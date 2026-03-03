"""
Integration tests for CreditGraph AI endpoints.
"""
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.loan_application import LoanApplication, LoanStatus
from app.models.creditgraph import CreditGraphAnalysis


@pytest.fixture
def mock_creditgraph_response():
    """Mock successful CreditGraph API response."""
    return {
        "case_id": "cg-12345",
        "decision": "APPROVED",
        "irs_score": 85,
        "confidence": 0.92,
        "risk_level": "LOW",
        "suggested_amount": 100000.0,
        "suggested_term": 24,
        "reasoning": "Strong credit history and stable income.",
        "irs_breakdown": {
            "credit_history": 22,
            "payment_capacity": 20,
            "stability": 14,
            "collateral": 12,
            "payment_morality": 17,
        },
    }


def test_analyze_triggers_creditgraph_and_stores_result(
    client: TestClient,
    session: Session,
    auth_headers: dict,
    test_loan: LoanApplication,
    mock_creditgraph_response,
):
    """Happy path: trigger analysis, mock API, check DB and status."""
    with patch(
        "app.services.creditgraph_client.CreditGraphClient.analyze_loan_application"
    ) as mock_analyze:
        mock_analyze.return_value = mock_creditgraph_response

        response = client.post(
            f"/api/v1/creditgraph/loan-applications/{test_loan.id}/analyze",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["decision"] == "APPROVED"
        assert data["irs_score"] == 85

        # Check DB
        analysis = session.query(CreditGraphAnalysis).filter_by(
            loan_application_id=test_loan.id).first()
        assert analysis is not None
        assert analysis.decision == "APPROVED"

        # Check Loan Status
        session.refresh(test_loan)
        assert test_loan.status == LoanStatus.AUTO_APPROVED.value


def test_analyze_returns_cached_if_already_exists(
    client: TestClient,
    session: Session,
    auth_headers: dict,
    test_loan: LoanApplication,
    mock_creditgraph_response,
):
    """Idempotency: don't call API again if analysis exists."""
    # Create existing analysis
    analysis = CreditGraphAnalysis(
        loan_application_id=test_loan.id,
        case_id="existing-123",
        decision="REJECTED",
        irs_score=40,
        confidence=0.8,
        risk_level="HIGH",
        full_response={"old": "data"},
    )
    session.add(analysis)
    session.commit()

    with patch(
        "app.services.creditgraph_client.CreditGraphClient.analyze_loan_application"
    ) as mock_analyze:
        response = client.post(
            f"/api/v1/creditgraph/loan-applications/{test_loan.id}/analyze",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["case_id"] == "existing-123"
        # API should NOT have been called
        mock_analyze.assert_not_called()


def test_analyze_force_reanalyze_replaces_existing(
    client: TestClient,
    session: Session,
    auth_headers: dict,
    test_loan: LoanApplication,
    mock_creditgraph_response,
):
    """Force re-analysis calls API even if record exists."""
    analysis = CreditGraphAnalysis(
        loan_application_id=test_loan.id,
        case_id="old-case",
        decision="MANUAL_REVIEW",
        irs_score=50,
        confidence=0.5,
        risk_level="MEDIUM",
        full_response={},
    )
    session.add(analysis)
    session.commit()

    with patch(
        "app.services.creditgraph_client.CreditGraphClient.analyze_loan_application"
    ) as mock_analyze:
        mock_analyze.return_value = mock_creditgraph_response

        response = client.post(
            f"/api/v1/creditgraph/loan-applications/{test_loan.id}/analyze?force=true",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["case_id"] == "cg-12345"
        mock_analyze.assert_called_once()


def test_get_analysis_not_found(
    client: TestClient, auth_headers: dict, test_loan: LoanApplication
):
    """GET returns 404 if no analysis has been run yet."""
    response = client.get(
        f"/api/v1/creditgraph/loan-applications/{test_loan.id}/analysis",
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_creditgraph_health_check(client: TestClient, auth_headers: dict):
    """Verify health check endpoint proxies correctly."""
    with patch(
        "app.services.creditgraph_client.CreditGraphClient.health_check"
    ) as mock_health:
        mock_health.return_value = True
        response = client.get(
            "/api/v1/creditgraph/health", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


def test_analyze_api_error_returns_502(
    client: TestClient, auth_headers: dict, test_loan: LoanApplication
):
    """Handle external API errors gracefully."""
    with patch(
        "app.services.creditgraph_client.CreditGraphClient.analyze_loan_application"
    ) as mock_analyze:
        mock_analyze.side_effect = Exception("API Timeout")

        response = client.post(
            f"/api/v1/creditgraph/loan-applications/{test_loan.id}/analyze",
            headers=auth_headers,
        )

        assert response.status_code == 502
        assert "API error" in response.json()["detail"]
