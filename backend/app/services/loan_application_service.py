"""
Loan Application service layer.

Contains all business logic for loan application CRUD operations,
status workflow management, credit risk association, and notes.

Status State Machine:
    received → verified → assigned → analyzed → approved
                                               ↘ rejected
    any_state → archived
"""
from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session, select, func

from app.models.loan_application import (
    LoanApplication,
    LoanApplicationDetail,
    LoanApplicationNote,
    LoanStatus,
)
from app.models.credit_risk import CreditRisk
from app.models.customer import Customer
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationUpdate,
    LoanApplicationStatusUpdate,
    LoanApplicationNoteCreate,
    LoanApplicationFilterSchema,
    LoanApplicationReadSchema,
    LoanApplicationListItem,
    LoanApplicationDetailRead,
    LoanApplicationNoteRead,
)
from app.schemas.customer import PaginationParams, PaginatedResponse


# ============================================================================
# Status State Machine
# ============================================================================

# Maps each status to the set of statuses it can transition TO
ALLOWED_TRANSITIONS: dict[LoanStatus, set[LoanStatus]] = {
    LoanStatus.RECEIVED: {LoanStatus.VERIFIED, LoanStatus.ARCHIVED},
    LoanStatus.VERIFIED: {LoanStatus.ASSIGNED, LoanStatus.ARCHIVED},
    LoanStatus.ASSIGNED: {LoanStatus.ANALYZED, LoanStatus.ARCHIVED},
    LoanStatus.ANALYZED: {
        LoanStatus.APPROVED,
        LoanStatus.REJECTED,
        LoanStatus.ARCHIVED,
    },
    LoanStatus.APPROVED: {LoanStatus.ARCHIVED},
    LoanStatus.REJECTED: {LoanStatus.ARCHIVED},
    LoanStatus.ARCHIVED: set(),  # Terminal state
}


def _validate_status_transition(
    current: str, target: LoanStatus
) -> None:
    """
    Validate that a status transition is allowed.

    Raises HTTP 422 if the transition is not permitted.
    """
    try:
        current_enum = LoanStatus(current)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Current status '{current}' is not a valid loan status.",
        )

    allowed = ALLOWED_TRANSITIONS.get(current_enum, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Cannot transition from '{current}' to '{target.value}'. "
                f"Allowed transitions: {[s.value for s in allowed] or 'none (terminal state)'}."
            ),
        )


def _apply_status_flags(loan: LoanApplication, new_status: LoanStatus) -> None:
    """Sync boolean flags and timestamps when status changes."""
    now = datetime.utcnow()
    loan.status = new_status.value
    loan.changed_status_at = now
    loan.is_new = False

    if new_status == LoanStatus.APPROVED:
        loan.is_approved = True
        loan.is_answered = True
        loan.approved_at = now
    elif new_status == LoanStatus.REJECTED:
        loan.is_rejected = True
        loan.is_answered = True
        loan.rejected_at = now
    elif new_status == LoanStatus.ARCHIVED:
        loan.is_archived = True
        loan.archived_at = now


# ============================================================================
# Helper: Build Response Schema
# ============================================================================

def _build_loan_read(loan: LoanApplication) -> LoanApplicationReadSchema:
    """Build a full LoanApplicationReadSchema from a LoanApplication ORM object."""
    detail_read: LoanApplicationDetailRead | None = None
    if loan.details:
        detail_read = LoanApplicationDetailRead.model_validate(loan.details)

    notes_read: list[LoanApplicationNoteRead] = [
        LoanApplicationNoteRead.model_validate(n) for n in (loan.notes or [])
    ]

    return LoanApplicationReadSchema(
        id=loan.id,
        customer_id=loan.customer_id,
        user_id=loan.user_id,
        status=loan.status,
        changed_status_at=loan.changed_status_at,
        is_answered=loan.is_answered,
        is_approved=loan.is_approved,
        is_rejected=loan.is_rejected,
        is_archived=loan.is_archived,
        is_new=loan.is_new,
        is_edited=loan.is_edited,
        is_active=loan.is_active,
        approved_at=loan.approved_at,
        rejected_at=loan.rejected_at,
        archived_at=loan.archived_at,
        created_at=loan.created_at,
        updated_at=loan.updated_at,
        detail=detail_read,
        notes=notes_read,
    )


