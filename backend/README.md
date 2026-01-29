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

The backend connects to an existing PostgreSQL database from Laravel.  
No migrations are needed as we're using the existing schema.
