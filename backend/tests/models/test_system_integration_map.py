import uuid
from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.system_integration_map import SystemIntegrationMap


def test_create_system_integration_map(session: Session, test_customer: Customer):
    integration = SystemIntegrationMap(
        customer_id=test_customer.id,
        system_name="PRESTERATIVA",
        external_client_id="EXT-10023",
    )
    session.add(integration)
    session.commit()
    session.refresh(integration)

    assert isinstance(integration.id, uuid.UUID)
    assert integration.customer_id == test_customer.id
    assert integration.system_name == "PRESTERATIVA"
    assert integration.external_client_id == "EXT-10023"
    assert integration.status == "ACTIVE"

    # Query back
    fetched = session.exec(
        select(SystemIntegrationMap).where(SystemIntegrationMap.customer_id == test_customer.id)
    ).first()
    assert fetched is not None
    assert fetched.id == integration.id
