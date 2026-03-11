# Loan Detail - Customer Summary Enrichment

Implemented on 2026-03-11.

## Context

The loan detail page (`/loans/[id]`) previously showed only the `customer_id`. As per user request, it now displays full contact and employment details.

## Technical Changes

### Backend

- **Schema**: Added `CompanyRead` and updated `CustomerReadSchema` in `backend/app/schemas/customer.py`.
- **Eager Loading**: Confirmed `get_customer_with_relations` in `backend/app/services/customer_service.py` correctly loads the `company` relationship.

### Frontend

- **API Types**: Updated `frontend/lib/api/types.ts` to include `CustomerJobInfoRead` and `CompanyRead`.
- **UI Components**:
  - `LoanDetailPage` now uses `useCustomer` hook to fetch data in parallel.
  - New enriched card with name, phone, email, and "Manager at Company" style employment info.
  - Icons: `User`, `Phone`, `Mail`, `Briefcase`.
  - Loading handling: Individual skeletons for each field in the card.

## Testing

- Unit test coverage added in `frontend/app/(dashboard)/loans/[id]/LoanDetailPage.test.tsx`.
- Verified hydration-safe HTML (no nested `div` in `p`).

## References

- [Loan Detail Page](<file:///home/ibernabel/develop/lamas-py/frontend/app/(dashboard)/loans/[id]/page.tsx>)
- [Customer Types](file:///home/ibernabel/develop/lamas-py/frontend/lib/api/types.ts)
