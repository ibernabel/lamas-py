from enum import Enum
from typing import Any, Dict, Optional
from sqlmodel import Column, Field, JSON, SQLModel


class ShadowRiskLevel(str, Enum):
    NONE = "NONE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    CRITICAL = "CRITICAL"


class CustomerShadowRisk(SQLModel, table=True):
    """Customer telemetry and shadow risk profile model."""

    __tablename__ = "customer_shadow_risks"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", unique=True, index=True, nullable=False)

    rem_subsistence_amount: float = Field(default=0.0, nullable=False)
    dti_ratio: float = Field(default=0.0, nullable=False)
    bureau_recent_inquiries_count: int = Field(default=0, nullable=False)

    same_day_withdrawal_flag: bool = Field(default=False, nullable=False)
    online_banking_risk_flag: bool = Field(default=False, nullable=False)
    clipboard_paste_detected: bool = Field(default=False, nullable=False)

    keystroke_latency_ms: float = Field(default=0.0, nullable=False)
    device_fingerprint: Optional[str] = Field(default=None, max_length=100, nullable=True)

    step_timings_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    shadow_risk_level: ShadowRiskLevel = Field(default=ShadowRiskLevel.NONE, nullable=False)
