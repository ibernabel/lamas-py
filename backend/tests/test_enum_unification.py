"""
Tests for Enum Unification — Opción B.

Validates that:
- Backend Pydantic schemas accept new Dominican-context values (common_law, technical, family).
- Backend rejects UPPERCASE enum values via ValidationError (HTTP 422).
- LoanSubmissionService correctly maps wizard's housing_type to housing_possession_type.
- LoanSubmissionService derives is_self_employed from occupation_type.
- CreditGraph service includes housing_possession_type in its payload.
"""
import pytest
from unittest.mock import MagicMock, patch
from pydantic import ValidationError
from sqlmodel import Session

from app.schemas.customer import CustomerDetailCreate, CustomerJobInfoCreate
from app.services.loan_submission_service import LoanSubmissionService


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _base_payload(**overrides) -> dict:
    """Build a minimal valid public wizard payload."""
    payload = {
        "identity": {
            "nid": "001-0000099-9",
            "first_name": "Ana",
            "last_name": "García",
            "mobile_phone": "8095550099",
            "email": "ana.garcia@example.com",
        },
        "profile": {
            "marital_status": "single",
            "housing_type": "owned",
            "housing_monthly_payment": 0.0,
            "education_level": "bachelor",
        },
        "job": {
            "occupation_type": "employed",
            "company_name": "Empresa ABC SRL",
            "role": "Coordinadora",
            "salary": 45000.0,
        },
        "financial": {"other_income": 5000.0},
        "loan_request": {
            "amount": 80000.0,
            "term_months": 18,
            "purpose": "renovation",
            "notes": None,
        },
        "legal_consent": {
            "privacy_consent_accepted": True,
            "bureau_authorization_accepted": True,
            "ai_processing_accepted": True,
            "consent_timestamp": "2026-07-30T12:00:00Z",
            "consent_ip_address": "10.0.0.1",
        },
        "telemetry": {
            "clipboard_paste_detected": False,
            "keystroke_latency_ms": 95.0,
            "device_fingerprint": "fp_enum_test_001",
            "step_timings_sec": {},
        },
    }
    payload.update(overrides)
    return payload


# ===========================================================================
# Unit Tests — Pydantic Schema Validation
# ===========================================================================


class TestMaritalStatusSchema:
    """marital_status: new value 'common_law' accepted, UPPERCASE rejected."""

    def test_common_law_accepted(self):
        """'common_law' must be accepted by CustomerDetailCreate."""
        detail = CustomerDetailCreate(
            first_name="Ana",
            last_name="García",
            marital_status="common_law",
        )
        assert detail.marital_status == "common_law"

    def test_all_valid_values_accepted(self):
        """All expected lowercase values must be accepted."""
        for value in ("single", "married", "divorced", "widowed", "common_law", "other"):
            detail = CustomerDetailCreate(
                first_name="Ana",
                last_name="García",
                marital_status=value,
            )
            assert detail.marital_status == value

    def test_uppercase_single_rejected(self):
        """UPPERCASE 'SINGLE' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerDetailCreate(
                first_name="Ana",
                last_name="García",
                marital_status="SINGLE",
            )

    def test_uppercase_common_law_rejected(self):
        """UPPERCASE 'COMMON_LAW' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerDetailCreate(
                first_name="Ana",
                last_name="García",
                marital_status="COMMON_LAW",
            )


class TestEducationLevelSchema:
    """education_level: new value 'technical' accepted, UPPERCASE rejected."""

    def test_technical_accepted(self):
        """'technical' must be accepted (Dominican-context addition)."""
        detail = CustomerDetailCreate(
            first_name="Ana",
            last_name="García",
            education_level="technical",
        )
        assert detail.education_level == "technical"

    def test_all_valid_values_accepted(self):
        """All 9 education level values must be accepted."""
        valid = (
            "primary", "secondary", "high_school", "technical",
            "bachelor", "postgraduate", "master", "doctorate", "other",
        )
        for value in valid:
            detail = CustomerDetailCreate(
                first_name="Ana", last_name="García", education_level=value
            )
            assert detail.education_level == value

    def test_uppercase_university_rejected(self):
        """UPPERCASE 'UNIVERSITY' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerDetailCreate(
                first_name="Ana",
                last_name="García",
                education_level="UNIVERSITY",
            )

    def test_uppercase_technical_rejected(self):
        """UPPERCASE 'TECHNICAL' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerDetailCreate(
                first_name="Ana",
                last_name="García",
                education_level="TECHNICAL",
            )


class TestHousingPossessionSchema:
    """housing_possession_type: new value 'family' accepted."""

    def test_family_accepted(self):
        """'family' must be accepted (Dominican-context addition)."""
        detail = CustomerDetailCreate(
            first_name="Ana",
            last_name="García",
            housing_possession_type="family",
        )
        assert detail.housing_possession_type == "family"

    def test_all_valid_values_accepted(self):
        """All possession type values must be accepted."""
        for value in ("owned", "rented", "mortgaged", "family", "other"):
            detail = CustomerDetailCreate(
                first_name="Ana", last_name="García", housing_possession_type=value
            )
            assert detail.housing_possession_type == value


