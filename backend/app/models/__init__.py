"""
SQLModel Models - Database tables and API schemas.
"""
from app.models.user import User, UserCreate, UserRead, UserLogin
from app.models.customer import (
    Customer,
    CustomerDetail,
    CustomerFinancialInfo,
    CustomerJobInfo,
    CustomerReference,
    CustomerVehicle,
    CustomersAccount,
    Company,
)
from app.models.loan_application import (
    LoanApplication,
    LoanApplicationDetail,
    LoanApplicationNote,
    LoanStatus,
)
from app.models.phone import Phone
from app.models.address import Address, Addressable
from app.models.portfolio import Portfolio, Broker, Promoter
from app.models.credit_risk import CreditRisk, CreditRiskCategory

__all__ = [
    "User",
    "UserCreate",
    "UserRead",
    "UserLogin",
    "Customer",
    "CustomerDetail",
    "CustomerFinancialInfo",
    "CustomerJobInfo",
    "CustomerReference",
    "CustomerVehicle",
    "CustomersAccount",
    "Company",
    "LoanApplication",
    "LoanApplicationDetail",
    "LoanApplicationNote",
    "LoanStatus",
    "Phone",
    "Address",
    "Addressable",
    "Portfolio",
    "Broker",
    "Promoter",
    "CreditRisk",
    "CreditRiskCategory",
]
