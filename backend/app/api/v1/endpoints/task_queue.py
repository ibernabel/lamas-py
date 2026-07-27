from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import select

from app.api.v1.deps import CurrentUser, DatabaseSession
from app.models.core_task_queue import CoreTaskQueue, TaskStatus, TaskType

router = APIRouter()


class TaskResolvePayload(BaseModel):
    status: TaskStatus
    core_reference_id: Optional[str] = None


@router.get(
    "/",
    response_model=List[CoreTaskQueue],
    status_code=status.HTTP_200_OK,
)
async def list_tasks_endpoint(
    current_user: CurrentUser,
    session: DatabaseSession,
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    task_type_filter: Optional[TaskType] = Query(None, alias="task_type"),
    customer_id: Optional[int] = Query(None),
):
    """List task queue items for HITL operator workflow."""
    statement = select(CoreTaskQueue)
    if status_filter:
        statement = statement.where(CoreTaskQueue.status == status_filter)
    if task_type_filter:
        statement = statement.where(CoreTaskQueue.task_type == task_type_filter)
    if customer_id:
        statement = statement.where(CoreTaskQueue.customer_id == customer_id)

    statement = statement.order_by(CoreTaskQueue.id.desc())
    tasks = session.exec(statement).all()
    return tasks


@router.patch(
    "/{task_id}/resolve",
    response_model=CoreTaskQueue,
    status_code=status.HTTP_200_OK,
)
async def resolve_task_endpoint(
    task_id: int,
    payload: TaskResolvePayload,
    current_user: CurrentUser,
    session: DatabaseSession,
):
    """Resolve/update a HITL core task queue item."""
    task = session.get(CoreTaskQueue, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )

    task.status = payload.status
    if payload.core_reference_id is not None:
        task.core_reference_id = payload.core_reference_id

    task.operator_id = current_user.id
    if payload.status in [TaskStatus.COMPLETED, TaskStatus.REJECTED]:
        task.completed_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)
    return task
