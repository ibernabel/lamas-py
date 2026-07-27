from datetime import datetime
from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.models.legal_consent import LegalConsent


def test_create_legal_consent(session: Session, test_customer: Customer, test_loan: LoanApplication):
    consent = LegalConsent(
        customer_id=test_customer.id,
        loan_application_id=test_loan.id,
        privacy_consent_accepted=True,
        bureau_authorization_accepted=True,
        ai_processing_accepted=True,
        consent_timestamp=datetime.utcnow(),
        consent_ip_address="190.166.45.12",
    )
    session.add(consent)
    session.commit()
    session.refresh(consent)

    assert consent.id is not None
    assert consent.customer_id == test_customer.id
    assert consent.loan_application_id == test_loan.id
    assert consent.privacy_consent_accepted is True
    assert consent.bureau_authorization_accepted is True
    assert consent.ai_processing_accepted is True
    assert consent.consent_ip_address == "190.166.45.12"

    fetched = session.exec(
        select(LegalConsent).where(LegalConsent.loan_application_id == test_loan.id)
    ).first()
    assert fetched is not None
    assert fetched.id == consent.id
