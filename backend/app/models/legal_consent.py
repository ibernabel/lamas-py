from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class LegalConsent(SQLModel, table=True):
    """Legal consent audit record adhering to Dominican Republic Law 172-13."""

    __tablename__ = "legal_consents"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", index=True, nullable=False)
    loan_application_id: int = Field(foreign_key="loan_applications.id", unique=True, index=True, nullable=False)

    privacy_consent_accepted: bool = Field(default=True, nullable=False)
    bureau_authorization_accepted: bool = Field(default=True, nullable=False)
    ai_processing_accepted: bool = Field(default=True, nullable=False)

    consent_timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    consent_ip_address: str = Field(max_length=45, nullable=False)
