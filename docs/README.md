# LAMaS Documentation

Documentation for the LAMaS (Loan Applications Management System) migration project.

## Navigation

### Planning

- [Migration PRD](./planning/migration-prd.md) - Product Requirements Document
- [Status Report (Feb 2026)](./status-report.md) - Current projects health and progress

### Implementation Phases

- [Phase 1: Backend Foundation](./implementation/phase-1-backend-foundation.md) - ✅
- [Phase 2: Customer APIs](./implementation/phase-2-customer-apis.md) - ✅
- [Phase 3: Loan Application APIs](./implementation/phase-3-loan-application-apis.md) - ✅
- [Phase 4: Frontend Foundation](./implementation/phase-4-frontend-foundation.md) - ✅
- [Maintenance & Environment](./implementation/maintenance.md) - 🔧
- [Phase 5: Frontend - Customer Management](./implementation/phase-5-frontend-customers.md) - ✅
- [Phase 6: Frontend - Loan Applications](./implementation/phase-6-frontend-loans.md) - ✅
- [Phase 8: CreditGraph AI Integration](./implementation/phase-8-creditgraph-backend.md) - 🟡

### Testing

- Testing Documentation _(Coming Soon)_

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
