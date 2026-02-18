"""
Credit Risk catalog endpoints - Read-only.

Provides access to the credit risk categories and risks catalog
used for associating risks with loan applications.
"""
from fastapi import APIRouter, HTTPException, status

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.models.credit_risk import CreditRisk, CreditRiskCategory
from app.schemas.loan_application import CreditRiskCategoryRead, CreditRiskRead
from sqlmodel import select

router = APIRouter()


@router.get("/", response_model=list[CreditRiskCategoryRead])
async def list_credit_risk_categories(
    current_user: CurrentUser,
    session: DatabaseSession,
) -> list[CreditRiskCategoryRead]:
    """
    List all credit risk categories.

    Returns the full catalog of credit risk categories.
    Use GET /credit-risks/{id} to get risks within a category.
    """
    categories = session.exec(select(CreditRiskCategory)).all()
    return [CreditRiskCategoryRead.model_validate(c) for c in categories]


@router.get("/risks", response_model=list[CreditRiskRead])
async def list_credit_risks(
    current_user: CurrentUser,
    session: DatabaseSession,
) -> list[CreditRiskRead]:
    """
    List all credit risks with their categories.

    Use this endpoint to browse available credit risks
    before associating one with a loan application via
    PATCH /loan-applications/{id}/credit-risk.
    """
    risks = session.exec(select(CreditRisk)).all()
    result = []
    for risk in risks:
        category = session.get(
            CreditRiskCategory, risk.category_id) if risk.category_id else None
        result.append(
            CreditRiskRead(
                id=risk.id,
                name=risk.name,
                description=risk.description,
                category_id=risk.category_id,
                category=CreditRiskCategoryRead.model_validate(
                    category) if category else None,
            )
        )
    return result


@router.get("/risks/{risk_id}", response_model=CreditRiskRead)
async def get_credit_risk(
    risk_id: int,
    current_user: CurrentUser,
    session: DatabaseSession,
) -> CreditRiskRead:
    """Get a specific credit risk by ID."""
    risk = session.get(CreditRisk, risk_id)
    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Credit risk with ID {risk_id} not found.",
        )
    category = session.get(
        CreditRiskCategory, risk.category_id) if risk.category_id else None
    return CreditRiskRead(
        id=risk.id,
        name=risk.name,
        description=risk.description,
        category_id=risk.category_id,
        category=CreditRiskCategoryRead.model_validate(
            category) if category else None,
    )
