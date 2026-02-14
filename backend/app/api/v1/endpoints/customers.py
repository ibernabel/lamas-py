"""
Customer API endpoints - Complete CRUD operations.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.deps import CurrentUser, DatabaseSession
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
from app.services.customer_service import (
    create_customer_with_nested_data,
    create_customer_simple,
    get_customer_with_relations,
    update_customer,
    search_customers,
    assign_customer_to_portfolio,
    validate_nid,
)

router = APIRouter()


@router.post("/", response_model=CustomerReadSchema, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreateSchema,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> CustomerReadSchema:
    """
    Create a new customer with full data (addresses required).

    Requires:
    - NID (11 digits)
    - Customer detail (name, email, etc.)
    - At least 1 phone number
    - At least 1 address

    Optional:
    - Financial information
    - Job information
    - References
    - Vehicle information
    - Company information
    - Bank accounts

    Note: Portfolio and promoter assignment is done separately via PATCH /{customer_id}/assign
    """
    customer = await create_customer_with_nested_data(session, customer_data)
    return customer


@router.post("/simple", response_model=CustomerReadSchema, status_code=status.HTTP_201_CREATED)
async def create_customer_simple_endpoint(
    customer_data: CustomerSimpleCreateSchema,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> CustomerReadSchema:
    """
    Create a new customer with minimal data (addresses optional).

    Requires:
    - NID (11 digits)
    - Customer detail (name, email, etc.)
    - At least 1 phone number

    Optional:
    - Addresses
    - References

    This is a simplified endpoint for quick customer creation.
    Additional data can be added later via PUT /{customer_id}.
    """
    customer = await create_customer_simple(session, customer_data)
    return customer


@router.get("/", response_model=PaginatedResponse[CustomerListItem])
async def list_customers(
    current_user: CurrentUser,
    session: DatabaseSession,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(
        20, ge=1, le=100, description="Items per page (max 100)"),
    nid: str | None = Query(None, description="Filter by NID (partial match)"),
    name: str | None = Query(
        None, description="Filter by name (partial match)"),
    email: str | None = Query(
        None, description="Filter by email (partial match)"),
    portfolio_id: int | None = Query(
        None, description="Filter by portfolio ID"),
    promoter_id: int | None = Query(None, description="Filter by promoter ID"),
    is_active: bool | None = Query(
        None, description="Filter by active status"),
) -> PaginatedResponse[CustomerListItem]:
    """
    List customers with pagination and filtering.

    Supports filtering by:
    - NID (partial match)
    - Name (partial match on first or last name)
    - Email (partial match)
    - Portfolio ID
    - Promoter ID
    - Active status

    Results are sorted by created_at DESC by default.
    """
    filters = CustomerFilterSchema(
        nid=nid,
        name=name,
        email=email,
        portfolio_id=portfolio_id,
        promoter_id=promoter_id,
        is_active=is_active,
    )

    pagination = PaginationParams(page=page, per_page=per_page)

    return await search_customers(session, filters, pagination)


@router.get("/{customer_id}", response_model=CustomerReadSchema)
async def get_customer(
    customer_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> CustomerReadSchema:
    """
    Get customer by ID with all relationships.

    Returns complete customer data including:
    - Personal details
    - Financial information
    - Job information
    - Phones
    - Addresses
    - References
    - Vehicle information
    - Company information
    """
    customer = await get_customer_with_relations(session, customer_id)

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )

    return customer


@router.put("/{customer_id}", response_model=CustomerReadSchema)
async def update_customer_endpoint(
    customer_id: int,
    customer_data: CustomerUpdateSchema,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> CustomerReadSchema:
    """
    Update customer data (partial updates supported).

    All fields are optional - only provided fields will be updated.

    Nested data (detail, financial_info, job_info, etc.) will be:
    - Updated if the nested entity already exists
    - Created if it doesn't exist

    Note: NID cannot be changed once set.
    """
    customer = await update_customer(session, customer_id, customer_data)

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )

    return customer


@router.patch("/{customer_id}/assign", response_model=CustomerReadSchema)
async def assign_customer(
    customer_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
    portfolio_id: int | None = Query(
        None, description="Portfolio ID to assign"),
    promoter_id: int | None = Query(None, description="Promoter ID to assign"),
) -> CustomerReadSchema:
    """
    Assign customer to portfolio and/or promoter.

    This endpoint is typically used after customer creation to:
    - Assign customer to a specific portfolio
    - Assign customer to a specific promoter

    Sets:
    - is_assigned = True
    - assigned_at = current timestamp

    Note: This endpoint should be restricted to admin users in production.
    Currently allows any authenticated user for development.
    """
    if portfolio_id is None and promoter_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of portfolio_id or promoter_id must be provided"
        )

    customer = await assign_customer_to_portfolio(
        session, customer_id, portfolio_id, promoter_id
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )

    return customer


@router.post("/validate-nid", response_model=NIDValidationResponse)
async def validate_nid_endpoint(
    session: DatabaseSession,
    nid: str = Query(..., description="NID to validate"),
) -> NIDValidationResponse:
    """
    Validate NID format and check uniqueness.

    This is a PUBLIC endpoint (no authentication required).

    Validates:
    - NID format (exactly 11 digits)
    - NID uniqueness (not already in database)

    Returns:
    - is_valid: True if format is correct
    - is_unique: True if NID doesn't exist in database
    - message: Error message if validation fails

    Use this endpoint in the frontend to provide real-time validation
    feedback when users enter their NID.
    """
    return await validate_nid(session, nid)
