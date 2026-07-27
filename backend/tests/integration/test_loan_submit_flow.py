from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.legal_consent import LegalConsent
from app.models.customer_shadow_risk import CustomerShadowRisk


def test_full_loan_submit_and_hitl_workflow(client: TestClient, auth_headers: dict, session: Session):
    valid_payload = {
        "identity": {
            "nid": "001-9998887-1",
            "first_name": "Maria",
            "last_name": "Alvarez",
            "mobile_phone": "8095551122",
            "email": "maria.alvarez@example.com",
        },
        "profile": {
            "marital_status": "SINGLE",
            "housing_type": "OWNED",
            "housing_monthly_payment": 0.0,
            "education_level": "UNIVERSITY",
        },
        "job": {
            "company_name": "Empresa Test SRL",
            "role": "Gerente",
            "salary": 75000.0,
        },
        "financial": {
            "other_income": 10000.0,
        },
        "loan_request": {
            "amount": 250000.0,
            "term_months": 36,
            "purpose": "VEHICLE_PURCHASE",
            "notes": "Compra de vehículo usadof",
        },
        "legal_consent": {
            "privacy_consent_accepted": True,
            "bureau_authorization_accepted": True,
            "ai_processing_accepted": True,
            "consent_timestamp": "2026-07-27T15:00:00Z",
            "consent_ip_address": "186.6.120.44",
        },
        "telemetry": {
            "clipboard_paste_detected": True,
            "keystroke_latency_ms": 110.0,
            "device_fingerprint": "fp_integration_test_99",
            "step_timings_sec": {"step1": 10, "step2": 15},
        },
    }

    # 1. Reject submission if legal consent is missing/false
    invalid_payload = valid_payload.copy()
    invalid_payload["legal_consent"] = {
        "privacy_consent_accepted": False,
        "bureau_authorization_accepted": True,
    }
    rej_response = client.post("/api/v1/loan-applications/submit", json=invalid_payload)
    assert rej_response.status_code == 400
    assert "Law 172-13" in rej_response.json()["detail"]

    # 2. Submit valid loan application
    response = client.post("/api/v1/loan-applications/submit", json=valid_payload)
    assert response.status_code == 201
    resp_data = response.json()
    assert resp_data["status"] == "success"

    loan_id = resp_data["loan_application_id"]
    customer_id = resp_data["customer_id"]
    core_task_id = resp_data["core_task_id"]

    # 3. Verify LegalConsent and ShadowRisk saved in DB
    legal_record = session.exec(select(LegalConsent).where(LegalConsent.loan_application_id == loan_id)).first()
    assert legal_record is not None
    assert legal_record.privacy_consent_accepted is True
    assert legal_record.consent_ip_address == "186.6.120.44"

    shadow_record = session.exec(select(CustomerShadowRisk).where(CustomerShadowRisk.customer_id == customer_id)).first()
    assert shadow_record is not None
    assert shadow_record.device_fingerprint == "fp_integration_test_99"

    # 4. HITL Operator lists pending task queue
    list_tasks_resp = client.get("/api/v1/task-queue/", headers=auth_headers)
    assert list_tasks_resp.status_code == 200
    tasks = list_tasks_resp.json()
    matching_task = next((t for t in tasks if t["id"] == core_task_id), None)
    assert matching_task is not None
    assert matching_task["status"] == "PENDING"

    # 5. HITL Operator marks core task as COMPLETED
    resolve_resp = client.patch(
        f"/api/v1/task-queue/{core_task_id}/resolve",
        json={"status": "COMPLETED", "core_reference_id": "PRESTERATIVA-CORE-90021"},
        headers=auth_headers,
    )
    assert resolve_resp.status_code == 200
    resolved_data = resolve_resp.json()
    assert resolved_data["status"] == "COMPLETED"
    assert resolved_data["core_reference_id"] == "PRESTERATIVA-CORE-90021"
