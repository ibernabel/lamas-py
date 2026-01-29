# Phase 1: Backend Foundation - Implementation Plan

## Overview

Set up the FastAPI + SQLModel backend structure, connect to existing PostgreSQL database, and establish development environment.

---

## Technology Stack

| Component        | Technology                       |
| ---------------- | -------------------------------- |
| Framework        | FastAPI                          |
| ORM              | SQLModel (SQLAlchemy + Pydantic) |
| Python           | 3.11+                            |
| Database         | PostgreSQL (existing)            |
| Testing          | pytest + factory_boy             |
| Containerization | Docker                           |

---

## Step 1.1: Move Laravel Files to Legacy

### Files to KEEP in root:

- `.git/` - Version control
- `docs/` - Documentation
- `README.md` - Will update
- `.gitignore` - Will update

### Files to MOVE to `/legacy`:

```
app/
bootstrap/
config/
database/
lang/
public/
resources/
routes/
storage/
tests/
artisan
composer.json
composer.lock
package.json
package-lock.json
phpunit.xml
postcss.config.js
tailwind.config.js
vite.config.js
.editorconfig
.gitattributes
CONTRIBUTING.md
LICENSE
.env
.env.example
```

---

## Step 1.2: Create Backend Project Structure

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── customer.py
│   │   ├── loan_application.py
│   │   └── ...
│   ├── api/v1/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── deps.py
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── customers.py
│   │       └── loan_applications.py
│   └── services/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── factories/
│       ├── __init__.py
│       └── customer.py
├── pyproject.toml
├── Dockerfile
└── .env.example
```

---

## Step 1.3: Core Configuration Files

### [NEW] backend/pyproject.toml

```toml
[project]
name = "lamas-backend"
version = "0.1.0"
description = "LAMaS Backend API - Loan Applications Management System"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.34.0",
    "sqlmodel>=0.0.22",
    "psycopg2-binary>=2.9.0",
    "pydantic>=2.10.0",
    "pydantic-settings>=2.7.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.0",
    "python-multipart>=0.0.20",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-cov>=6.0.0",
    "pytest-asyncio>=0.25.0",
    "httpx>=0.28.0",
    "factory-boy>=3.3.0",
    "faker>=33.0.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

---

### [NEW] backend/app/main.py

```python
"""
LAMaS Backend API - Main Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Loan Applications Management System API",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.VERSION}
```

---

### [NEW] backend/app/core/config.py

```python
"""
Application configuration using Pydantic Settings.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Project
    PROJECT_NAME: str = "LAMaS API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://lamas:lamas@localhost:5432/lamas"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
```

---

### [NEW] backend/app/core/database.py

```python
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
    """Initialize database tables (only for new tables, not existing)."""
    # SQLModel.metadata.create_all(engine)  # Commented: using existing DB
    pass
```

---

### [NEW] backend/app/core/security.py

