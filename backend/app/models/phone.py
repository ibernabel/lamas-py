"""
Phone model - Polymorphic relationship.
"""
from datetime import datetime

from sqlmodel import Field, SQLModel


class Phone(SQLModel, table=True):
    """Phone model with polymorphic relationship."""

    __tablename__ = "phones"

    id: int | None = Field(default=None, primary_key=True)
    country_area: str | None = Field(default=None, max_length=10)
    number: str = Field(max_length=50)
    extension: str | None = Field(default=None, max_length=10)
    type: str | None = Field(default=None, max_length=50)
    phoneable_id: int = Field(foreign_key=None)  # Polymorphic
    phoneable_type: str = Field(max_length=255)  # Polymorphic type
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Note: Polymorphic relationships in SQLModel require manual handling
    # We'll implement helper methods in service layer
