"""
Customer and related models using SQLModel.
"""
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.loan_application import LoanApplication
    from app.models.portfolio import Portfolio, Promoter
    from app.models.phone import Phone


class Customer(SQLModel, table=True):
    """Customer database model."""

    __tablename__ = "customers"

    id: int | None = Field(default=None, primary_key=True)
    NID: str = Field(unique=True, index=True, max_length=11, sa_column_kwargs={"name": "NID"})
    lead_channel: str | None = Field(default=None, max_length=255)
    is_referred: bool = Field(default=False)
    referred_by: str | None = Field(default=None, max_length=11)
    is_active: bool = Field(default=True)
    is_assigned: bool = Field(default=False)
    portfolio_id: int | None = Field(default=None, foreign_key="portfolios.id")
    promoter_id: int | None = Field(default=None, foreign_key="promoters.id")
    assigned_at: datetime | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships (will be populated once all models exist)
    details: "CustomerDetail | None" = Relationship(back_populates="customer")
    financial_info: "CustomerFinancialInfo | None" = Relationship(back_populates="customer")
    job_info: "CustomerJobInfo | None" = Relationship(back_populates="customer")
    references: list["CustomerReference"] = Relationship(back_populates="customer")
    vehicle: "CustomerVehicle | None" = Relationship(back_populates="customer")
    company: "Company | None" = Relationship(back_populates="customer")
    accounts: list["CustomersAccount"] = Relationship(back_populates="customer")
    loan_applications: list["LoanApplication"] = Relationship(back_populates="customer")


class CustomerDetail(SQLModel, table=True):
    """Customer personal details."""

    __tablename__ = "customer_details"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    first_name: str = Field(max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    nickname: str | None = Field(default=None, max_length=255)
    birthday: date | None = Field(default=None)
    gender: str | None = Field(default=None, max_length=50)
    marital_status: str | None = Field(default=None, max_length=50)
    education_level: str | None = Field(default=None, max_length=100)
    nationality: str | None = Field(default=None, max_length=100)
    housing_type: str | None = Field(default=None, max_length=100)
    housing_possession_type: str | None = Field(default=None, max_length=100)
    move_in_date: date | None = Field(default=None)
    mode_of_transport: str | None = Field(default=None, max_length=100)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="details")


class CustomerFinancialInfo(SQLModel, table=True):
    """Customer financial information."""

    __tablename__ = "customer_financial_info"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    other_incomes: float | None = Field(default=None)
    discounts: float | None = Field(default=None)
    housing_type: str | None = Field(default=None, max_length=100)
    monthly_housing_payment: float | None = Field(default=None)
    total_debts: float | None = Field(default=None)
    loan_installments: float | None = Field(default=None)
    household_expenses: float | None = Field(default=None)
    labor_benefits: float | None = Field(default=None)
    guarantee_assets: str | None = Field(default=None)
    total_incomes: float | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="financial_info")


class CustomerJobInfo(SQLModel, table=True):
    """Customer job/employment information."""

    __tablename__ = "customer_job_info"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    is_self_employed: bool = Field(default=False)
    role: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=100)
    start_date: date | None = Field(default=None)
    salary: float | None = Field(default=None)
    other_incomes: float | None = Field(default=None)
    other_incomes_source: str | None = Field(default=None, max_length=255)
    payment_type: str | None = Field(default=None, max_length=100)
    payment_frequency: str | None = Field(default=None, max_length=100)
    payment_bank: str | None = Field(default=None, max_length=255)
    payment_account_number: str | None = Field(default=None, max_length=100)
    schedule: str | None = Field(default=None, max_length=255)
    supervisor_name: str | None = Field(default=None, max_length=255)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="job_info")


class CustomerReference(SQLModel, table=True):
    """Customer personal references."""

    __tablename__ = "customer_references"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    name: str = Field(max_length=255)
    nid: str | None = Field(default=None, max_length=11)
    email: str | None = Field(default=None, max_length=255)
    relationship: str = Field(max_length=100)
    reference_since: date | None = Field(default=None)
    is_active: bool = Field(default=True)
    occupation: str | None = Field(default=None, max_length=255)
    is_who_referred: bool = Field(default=False)
    type: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="references")


class CustomerVehicle(SQLModel, table=True):
    """Customer vehicle information."""

    __tablename__ = "customer_vehicles"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    vehicle_type: str | None = Field(default=None, max_length=100)
    vehicle_brand: str | None = Field(default=None, max_length=100)
    vehicle_model: str | None = Field(default=None, max_length=100)
    vehicle_year: int | None = Field(default=None)
    vehicle_color: str | None = Field(default=None, max_length=50)
    vehicle_plate_number: str | None = Field(default=None, max_length=20)
    is_financed: bool = Field(default=False)
    is_owned: bool = Field(default=False)
    is_leased: bool = Field(default=False)
    is_rented: bool = Field(default=False)
    is_shared: bool = Field(default=False)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="vehicle")


class CustomersAccount(SQLModel, table=True):
    """Customer bank accounts."""

    __tablename__ = "customers_accounts"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    number: str = Field(max_length=100)
    type: str | None = Field(default=None, max_length=50)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="accounts")


class Company(SQLModel, table=True):
    """Customer's employer company."""

    __tablename__ = "companies"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    name: str = Field(max_length=255)
    email: str | None = Field(default=None, max_length=255)
    type: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    rnc: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=255, sa_column_kwargs={"name": "departmet"})  # Note: typo in Laravel DB
    branch: str | None = Field(default=None, max_length=255)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relationships
    customer: Customer = Relationship(back_populates="company")
