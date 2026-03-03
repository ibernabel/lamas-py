"""
CreditGraph API endpoints.
"""
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.schemas.creditgraph import (
    CreditGraphAnalysisRead,
    CreditGraphAnalysisTriggerResponse,
    CreditGraphAnalysisNotFound,
)
from app.services.creditgraph_client import CreditGraphClient
from app.services.creditgraph_service import trigger_analysis, get_existing_analysis

router = APIRouter()


@router.get(
    "/loan-applications/{loan_id}/analysis",
    response_model=CreditGraphAnalysisRead,
    responses={404: {"model": CreditGraphAnalysisNotFound}},
)
async def get_loan_analysis_endpoint(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> Any:
    """
    Get existing CreditGraph analysis for a loan application.
    """
    analysis = get_existing_analysis(session, loan_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No analysis found for loan application {loan_id}",
        )
    return analysis


@router.post(
    "/loan-applications/{loan_id}/analyze",
    response_model=CreditGraphAnalysisRead,
    status_code=status.HTTP_200_OK,
)
async def trigger_loan_analysis_endpoint(
    loan_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
    force: bool = Query(
        False, description="Force re-analysis even if it exists"),
) -> CreditGraphAnalysisRead:
    """
    Trigger CreditGraph AI analysis for a loan application.

    If an analysis already exists, it returns the cached result unless 'force=true' is passed.
    """
    try:
        return trigger_analysis(session, loan_id, force_reanalyze=force)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CreditGraph API error: {str(e)}",
        )


@router.get("/health")
async def check_creditgraph_health_endpoint(
    current_user: CurrentUser,
) -> dict:
    """
    Check if CreditGraph AI service is reachable.
    """
    client = CreditGraphClient()
    healthy = client.health_check()
    return {"status": "healthy" if healthy else "unhealthy"}
