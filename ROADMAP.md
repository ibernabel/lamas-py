# LAMaS Migration Roadmap

## Project Overview

Migration of LAMaS (Loan Applications Management System) from Laravel to:

- **Backend**: FastAPI + SQLModel + Pydantic
- **Frontend**: Next.js 16 + Tailwind 4 + shadcn/ui + TypeScript
- **CI/CD**: GitHub Actions
- **Deployment**: Docker on VPS

---

## Quick Links

| Document                                                                            | Description                        |
| ----------------------------------------------------------------------------------- | ---------------------------------- |
| [Migration PRD](./docs/planning/migration-prd.md)                                   | Product Requirements Document      |
| [Phase 1: Backend Foundation](./docs/implementation/phase-1-backend-foundation.md)  | FastAPI + SQLModel setup           |
| [LAMAS Integration Requirements](./docs/planning/lamas-integration-requirements.md) | CreditGraph AI Integration (Phase 8) |

---

## Technology Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Backend    | Python 3.11, FastAPI, SQLModel, Pydantic v2 |
| Frontend   | Next.js 16, React 19, Tailwind 4, shadcn/ui |
| Database   | PostgreSQL 15                               |
| Auth       | JWT (python-jose)                           |
| Testing    | pytest, factory_boy, Postman                |
| CI/CD      | GitHub Actions                              |
| Deployment | Docker, Docker Compose                      |

---

## Phase Status

| Phase | Name                     | Status         | Completed  | Duration |
| ----- | ------------------------ | -------------- | ---------- | -------- |
| 1     | Backend Foundation       | ✅ Complete    | 2026-01-28 | 1 day    |
| 2     | Customer APIs            | ✅ Complete    | 2026-02-14 | 2 weeks  |
| 3     | Loan Application APIs    | ⚪ Not Started | -          | 2 weeks  |
| 4     | Frontend Foundation      | ⚪ Not Started | -          | 1 week   |
| 5     | Frontend - Customers     | ⚪ Not Started | -          | 2 weeks  |
| 6     | Frontend - Loans         | ⚪ Not Started | -          | 2 weeks  |
| 7     | CI/CD & Deployment       | ⚪ Not Started | -          | 1 week   |
| 8     | CreditGraph AI Integration | ⚪ Not Started | -          | 2 weeks  |

**Legend:** ✅ Complete | 🟡 In Progress | ⚪ Not Started

---

## Phase 1: Backend Foundation ✅

**Status**: Complete  
**Completed**: 2026-01-28  
**Duration**: 1 day

### Steps

- [x] **Step 1.1**: Move Laravel files to `/legacy` folder
- [x] **Step 1.2**: Create backend project structure
- [x] **Step 1.3**: Core configuration (config.py, database.py, security.py)
- [x] **Step 1.4**: SQLModel models (19 models from Laravel)
- [x] **Step 1.5**: Docker configuration
- [x] **Step 1.6**: GitHub Actions CI workflow
- [x] **Step 1.7**: Testing setup (pytest + conftest)
- [x] **Step 1.8**: API endpoints scaffolding

### Deliverables ✅

- ✅ Working FastAPI server at `http://localhost:8001` (port 8000 in use)
- ✅ SQLModel models connected to PostgreSQL (port 5433)
- ✅ Health check endpoint: `GET /health`
- ✅ OpenAPI docs at `/api/v1/docs`
- ✅ Authentication endpoints: `/api/v1/auth/login`, `/api/v1/auth/me`
- ✅ Docker Compose with FastAPI + PostgreSQL 15
- ✅ GitHub Actions CI workflow
- ✅ pytest testing framework with SQLite in-memory fixtures

### Key Achievements

- **19 SQLModel models** created mapping all Laravel models
- **uv package manager** installed (v0.9.27)
- **Simplified User model** (no Teams/Jetstream)
- **JWT authentication** with python-jose + bcrypt
- **Polymorphic relationships** (Phone, Address) mapped

---

## Phase 2: Customer APIs

### Steps

