# Phase 2: Customer APIs - Implementation Plan

**Status**: Pending Approval  
**Estimated Duration**: 2 weeks  
**Dependencies**: Phase 1 Complete ✅

---

## Overview

Implement complete CRUD operations for Customer management with nested data handling (details, phones, addresses). This phase builds upon the SQLModel foundation from Phase 1 and creates production-ready API endpoints with comprehensive validation and testing.

---

## User Review Required

> [!IMPORTANT]
> **Breaking Changes**
>
> - NID validation will enforce Dominican Republic format (11 digits, no dashes)
> - Customer creation requires ALL nested data in a single transaction

> [!WARNING]
> **Data Migration Consideration**
>
> - Existing customers in PostgreSQL will NOT be modified
> - API will read from existing schema as-is
> - No database migrations planned

---

## Proposed Changes

### Component 1: Customer Service Layer

#### [NEW] [backend/app/services/customer_service.py](file:///home/ibernabel/develop/lamas-py/backend/app/services/customer_service.py)

**Purpose**: Business logic for customer operations, transaction management

**Key Functions**:

```python
async def create_customer_with_nested_data(
    session: Session,
    customer_data: CustomerCreateSchema
) -> Customer:
    """
    - Validate NID uniqueness
    - Create customer + detail + financial + job info
    - Handle polymorphic phones and addresses
    - All in single DB transaction
    """

async def get_customer_with_relations(
    session: Session,
    customer_id: int
) -> CustomerReadSchema:
    """
    - Fetch customer with all relationships
    - Load: detail, financial_info, job_info, phones, addresses
    - Format polymorphic relationships
    """

async def update_customer(
    session: Session,
    customer_id: int,
    customer_data: CustomerUpdateSchema
) -> Customer:
    """
    - Partial updates supported
    - Update nested entities if provided
    - Validate business rules (e.g., NID change validation)
    """

async def search_customers(
    session: Session,
    filters: CustomerFilterSchema,
    pagination: PaginationParams
) -> PaginatedResponse[CustomerListItem]:
    """
    - Search by: NID, name, email, portfolio, promoter
    - Pagination support
    - Sort by: created_at, name
    """
```

**Rationale**: Separate business logic from API endpoints for testability and reusability.

---

#### [NEW] [backend/app/services/**init**.py](file:///home/ibernabel/develop/lamas-py/backend/app/services/__init__.py)

Empty package init file.

---

### Component 2: Pydantic Schemas

#### [NEW] [backend/app/schemas/customer.py](file:///home/ibernabel/develop/lamas-py/backend/app/schemas/customer.py)

**Purpose**: Request/response schemas for customer API endpoints

**Schemas**:

```python
# Input Schemas
class CustomerDetailCreate(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    birthday: date
    gender: Literal["M", "F", "O"]
    marital_status: Literal["single", "married", "divorced", "widowed"]
    # ... other fields

class PhoneCreate(BaseModel):
    number: str = Field(pattern=r"^\d{10}$")  # Dominican phone format
    type: Literal["mobile", "home", "work"]

class AddressCreate(BaseModel):
    street: str
    city: str
    province: str
    postal_code: str | None = None

class CustomerFinancialInfoCreate(BaseModel):
    other_incomes: Decimal = Field(ge=0)
    discounts: Decimal = Field(ge=0)
    # ... other fields

class CustomerJobInfoCreate(BaseModel):
    company_name: str
    position: str
    monthly_salary: Decimal = Field(gt=0)
    # ... other fields

class CustomerCreateSchema(BaseModel):
    # Main customer
    nid: str = Field(pattern=r"^\d{11}$", description="11-digit National ID")
    is_referred: bool = False
    referred_by: int | None = None
    portfolio_id: int
    promoter_id: int | None = None

    # Nested data
    detail: CustomerDetailCreate
    phones: list[PhoneCreate] = []
    addresses: list[AddressCreate] = []
    financial_info: CustomerFinancialInfoCreate | None = None
    job_info: CustomerJobInfoCreate | None = None

class CustomerUpdateSchema(BaseModel):
    """Partial update - all fields optional"""
    is_referred: bool | None = None
    portfolio_id: int | None = None
    # ... other fields (all optional)

    detail: CustomerDetailCreate | None = None
    phones: list[PhoneCreate] | None = None
    # ... etc.

# Output Schemas
class CustomerListItem(BaseModel):
    id: int
    nid: str
    full_name: str  # Computed from detail
    email: str
    portfolio_name: str
    created_at: datetime

class CustomerReadSchema(BaseModel):
    id: int
    nid: str
    is_referred: bool
    detail: CustomerDetailCreate  # Reuse input schema
    phones: list[PhoneCreate]
    addresses: list[AddressCreate]
    financial_info: CustomerFinancialInfoCreate | None
    job_info: CustomerJobInfoCreate | None
    created_at: datetime
    updated_at: datetime

class PaginatedResponse(Generic[T], BaseModel):
    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int
```

