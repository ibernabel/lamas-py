# Implementation Phase 7: Document Management

Implemented a full-stack document management system for LAMAS, supporting customer identity verification and loan analysis proofs.

## Architecture

### Backend

- **Model:** `CustomerDocument` (SQLModel). Supports polymorphic associations via `customer_id` and `loan_application_id`.
- **Storage Strategy:** Uses a factory pattern to switch between `LocalStorageService` (development) and `R2StorageService` (production).
- **Versioning:** Automatically marks previous duplicates (same `type` and `bank_name`) as `is_latest=False` upon new upload.

### Frontend

- **API Wrapper:** `lib/api/documents.ts` provides clean hooks for file operations using Axios with multipart support.
- **UI Components:** Reusable `DocumentUpload` and `DocumentList` components with drag-and-drop and progress states.

## Database Schema (CustomerDocument)

| Field                 | Type    | Description              |
| --------------------- | ------- | ------------------------ | ------------ | -------------- | ------------- |
| `id`                  | Integer | Primary Key              |
| `customer_id`         | Integer | Linked customer          |
| `loan_application_id` | Integer | Linked loan (optional)   |
| `document_type`       | String  | nid                      | labor_letter | bank_statement | credit_report |
| `bank_name`           | String  | Specific bank (optional) |
| `file_key`            | String  | Storage path/key         |
| `file_name`           | String  | Original filename        |
| `is_latest`           | Boolean | True for current version |

## Configuration

Environment variables added to `.env`:

- `STORAGE_BACKEND`: `local` or `r2`
- `STORAGE_LOCAL_UPLOAD_DIR`: Path for local files
- `R2_ACCOUNT_ID`: Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: R2 Credentials
- `R2_SECRET_ACCESS_KEY`: R2 Credentials
- `R2_BUCKET_NAME`: Target bucket

## Testing

Backend tests in `tests/test_documents_api.py` verify:

1. Document upload and metadata persistence.
2. Versioning logic (marking old files as historical).
3. Polymorphic associations (Customer vs Loan).
4. Deletion workflow.

Run tests:

```bash
.venv/bin/python -m pytest tests/test_documents_api.py -v
```