- [x] **Step 2.1**: Customer CRUD endpoints
- [x] **Step 2.2**: Nested data creation (details, phones, addresses)
- [x] **Step 2.3**: NID validation endpoint
- [x] **Step 2.4**: Search and filtering
- [x] **Step 2.5**: Unit tests with pytest + factory_boy

---

## Phase 3: Loan Application APIs

### Steps

- [ ] **Step 3.1**: LoanApplication CRUD
- [ ] **Step 3.2**: Status workflow management
- [ ] **Step 3.3**: Credit risk association
- [ ] **Step 3.4**: AI evaluation placeholder endpoint
- [ ] **Step 3.5**: Integration tests

---

## Phase 4: Frontend Foundation

### Steps

- [ ] **Step 4.1**: Next.js 16 project with App Router
- [ ] **Step 4.2**: Tailwind CSS 4 + shadcn/ui setup
- [ ] **Step 4.3**: NextAuth.js (JWT authentication)
- [ ] **Step 4.4**: API client (React Query/TanStack Query)
- [ ] **Step 4.5**: Layout, navigation, and theme

---

## Phase 5: Frontend - Customer Management

### Steps

- [ ] **Step 5.1**: Customer list (DataTable with search/filter)
- [ ] **Step 5.2**: Customer detail page
- [ ] **Step 5.3**: Customer creation form
- [ ] **Step 5.4**: Customer edit form
- [ ] **Step 5.5**: Form validation with Zod

---

## Phase 6: Frontend - Loan Applications

### Steps

- [ ] **Step 6.1**: Loan application list
- [ ] **Step 6.2**: Loan detail page
- [ ] **Step 6.3**: New loan application form
- [ ] **Step 6.4**: Status management UI
- [ ] **Step 6.5**: Evaluation trigger button (placeholder)

---

## Phase 7: CI/CD & Deployment

### Steps

- [ ] **Step 7.1**: Production Docker configuration
- [ ] **Step 7.2**: Environment variables and secrets
- [ ] **Step 7.3**: VPS deployment scripts
- [ ] **Step 7.4**: Domain and SSL setup
- [ ] **Step 7.5**: Monitoring and logging

---

## Phase 8: CreditGraph AI Integration

**Reference**: [LAMAS Integration Requirements](./docs/planning/lamas-integration-requirements.md)

### Backend Integration (FastAPI)

- [ ] **Step 8.1**: Database schema - Create `creditgraph_analyses` table
- [ ] **Step 8.2**: SQLModel model for CreditGraph analysis storage
- [ ] **Step 8.3**: CreditGraph API client service
- [ ] **Step 8.4**: Background task for triggering analysis
- [ ] **Step 8.5**: Pydantic schemas for CreditGraph responses
- [ ] **Step 8.6**: Environment configuration for CreditGraph API
- [ ] **Step 8.7**: Unit tests for CreditGraph client and endpoints
- [ ] **Step 8.8**: Integration of CreditGraph results in Loan Application model
- [ ] **Step 8.9**: Frontend components for decision dashboard
- [ ] **Step 8.10**: Visual cards for Decision, IRS Score, and Confidence
- [ ] **Step 8.11**: Recharts integration for IRS breakdown
- [ ] **Step 8.12**: Decision reasoning narrative display
- [ ] **Step 8.13**: Financial analysis summary (detected income, flags)
- [ ] **Step 8.14**: OSINT findings display
- [ ] **Step 8.15**: API client functions for CreditGraph integration

### Key Features

- Headless AI credit risk analysis
- Full response storage for audit trail
- Interactive dashboard with charts
- Decision workflow management (APPROVED, REJECTED, MANUAL_REVIEW)
- IRS score breakdown visualization
- Spanish narrative generation

---

## Notes

- **AI Evaluation Service**: Out of scope. Backend includes placeholder endpoint at `POST /api/v1/loan-applications/{id}/evaluate`
- **CreditGraph AI**: Integrated in Phase 8 as stateless headless service
- **No Teams/Multi-tenant**: Simplified user model with basic RBAC
- **Database**: Using existing PostgreSQL schema - no migrations needed
- **Legacy**: Laravel files preserved in `/legacy` folder for reference
