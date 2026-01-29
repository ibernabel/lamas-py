"""
Address model with many-to-many relationship.
"""
from datetime import datetime

from sqlmodel import Field, SQLModel


class Address(SQLModel, table=True):
    """Address model."""

    __tablename__ = "addresses"

    id: int | None = Field(default=None, primary_key=True)
    street: str = Field(max_length=255)
    street2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    type: str | None = Field(default=None, max_length=50)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    references: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)


class Addressable(SQLModel, table=True):
    """Pivot table for many-to-many Address relationships."""

    __tablename__ = "addressables"

    id: int | None = Field(default=None, primary_key=True)
    address_id: int = Field(foreign_key="addresses.id")
    addressable_id: int  # Polymorphic ID
    addressable_type: str = Field(max_length=255)  # Polymorphic type (e.g., 'App\\Models\\Company')
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)
