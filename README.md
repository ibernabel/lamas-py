<p align="center">
  <img src="./public/img/lamas-id-mini.png" alt="LAMaS Visual Identity" width="300" height="200">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/LAMaS-Loan%20Applications%20Management%20System-0F4C81?style=for-the-badge&logo=laravel&logoColor=white" alt="LAMaS Badge">
</p>

<p align="center">
<!-- Replace with your project's badges -->
<img src="https://img.shields.io/badge/Built%20with-Laravel-ff2d20?style=flat-square&logo=laravel" alt="Built with Laravel">
<img src="https://img.shields.io/badge/PHP-%3E%3D8.2-777BB4?style=flat-square&logo=php" alt="PHP Version">
<!-- Add more relevant badges like build status, license, etc. -->
</p>

# Loan Applications Managemet System - LAMaS

## Description

This project is a comprehensive web application built using the Laravel framework, designed to streamline and manage the loan application process. It provides a robust system for handling customer information, tracking loan details, assessing credit risk, and managing related entities such as brokers, promoters, and financial portfolios. The application includes both API endpoints for integration and potentially a web interface for administrative tasks and user interaction.

Key functionalities include:

* **Customer Management:** Detailed profiles, contact information, references, and financial/job details.
* **Loan Application Processing:** Creation, tracking, and management of loan applications.
* **Credit Risk Assessment:** Integration with credit risk categories and specific risk factors.
* **Entity Management:** Handling of brokers, promoters, companies, and portfolios associated with loan applications.
* **Address and Phone Management:** Polymorphic relationships for associating addresses and phone numbers with various entities.

## Documentation

### Installation and Setup

1. **Clone the repository:**

```bash
git clone https://github.com/ibernabel/lamas.git
cd lamas
```

2. **Install PHP dependencies:**

```bash
composer install
```

3. **Install JavaScript dependencies:**

```bash
npm install
```

4. **Copy the example environment file and configure it:**

```bash
cp .env.example .env
```

Edit the `.env` file to set your database credentials and other environment variables.

5. **Generate an application key:**

```bash
php artisan key:generate
```

6. **Run database migrations:**

```bash
php artisan migrate
```

7. **Seed the database (optional):**

```bash
php artisan db:seed
```

8. **Link storage (if necessary):**

```bash
php artisan storage:link
```

9. **Build assets:**

```bash
npm run dev # or npm run build for production
```

10. **Start the local development server:**

```bash
php artisan serve
```

The application will be available at `http://localhost:8000`.

### Project Structure

The project follows the standard Laravel directory structure. Key directories and files include:

* `app/Models/`: Contains Eloquent models representing the database tables (Customer, LoanApplication, Broker, Promoter, Portfolio, CreditRisk, etc.).
* `app/Http/Controllers/`: Houses the application's controllers, including API controllers (`Api/V1/CustomerController.php`).
* `app/Http/Requests/`: Contains form request classes for validation (`CustomerRequest.php`).
* `database/migrations/`: Defines the database schema and modifications.
* `database/seeders/`: Contains classes for seeding the database with test data.
* `routes/`: Defines application routes (`web.php`, `api.php`, `admin.php`).
* `resources/views/`: Contains Blade templates for the web interface.
* `config/`: Configuration files for various services and modules.

### Key Features

* **User Authentication and Authorization:** (Inferred from Jetstream/Fortify presence)
* **Role and Permission Management:** (Inferred from Spatie Permission migration)
* **Customer Data Management:** Comprehensive fields for customer details.
* **Loan Application Workflow:** Structured data for tracking applications.
* **Relational Data:** Models and migrations define relationships between entities (customers, loans, brokers, etc.).
* **API Endpoints:** (Specific endpoints need to be documented based on the actual API routes defined in `routes/api.php`. You might list key endpoints and their purpose here.)

Example (placeholder):

* `GET /api/v1/customers`: List all customers.
* `POST /api/v1/customers`: Create a new customer.
* `GET /api/v1/customers/{id}`: Get details for a specific customer.
* `PUT /api/v1/customers/{id}`: Update a specific customer.
* `DELETE /api/v1/customers/{id}`: Delete a specific customer.
* `POST /api/v1/loan-applications`: Create a new loan application.
* ... (List other relevant API endpoints)

### Database Schema

The database schema is defined by the migration files in `database/migrations/`. Key tables include `users`, `customers`, `loan_applications`, `brokers`, `promoters`, `portfolios`, `credit_risks`, `companies`, `phones`, `addresses`, etc. Relationships between tables are defined in the migration files and reflected in the Eloquent models.

### Contributing

Please check [CONTRIBUTING.md](https://github.com/ibernabel/lamas/blob/main/CONTRIBUTING.md) for contributions.

### License

The Laravel framework is open-sourced software licensed under the [Apache-2.0 license](https://github.com/ibernabel/lamas/blob/main/LICENSE).

---