```python
"""
Security utilities for JWT token handling and password hashing.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str | int,
    expires_delta: timedelta | None = None,
    extra_data: dict[str, Any] | None = None,
) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"exp": expire, "sub": str(subject)}
    if extra_data:
        to_encode.update(extra_data)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str | int) -> str:
    """Create a JWT refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict | None:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

---

## Step 1.4: SQLModel Models

### [NEW] backend/app/models/user.py

```python
"""
User model - Simplified (no Teams).
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.broker import Broker
    from app.models.promoter import Promoter


class UserBase(SQLModel):
    """Base user fields."""
    name: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    is_approved: bool = Field(default=False)


class User(UserBase, table=True):
    """User database model."""
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    password: str = Field(max_length=255)
    email_verified_at: datetime | None = Field(default=None)
    remember_token: str | None = Field(default=None, max_length=100)
    profile_photo_path: str | None = Field(default=None, max_length=2048)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    broker: "Broker | None" = Relationship(back_populates="user")
    promoter: "Promoter | None" = Relationship(back_populates="user")


class UserCreate(SQLModel):
    """Schema for creating a user."""
    name: str
    email: str
    password: str


class UserRead(UserBase):
    """Schema for reading a user (API response)."""
    id: int
    created_at: datetime | None


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str
    password: str
```

---

### [NEW] backend/app/models/customer.py

```python
"""
Customer and related models using SQLModel.
"""
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.loan_application import LoanApplication


class CustomerBase(SQLModel):
    """Base customer fields."""
    nid: str = Field(unique=True, index=True, max_length=11, alias="NID")
    lead_channel: str | None = Field(default=None, max_length=255)
    is_referred: bool = Field(default=False)
    referred_by: str | None = Field(default=None, max_length=11)
    is_active: bool = Field(default=True)
    is_assigned: bool = Field(default=False)


class Customer(CustomerBase, table=True):
    """Customer database model."""
    __tablename__ = "customers"

    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int | None = Field(default=None, foreign_key="portfolios.id")
    promoter_id: int | None = Field(default=None, foreign_key="promoters.id")
    assigned_at: datetime | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    details: "CustomerDetail | None" = Relationship(back_populates="customer")
    financial_info: "CustomerFinancialInfo | None" = Relationship(back_populates="customer")
    job_info: "CustomerJobInfo | None" = Relationship(back_populates="customer")
    references: list["CustomerReference"] = Relationship(back_populates="customer")
    vehicle: "CustomerVehicle | None" = Relationship(back_populates="customer")
    company: "Company | None" = Relationship(back_populates="customer")
    accounts: list["CustomersAccount"] = Relationship(back_populates="customer")
    loan_applications: list["LoanApplication"] = Relationship(back_populates="customer")


class CustomerDetail(SQLModel, table=True):
    """Customer personal details."""
    __tablename__ = "customer_details"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    nickname: str | None = Field(default=None, max_length=255)
    birthday: date | None = Field(default=None)
    gender: str | None = Field(default=None, max_length=50)
    marital_status: str | None = Field(default=None, max_length=50)
    education_level: str | None = Field(default=None, max_length=100)
    nationality: str | None = Field(default=None, max_length=100)
    housing_type: str | None = Field(default=None, max_length=100)
    housing_possession_type: str | None = Field(default=None, max_length=100)
    move_in_date: date | None = Field(default=None)
    mode_of_transport: str | None = Field(default=None, max_length=100)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="details")


class CustomerFinancialInfo(SQLModel, table=True):
    """Customer financial information."""
    __tablename__ = "customer_financial_info"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    other_incomes: float | None = Field(default=None)
    discounts: float | None = Field(default=None)
    housing_type: str | None = Field(default=None, max_length=100)
    monthly_housing_payment: float | None = Field(default=None)
    total_debts: float | None = Field(default=None)
    loan_installments: float | None = Field(default=None)
    household_expenses: float | None = Field(default=None)
    labor_benefits: float | None = Field(default=None)
    guarantee_assets: str | None = Field(default=None)
    total_incomes: float | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="financial_info")


class CustomerJobInfo(SQLModel, table=True):
    """Customer job/employment information."""
    __tablename__ = "customer_job_info"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    is_self_employed: bool = Field(default=False)
    role: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=100)
    start_date: date | None = Field(default=None)
    salary: float | None = Field(default=None)
    other_incomes: float | None = Field(default=None)
    other_incomes_source: str | None = Field(default=None, max_length=255)
    payment_type: str | None = Field(default=None, max_length=100)
    payment_frequency: str | None = Field(default=None, max_length=100)
    payment_bank: str | None = Field(default=None, max_length=255)
    payment_account_number: str | None = Field(default=None, max_length=100)
    schedule: str | None = Field(default=None, max_length=255)
    supervisor_name: str | None = Field(default=None, max_length=255)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="job_info")


class CustomerReference(SQLModel, table=True):
    """Customer personal references."""
    __tablename__ = "customer_references"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    name: str = Field(max_length=255)
    nid: str | None = Field(default=None, max_length=11)
    email: str | None = Field(default=None, max_length=255)
    relationship: str = Field(max_length=100)
    reference_since: date | None = Field(default=None)
    is_active: bool = Field(default=True)
    occupation: str | None = Field(default=None, max_length=255)
    is_who_referred: bool = Field(default=False)
    type: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="references")


class CustomerVehicle(SQLModel, table=True):
    """Customer vehicle information."""
    __tablename__ = "customer_vehicles"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    vehicle_type: str | None = Field(default=None, max_length=100)
    vehicle_brand: str | None = Field(default=None, max_length=100)
    vehicle_model: str | None = Field(default=None, max_length=100)
    vehicle_year: int | None = Field(default=None)
    vehicle_color: str | None = Field(default=None, max_length=50)
    vehicle_plate_number: str | None = Field(default=None, max_length=20)
    is_financed: bool = Field(default=False)
    is_owned: bool = Field(default=False)
    is_leased: bool = Field(default=False)
    is_rented: bool = Field(default=False)
    is_shared: bool = Field(default=False)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="vehicle")


class CustomersAccount(SQLModel, table=True):
    """Customer bank accounts."""
    __tablename__ = "customers_accounts"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    number: str = Field(max_length=100)
    type: str | None = Field(default=None, max_length=50)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="accounts")


class Company(SQLModel, table=True):
    """Customer's employer company."""
    __tablename__ = "companies"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    name: str = Field(max_length=255)
    email: str | None = Field(default=None, max_length=255)
    type: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    rnc: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=255)
    branch: str | None = Field(default=None, max_length=255)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="company")
