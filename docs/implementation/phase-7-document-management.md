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

---

## Document Viewer Modal (Extension)

Added inline document preview to the customer documents tab.

### New Components

| File                                           | Purpose                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `components/documents/DocumentViewerModal.tsx` | PDF (iframe), image (img), fallback download                              |
| `lib/utils/document-url.ts`                    | `resolveDocumentUrl()` — rewrites relative backend URLs to the auth proxy |
| `app/api/proxy/documents/[...path]/route.ts`   | Next.js Route Handler proxy with NextAuth session check                   |

### Backend Addition

`GET /documents/download/{file_key:path}` — serves local files via `FileResponse` with:

- `Content-Disposition: inline` (renders in browser, not download)
- `mimetypes.guess_type()` for auto content-type
- Path traversal protection
- Local-only guard (inactive when using R2)

### Security Architecture

Browsers cannot attach `Authorization` headers to `<iframe src>` / `<img src>`. The Next.js proxy solves this:

```
Browser → /api/proxy/documents/{key} (port 3000, session-checked)
  → FastAPI /api/v1/documents/download/{key} (Bearer token injected)
  → File streamed back with Content-Type + Content-Disposition
```

See [ADR 002](../decisions/002-document-proxy-auth.md) for full rationale.

### Frontend Tests

6 unit tests in `components/documents/__tests__/DocumentViewerModal.test.tsx` — all passing (58/58 total).
