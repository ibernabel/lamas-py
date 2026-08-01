"""
Data repair script for Customer #33 and Loan #55.
Updates customer phone, job_info occupation_type, start_date, and loan application details.
"""
from datetime import date
from sqlmodel import Session, select
from app.core.database import engine
from app.models.customer import Customer, CustomerDetail, CustomerJobInfo
from app.models.loan_application import LoanApplication, LoanApplicationDetail
from app.models.phone import Phone


def repair_data():
    with Session(engine) as session:
        customer = session.get(Customer, 33)
        if customer:
            print("Repairing Customer 33...")
            # 1. Phone
            phone_stmt = select(Phone).where(
                Phone.phoneable_type == "Customer",
                Phone.phoneable_id == 33,
                Phone.type == "mobile"
            )
            phone = session.exec(phone_stmt).first()
            if not phone:
                phone = Phone(
                    number="8095553333",
                    type="mobile",
                    country_area="+1",
                    phoneable_type="Customer",
                    phoneable_id=33
                )
                session.add(phone)
                print("-> Mobile phone created for Customer 33.")

            # 2. Job Info
            if customer.job_info:
                if not customer.job_info.occupation_type:
                    customer.job_info.occupation_type = "employed"
                if not customer.job_info.start_date:
                    customer.job_info.start_date = date(2022, 1, 15)
                session.add(customer.job_info)
                print("-> Job info updated for Customer 33.")

            # 3. Customer Detail move_in_date if missing
            if customer.detail and not customer.detail.move_in_date:
                customer.detail.move_in_date = date(2021, 6, 1)
                if not customer.detail.housing_possession_type:
                    customer.detail.housing_possession_type = "rented"
                session.add(customer.detail)
                print("-> Detail move_in_date and housing_possession_type updated for Customer 33.")

            session.commit()
            print("Customer 33 repaired successfully.")

        loan = session.get(LoanApplication, 55)
        if loan:
            print("Verifying Loan 55...")
            detail_stmt = select(LoanApplicationDetail).where(
                LoanApplicationDetail.loan_application_id == 55
            )
            detail = session.exec(detail_stmt).first()
            if detail:
                if not detail.term or detail.term == 0:
                    detail.term = 12
                if not detail.purpose:
                    detail.purpose = "PERSONAL"
                session.add(detail)
                session.commit()
                print("-> Loan 55 detail verified/updated.")


if __name__ == "__main__":
    repair_data()
