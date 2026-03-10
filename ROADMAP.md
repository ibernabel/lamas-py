# LAMaS Migration Roadmap

## Project Overview

Migration of LAMaS (Loan Applications Management System) from Laravel to:

- **Backend**: FastAPI + SQLModel + Pydantic
- **Frontend**: Next.js 16 + Tailwind 4 + shadcn/ui + TypeScript
- **CI/CD**: GitHub Actions
- **Deployment**: Docker on VPS

---

## Quick Links

| Document                                                                            | Description                          |
| ----------------------------------------------------------------------------------- | ------------------------------------ | ------------- |
| [Migration PRD](./docs/planning/migration-prd.md)                                   | Product Requirements Document        |
| [Phase 1: Backend Foundation](./docs/implementation/phase-1-backend-foundation.md)  | FastAPI + SQLModel setup             |
| [Phase 5: Frontend Customers](./docs/implementation/phase-5-frontend-customers.md)  | Customer management UI               | ✅ 2026-02-19 |
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

| Phase | Name                       | Status         | Completed  | Duration |
| ----- | -------------------------- | -------------- | ---------- | -------- |
| 1     | Backend Foundation         | ✅ Complete    | 2026-01-28 | 1 day    |
| 2     | Customer APIs              | ✅ Complete    | 2026-02-14 | 2 weeks  |
| 3     | Loan Application APIs      | ✅ Complete    | 2026-02-18 | 1 day    |
| 4     | Frontend Foundation        | ✅ Complete    | 2026-02-18 | 1 day    |
| 5     | Frontend - Customers       | ✅ Complete    | 2026-02-19 | 1 day    |
| 6     | Frontend - Loans           | ✅ Complete    | 2026-03-01 | 2 weeks  |
| 7     | CI/CD & Deployment         | ⚪ Not Started | -          | 1 week   |
| 8     | CreditGraph AI Integration | ✅ Complete    | 2026-03-08 | 2 weeks  |
| 9     | Document Management        | ✅ Complete    | 2026-03-10 | 2 days   |

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

## Phase 3: Loan Application APIs ✅

**Status**: Complete  
**Completed**: 2026-02-18  
**Duration**: 1 day

### Steps

- [x] **Step 3.1**: LoanApplication CRUD
- [x] **Step 3.2**: Status workflow management
- [x] **Step 3.3**: Credit risk association
- [x] **Step 3.4**: AI evaluation placeholder endpoint
- [x] **Step 3.5**: Integration tests

### Deliverables ✅

- ✅ `POST /api/v1/loan-applications/` — Create with nested detail
- ✅ `GET /api/v1/loan-applications/` — Paginated list with filters
- ✅ `GET /api/v1/loan-applications/{id}` — Full detail with relations
- ✅ `PUT /api/v1/loan-applications/{id}` — Partial update
- ✅ `DELETE /api/v1/loan-applications/{id}` — Soft delete
- ✅ `PATCH /api/v1/loan-applications/{id}/status` — Status state machine
- ✅ `PATCH /api/v1/loan-applications/{id}/credit-risk` — Credit risk association
- ✅ `POST /api/v1/loan-applications/{id}/notes` — Add notes
- ✅ `POST /api/v1/loan-applications/{id}/evaluate` — AI placeholder
- ✅ `GET /api/v1/credit-risks/` — Credit risk categories catalog
- ✅ `GET /api/v1/credit-risks/risks` — Credit risks list
- ✅ 22 integration tests (all passing)

---

## Phase 4: Frontend Foundation ✅

**Status**: Complete  
**Completed**: 2026-02-18  
**Duration**: 1 day

### Steps

- [x] **Step 4.1**: Next.js 16 project with App Router (pnpm, TypeScript, Tailwind 4)
- [x] **Step 4.2**: shadcn/ui setup (12 components installed)
- [x] **Step 4.3**: NextAuth.js v5 (Credentials provider, JWT session, proxy.ts)
- [x] **Step 4.4**: API client (TanStack Query, axios, typed interfaces)
- [x] **Step 4.5**: Layout, navigation, and theme (sidebar, header, dashboard home)
- [x] **Verification**: Successful browser test and local configuration fixes (2026-02-18)

### Deliverables ✅

- ✅ Next.js 16.1.6 + Tailwind CSS 4.2.0 + TypeScript 5.9.3
- ✅ NextAuth.js v5 JWT authentication with Credentials provider
- ✅ Route protection via `proxy.ts`
- ✅ TanStack Query v5 + axios API client with auth interceptors
- ✅ TypeScript interfaces for all backend schemas
- ✅ Dashboard layout: sidebar + header + main content
- ✅ Login page with Suspense boundary
- ✅ `pnpm run build` → Exit code 0, 5 pages generated

