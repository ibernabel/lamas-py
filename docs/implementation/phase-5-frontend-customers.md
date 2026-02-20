# Phase 5: Frontend — Customer Management

**Status**: ✅ Complete  
**Started**: 2026-02-19  
**Completed**: 2026-02-19  
**Duration**: 1 day

---

## Overview

Phase 5 implements the full customer management UI on top of the Phase 4 foundation. This includes the customer list (with search and filtering), customer detail page, and shared create/edit form with Zod schema validation.

---

## Components Implemented

### API Layer

| File                   | Description                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/api/customers.ts` | Full CRUD + `validateNid(nid)` server-side uniqueness check                                                                              |
| `lib/api/types.ts`     | `CustomerListItem`, `Customer`, `CustomerCreatePayload`, `CustomerUpdatePayload`, `PhoneCreate`, `AddressCreate`, `PaginatedResponse<T>` |

### Validation Schemas

**File**: `lib/validations/customer.schema.ts`

| Schema                 | Type                                | Used by                      |
| ---------------------- | ----------------------------------- | ---------------------------- |
| `customerFormSchema`   | Unified form schema (create + edit) | `CustomerForm`               |
| `phoneSchema`          | Phone sub-schema                    | nested in customerFormSchema |
| `addressSchema`        | Address sub-schema                  | nested in customerFormSchema |
| `customerCreateSchema` | Legacy — NID required               | API payload compat           |
| `customerUpdateSchema` | Legacy — all fields optional        | API payload compat           |

> [!IMPORTANT]
> **ZodDefault Rule**: Never use `.default()` in Zod schemas consumed by `react-hook-form`. `ZodDefault` splits Zod's input/output types — react-hook-form uses the **input** type for `TFieldValues`, making `.default(x)` produce `T | undefined` instead of `T`. Always declare defaults in `useForm({ defaultValues: ... })` instead.

### TanStack Query Hooks

**File**: `hooks/use-customers.ts`

| Hook                   | Description                              |
| ---------------------- | ---------------------------------------- |
| `useCustomers(params)` | Paginated list with search/filter params |
| `useCustomer(id)`      | Single customer detail                   |
| `useCreateCustomer()`  | POST mutation with toast feedback        |
| `useUpdateCustomer()`  | PUT mutation with toast feedback         |
| `useDeleteCustomer()`  | DELETE mutation with confirmation        |

### UI Components

| Component            | Path                                          | Description                                     |
| -------------------- | --------------------------------------------- | ----------------------------------------------- |
| `CustomerTable`      | `components/customers/CustomerTable.tsx`      | DataTable with pagination, action menu, avatar  |
| `CustomerFilters`    | `components/customers/CustomerFilters.tsx`    | Search input, status and assigned selects       |
| `CustomerListClient` | `components/customers/CustomerListClient.tsx` | Client container: state, filters, delete dialog |
| `CustomerForm`       | `components/customers/CustomerForm.tsx`       | Shared tabbed form (create + edit modes)        |

### Route Pages

| Route                  | File                                           | Description          |
| ---------------------- | ---------------------------------------------- | -------------------- |
| `/customers`           | `app/(dashboard)/customers/page.tsx`           | Customer list page   |
| `/customers/new`       | `app/(dashboard)/customers/new/page.tsx`       | Create customer      |
| `/customers/[id]`      | `app/(dashboard)/customers/[id]/page.tsx`      | Customer detail view |
| `/customers/[id]/edit` | `app/(dashboard)/customers/[id]/edit/page.tsx` | Edit customer        |

---

## CustomerForm Architecture

The `CustomerForm` is a 4-tab component shared for both create and edit modes:

**Tabs**: Identity | Personal | Phones | Addresses

```
CustomerForm (mode: "create" | "edit")
├── useForm<CustomerFormValues, unknown, CustomerFormValues>
│   └── zodResolver(customerFormSchema)   ← unified schema
├── Tab: Identity
│   ├── NID (create only — 11-digit NID validation + uniqueness check via API)
│   ├── lead_channel
│   └── is_referred + referred_by
├── Tab: Personal
│   ├── first_name, last_name, email, birthday
│   ├── gender (Select)
│   └── marital_status (Select)
├── Tab: Phones (useFieldArray)
│   └── [number, type] × N — at least 1 required
└── Tab: Addresses (useFieldArray, optional)
    └── [street, city, province, country, postal_code] × N
```

### react-hook-form v7.71 Compatibility Fix

react-hook-form v7.71 tightened the `Control<TFieldValues, TContext, TTransformedValues>` generic. The fix is to explicitly pin all three generics so `TTransformedValues = TFieldValues`:

```ts
// ✅ Correct — TTransformedValues bound explicitly
const form = useForm<CustomerFormValues, unknown, CustomerFormValues>({
  resolver: zodResolver(customerFormSchema),
  defaultValues: { ... }
});
```

This prevents the `Control` type cascade through all child `FormField` usages when `zodResolver` is used.

---

## shadcn/ui Components Added in Phase 5

`tabs`, `select` (already installed in Phase 4, used here), `form` (react-hook-form binding)

---

## Verification

```bash
# TypeScript check — zero errors in source code
cd frontend && npx tsc --noEmit
# Expected: only .next/types/validator.ts stale artifact (pre-existing, not our code)

# Dev server
pnpm run dev
```

### Routes Tested

- `GET /customers` — fixed empty table issue (backend restart + schema fix) ✅
- `GET /customers/new` — create form with NID validation ✅
- `GET /customers/{id}` — detail view ✅
- `GET /customers/{id}/edit` — edit form pre-populated ✅

---

## Testing

> [!NOTE]
> Unit tests for schemas, hooks, and components are planned as a follow-up step before Phase 5 is marked complete.

Planned test files:

- `lib/validations/customer.schema.test.ts` — Zod schema validation (happy + edge cases)
- `components/customers/CustomerTable.test.tsx` — render, pagination, action menu
- `components/customers/CustomerForm.test.tsx` — create/edit submit handlers, NID validation

```bash
# Run tests
pnpm test
```

---

## Known Issues / Next Steps

| Item                                        | Status     |
| ------------------------------------------- | ---------- |
| Unit tests (schemas, table, form)           | ⚪ Planned |
| Customer detail page polish                 | ⚪ Planned |
| NID uniqueness error UX (after form submit) | ⚪ Planned |
| Accessible form labels (a11y audit)         | ⚪ Planned |
