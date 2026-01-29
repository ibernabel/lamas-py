"""
Credit Risk models.
"""
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


class CreditRiskCategory(SQLModel, table=True):
    """Credit risk category model."""

    __tablename__ = "credit_risk_categories"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    credit_risks: list["CreditRisk"] = Relationship(back_populates="category")


class CreditRisk(SQLModel, table=True):
    """Credit risk model."""

    __tablename__ = "credit_risks"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: str | None = Field(default=None)
    category_id: int | None = Field(default=None, foreign_key="credit_risk_categories.id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    category: CreditRiskCategory | None = Relationship(back_populates="credit_risks")
