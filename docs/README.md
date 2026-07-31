# LAMaS Documentation

Documentation for the LAMaS (Loan Applications Management System) migration project.

## Navigation

### Planning

- [Migration PRD](./planning/migration-prd.md) - Product Requirements Document
- [LAMaS Integration Requirements](./planning/lamas-integration-requirements.md) - CreditGraph & API Integration Requirements
- [CreditGraph UI Technical Spec](./planning/creditgraph-ui-technical-spec.md) - Technical Specification & UI/UX Data Contract for CreditGraph AI
- [**REQ: Auditoría LoanApplication Enums**](./planning/req-loan-application-enum-audit.md) - 📋 Requerimientos para corrección de enums en formulario público
- [**REQ: Vista de Configuración e i18n Multi-Idioma**](./planning/req-settings-view-and-i18n.md) - 📋 Requerimientos y especificación técnica de i18n y /settings
- [**REQ: Personalización Apariencia de Tablas**](./planning/req-table-appearance-customization.md) - 📋 Requerimientos de apariencia dinámica de tablas en /settings (Fondo, Gradiente y Texto)
- [**REQ: Rediseño Estructura Tabla de Solicitudes**](./planning/req-loans-table-structure-redesign.md) - ✅ Especificación e implementación de 7 columnas, subtextos mini y botón Editar en /loans
- [Status Report (Jul 2026)](./status-report.md) - Current projects health and progress

### Implementation Phases

- [Phase 1: Backend Foundation](./implementation/phase-1-backend-foundation.md) - ✅
- [Phase 2: Customer APIs](./implementation/phase-2-customer-apis.md) - ✅
- [Phase 3: Loan Application APIs](./implementation/phase-3-loan-application-apis.md) - ✅
- [Phase 4: Frontend Foundation](./implementation/phase-4-frontend-foundation.md) - ✅
- [Maintenance & Environment](./implementation/maintenance.md) - 🔧
- [Phase 5: Frontend - Customer Management](./implementation/phase-5-frontend-customers.md) - ✅
- [Phase 6: Frontend - Loan Applications](./implementation/phase-6-frontend-loans.md) - ✅
- [Phase 7/9: Document Management](./implementation/phase-7-document-management.md) - ✅ (Manual verification pending fixes)
- [Phase 8: CreditGraph AI Integration](./implementation/phase-8-creditgraph.md) - ✅
- [Version Bump & Frontend Sync](./implementation/2026-07-27-version-bump-and-frontend-sync.md) - ✅ (Version 1.0.0)
- [Customer Detail Redesign & CreditGraph Spec](./implementation/2026-07-28-customer-detail-redesign-and-creditgraph-spec.md) - ✅ (2026-07-28)
- [Zero-PII Data Contract Integration](./implementation/2026-07-29-zero-pii-data-contract.md) - ✅ (2026-07-29)
- [Customer Form Enum Audit & Restoration](./implementation/2026-07-30-customer-form-enum-audit-restoration.md) - ✅ (2026-07-30)
- [**Multi-Language i18n & Settings View**](./implementation/2026-07-30-multi-language-i18n-and-settings-view.md) - ✅ (2026-07-30)
- [**Public Form Enum Unification (Opción B)**](./implementation/2026-07-30-public-form-enum-unification.md) - ✅ (2026-07-30)
- [**SoliPres Table Styling & Unified Status Badges**](./implementation/2026-07-30-solipres-table-styling-and-status-badges.md) - ✅ (2026-07-30)
- [**Loans Table Structure Redesign (7 Cols, Mini Subtexts & Edit)**](./implementation/2026-07-31-loans-table-structure-redesign.md) - ✅ (2026-07-31)

### Decisions & Architecture (ADRs)

- [ADR 002: Document Proxy Authentication](./decisions/002-document-proxy-auth.md)
- [ADR 003: Zero-PII Data Contract for CreditGraph AI](./decisions/003-zero-pii-data-contract.md)
- [ADR 004: Restauración de Enum Semánticos en CustomerForm](./decisions/004-enum-restoration-customer-fields.md)
- [ADR 005: Preservación de Identidad Visual y Familiaridad de UI (SoliPres ➔ LAMaS)](./decisions/005-solipres-ui-familiarity-and-table-design.md)
- [ADR 006: Remoción de la Entrada Inhabilitada "Credit Analysis" del Sidebar](./decisions/006-sidebar-credit-analysis-removal.md)

### Testing

- [Document Viewer Verification](./testing/document-viewer-manual-verification.md) - 2026-03-10

### Fixes

- [Fix: SelectItem Empty Value Runtime Error](./fixes/fix_2026_07_30_select_item_empty_value.md) - 2026-07-30
- [Fix: Importación CSV SoliPres (Duplicación Ruta, Savepoints y CORS)](./fixes/fix_2026_07_30_solipres_csv_import_500_cors.md) - 2026-07-30
- [Fix: Importación Completa de Datos CSV SoliPress (Empresa, Dirección, Teléfonos y Notas)](./fixes/fix_2026_07_31_solipres_csv_full_data_import.md) - 2026-07-31
- [Fix: Corrección de 19 Pruebas Unitarias de Vitest en Frontend](./fixes/fix_2026_07_31_frontend_vitest_unit_tests.md) - 2026-07-31

### Knowledges & Issues

- [Known Issue: Document Viewer 404](./knowledges/known_issue-document-viewer-404.md) - Identified 2026-03-10
- [**Known Issue: Public Form Enum Mismatch**](./knowledges/known-issue-public-form-enum-mismatch.md) - ✅ **RESUELTO** 2026-07-30 — Ver [implementación](./implementation/2026-07-30-public-form-enum-unification.md)

## Quick Start

```bash
# Start development environment
docker-compose up -d

# Backend API docs
open http://localhost:8000/docs

# Frontend (after Phase 4)
open http://localhost:3000
```

## Project Structure

```
lamas-py/
├── backend/         # FastAPI service
├── frontend/        # Next.js app (Phase 4+)
├── legacy/          # Laravel backup
├── docs/            # This documentation
├── ROADMAP.md       # Migration progress
└── docker-compose.yml
```
