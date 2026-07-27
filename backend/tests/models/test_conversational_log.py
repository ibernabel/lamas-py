import hashlib
import uuid
from sqlmodel import Session, select
from app.models.customer import Customer
from app.models.conversational_log import ConversationalLog


def test_create_conversational_log(session: Session, test_customer: Customer):
    raw_msg = "Hola, solicito información sobre préstamos vehiculares"
    msg_hash = hashlib.sha256(raw_msg.encode("utf-8")).hexdigest()

    log_entry = ConversationalLog(
        customer_id=test_customer.id,
        channel="WHATSAPP_API",
        direction="INBOUND",
        raw_message=raw_msg,
        content_hash=msg_hash,
        embedding=[0.1, 0.2, 0.3],
        sentiment_score=0.85,
    )
    session.add(log_entry)
    session.commit()
    session.refresh(log_entry)

    assert isinstance(log_entry.id, uuid.UUID)
    assert log_entry.customer_id == test_customer.id
    assert log_entry.channel == "WHATSAPP_API"
    assert log_entry.direction == "INBOUND"
    assert log_entry.content_hash == msg_hash
    assert log_entry.embedding == [0.1, 0.2, 0.3]
    assert log_entry.sentiment_score == 0.85

    fetched = session.exec(
        select(ConversationalLog).where(ConversationalLog.content_hash == msg_hash)
    ).first()
    assert fetched is not None
    assert fetched.id == log_entry.id
