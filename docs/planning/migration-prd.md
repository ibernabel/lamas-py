# LAMaS Migration PRD: Laravel → Python/FastAPI + Next.js

## Executive Summary

Migration of LAMaS (Loan Applications Management System) from Laravel monolith to:

- **Backend**: Python 3.11+ + FastAPI + SQLModel + Pydantic
- **Frontend**: Next.js 16 + Tailwind CSS 4 + shadcn/ui + TypeScript
- **Database**: PostgreSQL (existing)
- **CI/CD**: GitHub Actions
- **Deployment**: Docker on VPS

> [!NOTE]
>
> - **AI Evaluation Service** is OUT OF SCOPE (prepare endpoints only)
> - **No Teams/Multi-tenant** - Simple users with roles/permissions
> - **Not a SaaS** - Single instance deployment

---

## 1. Technology Stack

| Layer        | Technology     | Version | Notes                          |
| ------------ | -------------- | ------- | ------------------------------ |
| **Backend**  | FastAPI        | Latest  | Async API framework            |
|              | SQLModel       | Latest  | SQLAlchemy + Pydantic combined |
|              | Pydantic       | v2      | Strict typing                  |
|              | Python         | 3.11+   | Type hints support             |
| **Frontend** | Next.js        | 16      | App Router                     |
|              | React          | 19      | Latest with Server Components  |
|              | Tailwind CSS   | 4       | Utility-first CSS              |
|              | shadcn/ui      | Latest  | Accessible components          |
|              | TypeScript     | 5.x     | Strict typing                  |
| **Database** | PostgreSQL     | 15      | Existing database              |
| **Auth**     | JWT            | -       | python-jose                    |
| **CI/CD**    | GitHub Actions | -       | Automated tests & deploy       |
| **Deploy**   | Docker         | -       | Container deployment           |

---

## 2. Project Decisions

| Decision              | Value                         |
| --------------------- | ----------------------------- |
| API Naming Convention | `snake_case` (Python)         |
| Authentication        | JWT tokens (no Sessions)      |
| Multi-tenant          | **No** (single instance)      |
| Teams feature         | **Removed** (simple roles)    |
| Spatie Permissions    | **Simplified** to basic roles |
| Database              | Keep existing PostgreSQL      |
| AI Service            | Out of scope (endpoint only)  |

---

## 3. Models to Migrate

### Core Models (18 total)

| #   | Laravel Model           | SQLModel Table             | Relationships                                                                                 |
| --- | ----------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | `User`                  | `users`                    | Has: Broker, Promoter. Roles/Permissions                                                      |
| 2   | `Customer`              | `customers`                | Has: Detail, FinancialInfo, JobInfo, References, Vehicle, Company, Accounts, LoanApplications |
| 3   | `CustomerDetail`        | `customer_details`         | Morph: Phones, Addresses                                                                      |
| 4   | `CustomerFinancialInfo` | `customer_financial_info`  | BelongsTo: Customer                                                                           |
| 5   | `CustomerJobInfo`       | `customer_job_info`        | BelongsTo: Customer                                                                           |
| 6   | `CustomerReference`     | `customer_references`      | Morph: Phones, Addresses                                                                      |
| 7   | `CustomerVehicle`       | `customer_vehicles`        | BelongsTo: Customer                                                                           |
| 8   | `CustomersAccount`      | `customers_accounts`       | BelongsTo: Customer                                                                           |
| 9   | `Company`               | `companies`                | Morph: Phones, Addresses                                                                      |
| 10  | `LoanApplication`       | `loan_applications`        | BelongsTo: Customer. Has: Details, Notes, CreditRisks                                         |
| 11  | `LoanApplicationDetail` | `loan_application_details` | BelongsTo: LoanApplication                                                                    |
| 12  | `LoanApplicationNote`   | `loan_application_notes`   | BelongsTo: LoanApplication                                                                    |
| 13  | `CreditRisk`            | `credit_risks`             | ManyToMany: LoanApplications                                                                  |
| 14  | `CreditRiskCategory`    | `credit_risk_categories`   | Has: CreditRisks                                                                              |
| 15  | `Phone`                 | `phones`                   | Polymorphic (phoneable_id, phoneable_type)                                                    |
| 16  | `Address`               | `addresses`                | Via ManyToMany through `addressables`                                                         |
| 17  | `Portfolio`             | `portfolios`               | BelongsTo: Broker. Has: Customers                                                             |
| 18  | `Broker`                | `brokers`                  | BelongsTo: User. Has: Portfolio                                                               |
| 19  | `Promoter`              | `promoters`                | BelongsTo: User. Has: Customers                                                               |