# ============================================================================
# CRUD Operations
# ============================================================================

async def create_loan_application(
    session: Session,
    data: LoanApplicationCreate,
    user_id: int | None = None,
) -> LoanApplicationReadSchema:
    """
    Create a new loan application with its financial details.

    Validates that the customer exists before creating.
    """
    # Validate customer exists
    customer = session.get(Customer, data.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {data.customer_id} not found.",
        )

    # Create loan application
    loan = LoanApplication(
        customer_id=data.customer_id,
        user_id=user_id,
        status=LoanStatus.RECEIVED.value,
    )
    session.add(loan)
    session.flush()  # Get loan.id

    # Create nested detail
    detail = LoanApplicationDetail(
        loan_application_id=loan.id,
        amount=data.detail.amount,
        term=data.detail.term,
        rate=data.detail.rate,
        quota=data.detail.quota,
        frequency=data.detail.frequency,
        purpose=data.detail.purpose,
        customer_comment=data.detail.customer_comment,
    )
    session.add(detail)
    session.commit()
    session.refresh(loan)
    session.refresh(detail)

    # Attach detail and empty notes for response building
    loan.details = detail
    loan.notes = []

    return _build_loan_read(loan)


async def get_loan_application_with_relations(
    session: Session, loan_id: int
) -> LoanApplicationReadSchema | None:
    """Fetch a loan application by ID with all related data."""
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return None

    # Eagerly load relations via explicit queries
    detail = session.exec(
        select(LoanApplicationDetail).where(
            LoanApplicationDetail.loan_application_id == loan_id
        )
    ).first()

    notes = session.exec(
        select(LoanApplicationNote).where(
            LoanApplicationNote.loan_application_id == loan_id
        )
    ).all()

    loan.details = detail
    loan.notes = list(notes)

    return _build_loan_read(loan)


async def list_loan_applications(
    session: Session,
    filters: LoanApplicationFilterSchema,
    pagination: PaginationParams,
) -> PaginatedResponse[LoanApplicationListItem]:
    """List loan applications with filtering and pagination."""
    query = select(LoanApplication)

    # Apply filters
    if filters.customer_id is not None:
        query = query.where(LoanApplication.customer_id == filters.customer_id)
    if filters.status is not None:
        query = query.where(LoanApplication.status == filters.status.value)
    if filters.is_active is not None:
        query = query.where(LoanApplication.is_active == filters.is_active)
    if filters.is_approved is not None:
        query = query.where(LoanApplication.is_approved == filters.is_approved)
    if filters.is_rejected is not None:
        query = query.where(LoanApplication.is_rejected == filters.is_rejected)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    # Apply pagination
    offset = (pagination.page - 1) * pagination.per_page
    loans = session.exec(
        query.order_by(LoanApplication.created_at.desc())
        .offset(offset)
        .limit(pagination.per_page)
    ).all()

    # Build list items (include amount from detail for convenience)
    items: list[LoanApplicationListItem] = []
    for loan in loans:
        detail = session.exec(
            select(LoanApplicationDetail).where(
                LoanApplicationDetail.loan_application_id == loan.id
            )
        ).first()

        item = LoanApplicationListItem(
            id=loan.id,
            customer_id=loan.customer_id,
            user_id=loan.user_id,
            status=loan.status,
            is_active=loan.is_active,
            is_approved=loan.is_approved,
            is_rejected=loan.is_rejected,
            is_archived=loan.is_archived,
            is_new=loan.is_new,
            amount=detail.amount if detail else None,
            created_at=loan.created_at,
            updated_at=loan.updated_at,
        )
        items.append(item)

    return PaginatedResponse.create(
        items=items,
        total=total,
        page=pagination.page,
        per_page=pagination.per_page,
    )


