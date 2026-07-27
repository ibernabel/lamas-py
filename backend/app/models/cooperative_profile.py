from typing import Optional
from sqlmodel import Field, SQLModel


class CooperativeProfile(SQLModel, table=True):
    """Cooperative member profile tracking dual balances and metrics."""

    __tablename__ = "cooperative_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", unique=True, index=True, nullable=False)
    member_number: str = Field(max_length=50, unique=True, index=True, nullable=False)
    b2b_company_id: Optional[int] = Field(default=None, foreign_key="companies.id", nullable=True)

    share_balance: float = Field(default=0.0, nullable=False)
    savings_balance: float = Field(default=0.0, nullable=False)
    outstanding_loan_balance: float = Field(default=0.0, nullable=False)

    @property
    def net_exposure(self) -> float:
        """Calculates net exposure (outstanding loans minus shares and savings)."""
        return self.outstanding_loan_balance - (self.share_balance + self.savings_balance)
