from typing import Any, Dict, Optional
from sqlmodel import Column, Field, JSON, SQLModel


class SystemConfig(SQLModel, table=True):
    """Multi-tenant system configuration model."""

    __tablename__ = "system_configs"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_name: str = Field(max_length=100, unique=True, index=True, nullable=False)
    tenant_type: str = Field(max_length=50, nullable=False)  # FINANCIERA, COOPERATIVA
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
