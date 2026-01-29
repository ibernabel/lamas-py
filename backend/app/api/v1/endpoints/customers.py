"""
Customer endpoints - Scaffolding for Phase 2.
"""
from fastapi import APIRouter

from app.api.v1.deps import CurrentUser, DatabaseSession

router = APIRouter()


@router.get("/")
def list_customers(
    current_user: CurrentUser,
    session: DatabaseSession,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """
    List customers.
    TODO: Implement in Phase 2.
    """
    return {
        "message": "Customer list endpoint - To be implemented in Phase 2",
        "authenticated_user": current_user.email,
    }


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> dict:
    """
    Get customer by ID.
    TODO: Implement in Phase 2.
    """
    return {
        "message": f"Get customer {customer_id} - To be implemented in Phase 2",
        "authenticated_user": current_user.email,
    }
