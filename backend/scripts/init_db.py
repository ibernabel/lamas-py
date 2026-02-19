
from app.core.security import get_password_hash
from app.models.user import User
from app.core.database import engine
from sqlmodel import SQLModel, Session, select
import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def init_db():
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Check if user exists
        user = session.exec(select(User).where(
            User.email == "test@example.com")).first()
        if not user:
            print("Creating test user...")
            user = User(
                name="Test User",
                email="test@example.com",
                password=get_password_hash("testpass"),
                is_approved=True
            )
            session.add(user)
            session.commit()
            print("Test user created: test@example.com / testpass")
        else:
            print("Test user already exists.")


if __name__ == "__main__":
    init_db()