### Excluded Models (Laravel-specific)

| Model            | Reason                     |
| ---------------- | -------------------------- |
| `Team`           | No multi-tenant support    |
| `TeamInvitation` | No Teams feature           |
| `Membership`     | Laravel Jetstream specific |
| `Addressable`    | Pivot table, not model     |

---

## 4. API Response Design

### LoanApplication Response (Simplified)

**Before (Laravel):** Full embedded customer

```json
{
  "id": 1,
  "customer": {
    "id": 123,
    "NID": "12345678901",
    "details": { "first_name": "John", ... },
    "financial_info": { ... },
    "job_info": { ... }
  }
}
```

**After (FastAPI):** Customer reference only

```json
{
    "id": 1,
    "status": "received",
    "customer_id": 123,
    "customer_summary": {
        "nid": "12345678901",
        "full_name": "John Doe"
    },
    "details": {
        "amount": 50000,
        "term": 12,
        "rate": 2.5
    }
}
```

---

## 5. Project Structure

```
lamas-py/
├── legacy/                    # Laravel backup (reference only)
│
├── backend/                   # FastAPI + SQLModel
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── customers.py
│   │   │   │   └── loan_applications.py
│   │   │   ├── deps.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/            # SQLModel models
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── loan_application.py
│   │   │   └── ...
│   │   └── main.py
│   ├── tests/
│   │   ├── factories/         # factory_boy (like Laravel Factories)
│   │   └── test_*.py
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/                  # Next.js 16 + TypeScript
│   ├── app/                   # App Router
│   ├── components/            # shadcn/ui
│   ├── lib/
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml     # API tests
│       └── frontend-ci.yml    # Frontend tests
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── ROADMAP.md
└── docs/
```

---

## 6. Phase Overview

| Phase | Name                  | Focus                     | Duration |
| ----- | --------------------- | ------------------------- | -------- |
| **1** | Backend Foundation    | FastAPI + SQLModel setup  | 2 weeks  |
| **2** | Customer APIs         | Full Customer CRUD        | 2 weeks  |
| **3** | Loan Application APIs | Loan CRUD + status        | 2 weeks  |
| **4** | Frontend Foundation   | Next.js 16 + shadcn setup | 1 week   |
| **5** | Frontend - Customers  | Customer management UI    | 2 weeks  |
| **6** | Frontend - Loans      | Loan management UI        | 2 weeks  |
| **7** | CI/CD & Deployment    | GitHub Actions, Docker    | 1 week   |

---

## 7. SQLModel vs SQLAlchemy

SQLModel combines SQLAlchemy and Pydantic, reducing code duplication:

```python
# SQLModel: One class for both DB and API
from sqlmodel import SQLModel, Field

class Customer(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nid: str = Field(unique=True, max_length=11)
    is_active: bool = Field(default=True)

# Same class can be used as Pydantic schema!
```

Benefits:

- Single class definition (no separate Model + Schema)
- Type safety with Python type hints
- Native Pydantic v2 integration
- SQLAlchemy 2.0 compatible

---

## 8. Authentication Strategy

| Aspect        | Implementation                                |
| ------------- | --------------------------------------------- |
| Method        | JWT Bearer tokens                             |
| Library       | `python-jose`                                 |
| Token Storage | Client-side (no server sessions)              |
| Refresh       | Access + Refresh token pair                   |
| Roles         | Simple role strings (admin, broker, promoter) |
| Permissions   | Role-based access (RBAC)                      |

### User Roles (Simplified)

| Role       | Description          | Permissions                     |
| ---------- | -------------------- | ------------------------------- |
| `admin`    | Full access          | All operations                  |
| `broker`   | Portfolio manager    | Manage assigned customers/loans |
| `promoter` | Sales representative | Create customers, view loans    |

---

## 9. GitHub Actions CI/CD

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI
on: [push, pull_request]
jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-python@v5
              with:
                  python-version: "3.11"
            - run: pip install -e ".[dev]"
            - run: pytest --cov=app
```

---

## 10. Next Steps

1. ✅ PRD approved
2. → **Phase 1 Implementation Plan** (detailed step-by-step)
3. → Move Laravel to `/legacy`
4. → Begin FastAPI + SQLModel development