```

---

### [NEW] backend/app/models/loan_application.py

```python
"""
Loan Application and related models.
"""
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.customer import Customer


class LoanStatus(str, Enum):
    """Loan application status enum."""
    RECEIVED = "received"
    VERIFIED = "verified"
    ASSIGNED = "assigned"
    ANALYZED = "analyzed"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class LoanApplication(SQLModel, table=True):
    """Loan application database model."""
    __tablename__ = "loan_applications"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int | None = Field(default=None, foreign_key="customers.id")
    user_id: int | None = Field(default=None, foreign_key="users.id")
    status: LoanStatus = Field(default=LoanStatus.RECEIVED)
    changed_status_at: datetime | None = Field(default=None)
    is_answered: bool = Field(default=False)
    is_approved: bool = Field(default=False)
    is_rejected: bool = Field(default=False)
    is_archived: bool = Field(default=False)
    is_new: bool = Field(default=True)
    is_edited: bool = Field(default=False)
    is_active: bool = Field(default=True)
    approved_at: datetime | None = Field(default=None)
    rejected_at: datetime | None = Field(default=None)
    archived_at: datetime | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: "Customer | None" = Relationship(back_populates="loan_applications")
    details: "LoanApplicationDetail | None" = Relationship(back_populates="loan_application")
    notes: list["LoanApplicationNote"] = Relationship(back_populates="loan_application")


class LoanApplicationDetail(SQLModel, table=True):
    """Loan application financial details."""
    __tablename__ = "loan_application_details"

    id: int | None = Field(default=None, primary_key=True)
    loan_application_id: int = Field(foreign_key="loan_applications.id")
    amount: float = Field(default=0)
    term: int = Field(default=0)  # In months
    rate: float = Field(default=0)  # Interest rate
    quota: float = Field(default=0)  # Monthly payment
    frequency: str | None = Field(default=None, max_length=50)
    purpose: str | None = Field(default=None)
    customer_comment: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    loan_application: LoanApplication = Relationship(back_populates="details")


class LoanApplicationNote(SQLModel, table=True):
    """Notes on loan applications."""
    __tablename__ = "loan_application_notes"

    id: int | None = Field(default=None, primary_key=True)
    loan_application_id: int = Field(foreign_key="loan_applications.id")
    note: str
    user_id: int | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    loan_application: LoanApplication = Relationship(back_populates="notes")


# Response schemas
class LoanApplicationRead(SQLModel):
    """Loan application response (simplified customer)."""
    id: int
    status: LoanStatus
    customer_id: int | None
    customer_nid: str | None = None
    customer_name: str | None = None
    created_at: datetime | None
    details: "LoanApplicationDetail | None" = None
