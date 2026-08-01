from sqlmodel import Session
from app.services.loan_submission_service import LoanSubmissionService
from app.models.core_task_queue import TaskStatus, TaskType


def test_submit_loan_service_success(session: Session):
    payload = {
        "identity": {
            "nid": "001-0000001-1",
            "first_name": "Juan",
            "last_name": "Pérez Rodríguez",
            "mobile_phone": "8095550001",
            "email": "juan.perez@gmail.com",
        },
        "profile": {
            "marital_status": "married",
            "housing_type": "rented",
            "housing_monthly_payment": 12000.00,
            "education_level": "bachelor",
        },
        "job": {
            "company_name": "Banco BHD León",
            "role": "Analista Senior",
            "salary": 55000.00,
        },
        "financial": {
            "other_income": 8000.00,
        },
        "loan_request": {
            "amount": 100000.00,
            "term_months": 24,
            "purpose": "RENOVATION",
            "notes": "Remodelación de baño",
        },
        "legal_consent": {
            "privacy_consent_accepted": True,
            "bureau_authorization_accepted": True,
            "ai_processing_accepted": True,
            "consent_timestamp": "2026-07-27T14:30:00Z",
            "consent_ip_address": "190.166.45.12",
        },
        "telemetry": {
            "clipboard_paste_detected": False,
            "keystroke_latency_ms": 142.5,
            "device_fingerprint": "fp_a8f9312b904c",
            "step_timings_sec": {"step1": 15, "step2": 24},
        },
    }

    service = LoanSubmissionService(session)
    result = service.submit_loan(payload)

    assert result["customer"].nid == "00100000011"
    assert result["loan_application"].id is not None
    assert result["legal_consent"].privacy_consent_accepted is True
    assert result["legal_consent"].consent_ip_address == "190.166.45.12"
    assert result["shadow_risk"].device_fingerprint == "fp_a8f9312b904c"
    assert result["core_task"].task_type == TaskType.CREATE_LOAN_IN_CORE
    assert result["core_task"].status == TaskStatus.PENDING


def test_submit_loan_service_formats_and_deduplicates_nid(session: Session):
    payload1 = {
        "identity": {
            "nid": "402-2018559-5",
            "first_name": "Maria",
            "last_name": "Rodriguez",
        },
        "loan_request": {"amount": 50000.0, "term_months": 12},
    }
    payload2 = {
        "identity": {
            "nid": "40220185595",
            "first_name": "Maria",
            "last_name": "Rodriguez",
        },
        "loan_request": {"amount": 75000.0, "term_months": 18},
    }

    service = LoanSubmissionService(session)
    res1 = service.submit_loan(payload1)
    res2 = service.submit_loan(payload2)

    assert res1["customer"].nid == "40220185595"
    assert res2["customer"].id == res1["customer"].id
    assert res1["loan_application"].id != res2["loan_application"].id
