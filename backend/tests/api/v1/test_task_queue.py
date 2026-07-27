from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.models.core_task_queue import CoreTaskQueue, TaskStatus, TaskType


def test_list_and_resolve_task_queue(
    client: TestClient, session: Session, auth_headers: dict, test_customer: Customer, test_loan: LoanApplication
):
    # Seed task
    task = CoreTaskQueue(
        customer_id=test_customer.id,
        loan_application_id=test_loan.id,
        task_type=TaskType.CREATE_LOAN_IN_CORE,
        payload={"amount": 50000.0},
        status=TaskStatus.PENDING,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # 1. GET list tasks
    response = client.get("/api/v1/task-queue/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == task.id
    assert data[0]["status"] == "PENDING"

    # 2. PATCH resolve task
    resolve_resp = client.patch(
        f"/api/v1/task-queue/{task.id}/resolve",
        json={"status": "COMPLETED", "core_reference_id": "PREST-88712"},
        headers=auth_headers,
    )
    assert resolve_resp.status_code == 200
    res_data = resolve_resp.json()
    assert res_data["status"] == "COMPLETED"
    assert res_data["core_reference_id"] == "PREST-88712"
    assert res_data["completed_at"] is not None
