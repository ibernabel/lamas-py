"""
API integration tests for loan application endpoints.

Tests all CRUD operations, status workflow, credit risk association,
notes, validation, and error handling.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.customer import Customer, CustomerDetail
from app.models.loan_application import LoanApplication, LoanApplicationDetail, LoanStatus
from app.models.credit_risk import CreditRisk, CreditRiskCategory
from app.models.user import User
from app.core.security import get_password_hash
from tests.factories.loan_application_factory import (
    LoanApplicationFactory,
    LoanApplicationDetailFactory,
    CreditRiskCategoryFactory,
    CreditRiskFactory,
)


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def auth_headers(client: TestClient, session: Session):
    """Create a test user and return auth headers."""
    user = User(
        name="Test User",
        email="test@example.com",
        password=get_password_hash("testpass"),
        is_approved=True,
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpass"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_customer(session: Session) -> Customer:
    """Create a test customer in the database."""
    customer = Customer(nid="12345678901", is_active=True, is_assigned=False)
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Juan",
        last_name="Pérez",
        email="juan.perez@example.com",
    )
    session.add(detail)
    session.commit()
    session.refresh(customer)
    return customer


@pytest.fixture
def test_loan(session: Session, test_customer: Customer) -> LoanApplication:
    """Create a test loan application with detail."""
    loan = LoanApplication(
        customer_id=test_customer.id,
        status=LoanStatus.RECEIVED.value,
        is_active=True,
        is_new=True,
    )
    session.add(loan)
    session.flush()

    detail = LoanApplicationDetail(
        loan_application_id=loan.id,
        amount=100000.0,
        term=24,
        rate=15.0,
        quota=5000.0,
        frequency="monthly",
        purpose="home improvement",
    )
    session.add(detail)
    session.commit()
    session.refresh(loan)
    return loan


@pytest.fixture
def test_credit_risk(session: Session) -> CreditRisk:
    """Create a test credit risk in the database."""
    category = CreditRiskCategory(
        name="High Risk", description="High risk category")
    session.add(category)
    session.flush()

    risk = CreditRisk(
        name="Insufficient income",
        description="Customer income does not meet requirements",
        category_id=category.id,
    )
    session.add(risk)
    session.commit()
    session.refresh(risk)
    return risk


# ============================================================================
# Step 3.1: CRUD Tests
# ============================================================================

def test_create_loan_application_success(
    client: TestClient, session: Session, auth_headers: dict, test_customer: Customer
):
    """Happy path: create a loan application with financial details."""
    payload = {
        "customer_id": test_customer.id,
        "detail": {
            "amount": 150000.0,
            "term": 36,
            "rate": 12.5,
            "quota": 5000.0,
            "frequency": "monthly",
            "purpose": "vehicle purchase",
            "customer_comment": "I need a car for work.",
        },
    }

    response = client.post("/api/v1/loan-applications/",
                           json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == test_customer.id
    assert data["status"] == LoanStatus.RECEIVED.value
    assert data["is_new"] is True
    assert data["is_active"] is True
    assert data["detail"]["amount"] == 150000.0
    assert data["detail"]["term"] == 36


def test_create_loan_application_invalid_customer(
    client: TestClient, session: Session, auth_headers: dict
):
    """Returns 404 if customer does not exist."""
    payload = {
        "customer_id": 99999,
        "detail": {
            "amount": 50000.0,
            "term": 12,
            "rate": 10.0,
            "quota": 4500.0,
        },
    }

    response = client.post("/api/v1/loan-applications/",
                           json=payload, headers=auth_headers)

    assert response.status_code == 404


def test_create_loan_application_invalid_amount(
    client: TestClient, session: Session, auth_headers: dict, test_customer: Customer
):
    """Returns 422 if amount is zero or negative."""
    payload = {
        "customer_id": test_customer.id,
        "detail": {
            "amount": 0,  # Invalid: must be > 0
            "term": 12,
            "rate": 10.0,
            "quota": 0.0,
        },
    }

    response = client.post("/api/v1/loan-applications/",
                           json=payload, headers=auth_headers)

    assert response.status_code == 422


def test_list_loan_applications_pagination(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Test paginated list of loan applications."""
    response = client.get(
        "/api/v1/loan-applications/?page=1&per_page=10",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert "pages" in data
    assert data["page"] == 1
    assert data["per_page"] == 10
    assert data["total"] >= 1


def test_list_loan_applications_filter_by_status(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Filter loan applications by status."""
    response = client.get(
        "/api/v1/loan-applications/?status=received",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["status"] == "received"


def test_get_loan_application_by_id(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Happy path: get a loan application by ID."""
    response = client.get(
        f"/api/v1/loan-applications/{test_loan.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_loan.id
    assert data["status"] == LoanStatus.RECEIVED.value
    assert data["detail"] is not None
    assert data["detail"]["amount"] == 100000.0


def test_get_loan_application_not_found(
    client: TestClient, session: Session, auth_headers: dict
):
    """Returns 404 when loan application does not exist."""
    response = client.get(
        "/api/v1/loan-applications/99999", headers=auth_headers)

    assert response.status_code == 404


def test_update_loan_application(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Partial update of loan application detail."""
    payload = {
        "detail": {
            "amount": 200000.0,
            "term": 48,
            "rate": 14.0,
            "quota": 6000.0,
            "purpose": "debt consolidation",
        }
    }

    response = client.put(
        f"/api/v1/loan-applications/{test_loan.id}",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["detail"]["amount"] == 200000.0
    assert data["detail"]["term"] == 48
    assert data["detail"]["purpose"] == "debt consolidation"


def test_soft_delete_loan_application(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Soft delete sets is_active=False, record is preserved."""
    response = client.delete(
        f"/api/v1/loan-applications/{test_loan.id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    # Verify the record still exists but is inactive
    session.refresh(test_loan)
    assert test_loan.is_active is False


def test_delete_loan_not_found(
    client: TestClient, session: Session, auth_headers: dict
):
    """Returns 404 when trying to delete a non-existent loan."""
    response = client.delete(
        "/api/v1/loan-applications/99999", headers=auth_headers)

    assert response.status_code == 404


# ============================================================================
# Step 3.2: Status Workflow Tests
# ============================================================================

def test_status_transition_valid_received_to_verified(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Valid transition: received → verified."""
    payload = {"status": "verified",
               "note": "Documents verified successfully."}

    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/status",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "verified"
    assert data["is_new"] is False
    assert data["changed_status_at"] is not None
    # Note should be in the notes list
    assert any("Documents verified" in n["note"] for n in data["notes"])


def test_status_transition_invalid_received_to_approved(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Invalid transition: received → approved must return 422."""
    payload = {"status": "approved"}

    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/status",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert "Cannot transition" in detail


def test_status_transition_to_approved_sets_flags(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Approving a loan sets is_approved=True and approved_at timestamp."""
    # Walk through the full valid path: received → verified → assigned → analyzed → approved
    for target_status in ["verified", "assigned", "analyzed", "approved"]:
        response = client.patch(
            f"/api/v1/loan-applications/{test_loan.id}/status",
            json={"status": target_status},
            headers=auth_headers,
        )
        assert response.status_code == 200, f"Failed at transition to {target_status}"

    data = response.json()
    assert data["status"] == "approved"
    assert data["is_approved"] is True
    assert data["is_answered"] is True
    assert data["approved_at"] is not None


def test_status_transition_to_rejected_sets_flags(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Rejecting a loan sets is_rejected=True and rejected_at timestamp."""
    # Walk to analyzed first
    for target_status in ["verified", "assigned", "analyzed"]:
        client.patch(
            f"/api/v1/loan-applications/{test_loan.id}/status",
            json={"status": target_status},
            headers=auth_headers,
        )

    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/status",
        json={"status": "rejected", "note": "Income too low."},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"
    assert data["is_rejected"] is True
    assert data["is_answered"] is True
    assert data["rejected_at"] is not None


def test_status_transition_archived_is_terminal(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Archived is a terminal state - no further transitions allowed."""
    # Archive the loan
    client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/status",
        json={"status": "archived"},
        headers=auth_headers,
    )

    # Try to transition from archived
    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/status",
        json={"status": "received"},
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert "terminal state" in response.json()["detail"]


# ============================================================================
# Step 3.3: Credit Risk Association Tests
# ============================================================================

def test_associate_credit_risk_success(
    client: TestClient,
    session: Session,
    auth_headers: dict,
    test_loan: LoanApplication,
    test_credit_risk: CreditRisk,
):
    """Associate a credit risk with a loan application."""
    payload = {"credit_risk_id": test_credit_risk.id}

    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/credit-risk",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    # Association is recorded as a note
    assert any("[CREDIT_RISK]" in n["note"] for n in data["notes"])


def test_associate_credit_risk_not_found(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Returns 404 if credit risk does not exist."""
    payload = {"credit_risk_id": 99999}

    response = client.patch(
        f"/api/v1/loan-applications/{test_loan.id}/credit-risk",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 404


# ============================================================================
# Notes Tests
# ============================================================================

def test_add_note_to_loan(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Add a note to a loan application."""
    payload = {"note": "Customer called to follow up on application status."}

    response = client.post(
        f"/api/v1/loan-applications/{test_loan.id}/notes",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["notes"]) >= 1
    assert any("Customer called" in n["note"] for n in data["notes"])


def test_add_note_empty_content(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Returns 422 for empty note content."""
    payload = {"note": ""}

    response = client.post(
        f"/api/v1/loan-applications/{test_loan.id}/notes",
        json=payload,
        headers=auth_headers,
    )

    assert response.status_code == 422


# ============================================================================
# Step 3.4: AI Evaluation Placeholder Tests
# ============================================================================

def test_evaluate_placeholder_returns_structured_response(
    client: TestClient, session: Session, auth_headers: dict, test_loan: LoanApplication
):
    """Evaluate endpoint returns a structured placeholder response."""
    response = client.post(
        f"/api/v1/loan-applications/{test_loan.id}/evaluate",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["loan_id"] == test_loan.id
    assert data["status"] == "pending"
    assert "Phase 8" in data["message"]
    assert "loan_status" in data


def test_evaluate_loan_not_found(
    client: TestClient, session: Session, auth_headers: dict
):
    """Returns 404 if loan does not exist for evaluate endpoint."""
    response = client.post(
        "/api/v1/loan-applications/99999/evaluate",
        headers=auth_headers,
    )

    assert response.status_code == 404


# ============================================================================
# Authentication Tests
# ============================================================================

def test_unauthenticated_access_list(client: TestClient):
    """All protected endpoints return 401 without auth token."""
    response = client.get("/api/v1/loan-applications/")
    assert response.status_code == 401


def test_unauthenticated_access_create(client: TestClient):
    """Create endpoint returns 401 without auth token."""
    response = client.post("/api/v1/loan-applications/", json={})
    assert response.status_code == 401
