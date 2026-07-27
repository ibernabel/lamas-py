import uuid
from typing import Optional
from sqlmodel import Field, SQLModel


class SystemIntegrationMap(SQLModel, table=True):
    """Mapping model for linking customers with external systems (e.g. Presterativa, Mifos, WhatsApp)."""

    __tablename__ = "system_integration_maps"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    customer_id: int = Field(foreign_key="customers.id", index=True, nullable=False)
    system_name: str = Field(max_length=50, nullable=False)
    external_client_id: str = Field(max_length=100, nullable=False)
    status: str = Field(default="ACTIVE", max_length=50, nullable=False)
