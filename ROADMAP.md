# LAMaS Migration Roadmap

## Project Overview

Migration of LAMaS (Loan Applications Management System) from Laravel to:

- **Backend**: FastAPI + SQLModel + Pydantic
- **Frontend**: Next.js 16 + Tailwind 4 + shadcn/ui + TypeScript
- **CI/CD**: GitHub Actions
- **Deployment**: Docker on VPS

---

## Quick Links

| Document                                                                            | Description                          | Status        |
| ----------------------------------------------------------------------------------- | ------------------------------------ | ------------- |
| [Migration PRD](./docs/planning/migration-prd.md)                                   | Product Requirements Document        |               |
| [Phase 1: Backend Foundation](./docs/implementation/phase-1-backend-foundation.md)  | FastAPI + SQLModel setup             |               |
| [Phase 5: Frontend Customers](./docs/implementation/phase-5-frontend-customers.md)  | Customer management UI               | ✅ 2026-02-19 |
| [LAMAS Integration Requirements](./docs/planning/lamas-integration-requirements.md) | CreditGraph AI Integration (Phase 8) |               |
| [PRD Data Audit & Versioning](./docs/planning/prd-audit-versioning.md)              | Field-level Audit & Temporal Log     | 🟢 2026-07-31 |
| [Loan Application Enum Audit](./docs/planning/req-loan-application-enum-audit.md)  | Enum Audit & Alignment for Public    | 📋 Pending    |
| [Table Appearance Customization](./docs/planning/req-table-appearance-customization.md) | Dynamic Table Styling in /settings | 📋 Pending    |
| [PRD Document Upload UX Redesign](./docs/planning/prd-document-upload-ux-redesign.md) | Document Business Rules & UX       | 🟢 2026-07-31 |
| [Loans Table Structure Redesign](./docs/planning/req-loans-table-structure-redesign.md) | Rediseño de Tabla en /loans (7 cols + subtextos + Editar) | ✅ 2026-07-31 |
| [Universal NID Formatting](./docs/implementation/2026-07-31-nid-mask-formatting-and-flexible-inputs.md) | Formateo Universal de Cédula (000-0000000-0) | ✅ 2026-07-31 |

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
| -     | Customer Edit & Detail Fix | ✅ Complete    | 2026-03-11 | < 1 day  |
| 10    | Data Audit & Versioning    | 🟢 Approved    | -          | 2 weeks  |
| 11    | Loan Application Enum Audit| 📋 Pending     | -          | 1-2 days |
| 12    | Table Appearance Custom    | 📋 Pending     | -          | 2-3 days |
| 13    | Document Upload UX Redesign| 🟢 Approved    | -          | 3-4 days |
| 14    | Loans Table Structure Redesign| ✅ Complete | 2026-07-31 | 1 day    |
| 15    | Universal NID Formatting   | ✅ Complete    | 2026-07-31 | < 1 day  |

**Legend:** ✅ Complete | 🟢 Approved / Ready | 🟡 In Progress | 📋 Pending | ⚪ Not Started

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
- [x] **Step 6.6**: Customer Summary Integration (Async Loan DataTable)
- [x] **Step 6.7**: Enrich Loan Detail Customer Card (Full info & Employment)
- [x] **Step 6.8**: Documentation update

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
- Zero-PII Data Contract Architecture (Strict privacy, SHA-256 pseudonymization, Pydantic ingestion validation)
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
- ⚠️ **Known Issue**: Document preview modal currently fails in local dev due to routing mismatch (see [Known Issue](./docs/knowledges/known_issue-document-viewer-404.md))

---

## Phase 10: Data Audit & Versioning Module 🟢

**Status**: Approved — Ready for Implementation  
**Approved Date**: 2026-07-31  
**Reference**: [PRD: Data Audit & Versioning](./docs/planning/prd-audit-versioning.md)

### Steps

- [ ] **Step 10.1**: Core Audit Model (`AuditLog`) & DDL Migration Script with PostgreSQL RLS
- [ ] **Step 10.2**: `AuditContext` Dependency & `AuditService` with `diff_models()` helper
- [ ] **Step 10.3**: Service Layer Integration (`CustomerService`, `LoanApplicationService`)
- [ ] **Step 10.4**: Audit Query API (`GET /api/v1/audit/customers/{id}`, `/loan-applications/{id}`, `/users/{id}/activity`)
- [ ] **Step 10.5**: Automatic Process Tracing (CSV Import & Public Form `AuditContext` propagation)
- [ ] **Step 10.6**: Data Retention & Archival Strategy (10-year Ley 183-02 RD compliance, active vs. archive tables)
- [ ] **Step 10.7**: Frontend Audit Timeline Component (Next.js UI for Supervisors & Admins)
- [ ] **Step 10.8**: Unit & Integration Test Suite (`pytest`)

### Key Features

- **Field-level change tracking**: Captures `old_value`, `new_value`, actor (`user_id`), source, timestamp, and IP.
- **Append-only integrity**: Enforced via PostgreSQL Row-Level Security (RLS) from MVP.
- **Restricted access**: Read-only endpoints restricted exclusively to `admin` and `supervisor` roles.
- **Regulatory compliance**: 10-year retention strategy compliant with Dominican Republic Ley 183-02 and AML regulations.
- **Async performance**: Non-blocking audit log creation using FastAPI `BackgroundTask`.

---

## Phase 11: Loan Application Enum Audit & Alignment 📋

**Status**: Pending Execution  
**Reference**: [Loan Application Enum Audit](./docs/planning/req-loan-application-enum-audit.md)

### Steps

