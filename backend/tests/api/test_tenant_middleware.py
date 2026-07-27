from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.system_config import SystemConfig


def test_tenant_middleware_default(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200


def test_tenant_middleware_custom_header(client: TestClient, session: Session):
    # Seed custom config
    sys_config = SystemConfig(
        tenant_name="Cooperativa Maimon",
        tenant_type="COOPERATIVA",
        config={
            "enable_savings_module": True,
            "enable_b2b_payroll_agreements": False,
            "core_integration_mode": "DIRECT_API",
            "allowed_customer_types": ["MEMBER"],
        },
    )
    session.add(sys_config)
    session.commit()

    response = client.get("/health", headers={"X-Tenant-ID": "Cooperativa Maimon"})
    assert response.status_code == 200
