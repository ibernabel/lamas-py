"""
Additional tests for polymorphic relationships and FK validation.

Tests the fixes for known limitations:
1. Phone/Address polymorphic relationships
2. Portfolio/Promoter FK validation
"""
import pytest
from fastapi import HTTPException
from sqlmodel import Session

from app.models.customer import Customer, CustomerDetail
from app.models.phone import Phone
from app.models.address import Address, Addressable
from app.models.portfolio import Portfolio, Promoter
from app.models.user import User
from app.schemas.customer import (
    CustomerCreateSchema,
    CustomerDetailCreate,
    PhoneCreate,
    AddressCreate,
)
from app.services.customer_service import (
    create_customer_with_nested_data,
    assign_customer_to_portfolio,
)


@pytest.mark.asyncio
async def test_create_customer_with_phones_polymorphic(session: Session):
    """Test that phones are created with proper polymorphic fields."""
    customer_data = CustomerCreateSchema(
        NID="11111111111",
        detail=CustomerDetailCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            birthday="1990-01-01",
            gender="M",
            marital_status="single"
        ),
        phones=[
            PhoneCreate(number="8091234567",
                        type="mobile", country_area="809"),
            PhoneCreate(number="8097654321", type="home")
        ],
        addresses=[
            AddressCreate(
                street="Calle Test 123",
                city="Santo Domingo",
                state="Distrito Nacional"
            )
        ]
    )

    customer = await create_customer_with_nested_data(session, customer_data)

    # Verify phones were created with polymorphic fields
    phones = session.query(Phone).filter(
        Phone.phoneable_id == customer.id,
        Phone.phoneable_type == "Customer"
    ).all()

    assert len(phones) == 2
    assert phones[0].phoneable_type == "Customer"
    assert phones[0].phoneable_id == customer.id
    assert phones[0].number in ["8091234567", "8097654321"]


@pytest.mark.asyncio
async def test_create_customer_with_addresses_polymorphic(session: Session):
    """Test that addresses are created with proper polymorphic pivot table."""
    customer_data = CustomerCreateSchema(
        NID="22222222222",
        detail=CustomerDetailCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            birthday="1992-05-15",
            gender="F",
            marital_status="single"
        ),
        phones=[
            PhoneCreate(number="8291234567", type="mobile")
        ],
        addresses=[
            AddressCreate(
                street="Calle Principal 456",
                street2="Apt 5B",
                city="Santiago",
                state="Santiago",
                postal_code="51000",
                type="home"
            ),
            AddressCreate(
                street="Av. Independencia 789",
                city="Santo Domingo",
                state="DN",
                type="work"
            )
        ]
    )

    customer = await create_customer_with_nested_data(session, customer_data)

    # Verify addressable pivot records were created
    addressables = session.query(Addressable).filter(
        Addressable.addressable_id == customer.id,
        Addressable.addressable_type == "Customer"
    ).all()

    assert len(addressables) == 2
    assert all(a.addressable_type == "Customer" for a in addressables)
    assert all(a.addressable_id == customer.id for a in addressables)

    # Verify addresses were created
    address_ids = [a.address_id for a in addressables]
    addresses = session.query(Address).filter(
        Address.id.in_(address_ids)).all()

    assert len(addresses) == 2
    assert any(a.street == "Calle Principal 456" for a in addresses)
    assert any(a.street == "Av. Independencia 789" for a in addresses)


@pytest.mark.asyncio
async def test_assign_customer_invalid_portfolio(session: Session):
    """Test that assigning to non-existent portfolio raises 404."""
    # Create test customer
    customer = Customer(nid="33333333333", is_active=True, is_assigned=False)
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Test",
        last_name="User",
        email="test@example.com"
    )
    session.add(detail)
    session.commit()

    # Attempt to assign to non-existent portfolio
    with pytest.raises(HTTPException) as exc_info:
        await assign_customer_to_portfolio(session, customer.id, portfolio_id=99999)

    assert exc_info.value.status_code == 404
    assert "Portfolio with ID 99999 not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_assign_customer_invalid_promoter(session: Session):
    """Test that assigning to non-existent promoter raises 404."""
    # Create test customer
    customer = Customer(nid="44444444444", is_active=True, is_assigned=False)
    session.add(customer)
    session.flush()

    detail = CustomerDetail(
        customer_id=customer.id,
        first_name="Test",
        last_name="User",
        email="test@example.com"
    )
    session.add(detail)
    session.commit()

    # Attempt to assign to non-existent promoter
    with pytest.raises(HTTPException) as exc_info:
        await assign_customer_to_portfolio(session, customer.id, promoter_id=99999)

    assert exc_info.value.status_code == 404
    assert "Promoter with ID 99999 not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_assign_customer_valid_portfolio_and_promoter(session: Session):
    """Test successful assignment with valid portfolio and promoter."""
    # Create user for portfolio/promoter
    user = User(
        email="admin@example.com",
        name="Admin User",
        password="hashed",
        is_approved=True,
    )
    session.add(user)
    session.flush()

    # Create portfolio
    portfolio = Portfolio(name="Test Portfolio")
    session.add(portfolio)
    session.flush()

    # Create promoter
    promoter = Promoter(
        nid="55555555555",
        user_id=user.id
    )
    session.add(promoter)
    session.flush()

    # Create customer
    customer = Customer(nid="66666666666", is_active=True, is_assigned=False)
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

    # Assign customer
    updated_customer = await assign_customer_to_portfolio(
        session,
        customer.id,
        portfolio_id=portfolio.id,
        promoter_id=promoter.id
    )

    assert updated_customer is not None
    assert updated_customer.portfolio_id == portfolio.id
    assert updated_customer.promoter_id == promoter.id
    assert updated_customer.is_assigned is True
    assert updated_customer.assigned_at is not None
