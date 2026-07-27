from datetime import datetime
from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.models.core_task_queue import CoreTaskQueue, TaskStatus, TaskType


def test_create_core_task_queue(session: Session, test_customer: Customer, test_loan: LoanApplication):
    task = CoreTaskQueue(
        customer_id=test_customer.id,
        loan_application_id=test_loan.id,
        task_type=TaskType.CREATE_LOAN_IN_CORE,
        payload={"amount": 100000.0, "term_months": 24},
        status=TaskStatus.PENDING,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    assert task.id is not None
    assert task.customer_id == test_customer.id
    assert task.loan_application_id == test_loan.id
    assert task.task_type == TaskType.CREATE_LOAN_IN_CORE
    assert task.status == TaskStatus.PENDING
    assert task.payload == {"amount": 100000.0, "term_months": 24}
    assert task.core_reference_id is None

    # Simulate resolution by operator
    task.status = TaskStatus.COMPLETED
    task.core_reference_id = "MIFOS-PREST-9941"
    task.completed_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    assert task.status == TaskStatus.COMPLETED
    assert task.core_reference_id == "MIFOS-PREST-9941"
    assert task.completed_at is not None
