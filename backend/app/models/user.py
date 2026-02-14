"""
User model - Simplified authentication (no Teams).
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.portfolio import Broker, Promoter


class UserBase(SQLModel):
    """Base user fields for API schemas."""

    name: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    is_approved: bool = Field(default=False)


class User(UserBase, table=True):
    """User database model."""

    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    password: str = Field(max_length=255)
    email_verified_at: datetime | None = Field(default=None)
    remember_token: str | None = Field(default=None, max_length=100)
    profile_photo_path: str | None = Field(default=None, max_length=2048)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    broker: "Broker" = Relationship(back_populates="user")
    promoter: "Promoter" = Relationship(back_populates="user")


class UserCreate(SQLModel):
    """Schema for creating a user."""

    name: str
    email: str
    password: str


class UserRead(UserBase):
    """Schema for reading a user (API response)."""

    id: int
    email_verified_at: datetime | None = None
    created_at: datetime | None


class UserLogin(SQLModel):
    """Schema for user login."""

    email: str
    password: str