**Validations**:

- NID: Exactly 11 digits (Dominican format)
- Phone: 10 digits (Dominican format)
- Email: Valid email format
- Monetary fields: Non-negative decimals
- Required nested data: `detail` is mandatory

---

#### [NEW] [backend/app/schemas/**init**.py](file:///home/ibernabel/develop/lamas-py/backend/app/schemas/__init__.py)

Export all schemas for easy import.

---

### Component 3: API Endpoints

#### [MODIFY] [backend/app/api/v1/endpoints/customers.py](file:///home/ibernabel/develop/lamas-py/backend/app/api/v1/endpoints/customers.py)

**Current State**: Placeholder endpoints returning empty responses

**Changes**:

```python
from app.services.customer_service import (
    create_customer_with_nested_data,
    get_customer_with_relations,
    update_customer,
    search_customers,
    validate_nid
)
from app.schemas.customer import (
    CustomerCreateSchema,
    CustomerUpdateSchema,
    CustomerReadSchema,
    CustomerListItem,
    PaginatedResponse
)

@router.post("/", response_model=CustomerReadSchema, status_code=201)
async def create_customer(
    customer_data: CustomerCreateSchema,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create customer with all nested data.
    Requires authentication.
    """
    customer = await create_customer_with_nested_data(session, customer_data)
    return customer

@router.get("/", response_model=PaginatedResponse[CustomerListItem])
async def list_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    nid: str | None = None,
    name: str | None = None,
    portfolio_id: int | None = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List customers with pagination and filters.
    """
    filters = CustomerFilterSchema(
        nid=nid,
        name=name,
        portfolio_id=portfolio_id
    )
    return await search_customers(session, filters, page, per_page)

@router.get("/{customer_id}", response_model=CustomerReadSchema)
async def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get customer by ID with all relationships."""
    customer = await get_customer_with_relations(session, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerReadSchema)
async def update_customer_endpoint(
    customer_id: int,
    customer_data: CustomerUpdateSchema,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update customer (partial updates supported)."""
    customer = await update_customer(session, customer_id, customer_data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/validate-nid", response_model=dict)
async def validate_nid_endpoint(
    nid: str,
    session: Session = Depends(get_session)
):
    """
    Validate NID format and check uniqueness.
    Public endpoint (no auth required).
    """
    is_valid = await validate_nid(session, nid)
    return {"nid": nid, "is_valid": is_valid, "is_unique": not exists}
```

**Error Handling**:

- 400: Validation errors (NID format, required fields)
- 404: Customer not found
- 409: Duplicate NID
- 422: Unprocessable entity (Pydantic validation)

---

### Component 4: Validation Utilities

#### [NEW] [backend/app/utils/validators.py](file:///home/ibernabel/develop/lamas-py/backend/app/utils/validators.py)

**Purpose**: Reusable validation functions

```python
def validate_dominican_nid(nid: str) -> bool:
    """
    Validate Dominican Republic National ID format.
    - Must be exactly 11 digits
    - No dashes or special characters
    """
    return bool(re.match(r"^\d{11}$", nid))

def validate_dominican_phone(phone: str) -> bool:
    """
    Validate Dominican phone format.
    - Must be exactly 10 digits
    """
    return bool(re.match(r"^\d{10}$", phone))
```

---

