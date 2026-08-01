import re
from datetime import datetime
from typing import Any, Dict
from sqlmodel import Session, select

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
from app.models.loan_application import LoanApplication, LoanApplicationDetail, LoanStatus
from app.models.legal_consent import LegalConsent
from app.models.customer_shadow_risk import CustomerShadowRisk, ShadowRiskLevel
from app.models.core_task_queue import CoreTaskQueue, TaskType, TaskStatus


class LoanSubmissionService:
    """Orchestrates public loan submission, telemetry, legal consent, and HITL task queue registration."""

    def __init__(self, session: Session):
        self.session = session

    def submit_loan(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        identity = payload.get("identity", {})
        profile = payload.get("profile", {})
        job = payload.get("job", {})
        financial = payload.get("financial", {})
        loan_req = payload.get("loan_request", {})
        legal = payload.get("legal_consent", {})
        telemetry = payload.get("telemetry", {})

        raw_nid = identity.get("nid")
        if not raw_nid:
            raise ValueError("Customer NID is required")

        # Sanitize NID to remove non-digit characters (e.g. hyphens)
        nid = re.sub(r"\D", "", str(raw_nid))
        if not nid:
            raise ValueError("Invalid NID provided")

        raw_referred_by = identity.get("referred_by")
        referred_by = re.sub(r"\D", "", str(raw_referred_by)) if raw_referred_by else None

        # Also import Phone model
        from app.models.phone import Phone
        from datetime import date, timedelta

        # Parse move_in_date from time_at_residence_months if provided
        move_in_date_val = None
        time_months = profile.get("time_at_residence_months")
        if time_months and isinstance(time_months, (int, float)) and time_months > 0:
            move_in_date_val = date.today() - timedelta(days=int(time_months * 30))

        # Parse employment start date
        start_date_val = None
        if job.get("employment_start_date"):
            try:
                start_date_val = datetime.strptime(str(job.get("employment_start_date")), "%Y-%m-%d").date()
            except Exception:
                pass

        occupation = job.get("occupation_type")

        # 1. Customer deduplication or creation
        statement = select(Customer).where(Customer.nid == nid)
        customer = self.session.exec(statement).first()

        if not customer:
            customer = Customer(
                nid=nid,
                lead_channel="PUBLIC_FORM",
                is_referred=bool(referred_by),
                referred_by=referred_by,
                is_active=True,
                is_assigned=False,
            )
            self.session.add(customer)
            self.session.flush()

            # Customer Detail
            # Note: the public wizard captures housing *possession* (owned/rented/etc.),
            # not physical type (house/apartment). We map accordingly.
            detail = CustomerDetail(
                customer_id=customer.id,
                first_name=identity.get("first_name", ""),
                last_name=identity.get("last_name", ""),
                email=identity.get("email"),
                marital_status=profile.get("marital_status"),
                education_level=profile.get("education_level"),
                housing_type=None,  # Physical type not captured in public wizard
                housing_possession_type=profile.get("housing_type"),  # Wizard sends possession
                move_in_date=move_in_date_val,
            )
            self.session.add(detail)

            # Customer Job Info
            # Derive is_self_employed from occupation_type for backward compatibility
            # with admin form and legacy boolean field.
            job_info = CustomerJobInfo(
                customer_id=customer.id,
                occupation_type=occupation,
                is_self_employed=occupation in ("independent", "business_owner"),
                role=job.get("role"),
                start_date=start_date_val,
                salary=job.get("salary"),
                payment_frequency=job.get("payment_frequency"),
                other_incomes=financial.get("other_income"),
                other_incomes_source=financial.get("other_income_source"),
                payment_bank=job.get("payment_bank"),
                supervisor_name=job.get("supervisor_name"),
            )
            self.session.add(job_info)

            # Customer Financial Info
            financial_info = CustomerFinancialInfo(
                customer_id=customer.id,
                other_incomes=financial.get("other_income"),
                monthly_housing_payment=profile.get("housing_monthly_payment"),
                housing_type=profile.get("housing_type"),
            )
            self.session.add(financial_info)

            # Employer Company
            if job.get("company_name"):
                company = Company(
                    customer_id=customer.id,
                    name=job.get("company_name"),
                    rnc=job.get("company_rnc"),
                )
                self.session.add(company)

            # References
            for ref in payload.get("references", []):
                cust_ref = CustomerReference(
                    customer_id=customer.id,
                    name=ref.get("name", ""),
                    relationship=ref.get("relationship", ""),
                    type=ref.get("ref_type"),
                )
                self.session.add(cust_ref)

            # Vehicles
            for veh in payload.get("vehicles", []):
                cust_veh = CustomerVehicle(
                    customer_id=customer.id,
                    vehicle_brand=veh.get("make"),
                    vehicle_model=veh.get("model"),
                    vehicle_year=veh.get("year"),
                    vehicle_plate_number=veh.get("plate"),
                )
                self.session.add(cust_veh)

            # Bank Accounts
            for acc in payload.get("bank_accounts", []):
                cust_acc = CustomersAccount(
                    customer_id=customer.id,
                    number=acc.get("account_number_last4", ""),
                    type=acc.get("account_type"),
                )
                self.session.add(cust_acc)
        else:
            # Update existing customer details with new submission data if provided
            if customer.detail:
                if identity.get("first_name"): customer.detail.first_name = identity.get("first_name")
                if identity.get("last_name"): customer.detail.last_name = identity.get("last_name")
                if identity.get("email"): customer.detail.email = identity.get("email")
                if profile.get("marital_status"): customer.detail.marital_status = profile.get("marital_status")
                if profile.get("education_level"): customer.detail.education_level = profile.get("education_level")
                if profile.get("housing_type"): customer.detail.housing_possession_type = profile.get("housing_type")
                if move_in_date_val: customer.detail.move_in_date = move_in_date_val
                self.session.add(customer.detail)

            if customer.job_info:
                if occupation:
                    customer.job_info.occupation_type = occupation
                    customer.job_info.is_self_employed = occupation in ("independent", "business_owner")
                if job.get("role"): customer.job_info.role = job.get("role")
                if start_date_val: customer.job_info.start_date = start_date_val
                if job.get("salary") is not None: customer.job_info.salary = job.get("salary")
                if job.get("payment_frequency"): customer.job_info.payment_frequency = job.get("payment_frequency")
                if job.get("payment_bank"): customer.job_info.payment_bank = job.get("payment_bank")
                if financial.get("other_income") is not None: customer.job_info.other_incomes = financial.get("other_income")
                if financial.get("other_income_source"): customer.job_info.other_incomes_source = financial.get("other_income_source")
                if job.get("supervisor_name"): customer.job_info.supervisor_name = job.get("supervisor_name")
                self.session.add(customer.job_info)
            elif occupation or job.get("role"):
                job_info = CustomerJobInfo(
                    customer_id=customer.id,
                    occupation_type=occupation,
                    is_self_employed=occupation in ("independent", "business_owner") if occupation else False,
                    role=job.get("role"),
                    start_date=start_date_val,
                    salary=job.get("salary"),
                    payment_frequency=job.get("payment_frequency"),
                    other_incomes=financial.get("other_income"),
                    other_incomes_source=financial.get("other_income_source"),
                    payment_bank=job.get("payment_bank"),
                    supervisor_name=job.get("supervisor_name"),
                )
                self.session.add(job_info)

            # Update or create Financial Info
            if customer.financial_info:
                if profile.get("housing_monthly_payment") is not None:
                    customer.financial_info.monthly_housing_payment = profile.get("housing_monthly_payment")
                if profile.get("housing_type"):
                    customer.financial_info.housing_type = profile.get("housing_type")
                if financial.get("other_income") is not None:
                    customer.financial_info.other_incomes = financial.get("other_income")
                self.session.add(customer.financial_info)
            elif profile.get("housing_monthly_payment") is not None or profile.get("housing_type"):
                financial_info = CustomerFinancialInfo(
                    customer_id=customer.id,
                    other_incomes=financial.get("other_income"),
                    monthly_housing_payment=profile.get("housing_monthly_payment"),
                    housing_type=profile.get("housing_type"),
                )
                self.session.add(financial_info)

            if job.get("company_name"):
                if customer.company:
                    customer.company.name = job.get("company_name")
                    if job.get("company_rnc"): customer.company.rnc = job.get("company_rnc")
                    self.session.add(customer.company)
                else:
                    company = Company(
                        customer_id=customer.id,
                        name=job.get("company_name"),
                        rnc=job.get("company_rnc"),
                    )
                    self.session.add(company)

        # 1b. Mobile phone persistence
        raw_mobile = identity.get("mobile_phone")
        if raw_mobile:
            clean_mobile = re.sub(r"\D", "", str(raw_mobile))
            if clean_mobile:
                phone_stmt = select(Phone).where(
                    Phone.phoneable_type == "Customer",
                    Phone.phoneable_id == customer.id,
                    Phone.type == "mobile"
                )
                existing_mobile = self.session.exec(phone_stmt).first()
                if not existing_mobile:
                    new_phone = Phone(
                        number=clean_mobile,
                        type="mobile",
                        country_area="+1",
                        phoneable_type="Customer",
                        phoneable_id=customer.id
                    )
                    self.session.add(new_phone)
                else:
                    existing_mobile.number = clean_mobile
                    self.session.add(existing_mobile)

        # 2. Create Loan Application
        loan_app = LoanApplication(
            customer_id=customer.id,
            status=LoanStatus.RECEIVED.value,
            is_active=True,
            is_new=True,
        )
        self.session.add(loan_app)
        self.session.flush()

        loan_detail = LoanApplicationDetail(
            loan_application_id=loan_app.id,
            amount=loan_req.get("amount") or 0.0,
            term=loan_req.get("term_months") or 0,
            frequency=loan_req.get("payment_frequency") or loan_req.get("frequency") or "monthly",
            purpose=loan_req.get("purpose"),
            customer_comment=loan_req.get("notes"),
        )
        self.session.add(loan_detail)

        # 3. Create Legal Consent Audit Record
        consent_ts = datetime.utcnow()
        if legal.get("consent_timestamp"):
            try:
                consent_ts = datetime.fromisoformat(legal["consent_timestamp"].replace("Z", "+00:00"))
            except Exception:
                pass

        legal_consent = LegalConsent(
            customer_id=customer.id,
            loan_application_id=loan_app.id,
            privacy_consent_accepted=legal.get("privacy_consent_accepted", True),
            bureau_authorization_accepted=legal.get("bureau_authorization_accepted", True),
            ai_processing_accepted=legal.get("ai_processing_accepted", True),
            consent_timestamp=consent_ts,
            consent_ip_address=legal.get("consent_ip_address", "127.0.0.1"),
        )
        self.session.add(legal_consent)

        # 4. Create or Update Customer Shadow Risk Telemetry
        shadow_risk_stmt = select(CustomerShadowRisk).where(CustomerShadowRisk.customer_id == customer.id)
        shadow_risk = self.session.exec(shadow_risk_stmt).first()

        if not shadow_risk:
            shadow_risk = CustomerShadowRisk(
                customer_id=customer.id,
                clipboard_paste_detected=telemetry.get("clipboard_paste_detected", False),
                keystroke_latency_ms=telemetry.get("keystroke_latency_ms", 0.0),
                device_fingerprint=telemetry.get("device_fingerprint"),
                step_timings_json=telemetry.get("step_timings_sec", {}),
                shadow_risk_level=ShadowRiskLevel.NONE,
            )
            self.session.add(shadow_risk)
        else:
            shadow_risk.clipboard_paste_detected = telemetry.get("clipboard_paste_detected", False)
            shadow_risk.keystroke_latency_ms = telemetry.get("keystroke_latency_ms", 0.0)
            shadow_risk.device_fingerprint = telemetry.get("device_fingerprint")
            shadow_risk.step_timings_json = telemetry.get("step_timings_sec", {})
            self.session.add(shadow_risk)

        # 5. Enqueue Core Task Queue Item (HITL)
        core_task = CoreTaskQueue(
            customer_id=customer.id,
            loan_application_id=loan_app.id,
            task_type=TaskType.CREATE_LOAN_IN_CORE,
            payload={
                "customer_nid": customer.nid,
                "loan_application_id": loan_app.id,
                "amount": loan_req.get("amount"),
                "term_months": loan_req.get("term_months"),
                "purpose": loan_req.get("purpose"),
            },
            status=TaskStatus.PENDING,
        )
        self.session.add(core_task)

        self.session.commit()
        self.session.refresh(customer)
        self.session.refresh(loan_app)
        self.session.refresh(legal_consent)
        self.session.refresh(shadow_risk)
        self.session.refresh(core_task)

        return {
            "customer": customer,
            "loan_application": loan_app,
            "legal_consent": legal_consent,
            "shadow_risk": shadow_risk,
            "core_task": core_task,
        }
