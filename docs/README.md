# LAMaS Documentation

Documentation for the LAMaS (Loan Applications Management System) migration project.

## Navigation

### Planning

- [Migration PRD](./planning/migration-prd.md) - Product Requirements Document
- [LAMaS Integration Requirements](./planning/lamas-integration-requirements.md) - CreditGraph & API Integration Requirements
- [CreditGraph UI Technical Spec](./planning/creditgraph-ui-technical-spec.md) - Technical Specification & UI/UX Data Contract for CreditGraph AI
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

### Decisions & Architecture (ADRs)

- [ADR 002: Document Proxy Authentication](./decisions/002-document-proxy-auth.md)
- [ADR 003: Zero-PII Data Contract for CreditGraph AI](./decisions/003-zero-pii-data-contract.md)

### Testing

- [Document Viewer Verification](./testing/document-viewer-manual-verification.md) - 2026-03-10

### Knowledges & Issues

- [Known Issue: Document Viewer 404](./knowledges/known_issue-document-viewer-404.md) - Identified 2026-03-10

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
