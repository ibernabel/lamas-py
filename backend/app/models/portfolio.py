"""
Portfolio, Broker, and Promoter models.
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.customer import Customer


class Portfolio(SQLModel, table=True):
    """Portfolio model."""

    __tablename__ = "portfolios"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    broker_id: int | None = Field(default=None, foreign_key="brokers.id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    broker: "Broker | None" = Relationship(back_populates="portfolio")


class Broker(SQLModel, table=True):
    """Broker model."""

    __tablename__ = "brokers"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="broker")
    portfolio: "Portfolio | None" = Relationship(back_populates="broker")


class Promoter(SQLModel, table=True):
    """Promoter model."""

    __tablename__ = "promoters"

    id: int | None = Field(default=None, primary_key=True)
    NID: str = Field(unique=True, max_length=11, sa_column_kwargs={"name": "NID"})
    bonus_type: str | None = Field(default=None, max_length=50)
    bonus_value: float | None = Field(default=None)
    bank_name: str | None = Field(default=None, max_length=255)
    bank_account_number: str | None = Field(default=None, max_length=100)
    bank_account_type: str | None = Field(default=None, max_length=50)
    bank_account_name: str | None = Field(default=None, max_length=255)
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="promoter")
