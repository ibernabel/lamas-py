<p align="center">
  <img src="./frontend/public/img/lamas-id-mini.png" alt="LAMaS Visual Identity" width="300" height="200">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/LAMaS-Loan%20Applications%20Management%20System-0F4C81?style=for-the-badge&logo=fastapi&logoColor=white" alt="LAMaS Badge">
</p>

<p align="center">
<img src="https://img.shields.io/badge/FastAPI-0.128.0-009688?style=flat-square&logo=fastapi" alt="FastAPI">
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python Version">
<img src="https://img.shields.io/badge/SQLModel-0.0.31-DE3163?style=flat-square" alt="SQLModel">
<img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License">
</p>

> **🚧 Migration in Progress**: This project is being migrated from Laravel to FastAPI + Next.js  
> **Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🟡

# Loan Applications Management System - LAMaS

## 📋 Overview

**LAMaS** (Loan Applications Management System) is a modern web application designed to streamline the loan application process. The system is being migrated from Laravel to a modern stack:

- **Backend**: Python + FastAPI + SQLModel
- **Frontend**: Next.js 16 + TypeScript + Tailwind 4
- **Database**: PostgreSQL 15
- **Deployment**: Docker

### Migration Status

| Phase | Name                  | Status         |
| ----- | --------------------- | -------------- |
| 1     | Backend Foundation    | ✅ Complete    |
| 2     | Customer APIs         | 🟡 In Progress |
| 3     | Loan Application APIs | ⚪ Planned     |
| 4-7   | Frontend & Deployment | ⚪ Planned     |

---

## 🛠️ Tech Stack

### Backend (FastAPI)

- **Framework**: FastAPI 0.128.0
- **ORM**: SQLModel 0.0.31 (SQLAlchemy + Pydantic)
- **Authentication**: JWT (python-jose + passlib)
- **Database**: PostgreSQL 15
- **Testing**: pytest + httpx
- **Deployment**: Docker

### Frontend (Planned - Phase 4)

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **State**: React Query (TanStack Query)

### Legacy (Archived)

- Laravel 11.x + PHP 8.2 (moved to `/legacy`)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Python 3.11+ with [uv](https://github.com/astral-sh/uv)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ibernabel/lamas-py.git
cd lamas-py

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

**API will be available at**: http://localhost:8001  
**API Docs (Swagger)**: http://localhost:8001/api/v1/docs

### Local Development (without Docker)

```bash
cd backend

# Install dependencies using uv (faster)
uv pip install -e ".[dev]"

# Or use pip
pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:pass@localhost:5432/lamas

# Run the server
uvicorn app.main:app --reload
```

### Run Tests

```bash
# Inside Docker
docker compose exec backend pytest --cov=app

# Local
cd backend && pytest
```

---

## 📚 Documentation

- [Migration PRD](./docs/planning/migration-prd.md)
- [Phase 1: Backend Foundation](./docs/implementation/phase-1-completion.md)
- [ROADMAP](./ROADMAP.md)
- [Backend README](./backend/README.md)

---

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login with JWT
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Customers (Phase 2 - In Progress)

- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/{id}` - Get customer
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/{id}` - Update customer

### Loan Applications (Phase 3 - Planned)

- `GET /api/v1/loan-applications` - List loan applications
- `GET /api/v1/loan-applications/{id}` - Get loan application
- `POST /api/v1/loan-applications/{id}/evaluate` - Trigger AI evaluation

**Interactive API Docs**: http://localhost:8001/api/v1/docs

---

## 🗂️ Project Structure

```
lamas-py/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/v1/       # API endpoints
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLModel models
│   │   └── main.py       # Application entry
│   ├── tests/            # Test suite
│   └── pyproject.toml    # Python dependencies
├── legacy/               # Original Laravel application (archived)
├── docs/                 # Project documentation
│   ├── planning/         # PRD, architecture
│   └── implementation/   # Phase completion reports
├── .github/
│   └── workflows/        # CI/CD pipelines
├── docker-compose.yml    # Container orchestration
└── ROADMAP.md           # Migration roadmap
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_health.py -v
```

---

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Enter backend container
docker compose exec backend sh
```

---

## 🗺️ Migration Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed migration plan.

**Current Status**: Phase 1 Complete ✅

---

## 🤝 Contributing

See [CONTRIBUTING.md](./legacy/CONTRIBUTING.md) for guidelines.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Legacy Laravel Application

The original Laravel application is preserved in `/legacy` for reference.
