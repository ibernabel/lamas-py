"""
Customer Pydantic schemas for request/response validation.

This module defines all schemas for customer CRUD operations including:
- Input schemas for creating/updating customers and nested data
- Output schemas for API responses
- Validation schemas with Dominican Republic standards
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, Field, field_validator


# ============================================================================
# Input Schemas (Create/Update)
# ============================================================================


class CustomerDetailCreate(BaseModel):
    """Customer personal details schema."""

    first_name: str = Field(min_length=2, max_length=255)
    last_name: str = Field(min_length=2, max_length=255)
    email: EmailStr | None = None
    nickname: str | None = Field(None, max_length=255)
    birthday: date | None = None
    gender: Literal["M", "F", "O"] | None = None
    marital_status: Literal["single", "married",
                            "divorced", "widowed"] | None = None
    education_level: str | None = Field(None, max_length=100)
    nationality: str | None = Field(None, max_length=100)
    housing_type: str | None = Field(None, max_length=100)
    housing_possession_type: str | None = Field(None, max_length=100)
    move_in_date: date | None = None
    mode_of_transport: str | None = Field(None, max_length=100)


class PhoneCreate(BaseModel):
    """Phone number schema with Dominican format validation."""

    country_area: str | None = Field(None, max_length=10)
    number: str = Field(
        pattern=r"^\d{10}$", description="10-digit Dominican phone number")
    extension: str | None = Field(None, max_length=10)
    type: Literal["mobile", "home", "work"] = "mobile"

    @field_validator("number")
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        """Ensure phone is exactly 10 digits."""
        if not v.isdigit() or len(v) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return v


class AddressCreate(BaseModel):
    """Address schema."""

    street: str = Field(max_length=500)
    street2: str | None = Field(None, max_length=255)
    city: str = Field(max_length=100)
    state: str | None = Field(None, max_length=100, alias="province")
    type: str | None = Field(None, max_length=50)
    postal_code: str | None = Field(None, max_length=20)
    country: str = Field(default="Dominican Republic", max_length=100)
    references: str | None = None

    class Config:
        populate_by_name = True  # Allow both 'state' and 'province'


class CustomerFinancialInfoCreate(BaseModel):
    """Customer financial information schema."""

    other_incomes: Decimal = Field(default=Decimal(
        "0"), ge=0, description="Other income sources")
    discounts: Decimal = Field(default=Decimal(
        "0"), ge=0, description="Monthly discounts")
    housing_type: str | None = Field(None, max_length=100)
    monthly_housing_payment: Decimal | None = Field(None, ge=0)
    total_debts: Decimal | None = Field(None, ge=0)
    loan_installments: Decimal | None = Field(None, ge=0)
    household_expenses: Decimal | None = Field(None, ge=0)
    labor_benefits: Decimal | None = Field(None, ge=0)
    guarantee_assets: str | None = None
    total_incomes: Decimal | None = Field(None, ge=0)


class CustomerJobInfoCreate(BaseModel):
    """Customer employment information schema."""

    is_self_employed: bool = False
    role: str | None = Field(None, max_length=255,
                             description="Job position/role")
    level: str | None = Field(None, max_length=100,
                              description="Job level (junior, senior, etc.)")
    start_date: date | None = Field(None, description="Employment start date")
    salary: Decimal | None = Field(None, gt=0, description="Monthly salary")
    other_incomes: Decimal | None = Field(None, ge=0)
    other_incomes_source: str | None = Field(None, max_length=255)
    payment_type: str | None = Field(None, max_length=100)
    payment_frequency: str | None = Field(None, max_length=100)
    payment_bank: str | None = Field(None, max_length=255)
    payment_account_number: str | None = Field(None, max_length=100)
    schedule: str | None = Field(None, max_length=255)
    supervisor_name: str | None = Field(None, max_length=255)


class CustomerReferenceCreate(BaseModel):
    """Customer personal reference schema."""

    name: str = Field(max_length=255)
    nid: str | None = Field(
        None, pattern=r"^\d{11}$", description="11-digit National ID")
    email: EmailStr | None = None
    relationship: str = Field(
        max_length=100, description="Relationship to customer")
    reference_since: date | None = None
    occupation: str | None = Field(None, max_length=255)
    is_who_referred: bool = False
    type: str | None = Field(None, max_length=50)
    address: str | None = None


class CustomerVehicleCreate(BaseModel):
    """Customer vehicle information schema."""

    vehicle_type: str | None = Field(None, max_length=100)
    vehicle_brand: str | None = Field(None, max_length=100)
    vehicle_model: str | None = Field(None, max_length=100)
    vehicle_year: int | None = Field(None, ge=1900, le=2100)
    vehicle_color: str | None = Field(None, max_length=50)
    vehicle_plate_number: str | None = Field(None, max_length=20)
    is_financed: bool = False
    is_owned: bool = False
    is_leased: bool = False
    is_rented: bool = False
    is_shared: bool = False


class CompanyCreate(BaseModel):
    """Employer company information schema."""

    name: str = Field(max_length=255)
    email: EmailStr | None = None
    type: str | None = Field(None, max_length=100)
    website: str | None = Field(None, max_length=255)
    rnc: str | None = Field(None, max_length=50,
                            description="Dominican tax ID")
    department: str | None = Field(None, max_length=255)
    branch: str | None = Field(None, max_length=255)


class CustomersAccountCreate(BaseModel):
    """Customer bank account schema."""

    number: str = Field(max_length=100)
    type: str | None = Field(
        None, max_length=50, description="Account type (checking, savings)")


# ============================================================================
# Main Customer Schemas
# ============================================================================


class CustomerCreateSchema(BaseModel):
    """
    Full customer creation schema.

    Requires: NID, detail, phones (min 1), addresses (min 1).
    Portfolio/promoter assignment done separately via PATCH endpoint.
    """

    # Main customer data
    nid: str = Field(
        pattern=r"^\d{11}$",
        description="11-digit National ID (Dominican Republic)",
        alias="NID"
    )
    lead_channel: str | None = Field(None, max_length=255)
    is_referred: bool = False
    referred_by: str | None = Field(
        None, pattern=r"^\d{11}$", description="Referrer's NID")

    # Required nested data
    detail: CustomerDetailCreate
    phones: list[PhoneCreate] = Field(
        min_length=1, description="At least 1 phone required")
    addresses: list[AddressCreate] = Field(
        min_length=1, description="At least 1 address required")

    # Optional nested data
    financial_info: CustomerFinancialInfoCreate | None = None
    job_info: CustomerJobInfoCreate | None = None
    references: list[CustomerReferenceCreate] = Field(default_factory=list)
    company: CompanyCreate | None = None
    vehicle: CustomerVehicleCreate | None = None
    accounts: list[CustomersAccountCreate] = Field(default_factory=list)

    @field_validator("nid", "referred_by")
    @classmethod
    def validate_nid_format(cls, v: str | None) -> str | None:
        """Validate NID is exactly 11 digits."""
        if v is None:
            return v
        if not v.isdigit() or len(v) != 11:
            raise ValueError("NID must be exactly 11 digits")
        return v

    class Config:
        populate_by_name = True  # Allow both 'nid' and 'NID'


class CustomerSimpleCreateSchema(BaseModel):
    """
    Simple customer creation schema.

    Requires: NID, detail, phones (min 1).
    Addresses and references are optional in this version.
    """

    # Main customer data
    nid: str = Field(
        pattern=r"^\d{11}$",
        description="11-digit National ID (Dominican Republic)",
        alias="NID"
    )
    lead_channel: str | None = Field(None, max_length=255)
    is_referred: bool = False
    referred_by: str | None = Field(None, pattern=r"^\d{11}$")

    # Required nested data
    detail: CustomerDetailCreate
    phones: list[PhoneCreate] = Field(min_length=1)

    # Optional nested data (addresses optional in simple version)
    addresses: list[AddressCreate] = Field(default_factory=list)
    references: list[CustomerReferenceCreate] = Field(default_factory=list)

    @field_validator("nid", "referred_by")
    @classmethod
    def validate_nid_format(cls, v: str | None) -> str | None:
        """Validate NID is exactly 11 digits."""
        if v is None:
            return v
        if not v.isdigit() or len(v) != 11:
            raise ValueError("NID must be exactly 11 digits")
        return v

    class Config:
        populate_by_name = True


class CustomerUpdateSchema(BaseModel):
    """
    Customer update schema with partial updates support.

    All fields are optional to allow partial updates.
    """

    # Main customer fields
    lead_channel: str | None = None
    is_referred: bool | None = None
    referred_by: str | None = None

    # Nested data (all optional)
    detail: CustomerDetailCreate | None = None
    phones: list[PhoneCreate] | None = None
    addresses: list[AddressCreate] | None = None
    financial_info: CustomerFinancialInfoCreate | None = None
    job_info: CustomerJobInfoCreate | None = None
    references: list[CustomerReferenceCreate] | None = None
    company: CompanyCreate | None = None
    vehicle: CustomerVehicleCreate | None = None
    accounts: list[CustomersAccountCreate] | None = None


# ============================================================================
# Output Schemas (API Responses)
# ============================================================================


class PhoneRead(BaseModel):
    """Phone number response schema."""

    id: int
    number: str
    type: str

    class Config:
        from_attributes = True


class AddressRead(BaseModel):
    """Address response schema."""

    id: int
    street: str
    city: str
    province: str
    postal_code: str | None = None
    country: str

    class Config:
        from_attributes = True


class CustomerDetailRead(BaseModel):
    """Customer detail response schema."""

    id: int
    first_name: str
    last_name: str
    email: str | None = None
    birthday: date | None = None
    gender: str | None = None
    marital_status: str | None = None

    class Config:
        from_attributes = True


class CustomerListItem(BaseModel):
    """Customer list item schema for pagination responses."""

    id: int
    nid: str
    full_name: str  # Computed from detail
    email: str | None = None
    is_active: bool
    is_assigned: bool
    portfolio_id: int | None = None
    promoter_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerReadSchema(BaseModel):
    """
    Full customer response schema with all relationships.

    Used for GET /customers/{id} and POST /customers/ responses.
    """

    id: int
    nid: str
    lead_channel: str | None = None
    is_referred: bool
    referred_by: str | None = None
    is_active: bool
    is_assigned: bool
    portfolio_id: int | None = None
    promoter_id: int | None = None
    assigned_at: datetime | None = None

    # Nested data
    detail: CustomerDetailRead | None = None
    phones: list[PhoneRead] = []
    addresses: list[AddressRead] = []
    financial_info: CustomerFinancialInfoCreate | None = None
    job_info: CustomerJobInfoCreate | None = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Utility Schemas
# ============================================================================


class CustomerFilterSchema(BaseModel):
    """Filter schema for customer search."""

    nid: str | None = None
    name: str | None = None
    email: str | None = None
    portfolio_id: int | None = None
    promoter_id: int | None = None
    is_active: bool | None = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int

    @classmethod
    def create(
        cls,
        items: list[T],
        total: int,
        page: int,
        per_page: int,
    ) -> "PaginatedResponse[T]":
        """Create a paginated response with calculated pages."""
        pages = (total + per_page - 1) // per_page if total > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages,
        )


class NIDValidationResponse(BaseModel):
    """Response schema for NID validation endpoint."""

    nid: str
    is_valid: bool
    is_unique: bool
    message: str | None = None