class TestOccupationTypeSchema:
    """occupation_type: new field, all values accepted; UPPERCASE rejected."""

    def test_all_valid_values_accepted(self):
        """All four occupation_type values must be accepted."""
        for value in ("employed", "independent", "business_owner", "other"):
            job = CustomerJobInfoCreate(occupation_type=value)
            assert job.occupation_type == value

    def test_uppercase_employed_rejected(self):
        """UPPERCASE 'EMPLOYED' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerJobInfoCreate(occupation_type="EMPLOYED")

    def test_uppercase_business_owner_rejected(self):
        """UPPERCASE 'BUSINESS_OWNER' must raise a ValidationError."""
        with pytest.raises(ValidationError):
            CustomerJobInfoCreate(occupation_type="BUSINESS_OWNER")


# ===========================================================================
# Unit Tests — Business Logic (is_self_employed derivation)
# ===========================================================================


class TestIsSelfEmployedDerivation:
    """is_self_employed must be derived from occupation_type in LoanSubmissionService."""

    def _run_service(self, session: Session, occupation: str) -> dict:
        """Helper: run LoanSubmissionService with a given occupation_type."""
        import uuid
        nid = f"001{str(uuid.uuid4().int)[:7]}1"  # unique 11-digit NID
        payload = _base_payload()
        payload["identity"]["nid"] = nid
        payload["job"]["occupation_type"] = occupation
        service = LoanSubmissionService(session)
        return service.submit_loan(payload)

    def test_employed_is_not_self_employed(self, session: Session):
        """occupation_type='employed' → is_self_employed=False."""
        result = self._run_service(session, "employed")
        customer = result["customer"]
        session.refresh(customer)
        assert customer.job_info.is_self_employed is False

    def test_independent_is_self_employed(self, session: Session):
        """occupation_type='independent' → is_self_employed=True."""
        result = self._run_service(session, "independent")
        customer = result["customer"]
        session.refresh(customer)
        assert customer.job_info.is_self_employed is True
        assert customer.job_info.occupation_type == "independent"

    def test_business_owner_is_self_employed(self, session: Session):
        """occupation_type='business_owner' → is_self_employed=True."""
        result = self._run_service(session, "business_owner")
        customer = result["customer"]
        session.refresh(customer)
        assert customer.job_info.is_self_employed is True
        assert customer.job_info.occupation_type == "business_owner"


# ===========================================================================
# Integration Tests — LoanSubmissionService
# ===========================================================================


class TestHousingTypeMappingInService:
    """Wizard housing_type (possession) must be stored in housing_possession_type."""

    def test_owned_stored_in_possession_field(self, session: Session):
        """'owned' from wizard → CustomerDetail.housing_possession_type='owned', housing_type=None."""
        payload = _base_payload()
        payload["profile"]["housing_type"] = "owned"

        service = LoanSubmissionService(session)
        result = service.submit_loan(payload)
        customer = result["customer"]
        session.refresh(customer)

        assert customer.detail.housing_possession_type == "owned"
        assert customer.detail.housing_type is None

    def test_family_stored_in_possession_field(self, session: Session):
        """'family' from wizard → CustomerDetail.housing_possession_type='family'."""
        payload = _base_payload()
        payload["identity"]["nid"] = "001-1234568-2"
        payload["profile"]["housing_type"] = "family"

        service = LoanSubmissionService(session)
        result = service.submit_loan(payload)
        customer = result["customer"]
        session.refresh(customer)

        assert customer.detail.housing_possession_type == "family"


class TestSubmitLoanEnumIntegration:
    """Full submission payloads with new enum values must succeed."""

    def test_submit_with_common_law_marital_status(self, session: Session):
        """Submit with marital_status='common_law' → stored correctly."""
        payload = _base_payload()
        payload["identity"]["nid"] = "001-0000088-8"
        payload["profile"]["marital_status"] = "common_law"

        service = LoanSubmissionService(session)
        result = service.submit_loan(payload)
        customer = result["customer"]
        session.refresh(customer)

        assert customer.detail.marital_status == "common_law"

    def test_submit_with_technical_education_level(self, session: Session):
        """Submit with education_level='technical' → stored correctly."""
        payload = _base_payload()
        payload["identity"]["nid"] = "001-0000077-7"
        payload["profile"]["education_level"] = "technical"

        service = LoanSubmissionService(session)
        result = service.submit_loan(payload)
        customer = result["customer"]
        session.refresh(customer)

        assert customer.detail.education_level == "technical"


# ===========================================================================
# Unit Tests — CreditGraph Payload
# ===========================================================================


class TestCreditGraphPayload:
    """CreditGraph service must include housing_possession_type in the payload."""

    def test_housing_possession_type_in_applicant_data(self, session: Session, test_loan):
        """trigger_analysis must include housing_possession_type in applicant_data."""
        # Set housing_possession_type on the customer detail
        from app.models.customer import CustomerDetail
        detail = test_loan.customer.detail
        if detail:
            detail.housing_possession_type = "rented"
            session.add(detail)
            session.commit()

        captured_payload = {}

        def mock_analyze(applicant, loan, documents):
            captured_payload.update(applicant)
            return {
                "case_id": "MOCK-001",
                "decision": "MANUAL_REVIEW",
                "irs_score": 0.5,
                "confidence": 0.7,
                "risk_level": "MEDIUM",
            }

        with patch(
            "app.services.creditgraph_service.CreditGraphClient"
        ) as MockClient:
            MockClient.return_value.analyze_loan_application.side_effect = mock_analyze
            from app.services import creditgraph_service
            try:
                creditgraph_service.trigger_analysis(session, test_loan.id)
            except Exception:
                pass  # We only care about the payload captured

        assert "housing_possession_type" in captured_payload, (
            "housing_possession_type must be included in CreditGraph applicant payload"
        )
