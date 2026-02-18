# Phase 3: Loan Application APIs

**Status**: ✅ Complete  
**Completed**: 2026-02-18  
**Duration**: 1 day

---

## Overview

Phase 3 implements the complete Loan Application API, following the same layered architecture as Phase 2 (Customer APIs): **Schemas → Service → Endpoints → Tests**.

---

## Files Created / Modified

| File                                          | Type     | Purpose                                  |
| --------------------------------------------- | -------- | ---------------------------------------- |
| `app/schemas/loan_application.py`             | NEW      | Pydantic schemas (input/output/filter)   |
| `app/services/loan_application_service.py`    | NEW      | Business logic + status state machine    |
| `app/api/v1/endpoints/loan_applications.py`   | MODIFIED | Full CRUD + workflow (replaced scaffold) |
| `app/api/v1/endpoints/credit_risks.py`        | NEW      | Credit risk catalog (read-only)          |
| `app/api/v1/router.py`                        | MODIFIED | Registered `credit_risks` router         |
| `tests/factories/loan_application_factory.py` | NEW      | factory_boy test factories               |
| `tests/test_loan_applications_api.py`         | NEW      | 22 integration tests                     |

---

## API Endpoints

### Loan Applications (`/api/v1/loan-applications/`)

| Method   | Path                | Auth | Description                         |
| -------- | ------------------- | ---- | ----------------------------------- |
| `POST`   | `/`                 | ✅   | Create with nested financial detail |
| `GET`    | `/`                 | ✅   | Paginated list with filters         |
| `GET`    | `/{id}`             | ✅   | Full detail with notes              |
| `PUT`    | `/{id}`             | ✅   | Partial update of financial detail  |
| `DELETE` | `/{id}`             | ✅   | Soft delete (`is_active=False`)     |
| `PATCH`  | `/{id}/status`      | ✅   | Status workflow transition          |
| `PATCH`  | `/{id}/credit-risk` | ✅   | Associate a credit risk             |
| `POST`   | `/{id}/notes`       | ✅   | Add an audit note                   |
| `POST`   | `/{id}/evaluate`    | ✅   | AI evaluation placeholder (Phase 8) |

### Credit Risks (`/api/v1/credit-risks/`)

| Method | Path          | Auth | Description                    |
| ------ | ------------- | ---- | ------------------------------ |
| `GET`  | `/`           | ✅   | List all categories            |
| `GET`  | `/risks`      | ✅   | List all risks with categories |
| `GET`  | `/risks/{id}` | ✅   | Get specific risk              |

---

## Status State Machine

```
received → verified → assigned → analyzed → approved
                                           ↘ rejected
any_state → archived (terminal)
```

**Boolean flag sync on transition:**

| Status     | Flags Set                                                   |
| ---------- | ----------------------------------------------------------- |
| `approved` | `is_approved=True`, `is_answered=True`, `approved_at=now()` |
| `rejected` | `is_rejected=True`, `is_answered=True`, `rejected_at=now()` |
| `archived` | `is_archived=True`, `archived_at=now()`                     |
| Any        | `changed_status_at=now()`, `is_new=False`                   |

Invalid transitions return `HTTP 422 Unprocessable Entity`.

---

## Test Coverage

```bash
# Run Phase 3 tests
cd backend && uv run pytest tests/test_loan_applications_api.py -v

# Run full suite
uv run pytest tests/ -v
# Result: 48 passed, 0 failed
```

### Test Scenarios

- ✅ CRUD happy paths (create, list, get, update, delete)
- ✅ Validation errors (invalid amount, missing customer)
- ✅ Status workflow (valid transitions, invalid transitions, flag sync)
- ✅ Terminal state enforcement (archived → any = 422)
- ✅ Credit risk association (success + 404)
- ✅ Notes (add, empty content validation)
- ✅ AI evaluation placeholder (success + 404)
- ✅ Unauthenticated access (401)

---

## Design Decisions

1. **Soft delete** — `DELETE` sets `is_active=False`. Records preserved for audit.
2. **Credit risk as audit note** — Association stored as `[CREDIT_RISK]` prefixed note for immutable audit trail.
3. **Schemas re-use** — `PaginatedResponse[T]` and `PaginationParams` imported from `schemas/customer.py` (DRY).
4. **Explicit relation loading** — Relations loaded via explicit `session.exec()` queries to avoid SQLModel lazy-load issues in async context.
