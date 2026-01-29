"""
Database configuration using SQLModel.
"""
from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)


def get_session():
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.
    """
    with Session(engine) as session:
        yield session


def init_db():
    """
    Initialize database tables.
    Note: We're using an existing PostgreSQL database from Laravel,
    so this only creates new tables if needed.
    """
    # Uncomment if creating new tables:
    # SQLModel.metadata.create_all(engine)
    pass
