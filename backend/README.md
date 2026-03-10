# LAMaS Backend API

FastAPI + SQLModel backend for Loan Applications Management System.

## Stack

- **Python**: 3.11+
- **Framework**: FastAPI
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: PostgreSQL 15
- **Authentication**: JWT (python-jose)
- **Testing**: pytest + httpx

## Quick Start

### Using Docker (Recommended)

```bash
# From project root
docker compose up --build

# API will be available at http://localhost:8000
# OpenAPI docs at http://localhost:8000/api/v1/docs
```

### Local Development

```bash
# Install dependencies using uv
uv pip install -e ".[dev]"

# Set environment variables
cp .env.example .env
# Edit .env with your settings

# Run the application
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/        # API endpoints
│   ├── core/          # Config, database, security
│   ├── models/        # SQLModel models
│   └── main.py        # Application entry
├── tests/             # Test suite
├── pyproject.toml     # Dependencies
└── Dockerfile         # Docker configuration
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Customers (Phase 2)

- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/{id}` - Get customer

### Loan Applications (Phase 3)

- `GET /api/v1/loan-applications` - List loan applications
- `GET /api/v1/loan-applications/{id}` - Get loan application
- `POST /api/v1/loan-applications/{id}/evaluate` - Trigger AI evaluation (placeholder)

## Environment Variables

See `.env.example` for all available variables.

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_health.py -v
```

## Database

This project uses **SQLModel** (`SQLAlchemy` under the hood) with `metadata.create_all()` as its schema management strategy. **Alembic is not used.**

### Initial Setup

Run the setup script to create all tables and seed the default admin user:

```bash
# Create all tables defined in app/models/ and seed the default admin user
.venv/bin/python scripts/setup_db.py
```

### ⚠️ Adding a New SQLModel

Every time you add a new `SQLModel` class with `table=True`, you **must**:

1. Import it in `app/models/__init__.py` so SQLModel's metadata registry knows about it.
2. Re-run the setup script to materialize the new table in PostgreSQL:

```bash
# Detect and create any new tables (safe to run multiple times — existing tables are skipped)
.venv/bin/python scripts/setup_db.py
```

> `create_all()` is **additive only**: it creates missing tables but never drops or alters existing ones. It is safe to run at any time.

### Scripts Reference

| Script                      | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `scripts/setup_db.py`       | Create all tables + seed default admin user       |
| `scripts/init_db.py`        | Lightweight alternative (tables only + test user) |
| `scripts/seed_customers.py` | Seed sample customer data for development         |
| `scripts/seed_loans.py`     | Seed sample loan application data for development |
