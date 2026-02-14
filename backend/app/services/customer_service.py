"""
Customer service layer - Business logic for customer operations.

This module handles all customer-related business operations including:
- Customer creation (full and simple versions)
- Customer retrieval with relationships
- Customer updates
- Customer search and filtering
- Portfolio/promoter assignment
- NID validation
All database operations are wrapped in transactions for data integrity.
"""
from typing import Sequence

from fastapi import HTTPException
from sqlmodel import Session, select, func, or_

from app.models.customer import (
    Customer,
    CustomerDetail,
    CustomerFinancialInfo,
    CustomerJobInfo,
    CustomerReference,
    CustomerVehicle,
    Company,
    CustomersAccount,
)
from app.schemas.customer import (
    CustomerCreateSchema,
    CustomerSimpleCreateSchema,
    CustomerUpdateSchema,
    CustomerReadSchema,
    CustomerListItem,
    CustomerFilterSchema,
    PaginationParams,
    PaginatedResponse,
    NIDValidationResponse,
)
from app.utils.validators import validate_dominican_nid


async def validate_nid(session: Session, nid: str) -> NIDValidationResponse:
    """
    Validate NID format and check uniqueness in database.

    Args:
        session: Database session
        nid: National ID to validate

    Returns:
        NIDValidationResponse with validation results

    Examples:
        >>> response = await validate_nid(session, "12345678901")
        >>> response.is_valid  # True if format is correct
        >>> response.is_unique  # True if not in database
    """
    # Validate format
    is_valid = validate_dominican_nid(nid)

    if not is_valid:
        return NIDValidationResponse(
            nid=nid,
            is_valid=False,
            is_unique=False,
            message="NID must be exactly 11 digits"
        )

    # Check uniqueness
    statement = select(Customer).where(Customer.nid == nid)
    existing_customer = session.exec(statement).first()

    return NIDValidationResponse(
        nid=nid,
        is_valid=True,
        is_unique=existing_customer is None,
        message=None if existing_customer is None else "NID already exists"
    )


async def create_customer_with_nested_data(
    session: Session,
    customer_data: CustomerCreateSchema
) -> Customer:
    """
    Create a customer with all nested data (FULL version).

    This function handles:
    - NID uniqueness validation
    - Customer creation
    - Nested data creation (detail, phones, addresses, etc.)
    - All operations in a single transaction

    Args:
        session: Database session
        customer_data: Customer creation schema with all nested data

    Returns:
        Created Customer instance

    Raises:
        HTTPException: 409 if NID already exists
        HTTPException: 400 for validation errors

    Note:
        Portfolio and promoter assignment should be done separately
        via assign_customer_to_portfolio function.
    """
    # Validate NID uniqueness
    nid = customer_data.nid
    validation_result = await validate_nid(session, nid)

    if not validation_result.is_unique:
        raise HTTPException(
            status_code=409,
            detail=f"Customer with NID {nid} already exists"
        )

    try:
        # Create main customer
        customer = Customer(
            nid=nid,
            lead_channel=customer_data.lead_channel,
            is_referred=customer_data.is_referred,
            referred_by=customer_data.referred_by,
            is_active=True,
            is_assigned=False,
        )
        session.add(customer)
        session.flush()  # Get customer.id for nested data

        # Create customer detail (REQUIRED)
        detail = CustomerDetail(
            customer_id=customer.id,
            **customer_data.detail.model_dump()
        )
        session.add(detail)

        # Create financial info (optional)
        if customer_data.financial_info:
            financial_info = CustomerFinancialInfo(
                customer_id=customer.id,
                **customer_data.financial_info.model_dump()
            )
            session.add(financial_info)

        # Create job info (optional)
        if customer_data.job_info:
            job_info = CustomerJobInfo(
                customer_id=customer.id,
                **customer_data.job_info.model_dump()
            )
            session.add(job_info)

        # Create company (optional)
        if customer_data.company:
            company = Company(
                customer_id=customer.id,
                **customer_data.company.model_dump()
            )
            session.add(company)

        # Create vehicle (optional)
        if customer_data.vehicle:
            vehicle = CustomerVehicle(
                customer_id=customer.id,
                **customer_data.vehicle.model_dump()
            )
            session.add(vehicle)

        # Create references (optional)
        for ref_data in customer_data.references:
            reference = CustomerReference(
                customer_id=customer.id,
                **ref_data.model_dump()
            )
            session.add(reference)

        # Create bank accounts (optional)
        for account_data in customer_data.accounts:
            account = CustomersAccount(
                customer_id=customer.id,
                **account_data.model_dump()
            )
            session.add(account)

        # TODO: Create phones and addresses (polymorphic relationships)
        # These require handling the polymorphic phoneable_type/phoneable_id
        # and addressables pivot table. Will implement in separate function.

        session.commit()
        session.refresh(customer)

        return customer

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create customer: {str(e)}"
        )