```

---

## Step 1.5: Docker Configuration

### [NEW] backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file
COPY pyproject.toml .

# Install Python dependencies
RUN pip install --no-cache-dir -e ".[dev]"

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### [NEW] docker-compose.yml (root)

```yaml
version: "3.8"

services:
    backend:
        build:
            context: ./backend
            dockerfile: Dockerfile
        container_name: lamas-api
        ports:
            - "8000:8000"
        environment:
            - DATABASE_URL=postgresql://lamas:lamas@db:5432/lamas
            - SECRET_KEY=${SECRET_KEY:-development-secret-key}
            - DEBUG=true
        depends_on:
            db:
                condition: service_healthy
        volumes:
            - ./backend:/app
        command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

    db:
        image: postgres:15
        container_name: lamas-db
        environment:
            - POSTGRES_USER=lamas
            - POSTGRES_PASSWORD=lamas
            - POSTGRES_DB=lamas
        ports:
            - "5432:5432"
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U lamas"]
            interval: 5s
            timeout: 5s
            retries: 5

volumes:
    postgres_data:
```

---

## Step 1.6: GitHub Actions CI

### [NEW] .github/workflows/backend-ci.yml

```yaml
name: Backend CI

on:
    push:
        branches: [main, develop]
        paths:
            - "backend/**"
            - ".github/workflows/backend-ci.yml"
    pull_request:
        branches: [main]
        paths:
            - "backend/**"

jobs:
    test:
        runs-on: ubuntu-latest

        services:
            postgres:
                image: postgres:15
                env:
                    POSTGRES_USER: lamas
                    POSTGRES_PASSWORD: lamas
                    POSTGRES_DB: lamas_test
                ports:
                    - 5432:5432
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5

        steps:
            - uses: actions/checkout@v4

            - name: Set up Python
              uses: actions/setup-python@v5
              with:
                  python-version: "3.11"

            - name: Install dependencies
              working-directory: ./backend
              run: |
                  pip install --upgrade pip
                  pip install -e ".[dev]"

            - name: Run tests with coverage
              working-directory: ./backend
              env:
                  DATABASE_URL: postgresql://lamas:lamas@localhost:5432/lamas_test
                  SECRET_KEY: test-secret-key
              run: |
                  pytest --cov=app --cov-report=xml --cov-report=term

            - name: Upload coverage
              uses: codecov/codecov-action@v4
              with:
                  file: ./backend/coverage.xml
                  fail_ci_if_error: false
```

---

## Verification Plan

### Automated Tests

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for health checks
docker-compose ps

# 3. Run backend tests
docker-compose exec backend pytest -v

# 4. Test coverage
docker-compose exec backend pytest --cov=app
```

### Manual Verification (Postman)

| Test           | Method | Endpoint             | Expected                |
| -------------- | ------ | -------------------- | ----------------------- |
| Health Check   | GET    | `/health`            | `{"status": "healthy"}` |
| API Docs       | GET    | `/api/v1/docs`       | Swagger UI              |
| List Customers | GET    | `/api/v1/customers`  | 401 (no auth)           |
| Login          | POST   | `/api/v1/auth/login` | JWT token               |

### Test Commands

```bash
# Check health endpoint
curl http://localhost:8000/health

# View OpenAPI docs in browser
open http://localhost:8000/api/v1/docs
```

---

## Summary

| Step | Task                   | Key Files                                       |
| ---- | ---------------------- | ----------------------------------------------- |
| 1.1  | Move Laravel to legacy | Move ~20 items                                  |
| 1.2  | Project structure      | Directory layout                                |
| 1.3  | Core config            | `config.py`, `database.py`, `security.py`       |
| 1.4  | SQLModel models        | `user.py`, `customer.py`, `loan_application.py` |
| 1.5  | Docker                 | `Dockerfile`, `docker-compose.yml`              |
| 1.6  | GitHub Actions         | `backend-ci.yml`                                |
