"""
factory_boy factories for loan application test data.

Provides factories for:
- LoanApplication
- LoanApplicationDetail
- LoanApplicationNote
- CreditRiskCategory
- CreditRisk

Usage:
    loan = LoanApplicationFactory.build()         # Memory only
    detail = LoanApplicationDetailFactory.build() # Memory only
"""
import factory
from factory import fuzzy

from app.models.loan_application import (
    LoanApplication,
    LoanApplicationDetail,
    LoanApplicationNote,
    LoanStatus,
)
from app.models.credit_risk import CreditRisk, CreditRiskCategory


class LoanApplicationFactory(factory.Factory):
    """Factory for LoanApplication model."""

    class Meta:
        model = LoanApplication

    id = factory.Sequence(lambda n: n + 1)
    customer_id = None  # Set externally
    user_id = None
    status = LoanStatus.RECEIVED.value
    changed_status_at = None
    is_answered = False
    is_approved = False
    is_rejected = False
    is_archived = False
    is_new = True
    is_edited = False
    is_active = True
    approved_at = None
    rejected_at = None
    archived_at = None


class LoanApplicationDetailFactory(factory.Factory):
    """Factory for LoanApplicationDetail model."""

    class Meta:
        model = LoanApplicationDetail

    id = factory.Sequence(lambda n: n + 1)
    loan_application_id = None  # Set externally
    amount = fuzzy.FuzzyDecimal(10000, 500000, precision=2)
    term = fuzzy.FuzzyInteger(6, 60)  # 6 to 60 months
    rate = fuzzy.FuzzyDecimal(5.0, 30.0, precision=2)
    quota = fuzzy.FuzzyDecimal(500, 20000, precision=2)
    frequency = fuzzy.FuzzyChoice(["monthly", "biweekly", "weekly"])
    purpose = fuzzy.FuzzyChoice(
        ["home improvement", "vehicle purchase",
            "debt consolidation", "education", "business"]
    )
    customer_comment = factory.Faker("sentence", nb_words=10)


class LoanApplicationNoteFactory(factory.Factory):
    """Factory for LoanApplicationNote model."""

    class Meta:
        model = LoanApplicationNote

    id = factory.Sequence(lambda n: n + 1)
    loan_application_id = None  # Set externally
    note = factory.Faker("sentence", nb_words=15)
    user_id = None


class CreditRiskCategoryFactory(factory.Factory):
    """Factory for CreditRiskCategory model."""

    class Meta:
        model = CreditRiskCategory

    id = factory.Sequence(lambda n: n + 1)
    name = fuzzy.FuzzyChoice(
        ["Low Risk", "Medium Risk", "High Risk", "Very High Risk"])
    description = factory.Faker("sentence", nb_words=8)


class CreditRiskFactory(factory.Factory):
    """Factory for CreditRisk model."""

    class Meta:
        model = CreditRisk

    id = factory.Sequence(lambda n: n + 1)
    name = fuzzy.FuzzyChoice(
        ["Insufficient income", "Bad credit history",
            "High debt ratio", "No collateral"]
    )
    description = factory.Faker("sentence", nb_words=10)
    category_id = None  # Set externally
