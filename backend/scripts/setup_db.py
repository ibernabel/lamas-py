"""
Initialize database schema and create a default admin user.
"""
import sys
import os

# Add parent dir to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import *
from sqlmodel import Session, select, SQLModel
from app.core.database import engine
from app.core.security import get_password_hash
from app.models.user import User

# Import all models to ensure metadata is populated


def setup():
    print("🛠️  Initializing database schema...")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Check if default user exists
        admin_email = "test@example.com"
        statement = select(User).where(User.email == admin_email)
        admin = session.exec(statement).first()

        if not admin:
            print(f"👤  Creating default admin user: {admin_email}...")
            new_admin = User(
                name="Idequel Bernabel",
                email=admin_email,
                password=get_password_hash("testpass"),
                is_approved=True
            )
            session.add(new_admin)
            session.commit()
            print("✅  Admin user created.")
        else:
            print(f"ℹ️   Admin user {admin_email} already exists.")


if __name__ == "__main__":
    setup()
