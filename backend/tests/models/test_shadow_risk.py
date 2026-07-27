from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.customer_shadow_risk import CustomerShadowRisk, ShadowRiskLevel


def test_create_customer_shadow_risk(session: Session, test_customer: Customer):
    risk = CustomerShadowRisk(
        customer_id=test_customer.id,
        rem_subsistence_amount=15000.0,
        dti_ratio=0.35,
        bureau_recent_inquiries_count=2,
        same_day_withdrawal_flag=False,
        online_banking_risk_flag=False,
        clipboard_paste_detected=True,
        keystroke_latency_ms=142.5,
        device_fingerprint="fp_a8f9312b904c",
        step_timings_json={"step1": 15, "step2": 24},
        shadow_risk_level=ShadowRiskLevel.LOW,
    )
    session.add(risk)
    session.commit()
    session.refresh(risk)

    assert risk.id is not None
    assert risk.customer_id == test_customer.id
    assert risk.clipboard_paste_detected is True
    assert risk.keystroke_latency_ms == 142.5
    assert risk.device_fingerprint == "fp_a8f9312b904c"
    assert risk.step_timings_json == {"step1": 15, "step2": 24}
    assert risk.shadow_risk_level == ShadowRiskLevel.LOW

    fetched = session.exec(
        select(CustomerShadowRisk).where(CustomerShadowRisk.customer_id == test_customer.id)
    ).first()
    assert fetched is not None
    assert fetched.id == risk.id
