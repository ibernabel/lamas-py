from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.cooperative_profile import CooperativeProfile


def test_create_cooperative_profile(session: Session, test_customer: Customer):
    profile = CooperativeProfile(
        customer_id=test_customer.id,
        member_number="SOC-2026-0089",
        share_balance=25000.0,
        savings_balance=15000.0,
        outstanding_loan_balance=100000.0,
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)

    assert profile.id is not None
    assert profile.customer_id == test_customer.id
    assert profile.member_number == "SOC-2026-0089"
    assert profile.share_balance == 25000.0
    assert profile.savings_balance == 15000.0
    assert profile.outstanding_loan_balance == 100000.0
    assert profile.net_exposure == 60000.0  # 100000 - (25000 + 15000)

    # Query back
    fetched = session.exec(
        select(CooperativeProfile).where(CooperativeProfile.customer_id == test_customer.id)
    ).first()
    assert fetched is not None
    assert fetched.net_exposure == 60000.0
