from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from sqlmodel import Column, Field, JSON, SQLModel


class TaskType(str, Enum):
    CREATE_LOAN_IN_CORE = "CREATE_LOAN_IN_CORE"
    APPLY_RECEIPT_IN_CORE = "APPLY_RECEIPT_IN_CORE"
    UPDATE_MORA_STATUS = "UPDATE_MORA_STATUS"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"


class CoreTaskQueue(SQLModel, table=True):
    """Task queue model for Human-In-The-Loop (HITL) synchronization with Core systems."""

    __tablename__ = "core_task_queues"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", index=True, nullable=False)
    loan_application_id: Optional[int] = Field(
        default=None, foreign_key="loan_applications.id", index=True, nullable=True
    )

    task_type: TaskType = Field(nullable=False)
    payload: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    status: TaskStatus = Field(default=TaskStatus.PENDING, index=True, nullable=False)

    operator_id: Optional[int] = Field(default=None, foreign_key="users.id", nullable=True)
    core_reference_id: Optional[str] = Field(default=None, max_length=100, nullable=True)
    completed_at: Optional[datetime] = Field(default=None, nullable=True)
