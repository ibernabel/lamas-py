"""
Loan Application API endpoints - Full CRUD + Status Workflow.

Implements:
- POST   /loan-applications/              - Create with nested detail
- GET    /loan-applications/              - List with pagination & filters
- GET    /loan-applications/{id}          - Get by ID with relations
- PUT    /loan-applications/{id}          - Update detail
- DELETE /loan-applications/{id}          - Soft delete
- PATCH  /loan-applications/{id}/status   - Status workflow transition
- PATCH  /loan-applications/{id}/credit-risk - Associate credit risk
- POST   /loan-applications/{id}/notes    - Add note
- POST   /loan-applications/{id}/evaluate - AI evaluation placeholder
"""
from fastapi import APIRouter, HTTPException, Query, status

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.schemas.loan_application import (
    CreditRiskAssociation,
    LoanApplicationCreate,
    LoanApplicationFilterSchema,
    LoanApplicationNoteCreate,
    LoanApplicationReadSchema,
    LoanApplicationListItem,
    LoanApplicationStatusUpdate,
    LoanApplicationUpdate,
    LoanStatus,
)
from app.schemas.customer import PaginatedResponse, PaginationParams
from app.services.loan_application_service import (
    add_loan_note,
    associate_credit_risk,
    create_loan_application,
    get_loan_application_with_relations,
    list_loan_applications,
    soft_delete_loan_application,
    transition_loan_status,
    update_loan_application,
)

router = APIRouter()


@router.post(
    "/",
    response_model=LoanApplicationReadSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_loan_application_endpoint(
    data: LoanApplicationCreate,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Create a new loan application with financial details.

    Requires:
    - customer_id: Must reference an existing customer
    - detail: Financial details (amount, term, rate, quota)

    The application starts in 'received' status automatically.
    """
    return await create_loan_application(session, data, user_id=current_user.id)


@router.get("/", response_model=PaginatedResponse[LoanApplicationListItem])
async def list_loan_applications_endpoint(
    current_user: CurrentUser,
    session: DatabaseSession,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(
        20, ge=1, le=100, description="Items per page (max 100)"),
    customer_id: int | None = Query(None, description="Filter by customer ID"),
    status_filter: LoanStatus | None = Query(
        None, alias="status", description="Filter by loan status"
    ),
    is_active: bool | None = Query(
        None, description="Filter by active status"),
    is_approved: bool | None = Query(
        None, description="Filter by approved status"),
    is_rejected: bool | None = Query(
        None, description="Filter by rejected status"),
) -> PaginatedResponse[LoanApplicationListItem]:
    """
    List loan applications with pagination and filtering.

    Supports filtering by:
    - customer_id
    - status (received, verified, assigned, analyzed, approved, rejected, archived)
    - is_active, is_approved, is_rejected

    Results are sorted by created_at DESC.
    """
    filters = LoanApplicationFilterSchema(
        customer_id=customer_id,
        status=status_filter,
        is_active=is_active,
        is_approved=is_approved,
        is_rejected=is_rejected,
    )
    pagination = PaginationParams(page=page, per_page=per_page)
    return await list_loan_applications(session, filters, pagination)


@router.get("/{loan_id}", response_model=LoanApplicationReadSchema)
async def get_loan_application_endpoint(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Get a loan application by ID with all relationships.

    Returns complete data including financial details and notes.
    """
    loan = await get_loan_application_with_relations(session, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )
    return loan


@router.put("/{loan_id}", response_model=LoanApplicationReadSchema)
async def update_loan_application_endpoint(
    loan_id: int,
    data: LoanApplicationUpdate,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Update a loan application's financial details (partial updates supported).

    All fields are optional - only provided fields will be updated.
    Note: Status changes must be done via PATCH /{loan_id}/status.
    """
    loan = await update_loan_application(session, loan_id, data)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )
    return loan


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan_application_endpoint(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> None:
    """
    Soft delete a loan application (sets is_active=False).

    The record is preserved in the database for audit purposes.
    """
    deleted = await soft_delete_loan_application(session, loan_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )


@router.patch("/{loan_id}/status", response_model=LoanApplicationReadSchema)
async def transition_loan_status_endpoint(
    loan_id: int,
    data: LoanApplicationStatusUpdate,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Transition a loan application to a new status.

    Valid status flow:
    - received → verified → assigned → analyzed → approved
    - received → verified → assigned → analyzed → rejected
    - any_state → archived (terminal)

    Invalid transitions return HTTP 422 Unprocessable Entity.

    Boolean flags are automatically synced:
    - approved → is_approved=True, approved_at=now()
    - rejected → is_rejected=True, rejected_at=now()
    - archived → is_archived=True, archived_at=now()
    """
    loan = await transition_loan_status(
        session, loan_id, data, user_id=current_user.id
    )
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )
    return loan


@router.patch("/{loan_id}/credit-risk", response_model=LoanApplicationReadSchema)
async def associate_credit_risk_endpoint(
    loan_id: int,
    data: CreditRiskAssociation,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Associate a credit risk with a loan application.

    The association is recorded as a note for audit trail purposes.
    Use GET /credit-risks/ to browse available credit risks.
    """
    loan = await associate_credit_risk(session, loan_id, data.credit_risk_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )
    return loan


@router.post("/{loan_id}/notes", response_model=LoanApplicationReadSchema)
async def add_note_endpoint(
    loan_id: int,
    data: LoanApplicationNoteCreate,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> LoanApplicationReadSchema:
    """
    Add a note to a loan application.

    Notes are immutable once created and serve as an audit trail.
    """
    loan = await add_loan_note(session, loan_id, data, user_id=current_user.id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )
    return loan


@router.post("/{loan_id}/evaluate")
async def evaluate_loan_application_endpoint(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> dict:
    """
    Trigger AI evaluation for a loan application.

    NOTE: This is a placeholder endpoint for future CreditGraph AI integration (Phase 8).
    The loan application must exist to call this endpoint.

    Future implementation will:
    - Send loan + customer data to CreditGraph AI service
    - Store the analysis result in creditgraph_analyses table
    - Return decision: APPROVED, REJECTED, or MANUAL_REVIEW
    """
    loan = await get_loan_application_with_relations(session, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan application with ID {loan_id} not found.",
        )

    return {
        "loan_id": loan_id,
        "status": "pending",
        "message": "AI evaluation placeholder — CreditGraph AI integration coming in Phase 8.",
        "triggered_by": current_user.email,
        "loan_status": loan.status,
    }