---

## Phase 5: Frontend - Customer Management ✅

**Status**: Complete  
**Started**: 2026-02-19  
**Completed**: 2026-02-19

**Reference**: [Phase 5 Implementation Doc](./docs/implementation/phase-5-frontend-customers.md)

### Steps

- [x] **Step 5.1**: Customer API layer (`lib/api/customers.ts`, `lib/api/types.ts`)
- [x] **Step 5.2**: Zod validation schemas (`lib/validations/customer.schema.ts`)
- [x] **Step 5.3**: TanStack Query hooks (`hooks/use-customers.ts`)
- [x] **Step 5.4**: Customer UI components (`CustomerTable`, `CustomerFilters`, `CustomerListClient`, `CustomerForm`)
- [x] **Step 5.5**: Route pages (`/customers`, `/customers/new`, `/customers/[id]`, `/customers/[id]/edit`)
- [x] **Step 5.6**: TypeScript errors resolved (react-hook-form v7.71 TTransformedValues fix)
- [x] **Step 5.7**: Unit tests — 42/42 pass (31 schema + 11 CustomerTable)
- [x] **Step 5.8**: 5 fake customers seeded in lamas-db (Carlos, Maria, Jose, Ana, Pedro)

---

## Phase 6: Frontend - Loan Applications ✅

**Status**: Complete  
**Completed**: 2026-03-01

### Steps

- [x] **Step 6.1**: Loan API layer extension
- [x] **Step 6.2**: Zod validation schemas
- [x] **Step 6.3**: TanStack Query hooks
- [x] **Step 6.4**: UI Components (LoanTable, LoanForm, Dialogs)
- [x] **Step 6.5**: Route pages (list, new, detail)
- [x] **Step 6.6**: Documentation update

---

## Phase 7: CI/CD & Deployment

### Steps

- [ ] **Step 7.1**: Production Docker configuration
- [ ] **Step 7.2**: Environment variables and secrets
- [ ] **Step 7.3**: VPS deployment scripts
- [ ] **Step 7.4**: Domain and SSL setup
- [ ] **Step 7.5**: Monitoring and logging

---

## Phase 8: CreditGraph AI Integration ✅

**Status**: Complete
**Completed**: 2026-03-08
**Reference**: [LAMAS Integration Requirements](./docs/planning/lamas-integration-requirements.md)

### Backend Integration (FastAPI)

- [x] **Step 8.1**: Database schema - Create `creditgraph_analyses` table
- [x] **Step 8.2**: SQLModel model for CreditGraph analysis storage
- [x] **Step 8.3**: CreditGraph API client service (Synchronous)
- [x] **Step 8.4**: Background task orchestration for triggering analysis
- [x] **Step 8.5**: Pydantic schemas for CreditGraph responses
- [x] **Step 8.6**: Environment configuration for CreditGraph API
- [x] **Step 8.7**: Unit tests for CreditGraph client and endpoints (29 tests)
- [x] **Step 8.8**: Integration of CreditGraph results in Loan Application model
- [x] **Step 8.9**: Frontend components for decision dashboard
- [x] **Step 8.10**: Visual cards for Decision, IRS Score, and Confidence
- [x] **Step 8.11**: Recharts integration for IRS breakdown
- [x] **Step 8.12**: Decision reasoning narrative display
- [x] **Step 8.13**: Financial analysis summary (detected income, flags)
- [x] **Step 8.14**: OSINT findings display
- [x] **Step 8.15**: API client functions for CreditGraph integration
- [x] **Step 8.16**: Dedicated analysis route `/loans/[id]/analysis`

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

---

## Phase 9: Document Management ✅

**Status**: Complete  
**Completed**: 2026-03-10  
**Reference**: [Phase 9 Implementation Doc](./docs/implementation/phase-7-document-management.md)

### Steps

- [x] **Step 9.1**: Storage abstraction (Local + Cloudflare R2)
- [x] **Step 9.2**: `CustomerDocument` SQLModel with versioning
- [x] **Step 9.3**: Backend API endpoints for upload/list/delete
- [x] **Step 9.4**: Frontend components (`DocumentUpload`, `DocumentList`)
- [x] **Step 9.5**: UI Integration (Customer detail, Loan detail, Customer creation)
- [x] **Step 9.6**: Integration tests (4/4 pass)

### Deliverables ✅

- ✅ `AbstractStorageService` with Local and R2 implementations
- ✅ Secure download via pre-signed URLs
- ✅ Automatic file versioning management
- ✅ Integrated document management in 3 key UI areas
- ✅ 4 backend integration tests
