2026-03-11 16:34:05,682 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-03-11 16:34:05,683 INFO sqlalchemy.engine.Engine SELECT users.name, users.email, users.is_approved, users.id, users.password, users.email_verified_at, users.remember_token, users.profile_photo_path, users.created_at, users.updated_at
FROM users
WHERE users.id = %(id_1)s
2026-03-11 16:34:05,683 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'id_1': 1}
2026-03-11 16:34:05,690 INFO sqlalchemy.engine.Engine SELECT customers.id, customers."NID", customers.lead_channel, customers.is_referred, customers.referred_by, customers.is_active, customers.is_assigned, customers.portfolio_id, customers.promoter_id, customers.assigned_at, customers.created_at, customers.updated_at
FROM customers
WHERE customers.id = %(id_1)s
2026-03-11 16:34:05,691 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'id_1': 1}
2026-03-11 16:34:05,699 INFO sqlalchemy.engine.Engine SELECT customer_details.id AS customer_details_id, customer_details.customer_id AS customer_details_customer_id, customer_details.first_name AS customer_details_first_name, customer_details.last_name AS customer_details_last_name, customer_details.email AS customer_details_email, customer_details.nickname AS customer_details_nickname, customer_details.birthday AS customer_details_birthday, customer_details.gender AS customer_details_gender, customer_details.marital_status AS customer_details_marital_status, customer_details.education_level AS customer_details_education_level, customer_details.nationality AS customer_details_nationality, customer_details.housing_type AS customer_details_housing_type, customer_details.housing_possession_type AS customer_details_housing_possession_type, customer_details.move_in_date AS customer_details_move_in_date, customer_details.mode_of_transport AS customer_details_mode_of_transport, customer_details.created_at AS customer_details_created_at, customer_details.updated_at AS customer_details_updated_at
FROM customer_details
WHERE %(param_1)s = customer_details.customer_id
2026-03-11 16:34:05,699 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,724 INFO sqlalchemy.engine.Engine SELECT customer_financial_info.id AS customer_financial_info_id, customer_financial_info.customer_id AS customer_financial_info_customer_id, customer_financial_info.other_incomes AS customer_financial_info_other_incomes, customer_financial_info.discounts AS customer_financial_info_discounts, customer_financial_info.housing_type AS customer_financial_info_housing_type, customer_financial_info.monthly_housing_payment AS customer_financial_info_monthly_housing_payment, customer_financial_info.total_debts AS customer_financial_info_total_debts, customer_financial_info.loan_installments AS customer_financial_info_loan_installments, customer_financial_info.household_expenses AS customer_financial_info_household_expenses, customer_financial_info.labor_benefits AS customer_financial_info_labor_benefits, customer_financial_info.guarantee_assets AS customer_financial_info_guarantee_assets, customer_financial_info.total_incomes AS customer_financial_info_total_incomes, customer_financial_info.created_at AS customer_financial_info_created_at, customer_financial_info.updated_at AS customer_financial_info_updated_at
FROM customer_financial_info
WHERE %(param_1)s = customer_financial_info.customer_id
2026-03-11 16:34:05,724 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,729 INFO sqlalchemy.engine.Engine SELECT customer_job_info.id AS customer_job_info_id, customer_job_info.customer_id AS customer_job_info_customer_id, customer_job_info.is_self_employed AS customer_job_info_is_self_employed, customer_job_info.role AS customer_job_info_role, customer_job_info.level AS customer_job_info_level, customer_job_info.start_date AS customer_job_info_start_date, customer_job_info.salary AS customer_job_info_salary, customer_job_info.other_incomes AS customer_job_info_other_incomes, customer_job_info.other_incomes_source AS customer_job_info_other_incomes_source, customer_job_info.payment_type AS customer_job_info_payment_type, customer_job_info.payment_frequency AS customer_job_info_payment_frequency, customer_job_info.payment_bank AS customer_job_info_payment_bank, customer_job_info.payment_account_number AS customer_job_info_payment_account_number, customer_job_info.schedule AS customer_job_info_schedule, customer_job_info.supervisor_name AS customer_job_info_supervisor_name, customer_job_info.created_at AS customer_job_info_created_at, customer_job_info.updated_at AS customer_job_info_updated_at
FROM customer_job_info
WHERE %(param_1)s = customer_job_info.customer_id
2026-03-11 16:34:05,729 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,744 INFO sqlalchemy.engine.Engine SELECT customer_references.id AS customer_references_id, customer_references.customer_id AS customer_references_customer_id, customer_references.name AS customer_references_name, customer_references.nid AS customer_references_nid, customer_references.email AS customer_references_email, customer_references.relationship AS customer_references_relationship, customer_references.reference_since AS customer_references_reference_since, customer_references.is_active AS customer_references_is_active, customer_references.occupation AS customer_references_occupation, customer_references.is_who_referred AS customer_references_is_who_referred, customer_references.type AS customer_references_type, customer_references.address AS customer_references_address, customer_references.created_at AS customer_references_created_at, customer_references.updated_at AS customer_references_updated_at
FROM customer_references
WHERE %(param_1)s = customer_references.customer_id
2026-03-11 16:34:05,745 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,749 INFO sqlalchemy.engine.Engine SELECT customer_vehicles.id AS customer_vehicles_id, customer_vehicles.customer_id AS customer_vehicles_customer_id, customer_vehicles.vehicle_type AS customer_vehicles_vehicle_type, customer_vehicles.vehicle_brand AS customer_vehicles_vehicle_brand, customer_vehicles.vehicle_model AS customer_vehicles_vehicle_model, customer_vehicles.vehicle_year AS customer_vehicles_vehicle_year, customer_vehicles.vehicle_color AS customer_vehicles_vehicle_color, customer_vehicles.vehicle_plate_number AS customer_vehicles_vehicle_plate_number, customer_vehicles.is_financed AS customer_vehicles_is_financed, customer_vehicles.is_owned AS customer_vehicles_is_owned, customer_vehicles.is_leased AS customer_vehicles_is_leased, customer_vehicles.is_rented AS customer_vehicles_is_rented, customer_vehicles.is_shared AS customer_vehicles_is_shared, customer_vehicles.created_at AS customer_vehicles_created_at, customer_vehicles.updated_at AS customer_vehicles_updated_at
FROM customer_vehicles
WHERE %(param_1)s = customer_vehicles.customer_id
2026-03-11 16:34:05,750 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,760 INFO sqlalchemy.engine.Engine SELECT companies.id AS companies_id, companies.customer_id AS companies_customer_id, companies.name AS companies_name, companies.email AS companies_email, companies.type AS companies_type, companies.website AS companies_website, companies.rnc AS companies_rnc, companies.departmet AS companies_departmet, companies.branch AS companies_branch, companies.created_at AS companies_created_at, companies.updated_at AS companies_updated_at
FROM companies
WHERE %(param_1)s = companies.customer_id
2026-03-11 16:34:05,760 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,766 INFO sqlalchemy.engine.Engine SELECT customers_accounts.id AS customers_accounts_id, customers_accounts.customer_id AS customers_accounts_customer_id, customers_accounts.number AS customers_accounts_number, customers_accounts.type AS customers_accounts_type, customers_accounts.created_at AS customers_accounts_created_at, customers_accounts.updated_at AS customers_accounts_updated_at
FROM customers_accounts
WHERE %(param_1)s = customers_accounts.customer_id
2026-03-11 16:34:05,766 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'param_1': 1}
2026-03-11 16:34:05,774 INFO sqlalchemy.engine.Engine SELECT phones.id, phones.country_area, phones.number, phones.extension, phones.type, phones.phoneable_id, phones.phoneable_type, phones.created_at, phones.updated_at
FROM phones
WHERE phones.phoneable_type = %(phoneable_type_1)s AND phones.phoneable_id = %(phoneable_id_1)s
2026-03-11 16:34:05,777 INFO sqlalchemy.engine.Engine [cached since 3600s ago] {'phoneable_type_1': 'Customer', 'phoneable_id_1': 1}
2026-03-11 16:34:05,791 INFO sqlalchemy.engine.Engine ROLLBACK
INFO:     127.0.0.1:50507 - "GET /api/v1/customers/1 HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/uvicorn/protocols/http/httptools_impl.py", line 416, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/applications.py", line 1134, in __call__
    await super().__call__(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/applications.py", line 107, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/errors.py", line 186, in __call__
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/cors.py", line 95, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/cors.py", line 153, in simple_response
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/middleware/asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 716, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 736, in app
    await route.handle(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 290, in handle
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 119, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 105, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 424, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 312, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/app/api/v1/endpoints/customers.py", line 151, in get_customer
    customer = await get_customer_with_relations(session, customer_id)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/app/services/customer_service.py", line 384, in get_customer_with_relations
    customer.phones = session.exec(phones_stmt).all()
    ^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/sqlmodel/main.py", line 858, in __setattr__
    super().__setattr__(name, value)
    ~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/pydantic/main.py", line 1032, in __setattr__
    elif (setattr_handler := self._setattr_handler(name, value)) is not None:
                             ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/pydantic/main.py", line 1082, in _setattr_handler
    self.__pydantic_extra__[name] = value
    ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
TypeError: 'NoneType' object does not support item assignment
2026-03-11 16:34:07,052 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-03-11 16:34:07,053 INFO sqlalchemy.engine.Engine SELECT users.name, users.email, users.is_approved, users.id, users.password, users.email_verified_at, users.remember_token, users.profile_photo_path, users.created_at, users.updated_at
FROM users
WHERE users.id = %(id_1)s
2026-03-11 16:34:07,053 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'id_1': 1}
2026-03-11 16:34:07,071 INFO sqlalchemy.engine.Engine SELECT customers.id, customers."NID", customers.lead_channel, customers.is_referred, customers.referred_by, customers.is_active, customers.is_assigned, customers.portfolio_id, customers.promoter_id, customers.assigned_at, customers.created_at, customers.updated_at
FROM customers
WHERE customers.id = %(id_1)s
2026-03-11 16:34:07,071 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'id_1': 1}
2026-03-11 16:34:07,079 INFO sqlalchemy.engine.Engine SELECT customer_details.id AS customer_details_id, customer_details.customer_id AS customer_details_customer_id, customer_details.first_name AS customer_details_first_name, customer_details.last_name AS customer_details_last_name, customer_details.email AS customer_details_email, customer_details.nickname AS customer_details_nickname, customer_details.birthday AS customer_details_birthday, customer_details.gender AS customer_details_gender, customer_details.marital_status AS customer_details_marital_status, customer_details.education_level AS customer_details_education_level, customer_details.nationality AS customer_details_nationality, customer_details.housing_type AS customer_details_housing_type, customer_details.housing_possession_type AS customer_details_housing_possession_type, customer_details.move_in_date AS customer_details_move_in_date, customer_details.mode_of_transport AS customer_details_mode_of_transport, customer_details.created_at AS customer_details_created_at, customer_details.updated_at AS customer_details_updated_at
FROM customer_details
WHERE %(param_1)s = customer_details.customer_id
2026-03-11 16:34:07,079 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,108 INFO sqlalchemy.engine.Engine SELECT customer_financial_info.id AS customer_financial_info_id, customer_financial_info.customer_id AS customer_financial_info_customer_id, customer_financial_info.other_incomes AS customer_financial_info_other_incomes, customer_financial_info.discounts AS customer_financial_info_discounts, customer_financial_info.housing_type AS customer_financial_info_housing_type, customer_financial_info.monthly_housing_payment AS customer_financial_info_monthly_housing_payment, customer_financial_info.total_debts AS customer_financial_info_total_debts, customer_financial_info.loan_installments AS customer_financial_info_loan_installments, customer_financial_info.household_expenses AS customer_financial_info_household_expenses, customer_financial_info.labor_benefits AS customer_financial_info_labor_benefits, customer_financial_info.guarantee_assets AS customer_financial_info_guarantee_assets, customer_financial_info.total_incomes AS customer_financial_info_total_incomes, customer_financial_info.created_at AS customer_financial_info_created_at, customer_financial_info.updated_at AS customer_financial_info_updated_at
FROM customer_financial_info
WHERE %(param_1)s = customer_financial_info.customer_id
2026-03-11 16:34:07,108 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,118 INFO sqlalchemy.engine.Engine SELECT customer_job_info.id AS customer_job_info_id, customer_job_info.customer_id AS customer_job_info_customer_id, customer_job_info.is_self_employed AS customer_job_info_is_self_employed, customer_job_info.role AS customer_job_info_role, customer_job_info.level AS customer_job_info_level, customer_job_info.start_date AS customer_job_info_start_date, customer_job_info.salary AS customer_job_info_salary, customer_job_info.other_incomes AS customer_job_info_other_incomes, customer_job_info.other_incomes_source AS customer_job_info_other_incomes_source, customer_job_info.payment_type AS customer_job_info_payment_type, customer_job_info.payment_frequency AS customer_job_info_payment_frequency, customer_job_info.payment_bank AS customer_job_info_payment_bank, customer_job_info.payment_account_number AS customer_job_info_payment_account_number, customer_job_info.schedule AS customer_job_info_schedule, customer_job_info.supervisor_name AS customer_job_info_supervisor_name, customer_job_info.created_at AS customer_job_info_created_at, customer_job_info.updated_at AS customer_job_info_updated_at
FROM customer_job_info
WHERE %(param_1)s = customer_job_info.customer_id
2026-03-11 16:34:07,118 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,129 INFO sqlalchemy.engine.Engine SELECT customer_references.id AS customer_references_id, customer_references.customer_id AS customer_references_customer_id, customer_references.name AS customer_references_name, customer_references.nid AS customer_references_nid, customer_references.email AS customer_references_email, customer_references.relationship AS customer_references_relationship, customer_references.reference_since AS customer_references_reference_since, customer_references.is_active AS customer_references_is_active, customer_references.occupation AS customer_references_occupation, customer_references.is_who_referred AS customer_references_is_who_referred, customer_references.type AS customer_references_type, customer_references.address AS customer_references_address, customer_references.created_at AS customer_references_created_at, customer_references.updated_at AS customer_references_updated_at
FROM customer_references
WHERE %(param_1)s = customer_references.customer_id
2026-03-11 16:34:07,130 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,139 INFO sqlalchemy.engine.Engine SELECT customer_vehicles.id AS customer_vehicles_id, customer_vehicles.customer_id AS customer_vehicles_customer_id, customer_vehicles.vehicle_type AS customer_vehicles_vehicle_type, customer_vehicles.vehicle_brand AS customer_vehicles_vehicle_brand, customer_vehicles.vehicle_model AS customer_vehicles_vehicle_model, customer_vehicles.vehicle_year AS customer_vehicles_vehicle_year, customer_vehicles.vehicle_color AS customer_vehicles_vehicle_color, customer_vehicles.vehicle_plate_number AS customer_vehicles_vehicle_plate_number, customer_vehicles.is_financed AS customer_vehicles_is_financed, customer_vehicles.is_owned AS customer_vehicles_is_owned, customer_vehicles.is_leased AS customer_vehicles_is_leased, customer_vehicles.is_rented AS customer_vehicles_is_rented, customer_vehicles.is_shared AS customer_vehicles_is_shared, customer_vehicles.created_at AS customer_vehicles_created_at, customer_vehicles.updated_at AS customer_vehicles_updated_at
FROM customer_vehicles
WHERE %(param_1)s = customer_vehicles.customer_id
2026-03-11 16:34:07,140 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,144 INFO sqlalchemy.engine.Engine SELECT companies.id AS companies_id, companies.customer_id AS companies_customer_id, companies.name AS companies_name, companies.email AS companies_email, companies.type AS companies_type, companies.website AS companies_website, companies.rnc AS companies_rnc, companies.departmet AS companies_departmet, companies.branch AS companies_branch, companies.created_at AS companies_created_at, companies.updated_at AS companies_updated_at
FROM companies
WHERE %(param_1)s = companies.customer_id
2026-03-11 16:34:07,145 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,161 INFO sqlalchemy.engine.Engine SELECT customers_accounts.id AS customers_accounts_id, customers_accounts.customer_id AS customers_accounts_customer_id, customers_accounts.number AS customers_accounts_number, customers_accounts.type AS customers_accounts_type, customers_accounts.created_at AS customers_accounts_created_at, customers_accounts.updated_at AS customers_accounts_updated_at
FROM customers_accounts
WHERE %(param_1)s = customers_accounts.customer_id
2026-03-11 16:34:07,161 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'param_1': 1}
2026-03-11 16:34:07,170 INFO sqlalchemy.engine.Engine SELECT phones.id, phones.country_area, phones.number, phones.extension, phones.type, phones.phoneable_id, phones.phoneable_type, phones.created_at, phones.updated_at
FROM phones
WHERE phones.phoneable_type = %(phoneable_type_1)s AND phones.phoneable_id = %(phoneable_id_1)s
2026-03-11 16:34:07,170 INFO sqlalchemy.engine.Engine [cached since 3602s ago] {'phoneable_type_1': 'Customer', 'phoneable_id_1': 1}
2026-03-11 16:34:07,174 INFO sqlalchemy.engine.Engine ROLLBACK
INFO:     127.0.0.1:52801 - "GET /api/v1/customers/1 HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/uvicorn/protocols/http/httptools_impl.py", line 416, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/uvicorn/middleware/proxy_headers.py", line 60, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/applications.py", line 1134, in __call__
    await super().__call__(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/applications.py", line 107, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/errors.py", line 186, in __call__
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/cors.py", line 95, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/cors.py", line 153, in simple_response
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/middleware/exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/middleware/asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 716, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 736, in app
    await route.handle(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/routing.py", line 290, in handle
    await self.app(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 119, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 105, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 424, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/fastapi/routing.py", line 312, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/app/api/v1/endpoints/customers.py", line 151, in get_customer
    customer = await get_customer_with_relations(session, customer_id)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/app/services/customer_service.py", line 384, in get_customer_with_relations
    customer.phones = session.exec(phones_stmt).all()
    ^^^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/sqlmodel/main.py", line 858, in __setattr__
    super().__setattr__(name, value)
    ~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/pydantic/main.py", line 1032, in __setattr__
    elif (setattr_handler := self._setattr_handler(name, value)) is not None:
                             ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^
  File "/home/ibernabel/develop/lamas-py/backend/.venv/lib/python3.14/site-packages/pydantic/main.py", line 1082, in _setattr_handler
    self.__pydantic_extra__[name] = value
    ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
TypeError: 'NoneType' object does not support item assignment
