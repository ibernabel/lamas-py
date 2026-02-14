"""
Unit tests for customer service layer.

Tests business logic, transaction handling, and data operations.
"""
import pytest
from sqlmodel import Session, select

from app.models.customer import Customer, CustomerDetail
from app.schemas.customer import (
    CustomerCreateSchema,
    CustomerSimpleCreateSchema,
    CustomerFilterSchema,
    PaginationParams,
    CustomerDetailCreate,
    PhoneCreate,
    AddressCreate,
)
from app.services.customer_service import (
    create_customer_with_nested_data,
    create_customer_simple,
    get_customer_with_relations,
    search_customers,
    validate_nid,
)


@pytest.mark.asyncio
async def test_validate_nid_valid_and_unique(session: Session):
    """Test NID validation with valid and unique NID."""
    result = await validate_nid(session, "12345678901")

    assert result.is_valid is True
    assert result.is_unique is True
    assert result.message is None


@pytest.mark.asyncio
async def test_validate_nid_invalid_format(session: Session):
    """Test NID validation with invalid format."""
    result = await validate_nid(session, "123")

    assert result.is_valid is False
    assert result.is_unique is False
    assert "must be exactly 11 digits" in result.message


@pytest.mark.asyncio
async def test_validate_nid_not_unique(session: Session):
    """Test NID validation when NID already exists."""
    # Create existing customer
    customer = Customer(
        nid="99999999999",
        is_active=True,
        is_assigned=False
    )
    session.add(customer)
    session.commit()

    result = await validate_nid(session, "99999999999")

    assert result.is_valid is True
    assert result.is_unique is False
    assert "already exists" in result.message


@pytest.mark.asyncio
async def test_create_customer_with_nested_data(session: Session):
    """Test service creates customer with all nested entities."""
    customer_data = CustomerCreateSchema(
        NID="11111111111",
        lead_channel="web",
        is_referred=False,
        detail=CustomerDetailCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            birthday="1990-01-01",
            gender="M",
            marital_status="single"
        ),
        phones=[
            PhoneCreate(number="8091234567", type="mobile")
        ],
        addresses=[
            AddressCreate(
                street="Calle Test 123",
                city="Santo Domingo",
                province="DN"
            )
        ]
    )

    customer = await create_customer_with_nested_data(session, customer_data)

    assert customer.id is not None
    assert customer.nid == "11111111111"

    # Verify detail was created
    statement = select(CustomerDetail).where(
        CustomerDetail.customer_id == customer.id)
    detail = session.exec(statement).first()
    assert detail is not None
    assert detail.first_name == "John"
    assert detail.last_name == "Doe"


@pytest.mark.asyncio
async def test_create_customer_simple(session: Session):
    """Test simple customer creation without addresses."""
    customer_data = CustomerSimpleCreateSchema(
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
            PhoneCreate(number="8297654321", type="mobile")
        ]
    )

    customer = await create_customer_simple(session, customer_data)

    assert customer.id is not None
    assert customer.nid == "22222222222"
    assert customer.detail is not None
    assert customer.detail.first_name == "Jane"


@pytest.mark.asyncio
async def test_get_customer_with_relations(session: Session):
    """Test fetching customer with all relationships."""
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
        first_name="Test",
        last_name="User",
        email="test@example.com"
    )
    session.add(detail)
    session.commit()

    # Fetch customer
    result = await get_customer_with_relations(session, customer.id)

    assert result is not None
    assert result.id == customer.id
    assert result.detail is not None
    assert result.detail.first_name == "Test"


@pytest.mark.asyncio
async def test_search_customers_by_nid(session: Session):
    """Test customer search by NID."""
    # Create test customers
    customer1 = Customer(nid="44444444444", is_active=True, is_assigned=False)
    session.add(customer1)
    session.flush()

    detail1 = CustomerDetail(
        customer_id=customer1.id,
        first_name="Search",
        last_name="Test1",
        email="search1@example.com"
    )
    session.add(detail1)

    customer2 = Customer(nid="55555555555", is_active=True, is_assigned=False)
    session.add(customer2)
    session.flush()

    detail2 = CustomerDetail(
        customer_id=customer2.id,
        first_name="Search",
        last_name="Test2",
        email="search2@example.com"
    )
    session.add(detail2)
    session.commit()

    # Search by NID
    filters = CustomerFilterSchema(nid="44444")
    pagination = PaginationParams(page=1, per_page=10)

    results = await search_customers(session, filters, pagination)

    assert results.total >= 1
    assert any(item.nid == "44444444444" for item in results.items)


@pytest.mark.asyncio
async def test_search_customers_pagination(session: Session):
    """Test pagination in customer search."""
    filters = CustomerFilterSchema()
    pagination = PaginationParams(page=1, per_page=5)

    results = await search_customers(session, filters, pagination)

    assert results.page == 1
    assert results.per_page == 5
    assert len(results.items) <= 5
    assert results.pages >= 0
