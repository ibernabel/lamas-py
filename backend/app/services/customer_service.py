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
from app.models.phone import Phone
from app.models.address import Address, Addressable
from app.models.portfolio import Portfolio, Promoter
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
    Validate NID format/checksum and check uniqueness in database.
    If customer exists, returns prefillable profile data for public form.

    Args:
        session: Database session
        nid: National ID to validate

    Returns:
        NIDValidationResponse with validation results and optional customer details
    """
    # Validate format and JCE Modulo 10 checksum
    is_valid = validate_dominican_nid(nid)

    if not is_valid:
        return NIDValidationResponse(
            nid=nid,
            is_valid=False,
            is_unique=False,
            message="Cédula no válida (dígito verificador incorrecto)"
        )

    # Clean NID for database lookup
    cleaned_nid = "".join(filter(str.isdigit, nid))

    # Check uniqueness & fetch existing customer data
    statement = select(Customer).where(Customer.nid == cleaned_nid)
    existing_customer = session.exec(statement).first()

    customer_data = None
    if existing_customer:
        detail = existing_customer.detail
        job_info = existing_customer.job_info
        company = existing_customer.company

        # Query mobile phone or primary phone
        phone_stmt = select(Phone).where(
            Phone.phoneable_type == "Customer",
            Phone.phoneable_id == existing_customer.id,
            Phone.type == "mobile"
        )
        mobile_phone_record = session.exec(phone_stmt).first()
        if not mobile_phone_record:
            any_phone_stmt = select(Phone).where(
                Phone.phoneable_type == "Customer",
                Phone.phoneable_id == existing_customer.id
            )
            mobile_phone_record = session.exec(any_phone_stmt).first()

        financial_info = existing_customer.financial_info
        customer_data = {
            "first_name": (detail.first_name if detail else "") or "",
            "last_name": (detail.last_name if detail else "") or "",
            "email": (detail.email if detail else "") or "",
            "mobile_phone": mobile_phone_record.number if mobile_phone_record else "",
            "marital_status": detail.marital_status if detail else None,
            "housing_type": (detail.housing_possession_type or detail.housing_type) if detail else None,
            "housing_monthly_payment": financial_info.monthly_housing_payment if (financial_info and financial_info.monthly_housing_payment is not None) else None,
            "education_level": detail.education_level if detail else None,
            "occupation_type": job_info.occupation_type if job_info else None,
            "role": (job_info.role if job_info else "") or "",
            "company_name": (company.name if company else "") or "",
            "salary": job_info.salary if job_info else None,
            "payment_bank": (job_info.payment_bank if job_info else "") or "",
            "payment_frequency": job_info.payment_frequency if job_info else None,
            "employment_start_date": str(job_info.start_date) if (job_info and job_info.start_date) else "",
        }

    return NIDValidationResponse(
        nid=cleaned_nid,
        is_valid=True,
        is_unique=existing_customer is None,
        message=None if existing_customer is None else "Cliente ya registrado en el sistema",
        existing_customer=customer_data,
    )


async def create_customer_with_nested_data(
    session: Session,
    customer_data: CustomerCreateSchema
) -> CustomerReadSchema:
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

        # Create phones (polymorphic relationship)
        for phone_data in customer_data.phones:
            phone = Phone(
                number=phone_data.number,
                type=phone_data.type,
                country_area=phone_data.country_area,
                extension=phone_data.extension,
                phoneable_type="Customer",  # Laravel-style polymorphic
                phoneable_id=customer.id
            )
            session.add(phone)

        # Create addresses (polymorphic via pivot table)
        for address_data in customer_data.addresses:
            address = Address(
                street=address_data.street,
                street2=address_data.street2,
                city=address_data.city,
                state=address_data.state,
                type=address_data.type,
                postal_code=address_data.postal_code,
                country=address_data.country,
                references=address_data.references,
            )
            session.add(address)
            session.flush()  # Get address.id for pivot table

            # Create pivot record
            addressable = Addressable(
                address_id=address.id,
                addressable_type="Customer",  # Laravel-style polymorphic
                addressable_id=customer.id
            )
            session.add(addressable)

        session.commit()
        return await get_customer_with_relations(session, customer.id)

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create customer: {str(e)}"
        )


async def create_customer_simple(
    session: Session,
    customer_data: CustomerSimpleCreateSchema
) -> CustomerReadSchema:
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

        # Create phones (polymorphic relationship)
        for phone_data in customer_data.phones:
            phone = Phone(
                number=phone_data.number,
                type=phone_data.type,
                country_area=phone_data.country_area,
                extension=phone_data.extension,
                phoneable_type="Customer",
                phoneable_id=customer.id
            )
            session.add(phone)

        # Create addresses if provided (polymorphic via pivot table)
        for address_data in customer_data.addresses:
            address = Address(
                street=address_data.street,
                street2=address_data.street2,
                city=address_data.city,
                state=address_data.state,
                type=address_data.type,
                postal_code=address_data.postal_code,
                country=address_data.country,
                references=address_data.references,
            )
            session.add(address)
            session.flush()

            addressable = Addressable(
                address_id=address.id,
                addressable_type="Customer",
                addressable_id=customer.id
            )
            session.add(addressable)

        session.commit()
        return await get_customer_with_relations(session, customer.id)

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create customer: {str(e)}"
        )


async def get_customer_model_with_relations(
    session: Session,
    customer_id: int
) -> Customer | None:
    """
    Get customer model by ID with all relationships eagerly loaded.
    INTERNAL USE ONLY (returns SQLModel instance).
    """
    statement = select(Customer).where(Customer.id == customer_id)
    customer = session.exec(statement).first()

    if customer:
        # Load relationships (SQLAlchemy lazy load)
        _ = customer.detail
        _ = customer.financial_info
        _ = customer.job_info
        _ = customer.references
        _ = customer.vehicle
        _ = customer.company
        _ = customer.accounts
        return customer

    return None


async def get_customer_with_relations(
    session: Session,
    customer_id: int
) -> CustomerReadSchema | None:
    """
    Get customer by ID with all relationships eagerly loaded for API response.
    """
    customer = await get_customer_model_with_relations(session, customer_id)

    if not customer:
        return None

    # Manually load polymorphic phones
    phones_stmt = select(Phone).where(
        Phone.phoneable_type == "Customer",
        Phone.phoneable_id == customer.id
    )
    phones = session.exec(phones_stmt).all()

    # Manually load polymorphic addresses (via pivot)
    addresses_stmt = select(Address).join(
        Addressable, Address.id == Addressable.address_id
    ).where(
        Addressable.addressable_type == "Customer",
        Addressable.addressable_id == customer.id
    )
    addresses = session.exec(addresses_stmt).all()

    # Return as schema to avoid issues with extra attribute assignment on SQLModel
    return CustomerReadSchema(
        **customer.model_dump(),
        detail=customer.detail,
        phones=phones,
        addresses=addresses,
        financial_info=customer.financial_info,
        job_info=customer.job_info,
        company=customer.company,
        accounts=customer.accounts,
        references=customer.references,
        vehicle=customer.vehicle
    )


async def update_customer(
    session: Session,
    customer_id: int,
    customer_data: CustomerUpdateSchema
) -> CustomerReadSchema | None:
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
    customer = await get_customer_model_with_relations(session, customer_id)

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
        if customer_data.detail:
            if customer.detail:
                for field, value in customer_data.detail.model_dump(exclude_unset=True, exclude_none=True).items():
                    setattr(customer.detail, field, value)
            else:
                detail = CustomerDetail(
                    customer_id=customer.id,
                    **customer_data.detail.model_dump(exclude_unset=True, exclude_none=True)
                )
                session.add(detail)

        if customer_data.financial_info:
            if customer.financial_info:
                for field, value in customer_data.financial_info.model_dump(exclude_unset=True, exclude_none=True).items():
                    setattr(customer.financial_info, field, value)
            else:
                financial_info = CustomerFinancialInfo(
                    customer_id=customer.id,
                    **customer_data.financial_info.model_dump(exclude_unset=True, exclude_none=True)
                )
                session.add(financial_info)

        if customer_data.job_info:
            if customer.job_info:
                for field, value in customer_data.job_info.model_dump(exclude_unset=True, exclude_none=True).items():
                    setattr(customer.job_info, field, value)
            else:
                job_info = CustomerJobInfo(
                    customer_id=customer.id,
                    **customer_data.job_info.model_dump(exclude_unset=True, exclude_none=True)
                )
                session.add(job_info)

        if customer_data.company:
            if customer.company:
                for field, value in customer_data.company.model_dump(exclude_unset=True, exclude_none=True).items():
                    setattr(customer.company, field, value)
            else:
                company = Company(
                    customer_id=customer.id,
                    **customer_data.company.model_dump(exclude_unset=True, exclude_none=True)
                )
                session.add(company)

        if customer_data.vehicle:
            if customer.vehicle:
                for field, value in customer_data.vehicle.model_dump(exclude_unset=True, exclude_none=True).items():
                    setattr(customer.vehicle, field, value)
            else:
                vehicle = CustomerVehicle(
                    customer_id=customer.id,
                    **customer_data.vehicle.model_dump(exclude_unset=True, exclude_none=True)
                )
                session.add(vehicle)

        # Update phones (replace all)
        if customer_data.phones is not None:
            # Delete existing phones
            existing_phones_stmt = select(Phone).where(
                Phone.phoneable_type == "Customer",
                Phone.phoneable_id == customer.id
            )
            existing_phones = session.exec(existing_phones_stmt).all()
            for p in existing_phones:
                session.delete(p)

            # Add new phones
            for phone_data in customer_data.phones:
                new_phone = Phone(
                    number=phone_data.number,
                    type=phone_data.type,
                    country_area=phone_data.country_area,
                    extension=phone_data.extension,
                    phoneable_type="Customer",
                    phoneable_id=customer.id
                )
                session.add(new_phone)

        # Update addresses (replace all)
        if customer_data.addresses is not None:
            # Delete existing addressable pivots first, then delete addresses
            existing_pivots_stmt = select(Addressable).where(
                Addressable.addressable_type == "Customer",
                Addressable.addressable_id == customer.id
            )
            existing_pivots = session.exec(existing_pivots_stmt).all()

            address_ids_to_delete = [p.address_id for p in existing_pivots]

            # 1. Delete pivot records first to avoid ForeignKeyViolation
            for pivot in existing_pivots:
                session.delete(pivot)
            session.flush()

            # 2. Delete address records after pivots are removed
            for addr_id in address_ids_to_delete:
                addr = session.get(Address, addr_id)
                if addr:
                    session.delete(addr)
            session.flush()

            # Add new addresses
            for address_data in customer_data.addresses:
                new_address = Address(
                    street=address_data.street,
                    street2=address_data.street2,
                    city=address_data.city,
                    state=address_data.state,
                    type=address_data.type,
                    postal_code=address_data.postal_code,
                    country=address_data.country,
                    references=address_data.references,
                )
                session.add(new_address)
                session.flush()

                new_pivot = Addressable(
                    address_id=new_address.id,
                    addressable_type="Customer",
                    addressable_id=customer.id
                )
                session.add(new_pivot)

        # Update references (replace all)
        if customer_data.references is not None:
            # Delete existing references
            existing_refs_stmt = select(CustomerReference).where(
                CustomerReference.customer_id == customer.id
            )
            existing_refs = session.exec(existing_refs_stmt).all()
            for r in existing_refs:
                session.delete(r)

            # Add new references
            for ref_data in customer_data.references:
                new_ref = CustomerReference(
                    customer_id=customer.id,
                    **ref_data.model_dump()
                )
                session.add(new_ref)

        session.commit()

        return await get_customer_with_relations(session, customer_id)

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

    # Apply pagination and sorting (ID DESC guarantees newest created record is first)
    statement = statement.order_by(Customer.id.desc())
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
        HTTPException: 404 if portfolio or promoter not found
        HTTPException: 400 for other validation errors

    Note:
        Sets is_assigned=True and assigned_at timestamp.
        Validates that portfolio/promoter exist before assignment.
    """
    # Validate Portfolio exists
    if portfolio_id is not None:
        portfolio_statement = select(Portfolio).where(
            Portfolio.id == portfolio_id)
        portfolio = session.exec(portfolio_statement).first()
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail=f"Portfolio with ID {portfolio_id} not found"
            )

    # Validate Promoter exists
    if promoter_id is not None:
        promoter_statement = select(Promoter).where(Promoter.id == promoter_id)
        promoter = session.exec(promoter_statement).first()
        if not promoter:
            raise HTTPException(
                status_code=404,
                detail=f"Promoter with ID {promoter_id} not found"
            )

    customer = await get_customer_model_with_relations(session, customer_id)

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

        return await get_customer_with_relations(session, customer_id)

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to assign customer: {str(e)}"
        )