async def update_loan_application(
    session: Session,
    loan_id: int,
    data: LoanApplicationUpdate,
) -> LoanApplicationReadSchema | None:
    """Partial update of a loan application's detail."""
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return None

    if data.detail is not None:
        # Update existing detail or create if missing
        detail = session.exec(
            select(LoanApplicationDetail).where(
                LoanApplicationDetail.loan_application_id == loan_id
            )
        ).first()

        if detail:
            detail.amount = data.detail.amount
            detail.term = data.detail.term
            detail.rate = data.detail.rate
            detail.quota = data.detail.quota
            detail.frequency = data.detail.frequency
            detail.purpose = data.detail.purpose
            detail.customer_comment = data.detail.customer_comment
            detail.updated_at = datetime.utcnow()
        else:
            detail = LoanApplicationDetail(
                loan_application_id=loan_id,
                amount=data.detail.amount,
                term=data.detail.term,
                rate=data.detail.rate,
                quota=data.detail.quota,
                frequency=data.detail.frequency,
                purpose=data.detail.purpose,
                customer_comment=data.detail.customer_comment,
            )
            session.add(detail)

        loan.is_edited = True
        loan.updated_at = datetime.utcnow()

    session.commit()
    session.refresh(loan)

    return await get_loan_application_with_relations(session, loan_id)


async def transition_loan_status(
    session: Session,
    loan_id: int,
    data: LoanApplicationStatusUpdate,
    user_id: int | None = None,
) -> LoanApplicationReadSchema | None:
    """
    Transition a loan application to a new status.

    Validates the transition against the state machine before applying.
    Optionally adds a note on status change.
    """
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return None

    # Validate transition
    _validate_status_transition(loan.status, data.status)

    # Apply status change and sync flags
    _apply_status_flags(loan, data.status)
    session.add(loan)

    # Optionally add a note
    if data.note:
        note = LoanApplicationNote(
            loan_application_id=loan_id,
            note=data.note,
            user_id=user_id,
        )
        session.add(note)

    session.commit()
    session.refresh(loan)

    return await get_loan_application_with_relations(session, loan_id)


async def associate_credit_risk(
    session: Session,
    loan_id: int,
    credit_risk_id: int,
) -> LoanApplicationReadSchema | None:
    """
    Associate a credit risk with a loan application.

    Validates that both the loan and the credit risk exist.
    Stores the association as a note for audit trail.
    """
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return None

    credit_risk = session.get(CreditRisk, credit_risk_id)
    if not credit_risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Credit risk with ID {credit_risk_id} not found.",
        )

    # Store association as a structured note for audit trail
    note = LoanApplicationNote(
        loan_application_id=loan_id,
        note=f"[CREDIT_RISK] Associated credit risk: '{credit_risk.name}' (ID: {credit_risk_id})",
    )
    session.add(note)
    session.commit()

    return await get_loan_application_with_relations(session, loan_id)


async def add_loan_note(
    session: Session,
    loan_id: int,
    data: LoanApplicationNoteCreate,
    user_id: int | None = None,
) -> LoanApplicationReadSchema | None:
    """Add a note to a loan application."""
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return None

    note = LoanApplicationNote(
        loan_application_id=loan_id,
        note=data.note,
        user_id=user_id,
    )
    session.add(note)
    session.commit()

    return await get_loan_application_with_relations(session, loan_id)


async def soft_delete_loan_application(
    session: Session, loan_id: int
) -> bool:
    """
    Soft delete a loan application by setting is_active=False.

    Returns True if deleted, False if not found.
    """
    loan = session.get(LoanApplication, loan_id)
    if not loan:
        return False

    loan.is_active = False
    loan.updated_at = datetime.utcnow()
    session.add(loan)
    session.commit()
    return True
