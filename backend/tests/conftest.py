"""Test configuration."""
from app.models.customer import Customer, CustomerDetail
from app.core.security import get_password_hash
from app.models.user import User
from app.models.loan_application import LoanApplication, LoanApplicationDetail, LoanStatus
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.config import settings
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    """Create a test database session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture
def client(session: Session):
    """Create a test client for the FastAPI app."""
    from fastapi.testclient import TestClient
    from app.core.database import get_session

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


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