#### [NEW] [backend/app/utils/**init**.py](file:///home/ibernabel/develop/lamas-py/backend/app/utils/__init__.py)

Empty package init file.

---

### Component 5: Testing

#### [NEW] [backend/tests/factories/customer_factory.py](file:///home/ibernabel/develop/lamas-py/backend/tests/factories/customer_factory.py)

**Purpose**: factory_boy factories for test data generation

```python
import factory
from factory import fuzzy
from app.models import Customer, CustomerDetail

class CustomerFactory(factory.Factory):
    class Meta:
        model = Customer

    nid = factory.Sequence(lambda n: f"{str(n).zfill(11)}")
    is_referred = False
    portfolio_id = 1
    promoter_id = None

class CustomerDetailFactory(factory.Factory):
    class Meta:
        model = CustomerDetail

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.Faker("email")
    birthday = factory.Faker("date_of_birth", minimum_age=18, maximum_age=80)
    gender = fuzzy.FuzzyChoice(["M", "F"])
    marital_status = fuzzy.FuzzyChoice(["single", "married", "divorced"])
```

---

#### [NEW] [backend/tests/test_customers_api.py](file:///home/ibernabel/develop/lamas-py/backend/tests/test_customers_api.py)

**Unit Tests**:

```python
def test_create_customer_success(client, auth_headers):
    """Test successful customer creation with all data."""
    payload = {
        "nid": "12345678901",
        "portfolio_id": 1,
        "detail": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "birthday": "1990-01-01",
            "gender": "M",
            "marital_status": "single"
        },
        "phones": [
            {"number": "8091234567", "type": "mobile"}
        ],
        "addresses": [
            {"street": "Calle Test", "city": "Santo Domingo", "province": "DN"}
        ]
    }
    response = client.post("/api/v1/customers/", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["nid"] == "12345678901"
    assert data["detail"]["first_name"] == "John"

def test_create_customer_invalid_nid(client, auth_headers):
    """Test NID validation (must be 11 digits)."""
    payload = {"nid": "123", ...}  # Invalid NID
    response = client.post("/api/v1/customers/", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_create_customer_duplicate_nid(client, auth_headers, existing_customer):
    """Test duplicate NID rejection."""
    payload = {"nid": existing_customer.nid, ...}
    response = client.post("/api/v1/customers/", json=payload, headers=auth_headers)
    assert response.status_code == 409

def test_list_customers_pagination(client, auth_headers):
    """Test customer listing with pagination."""
    response = client.get("/api/v1/customers/?page=1&per_page=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data

def test_get_customer_by_id(client, auth_headers, existing_customer):
    """Test retrieving customer by ID."""
    response = client.get(f"/api/v1/customers/{existing_customer.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == existing_customer.id

def test_update_customer(client, auth_headers, existing_customer):
    """Test customer update."""
    payload = {"detail": {"first_name": "Jane"}}
    response = client.put(f"/api/v1/customers/{existing_customer.id}", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["detail"]["first_name"] == "Jane"

def test_validate_nid_endpoint(client):
    """Test NID validation endpoint (public)."""
    response = client.post("/api/v1/customers/validate-nid", json={"nid": "12345678901"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
```

**Test Coverage Goals**:

- Customer CRUD: 100%
- Validation logic: 100%
- Error cases: All major paths

---

#### [NEW] [backend/tests/test_customer_service.py](file:///home/ibernabel/develop/lamas-py/backend/tests/test_customer_service.py)

**Service Layer Tests**:

```python
async def test_create_customer_with_nested_data(session):
    """Test service creates customer + all related entities."""
    data = CustomerCreateSchema(...)
    customer = await create_customer_with_nested_data(session, data)
    assert customer.id is not None
    assert customer.detail is not None
    assert len(customer.phones) > 0

async def test_search_customers_by_nid(session):
    """Test customer search by NID."""
    filters = CustomerFilterSchema(nid="12345678901")
    results = await search_customers(session, filters, page=1, per_page=10)
    assert results.total > 0
```

---

## Verification Plan

### Automated Tests

1. **Unit Tests** (Service Layer)

   ```bash
   # From backend directory
   pytest tests/test_customer_service.py -v
   ```

   **Coverage Target**: 90%+ for service layer

