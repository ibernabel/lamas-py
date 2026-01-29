"""
Authentication endpoints - Login, logout, token refresh.
"""
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
)
from app.models.user import User, UserLogin

router = APIRouter()


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(user_login: UserLogin, session: DatabaseSession) -> TokenResponse:
    """
    User login endpoint.
    Returns access and refresh tokens.
    """
    # Find user by email
    statement = select(User).where(User.email == user_login.email)
    user = session.exec(statement).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Verify password
    if not verify_password(user_login.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Check if user is approved
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account not approved",
        )

    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/logout")
def logout(current_user: CurrentUser) -> dict:
    """
    User logout endpoint.
    Note: With JWT, actual logout is handled client-side by removing the token.
    This endpoint just confirms the operation.
    """
    return {"message": "Successfully logged out"}


@router.get("/me")
def get_me(current_user: CurrentUser) -> dict:
    """Get current user information."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_approved": current_user.is_approved,
    }
