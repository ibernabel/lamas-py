"""
factory_boy factories for generating test data.

These factories use faker to generate realistic test data for:
- Customers
- Customer details
- Financial information
- Job information
- References
- Vehicles
- Companies
- Bank accounts

Usage:
    customer = CustomerFactory.build()  # Memory only
    customer = CustomerFactory.create(session=session)  # Saved to DB
"""
import factory
from factory import fuzzy
from datetime import date, timedelta

from app.models.customer import (
    Customer,
    CustomerDetail,
    CustomerFinancialInfo,
    CustomerJobInfo,
    CustomerReference,
    CustomerVehicle,
    Company,
    CustomersAccount,
)


class CustomerFactory(factory.Factory):
    """Factory for Customer model."""

    class Meta:
        model = Customer

    id = factory.Sequence(lambda n: n)
    nid = factory.Sequence(
        lambda n: f"{str(n + 10000000000).zfill(11)}")  # 11-digit NID
    lead_channel = fuzzy.FuzzyChoice(
        ["website", "referral", "phone", "walk-in"])
    is_referred = factory.Faker("pybool")
    referred_by = None
    is_active = True
    is_assigned = False
    portfolio_id = None
    promoter_id = None
    assigned_at = None


class CustomerDetailFactory(factory.Factory):
    """Factory for CustomerDetail model."""

    class Meta:
        model = CustomerDetail

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.Faker("email")
    nickname = factory.Faker("first_name")
    birthday = factory.Faker(
        "date_of_birth",
        minimum_age=18,
        maximum_age=80
    )
    gender = fuzzy.FuzzyChoice(["M", "F", "O"])
    marital_status = fuzzy.FuzzyChoice(
        ["single", "married", "divorced", "widowed"])
    education_level = fuzzy.FuzzyChoice(
        ["high_school", "bachelor", "master", "phd"])
    nationality = "Dominican"
    housing_type = fuzzy.FuzzyChoice(["owned", "rented", "family"])
    housing_possession_type = fuzzy.FuzzyChoice(
        ["owned", "rented", "mortgage"])
    move_in_date = factory.Faker(
        "date_between", start_date="-10y", end_date="today")
    mode_of_transport = fuzzy.FuzzyChoice(
        ["car", "motorcycle", "public", "taxi"])


class CustomerFinancialInfoFactory(factory.Factory):
    """Factory for CustomerFinancialInfo model."""

    class Meta:
        model = CustomerFinancialInfo

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    other_incomes = fuzzy.FuzzyDecimal(0, 50000, precision=2)
    discounts = fuzzy.FuzzyDecimal(0, 10000, precision=2)
    housing_type = fuzzy.FuzzyChoice(["owned", "rented", "family"])
    monthly_housing_payment = fuzzy.FuzzyDecimal(0, 30000, precision=2)
    total_debts = fuzzy.FuzzyDecimal(0, 500000, precision=2)
    loan_installments = fuzzy.FuzzyDecimal(0, 15000, precision=2)
    household_expenses = fuzzy.FuzzyDecimal(5000, 50000, precision=2)
    labor_benefits = fuzzy.FuzzyDecimal(0, 20000, precision=2)
    guarantee_assets = factory.Faker("sentence")
    total_incomes = fuzzy.FuzzyDecimal(15000, 150000, precision=2)


class CustomerJobInfoFactory(factory.Factory):
    """Factory for CustomerJobInfo model."""

    class Meta:
        model = CustomerJobInfo

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    is_self_employed = factory.Faker("pybool")
    role = factory.Faker("job")
    level = fuzzy.FuzzyChoice(
        ["entry", "junior", "mid", "senior", "lead", "manager"])
    start_date = factory.Faker(
        "date_between", start_date="-15y", end_date="today")
    salary = fuzzy.FuzzyDecimal(15000, 150000, precision=2)
    other_incomes = fuzzy.FuzzyDecimal(0, 30000, precision=2)
    other_incomes_source = factory.Faker("sentence", nb_words=3)
    payment_type = fuzzy.FuzzyChoice(["direct_deposit", "check", "cash"])
    payment_frequency = fuzzy.FuzzyChoice(["weekly", "biweekly", "monthly"])
    payment_bank = fuzzy.FuzzyChoice(
        ["Banco Popular", "BHD León", "Banreservas", "Scotiabank"])
    payment_account_number = factory.Faker("numerify", text="##########")
    schedule = fuzzy.FuzzyChoice(["9-5", "8-4", "flexible", "shift"])
    supervisor_name = factory.Faker("name")


class CustomerReferenceFactory(factory.Factory):
    """Factory for CustomerReference model."""

    class Meta:
        model = CustomerReference

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    name = factory.Faker("name")
    nid = factory.Sequence(lambda n: f"{str(n + 20000000000).zfill(11)}")
    email = factory.Faker("email")
    relationship = fuzzy.FuzzyChoice(
        ["friend", "family", "colleague", "neighbor"])
    reference_since = factory.Faker(
        "date_between", start_date="-20y", end_date="today")
    is_active = True
    occupation = factory.Faker("job")
    is_who_referred = False
    type = fuzzy.FuzzyChoice(["personal", "professional"])
    address = factory.Faker("address")


class CustomerVehicleFactory(factory.Factory):
    """Factory for CustomerVehicle model."""

    class Meta:
        model = CustomerVehicle

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    vehicle_type = fuzzy.FuzzyChoice(["car", "motorcycle", "suv", "truck"])
    vehicle_brand = fuzzy.FuzzyChoice(
        ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"])
    vehicle_model = factory.Faker("word")
    vehicle_year = fuzzy.FuzzyInteger(2000, 2024)
    vehicle_color = fuzzy.FuzzyChoice(
        ["white", "black", "silver", "blue", "red"])
    vehicle_plate_number = factory.Faker("license_plate")
    is_financed = factory.Faker("pybool")
    is_owned = factory.Faker("pybool")
    is_leased = False
    is_rented = False
    is_shared = False


class CompanyFactory(factory.Factory):
    """Factory for Company model."""

    class Meta:
        model = Company

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    name = factory.Faker("company")
    email = factory.Faker("company_email")
    type = fuzzy.FuzzyChoice(["private", "public", "government", "nonprofit"])
    website = factory.Faker("url")
    rnc = factory.Faker("numerify", text="###-#####-#")  # Dominican RNC format
    department = factory.Faker("word")
    branch = factory.Faker("city")


class CustomersAccountFactory(factory.Factory):
    """Factory for CustomersAccount model."""

    class Meta:
        model = CustomersAccount

    id = factory.Sequence(lambda n: n)
    customer_id = None  # Set externally
    number = factory.Faker("numerify", text="####################")
    type = fuzzy.FuzzyChoice(["checking", "savings"])
