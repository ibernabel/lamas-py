"""
Loan Application Pydantic schemas for request/response validation.

This module defines all schemas for loan application CRUD operations including:
- Input schemas for creating/updating loan applications and nested data
- Output schemas for API responses
- Status workflow schemas
- Credit risk association schemas
"""
from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from app.models.loan_application import LoanStatus
from app.schemas.customer import PaginatedResponse, PaginationParams  # noqa: F401 - re-exported


# ============================================================================
# Input Schemas (Create/Update)
# ============================================================================


class LoanApplicationDetailCreate(BaseModel):
    """Loan application financial details schema."""

    amount: float = Field(gt=0, description="Loan amount requested (must be > 0)")
    term: int = Field(gt=0, description="Loan term in months (must be > 0)")
    rate: float = Field(ge=0, le=100, description="Annual interest rate (0-100%)")
    quota: float = Field(ge=0, description="Monthly payment amount")
    frequency: str | None = Field(
        None,
        max_length=50,
        description="Payment frequency (monthly, biweekly, weekly)",
    )
    purpose: str | None = Field(None, description="Loan purpose description")
    customer_comment: str | None = Field(None, description="Customer's comment")


class LoanApplicationCreate(BaseModel):
    """Schema for creating a new loan application."""

    customer_id: int = Field(description="ID of the customer applying for the loan")
    detail: LoanApplicationDetailCreate


class LoanApplicationUpdate(BaseModel):
    """Schema for updating a loan application (partial updates supported)."""

    detail: LoanApplicationDetailCreate | None = None


class LoanApplicationStatusUpdate(BaseModel):
    """Schema for transitioning loan application status."""

    status: LoanStatus = Field(description="Target status for the loan application")
    note: str | None = Field(
        None, description="Optional note explaining the status change"
    )


class LoanApplicationNoteCreate(BaseModel):
    """Schema for adding a note to a loan application."""

    note: str = Field(min_length=1, description="Note content")


class CreditRiskAssociation(BaseModel):
    """Schema for associating a credit risk with a loan application."""

    credit_risk_id: int = Field(description="ID of the credit risk to associate")


# ============================================================================
# Output Schemas (API Responses)
# ============================================================================


class LoanApplicationDetailRead(BaseModel):
    """Loan application detail response schema."""

    id: int
    amount: float
    term: int
    rate: float
    quota: float
    frequency: str | None = None
    purpose: str | None = None
    customer_comment: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoanApplicationNoteRead(BaseModel):
    """Loan application note response schema."""

    id: int
    note: str
    user_id: int | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoanApplicationListItem(BaseModel):
    """Loan application list item schema for paginated responses."""

    id: int
    customer_id: int | None = None
    user_id: int | None = None
    status: str
    is_active: bool
    is_approved: bool
    is_rejected: bool
    is_archived: bool
    is_new: bool
    amount: float | None = None   # Pulled from detail for convenience
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoanApplicationReadSchema(BaseModel):
    """
    Full loan application response schema with all relationships.

    Used for GET /loan-applications/{id} and POST /loan-applications/ responses.
    """

    id: int
    customer_id: int | None = None
    user_id: int | None = None
    status: str
    changed_status_at: datetime | None = None
    is_answered: bool
    is_approved: bool
    is_rejected: bool
    is_archived: bool
    is_new: bool
    is_edited: bool
    is_active: bool
    approved_at: datetime | None = None
    rejected_at: datetime | None = None
    archived_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Nested data
    detail: LoanApplicationDetailRead | None = None
    notes: list[LoanApplicationNoteRead] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Credit Risk Schemas
# ============================================================================


class CreditRiskCategoryRead(BaseModel):
    """Credit risk category response schema."""

    id: int
    name: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CreditRiskRead(BaseModel):
    """Credit risk response schema."""

    id: int
    name: str
    description: str | None = None
    category_id: int | None = None
    category: CreditRiskCategoryRead | None = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Filter Schemas
# ============================================================================


class LoanApplicationFilterSchema(BaseModel):
    """Filter schema for loan application search."""

    customer_id: int | None = None
    status: LoanStatus | None = None
    is_active: bool | None = None
    is_approved: bool | None = None
    is_rejected: bool | None = None
