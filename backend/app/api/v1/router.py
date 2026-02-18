"""
API v1 Router - Aggregates all endpoint routers.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, customers, credit_risks, loan_applications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(
    customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(
    loan_applications.router, prefix="/loan-applications", tags=["loan-applications"]
)
api_router.include_router(
    credit_risks.router, prefix="/credit-risks", tags=["credit-risks"]
)
