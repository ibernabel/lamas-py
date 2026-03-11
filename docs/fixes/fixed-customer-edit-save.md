# Fixed: Customer Edit Phone & Address Save Bug

**Date**: 2026-03-11
**Issue**: Saving phone numbers and addresses on the customer edit page fails, and the customer detail page crashes with 500 errors.
**Root Cause**:

1. **Missing Implementation**: The `update_customer` function was missing logic for polymorphic entities (phones, addresses).
2. **Missing Dependency**: `email-validator` was not installed, causing crashes in Pydantic validation.
3. **Schema Mismatch**: `get_customer_with_relations` was returning a raw SQLModel instead of a validated schema, causing `TypeError` when manually attaching attributes.
4. **Update Conflict**: `update_customer` was attempting to update a Pydantic schema instead of a database model, leading to "field not found" errors (e.g., `nickname`).

## Resolution

### Technical Implementation

- **Strategy**: "Replace-all" (Clean and Insert). All existing phones/addresses for the customer are deleted and re-created from the payload during updates.
- **Service Layer Refactor**: Separated `get_customer_model_with_relations` (internal model use) from `get_customer_with_relations` (API response schema use).
- **Validation**: Added `nickname` to `CustomerDetailRead` and resolved `created_at` field duplication in `get_customer_with_relations`.
- **Infrastructure**: Implemented persistent logging using `RotatingFileHandler` (saved to `/backend/app.log`) for all Uvicorn and SQLAlchemy events.
- **Dependency**: Installed `email-validator` v2.3.2.

### Files Modified

- `backend/app/services/customer_service.py`: Core logic implementation.
- `backend/app/models/customer.py`: Model configuration adjustment.
- `backend/app/schemas/customer.py`: Response schema alignment.
- `backend/tests/test_customers_api.py`: Added integration tests.

## Verification

- Added `test_update_customer_phones` and `test_update_customer_addresses` to the integration suite.
- All 13 customer API tests passed successfully.

```bash
pytest tests/test_customers_api.py -v
```
