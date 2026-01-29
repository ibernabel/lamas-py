"""
Loan Application and related models.
"""
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.customer import Customer


class LoanStatus(str, Enum):
    """Loan application status enum."""

    RECEIVED = "received"
    VERIFIED = "verified"
    ASSIGNED = "assigned"
    ANALYZED = "analyzed"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class LoanApplication(SQLModel, table=True):
    """Loan application database model."""

    __tablename__ = "loan_applications"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int | None = Field(default=None, foreign_key="customers.id")
    user_id: int | None = Field(default=None, foreign_key="users.id")
    status: str = Field(default="received", max_length=50)  # Stored as string in DB
    changed_status_at: datetime | None = Field(default=None)
    is_answered: bool = Field(default=False)
    is_approved: bool = Field(default=False)
    is_rejected: bool = Field(default=False)
    is_archived: bool = Field(default=False)
    is_new: bool = Field(default=True)
    is_edited: bool = Field(default=False)
    is_active: bool = Field(default=True)
    approved_at: datetime | None = Field(default=None)
    rejected_at: datetime | None = Field(default=None)
    archived_at: datetime | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: "Customer | None" = Relationship(back_populates="loan_applications")
    details: "LoanApplicationDetail | None" = Relationship(back_populates="loan_application")
    notes: list["LoanApplicationNote"] = Relationship(back_populates="loan_application")


class LoanApplicationDetail(SQLModel, table=True):
    """Loan application financial details."""

    __tablename__ = "loan_application_details"

    id: int | None = Field(default=None, primary_key=True)
    loan_application_id: int = Field(foreign_key="loan_applications.id")
    amount: float = Field(default=0)
    term: int = Field(default=0)  # In months
    rate: float = Field(default=0)  # Interest rate
    quota: float = Field(default=0)  # Monthly payment
    frequency: str | None = Field(default=None, max_length=50)
    purpose: str | None = Field(default=None)
    customer_comment: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    loan_application: LoanApplication = Relationship(back_populates="details")


class LoanApplicationNote(SQLModel, table=True):
    """Notes on loan applications."""

    __tablename__ = "loan_application_notes"

    id: int | None = Field(default=None, primary_key=True)
    loan_application_id: int = Field(foreign_key="loan_applications.id")
    note: str
    user_id: int | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    loan_application: LoanApplication = Relationship(back_populates="notes")
