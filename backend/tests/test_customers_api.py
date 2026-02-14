"""
API integration tests for customer endpoints.

Tests all CRUD operations, validation, error handling, and edge cases.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.models.customer import Customer, CustomerDetail
from tests.factories.customer_factory import CustomerFactory, CustomerDetailFactory


def test_create_customer_full_success(client: TestClient, session: Session):
    """Test successful FULL customer creation with all required data."""
    payload = {
        "NID": "12345678901",
        "lead_channel": "website",
        "is_referred": False,
        "detail": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "birthday": "1990-01-15",
            "gender": "M",
            "marital_status": "single"
        },
        "phones": [
            {"number": "8091234567", "type": "mobile"}
        ],
        "addresses": [
            {
                "street": "Calle Principal 123",
                "city": "Santo Domingo",
                "province": "Distrito Nacional"
            }
        ]
    }

    # Get auth token first
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/customers/", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["nid"] == "12345678901"
    assert data["detail"]["first_name"] == "John"
    assert data["detail"]["last_name"] == "Doe"


def test_create_customer_simple_success(client: TestClient, session: Session):
    """Test successful SIMPLE customer creation (addresses optional)."""
    payload = {
        "NID": "98765432109",
        "detail": {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@example.com",
            "birthday": "1992-05-20",
            "gender": "F",
            "marital_status": "single"
        },
        "phones": [
            {"number": "8297654321", "type": "mobile"}
        ]
        # No addresses - valid for simple version
    }

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/customers/simple",
                           json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["nid"] == "98765432109"
    assert data["detail"]["first_name"] == "Jane"


def test_create_customer_invalid_nid_format(client: TestClient, session: Session):
    """Test NID validation (must be 11 digits)."""
    payload = {
        "NID": "123",  # Invalid - too short
        "detail": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "birthday": "1990-01-01",
            "gender": "M",
            "marital_status": "single"
        },
        "phones": [{"number": "8091234567", "type": "mobile"}],
        "addresses": [
            {"street": "Test St", "city": "SD", "province": "DN"}
        ]
    }

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/customers/", json=payload, headers=headers)

    assert response.status_code == 422  # Validation error


def test_create_customer_duplicate_nid(client: TestClient, session: Session):
    """Test duplicate NID rejection."""
    # Create first customer
    customer = Customer(
        nid="11111111111",
        is_active=True,
        is_assigned=False
    )
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Existing",
        last_name="Customer",
        email="existing@example.com"
    )
    session.add(detail)
    session.commit()

    # Try to create duplicate
    payload = {
        "NID": "11111111111",  # Duplicate
        "detail": {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": "duplicate@example.com",
            "birthday": "1990-01-01",
            "gender": "M",
            "marital_status": "single"
        },
        "phones": [{"number": "8091234567", "type": "mobile"}],
        "addresses": [
            {"street": "Test St", "city": "SD", "province": "DN"}
        ]
    }

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/customers/", json=payload, headers=headers)

    assert response.status_code == 409  # Conflict


def test_list_customers_pagination(client: TestClient, session: Session):
    """Test customer listing with pagination."""
    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(
        "/api/v1/customers/?page=1&per_page=10",
        headers=headers
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


def test_get_customer_by_id(client: TestClient, session: Session):
    """Test retrieving customer by ID."""
    # Create test customer
    customer = Customer(
        nid="22222222222",
        is_active=True,
        is_assigned=False
    )
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Test",
        last_name="Customer",
        email="test@example.com"
    )
    session.add(detail)
    session.commit()

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/v1/customers/{customer.id}", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == customer.id
    assert data["nid"] == "22222222222"


def test_get_customer_not_found(client: TestClient, session: Session):
    """Test 404 error when customer not found."""
    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/customers/99999", headers=headers)

    assert response.status_code == 404


def test_update_customer(client: TestClient, session: Session):
    """Test customer update."""
    # Create test customer
    customer = Customer(
        nid="33333333333",
        is_active=True,
        is_assigned=False
    )
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Original",
        last_name="Name",
        email="original@example.com"
    )
    session.add(detail)
    session.commit()

    # Update customer
    payload = {
        "detail": {
            "first_name": "Updated",
            "last_name": "Name",
            "email": "updated@example.com"
        }
    }

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.put(
        f"/api/v1/customers/{customer.id}",
        json=payload,
        headers=headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["detail"]["first_name"] == "Updated"


def test_assign_customer_to_portfolio(client: TestClient, session: Session):
    """Test assigning customer to portfolio after creation."""
    # Create test customer
    customer = Customer(
        nid="44444444444",
        is_active=True,
        is_assigned=False
    )
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Test",
        last_name="Assignment",
        email="assign@example.com"
    )
    session.add(detail)
    session.commit()

    # Get auth token
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Assign to portfolio
    response = client.patch(
        f"/api/v1/customers/{customer.id}/assign?portfolio_id=1&promoter_id=2",
        headers=headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["portfolio_id"] == 1
    assert data["promoter_id"] == 2
    assert data["is_assigned"] is True
    assert data["assigned_at"] is not None


def test_validate_nid_endpoint_valid(client: TestClient):
    """Test NID validation endpoint with valid NID."""
    response = client.post(
        "/api/v1/customers/validate-nid?nid=12345678901"
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["nid"] == "12345678901"


def test_validate_nid_endpoint_invalid(client: TestClient):
    """Test NID validation endpoint with invalid NID."""
    response = client.post(
        "/api/v1/customers/validate-nid?nid=123"
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert "must be exactly 11 digits" in data["message"]
