"""
CreditGraph Analysis models.
"""
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, JSON

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.loan_application import LoanApplication


class CreditGraphAnalysis(SQLModel, table=True):
    """CreditGraph analysis database model."""

    __tablename__ = "creditgraph_analyses"

    id: int | None = Field(default=None, primary_key=True)
    loan_application_id: int = Field(
        foreign_key="loan_applications.id", unique=True, index=True
    )

    # CreditGraph response fields
    case_id: str = Field(max_length=50, unique=True, index=True)
    decision: str = Field(max_length=50)  # APPROVED, REJECTED, MANUAL_REVIEW, APPROVED_PENDING_REVIEW
    irs_score: int = Field(index=True)
    confidence: float
    risk_level: str = Field(max_length=20, index=True)  # LOW, MEDIUM, HIGH, CRITICAL

    suggested_amount: float | None = Field(default=None)
    suggested_term: int | None = Field(default=None)

    # Full response for dashboard and audit trail
    full_response: dict = Field(sa_column=Column(JSON), default={})

    # Metadata
    analyzed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    processing_time_ms: int | None = Field(default=None)

    # Relationships
    loan_application: "LoanApplication" = Relationship(
        back_populates="creditgraph_analysis"
    )
