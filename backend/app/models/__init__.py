"""
SQLModel Models - Database tables and API schemas.
"""
from app.models.user import User, UserCreate, UserRead, UserLogin
from app.models.creditgraph import CreditGraphAnalysis
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
from app.models.document import CustomerDocument
from app.models.system_integration_map import SystemIntegrationMap
from app.models.cooperative_profile import CooperativeProfile
from app.models.legal_consent import LegalConsent
from app.models.customer_shadow_risk import CustomerShadowRisk, ShadowRiskLevel
from app.models.conversational_log import ConversationalLog
from app.models.core_task_queue import CoreTaskQueue, TaskType, TaskStatus
from app.models.system_config import SystemConfig

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
    "CustomerDocument",
    "SystemIntegrationMap",
    "CooperativeProfile",
    "LegalConsent",
    "CustomerShadowRisk",
    "ShadowRiskLevel",
    "ConversationalLog",
    "CoreTaskQueue",
    "TaskType",
    "TaskStatus",
    "SystemConfig",
]
