"""
Service for CreditGraph AI analysis orchestration (Sync).
"""
from datetime import datetime
from typing import Any, Optional

from sqlmodel import Session, select

from app.models.creditgraph import CreditGraphAnalysis
from app.models.loan_application import LoanApplication, LoanStatus
from app.services.creditgraph_client import CreditGraphClient


def get_existing_analysis(
    session: Session, loan_id: int
) -> Optional[CreditGraphAnalysis]:
    """Get existing analysis for a loan application (Sync)."""
    statement = select(CreditGraphAnalysis).where(
        CreditGraphAnalysis.loan_application_id == loan_id
    )
    return session.exec(statement).first()


def map_decision_to_loan_status(decision: str) -> str:
    """Map CreditGraph decision to LAMaS loan status."""
    status_map = {
        "APPROVED": LoanStatus.AUTO_APPROVED.value,
        "REJECTED": LoanStatus.AUTO_REJECTED.value,
        "MANUAL_REVIEW": LoanStatus.PENDING_SENIOR_REVIEW.value,
        "APPROVED_PENDING_REVIEW": LoanStatus.PENDING_JUNIOR_REVIEW.value,
    }
    return status_map.get(decision, LoanStatus.ANALYZED.value)


def trigger_analysis(
    session: Session, loan_id: int, *, force_reanalyze: bool = False
) -> CreditGraphAnalysis:
    """
    Trigger or fetch CreditGraph analysis for a loan application (Sync).
    """
    # 1. Fetch loan application
    loan_app = session.get(LoanApplication, loan_id)

    if not loan_app:
        raise ValueError(f"Loan application {loan_id} not found")

    # 2. Check existing analysis
    existing = get_existing_analysis(session, loan_id)
    if existing and not force_reanalyze:
        return existing

    # 3. Prepare payload (simplified for Phase 8)
    customer_name = "Unknown"
    customer_nid = "Unknown"
    customer_email = None

    if loan_app.customer:
        customer_nid = loan_app.customer.nid
        if loan_app.customer.detail:
            customer_name = f"{loan_app.customer.detail.first_name} {loan_app.customer.detail.last_name}"
            customer_email = loan_app.customer.detail.email

    applicant_data = {
        "full_name": customer_name,
        "cedula": customer_nid,
        "email": customer_email,
    }

    loan_data = {
        "requested_amount": float(loan_app.details.amount) if loan_app.details else 0,
        "term_months": loan_app.details.term if loan_app.details else 0,
        "purpose": loan_app.details.purpose if loan_app.details else "Unspecified",
    }

    # 4. Call CreditGraph API (Sync)
    client = CreditGraphClient()
    start_time = datetime.utcnow()

    result_json = client.analyze_loan_application(
        applicant=applicant_data,
        loan=loan_data,
        documents=[],
    )

    processing_time = int(
        (datetime.utcnow() - start_time).total_seconds() * 1000)

    # 5. Store/Update results
    if existing:
        analysis = existing
        analysis.case_id = result_json["case_id"]
        analysis.decision = result_json["decision"]
        analysis.irs_score = result_json["irs_score"]
        analysis.confidence = result_json["confidence"]
        analysis.risk_level = result_json["risk_level"]
        analysis.suggested_amount = result_json.get("suggested_amount")
        analysis.suggested_term = result_json.get("suggested_term")
        analysis.full_response = result_json
        analysis.analyzed_at = datetime.utcnow()
        analysis.processing_time_ms = processing_time
    else:
        analysis = CreditGraphAnalysis(
            loan_application_id=loan_id,
            case_id=result_json["case_id"],
            decision=result_json["decision"],
            irs_score=result_json["irs_score"],
            confidence=result_json["confidence"],
            risk_level=result_json["risk_level"],
            suggested_amount=result_json.get("suggested_amount"),
            suggested_term=result_json.get("suggested_term"),
            full_response=result_json,
            processing_time_ms=processing_time,
        )
        session.add(analysis)

    # 6. Update loan status
    loan_app.status = map_decision_to_loan_status(result_json["decision"])
    loan_app.changed_status_at = datetime.utcnow()

    session.commit()
    session.refresh(analysis)

    return analysis
