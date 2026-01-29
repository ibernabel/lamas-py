"""
Loan Application endpoints - Scaffolding for Phase 3.
"""
from fastapi import APIRouter

from app.api.v1.deps import CurrentUser, DatabaseSession

router = APIRouter()


@router.get("/")
def list_loan_applications(
    current_user: CurrentUser,
    session: DatabaseSession,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    """
    List loan applications.
    TODO: Implement in Phase 3.
    """
    return {
        "message": "Loan application list endpoint - To be implemented in Phase 3",
        "authenticated_user": current_user.email,
    }


@router.get("/{loan_id}")
def get_loan_application(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> dict:
    """
    Get loan application by ID.
    TODO: Implement in Phase 3.
    """
    return {
        "message": f"Get loan application {loan_id} - To be implemented in Phase 3",
        "authenticated_user": current_user.email,
    }


@router.post("/{loan_id}/evaluate")
def evaluate_loan_application(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> dict:
    """
    Trigger AI evaluation for loan application.
    NOTE: This is a placeholder endpoint for future AI integration (out of scope).
    TODO: Implement in future phases.
    """
    return {
        "message": f"AI Evaluation endpoint for loan {loan_id} - Placeholder for future AI service integration",
        "authenticated_user": current_user.email,
        "status": "not_implemented",
    }