- [ ] **Step 11.1**: Corregir enums del wizard público (`solicitar/page.tsx` y `loan-application.schema.ts`)
- [ ] **Step 11.2**: Resolver semántica de `housing_type` y mapeo de `COMMON_LAW` → `"other"`
- [ ] **Step 11.3**: Mapear/agregar `TECHNICAL` en nivel educativo y resolver `occupation_type`
- [ ] **Step 11.4**: Estandarizar valores de `purpose` y `payment_bank`
- [ ] **Step 11.5**: Pruebas de integración E2E del wizard sin errores HTTP 422

### Key Features

- Alineación completa de enums entre wizard público y backend FastAPI.
- Eliminación de errores HTTP 422 en la captación pública de clientes.
- Garantía de integridad de datos PII para el motor de evaluación CreditGraph AI.

---

## Phase 12: Table Appearance Customization Module 📋

**Status**: Pending Implementation  
**Reference**: [Table Appearance Customization](./docs/planning/req-table-appearance-customization.md)

### Steps

- [ ] **Step 12.1**: Controles UI de Apariencia de Tablas en `/settings` (Fondo, Sentido del Degradado, Transformación de Texto)
- [ ] **Step 12.2**: React Context `TableAppearanceProvider` y hook `useTableAppearance()`
- [ ] **Step 12.3**: Consumo reactivo en `TableHeader` / `TableHead` (`frontend/components/ui/table.tsx`)
- [ ] **Step 12.4**: Persistencia en `localStorage` (`'lamas_table_appearance_prefs'`)
- [ ] **Step 12.5**: Modelo SQLModel `UserPreference` y endpoints FastAPI (`GET/PATCH /api/v1/users/me/preferences`)
- [ ] **Step 12.6**: Pruebas unitarias de renderizado de tablas (`Vitest`)

### Key Features

- Personalización visual dinámica de tablas sin recargar la página.
- Degradados horizontal/vertical y formato MAYÚSCULAS/normal para la tabla.
- Persistencia dual cliente (`localStorage`) y backend (`UserPreference` en PostgreSQL).

---

## Phase 13: Document Upload UX Redesign & Business Rules 🟢

**Status**: Approved — Ready for Implementation
**Approved Date**: 2026-07-31
**Duration**: 3–4 días
**Reference**: [PRD Document Upload UX Redesign](./docs/planning/prd-document-upload-ux-redesign.md)

### Steps

- [ ] **Step 13.1**: Agregar `collateral_type` a `LoanApplication` *(prerequisito Sección C de Garantías)*
- [ ] **Step 13.2**: Crear `DocumentTypeEnum` con 13 tipos activos en `app/models/document.py`
- [ ] **Step 13.3**: Actualizar `app/schemas/document.py` — enum + `file_size_bytes` en response
- [ ] **Step 13.4**: Validar enum + MIME + tamaño (10 MB) en endpoints de upload → HTTP 422 / 413
- [ ] **Step 13.5**: Agregar `CurrentUser` en endpoint `GET /customers/{customer_id}` (security fix)
- [ ] **Step 13.6**: Implementar `GET /documents/loans/{loan_id}` (endpoint faltante)
- [ ] **Step 13.7**: Tests backend pytest (8 tests)
- [ ] **Step 13.8**: Crear `lib/config/document-types.ts` con catálogo centralizado y `SUPPORTED_BANKS`
- [ ] **Step 13.9**: Agregar `listLoanDocuments()` en `lib/api/documents.ts`
- [ ] **Step 13.10**: Actualizar `lib/api/types.ts` — `DocumentType` union + `collateral_type`
- [ ] **Step 13.11**: Crear `DocumentSlot.tsx` — validación MIME, tamaño, selector de banco
- [ ] **Step 13.12**: Crear `DocumentGroup.tsx` — agrupador de slots por sección
- [ ] **Step 13.13**: Crear `DocumentProgress.tsx` — indicador de progreso del expediente
- [ ] **Step 13.14**: Crear `CustomerDocumentsPanel.tsx` — secciones Identificación y Soporte Adicional
- [ ] **Step 13.15**: Crear `LoanDocumentsPanel.tsx` — Secciones A, B, C (condicional)
- [ ] **Step 13.16**: Actualizar `CustomerForm.tsx` — solo `nid` requerido en post-creación
- [ ] **Step 13.17**: Actualizar `/customers/[id]/page.tsx` — reemplazar `DocumentsSection`
- [ ] **Step 13.18**: Actualizar `/loans/[id]/page.tsx` — reemplazar bloque de documentos
- [ ] **Step 13.19**: Tests unitarios frontend Vitest (12 tests nuevos)
- [ ] **Step 13.20**: Documentar Known Issues (KI-DOC-001 al 010) en `docs/knowledges/`
- [ ] **Step 13.21**: `docs/implementation/phase-13-document-upload-ux-redesign.md`
- [ ] **Step 13.22**: Actualizar `ROADMAP.md` con deliverables completados

### Key Features

- **Catálogo centralizado**: `lib/config/document-types.ts` como Single Source of Truth de tipos, MIME y bancos
- **13 tipos activos**: Todos con slot de carga en el contexto correcto (cliente vs. préstamo)
- **Validación real de MIME y tamaño**: Backend (HTTP 422/413) + Frontend (UI error antes del submit)
- **Selector de banco**: Para `bank_statement`, el banco es obligatorio antes de subir
- **Sección C condicional**: Garantías (vehículo/propiedad) visibles solo cuando aplica `collateral_type`
- **`DocumentProgress`**: Indicador de completitud del expediente por sección
- **Bancos MVP**: BHD, Popular, Banreservas — configurables en código sin UI de settings
- **Backlog documentado**: OCR de PDF, multi-bank CreditGraph, R2 async fix

