import uuid
from datetime import datetime
from typing import Any, List, Optional
from sqlmodel import Column, Field, JSON, SQLModel


class ConversationalLog(SQLModel, table=True):
    """Log model for conversational interactions with vector embedding support."""

    __tablename__ = "conversational_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    customer_id: int = Field(foreign_key="customers.id", index=True, nullable=False)

    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    channel: str = Field(max_length=50, nullable=False)  # WHATSAPP_MANUAL_EXPORT, WHATSAPP_API, EMAIL
    direction: str = Field(max_length=20, nullable=False)  # INBOUND, OUTBOUND

    raw_message: str = Field(nullable=False)
    content_hash: str = Field(max_length=64, index=True, nullable=False)

    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(JSON, nullable=True))
    sentiment_score: float = Field(default=0.0, nullable=False)