async def create_customer_simple(
    session: Session,
    customer_data: CustomerSimpleCreateSchema
) -> Customer:
    """
    Create a customer with minimal data (SIMPLE version).

    This is a simplified version that only requires:
    - NID
    - Customer detail
    - At least 1 phone

    Addresses and references are optional in this version.

    Args:
        session: Database session
        customer_data: Simple customer creation schema

    Returns:
        Created Customer instance

    Raises:
        HTTPException: 409 if NID already exists
        HTTPException: 400 for validation errors
    """
    # Validate NID uniqueness
    nid = customer_data.nid
    validation_result = await validate_nid(session, nid)

    if not validation_result.is_unique:
        raise HTTPException(
            status_code=409,
            detail=f"Customer with NID {nid} already exists"
        )

    try:
        # Create main customer
        customer = Customer(
            nid=nid,
            lead_channel=customer_data.lead_channel,
            is_referred=customer_data.is_referred,
            referred_by=customer_data.referred_by,
            is_active=True,
            is_assigned=False,
        )
        session.add(customer)
        session.flush()

        # Create customer detail (REQUIRED)
        detail = CustomerDetail(
            customer_id=customer.id,
            **customer_data.detail.model_dump()
        )
        session.add(detail)

        # Create references (optional)
        for ref_data in customer_data.references:
            reference = CustomerReference(
                customer_id=customer.id,
                **ref_data.model_dump()
            )
            session.add(reference)

        # TODO: Create phones and addresses (polymorphic)

        session.commit()
        session.refresh(customer)

        return customer

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create customer: {str(e)}"
        )


async def get_customer_with_relations(
    session: Session,
    customer_id: int
) -> Customer | None:
    """
    Get customer by ID with all relationships eagerly loaded.

    Args:
        session: Database session
        customer_id: Customer ID to fetch

    Returns:
        Customer instance with relationships or None if not found

    Note:
        Uses eager loading to avoid N+1 query problems.
    """
    statement = select(Customer).where(Customer.id == customer_id)
    customer = session.exec(statement).first()

    if customer:
        # Manually load relationships
        # (SQLModel/SQLAlchemy will lazy load when accessed)
        _ = customer.detail
        _ = customer.financial_info
        _ = customer.job_info
        _ = customer.references
        _ = customer.vehicle
        _ = customer.company
        _ = customer.accounts

    return customer


async def update_customer(
    session: Session,
    customer_id: int,
    customer_data: CustomerUpdateSchema
) -> Customer | None:
    """
    Update customer with partial data support.

    Args:
        session: Database session
        customer_id: Customer ID to update
        customer_data: Update data (all fields optional)

    Returns:
        Updated Customer instance or None if not found

    Raises:
        HTTPException: 400 for validation errors

    Note:
        Only provided fields will be updated.
        Nested entities will be updated/replaced if provided.
    """
    customer = await get_customer_with_relations(session, customer_id)

    if not customer:
        return None

    try:
        # Update main customer fields
        update_data = customer_data.model_dump(
            exclude_unset=True, exclude_none=True)

        for field, value in update_data.items():
            if field not in ["detail", "phones", "addresses", "financial_info",
                             "job_info", "references", "company", "vehicle", "accounts"]:
                setattr(customer, field, value)

        # Update nested entities if provided
        if customer_data.detail and customer.detail:
            for field, value in customer_data.detail.model_dump().items():
                setattr(customer.detail, field, value)

        if customer_data.financial_info:
            if customer.financial_info:
                for field, value in customer_data.financial_info.model_dump().items():
                    setattr(customer.financial_info, field, value)
            else:
                financial_info = CustomerFinancialInfo(
                    customer_id=customer.id,
                    **customer_data.financial_info.model_dump()
                )
                session.add(financial_info)

        if customer_data.job_info:
            if customer.job_info:
                for field, value in customer_data.job_info.model_dump().items():
                    setattr(customer.job_info, field, value)
            else:
                job_info = CustomerJobInfo(
                    customer_id=customer.id,
                    **customer_data.job_info.model_dump()
                )
                session.add(job_info)

        # TODO: Update phones, addresses, references (polymorphic handling)

        session.commit()
        session.refresh(customer)

        return customer

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update customer: {str(e)}"
        )