2. **API Integration Tests**

   ```bash
   pytest tests/test_customers_api.py -v
   ```

   **Expected Results**:
   - All CRUD operations pass
   - Validation errors return 422
   - Duplicate NID returns 409
   - Pagination works correctly

3. **Full Test Suite with Coverage**
   ```bash
   pytest --cov=app.services.customer_service --cov=app.api.v1.endpoints.customers --cov-report=term-missing
   ```
   **Coverage Target**: 85%+ overall

### Manual Testing

1. **Postman Collection** (to be created)
   - Import `postman/lamas-phase2.json`
   - Set environment: `base_url=http://localhost:8001`, `jwt_token=<your_token>`
   - Run collection tests
   - **Expected**: All requests return 2xx status

2. **Interactive API Testing**

   ```bash
   # Start server
   docker compose up -d

   # Open browser
   http://localhost:8001/api/v1/docs

   # Test endpoints:
   # 1. POST /api/v1/customers/ - Create customer
   # 2. GET /api/v1/customers/ - List customers
   # 3. GET /api/v1/customers/{id} - Get specific customer
   # 4. PUT /api/v1/customers/{id} - Update customer
   ```

   **Expected**: All operations work in Swagger UI

3. **NID Validation Test**

   ```bash
   # Valid NID (11 digits)
   curl -X POST http://localhost:8001/api/v1/customers/validate-nid \
     -H "Content-Type: application/json" \
     -d '{"nid": "12345678901"}'
   # Expected: {"is_valid": true, "is_unique": true/false}

   # Invalid NID (wrong length)
   curl -X POST http://localhost:8001/api/v1/customers/validate-nid \
     -H "Content-Type: application/json" \
     -d '{"nid": "123"}'
   # Expected: 422 Unprocessable Entity
   ```

4. **Database Verification**
   ```bash
   # Check created customer in database
   docker compose exec db psql -U lamas -d lamas
   \c lamas
   SELECT * FROM customers LIMIT 5;
   SELECT * FROM customer_details LIMIT 5;
   SELECT * FROM phones WHERE phoneable_type = 'App\\Models\\Customer';
   ```
   **Expected**: Data matches API responses

### GitHub Actions CI

The existing workflow (`.github/workflows/backend-ci.yml`) will automatically:

- Run all pytest tests on push/PR
- Generate coverage report
- Fail build if tests fail or coverage < 80%

---

## Implementation Order

1. **Day 1-2**: Schemas + Validators
   - Create `schemas/customer.py` with all Pydantic models
   - Create `utils/validators.py`
   - Write unit tests for validators

2. **Day 3-5**: Service Layer
   - Implement `services/customer_service.py`
   - Write service layer tests
   - Test transaction handling

3. **Day 6-7**: API Endpoints
   - Update `api/v1/endpoints/customers.py`
   - Connect service layer to endpoints
   - Test with Swagger UI

4. **Day 8-9**: factory_boy + Advanced Tests
   - Create test factories
   - Write integration tests
   - Test edge cases (duplicates, invalid data, etc.)

5. **Day 10**: Documentation + Postman
   - Create Postman collection
   - Update API documentation
   - Manual verification

---

## Risks & Mitigations

| Risk                               | Mitigation                                                              |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Polymorphic relationships complex  | Use explicit service layer methods to handle Phone/Address associations |
| Transaction failures (nested data) | Wrap all operations in `session.begin()` context                        |
| NID validation performance         | Add database index on `customers.nid` (already exists)                  |
| Large customer lists               | Implement pagination (max 100 per page)                                 |

---

## Success Criteria

- ✅ All CRUD operations functional
- ✅ Test coverage ≥ 85%
- ✅ Pydantic validation works for all fields
- ✅ NID uniqueness enforced
- ✅ Polymorphic phones/addresses handled correctly
- ✅ Postman collection with passing tests
- ✅ CI/CD pipeline passes

---

## References

- [Phase 1 Completion](./phase-1-completion.md)
- [Migration PRD](../planning/migration-prd.md)
- [ROADMAP Phase 2](../../ROADMAP.md#phase-2-customer-apis)
