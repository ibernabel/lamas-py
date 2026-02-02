# LAMaS Documentation

Documentation for the LAMaS (Loan Applications Management System) migration project.

## Navigation

### Planning

- [Migration PRD](./planning/migration-prd.md) - Product Requirements Document

### Implementation Phases

- [Phase 1: Backend Foundation](./implementation/phase-1-backend-foundation.md)
- [Maintenance & Environment](./implementation/maintenance.md)
- Phase 2: Customer APIs _(Coming Soon)_
- Phase 3: Loan Application APIs _(Coming Soon)_
- Phase 4: Frontend Foundation _(Coming Soon)_
- Phase 5: Frontend - Customer Management _(Coming Soon)_
- Phase 6: Frontend - Loan Applications _(Coming Soon)_
- Phase 7: Integration & Deployment _(Coming Soon)_

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
