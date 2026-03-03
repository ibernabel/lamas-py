"""
CreditGraph API schemas.
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class CreditGraphAnalysisRead(BaseModel):
    """Schema for reading CreditGraph analysis data."""

    id: int
    loan_application_id: int
    case_id: str
    decision: Literal[
        "APPROVED", "REJECTED", "MANUAL_REVIEW", "APPROVED_PENDING_REVIEW"
    ]
    irs_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    suggested_amount: Optional[float] = None
    suggested_term: Optional[int] = None
    full_response: dict
    analyzed_at: datetime
    processing_time_ms: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class CreditGraphAnalysisTriggerResponse(BaseModel):
    """Response returned after triggering an analysis."""

    loan_id: int
    status: str
    message: str
    analysis: Optional[CreditGraphAnalysisRead] = None


class CreditGraphAnalysisNotFound(BaseModel):
    """Response when no analysis is found for a loan."""

    loan_id: int
    message: str