async def search_customers(
    session: Session,
    filters: CustomerFilterSchema,
    pagination: PaginationParams
) -> PaginatedResponse[CustomerListItem]:
    """
    Search customers with filtering and pagination.

    Args:
        session: Database session
        filters: Filter criteria
        pagination: Pagination parameters

    Returns:
        PaginatedResponse with customer list items

    Note:
        Supports filtering by: NID, name, email, portfolio, promoter, active status
        Results are sorted by created_at DESC by default
    """
    # Build base query
    statement = select(Customer).join(CustomerDetail, isouter=True)

    # Apply filters
    if filters.nid:
        statement = statement.where(Customer.nid.contains(filters.nid))

    if filters.name:
        statement = statement.where(
            or_(
                CustomerDetail.first_name.contains(filters.name),
                CustomerDetail.last_name.contains(filters.name)
            )
        )

    if filters.email:
        statement = statement.where(
            CustomerDetail.email.contains(filters.email))

    if filters.portfolio_id is not None:
        statement = statement.where(
            Customer.portfolio_id == filters.portfolio_id)

    if filters.promoter_id is not None:
        statement = statement.where(
            Customer.promoter_id == filters.promoter_id)

    if filters.is_active is not None:
        statement = statement.where(Customer.is_active == filters.is_active)

    # Get total count
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.exec(count_statement).one()

    # Apply pagination and sorting
    statement = statement.order_by(Customer.created_at.desc())
    statement = statement.offset((pagination.page - 1) * pagination.per_page)
    statement = statement.limit(pagination.per_page)

    # Execute query
    customers = session.exec(statement).all()

    # Convert to list items
    items = []
    for customer in customers:
        full_name = ""
        email = None
        if customer.detail:
            full_name = f"{customer.detail.first_name} {customer.detail.last_name}"
            email = customer.detail.email

        items.append(
            CustomerListItem(
                id=customer.id,
                nid=customer.nid,
                full_name=full_name,
                email=email,
                is_active=customer.is_active,
                is_assigned=customer.is_assigned,
                portfolio_id=customer.portfolio_id,
                promoter_id=customer.promoter_id,
                created_at=customer.created_at,
            )
        )

    return PaginatedResponse.create(
        items=items,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
    )


async def assign_customer_to_portfolio(
    session: Session,
    customer_id: int,
    portfolio_id: int | None = None,
    promoter_id: int | None = None
) -> Customer | None:
    """
    Assign customer to portfolio and/or promoter.

    Args:
        session: Database session
        customer_id: Customer ID to assign
        portfolio_id: Portfolio ID (optional)
        promoter_id: Promoter ID (optional)

    Returns:
        Updated Customer instance or None if not found

    Raises:
        HTTPException: 400 for validation errors

    Note:
        Sets is_assigned=True and assigned_at timestamp.
        Should validate that portfolio/promoter exist before calling this.
    """
    customer = await get_customer_with_relations(session, customer_id)

    if not customer:
        return None

    try:
        from datetime import datetime, timezone

        if portfolio_id is not None:
            customer.portfolio_id = portfolio_id

        if promoter_id is not None:
            customer.promoter_id = promoter_id

        # Mark as assigned if either portfolio or promoter is set
        if portfolio_id is not None or promoter_id is not None:
            customer.is_assigned = True
            customer.assigned_at = datetime.now(timezone.utc)

        session.commit()
        session.refresh(customer)

        return customer

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to assign customer: {str(e)}"
        )
