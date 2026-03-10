# Known Issue: Document Viewer Modal 404/Broken Links

## Status

**Identified:** 2026-03-10
**Severity:** High (Feature non-functional for local development)
**Component:** Frontend (DocumentViewerModal), Backend (LocalStorageService)

## Description

During the manual verification of the Document Viewer Modal (Phase 7), it was observed that while the modal UI (shadcn/ui Dialog) functions correctly, the actual content of the documents fails to load.

### Symptoms

1. **PDF Files:** The modal opens with the correct title, but the content area shows a "404 Page Not Found" error (Next.js default 404).
2. **Image Files:** The modal opens, but the image fails to load, showing a broken image icon.

## Technical Analysis

### 1. Relative URL Routing Mismatch

The backend `LocalStorageService` returns relative URLs for files:

```python
# backend/app/services/storage.py
async def get_url(self, key: str) -> str:
    return f"/api/v1/documents/download/{key}"
```

The frontend application runs on `http://localhost:3000`. When the browser tries to resolve `/api/v1/documents/download/...` within an `<iframe>` or `<img>`, it defaults to the same origin: `http://localhost:3000/api/v1/...`.

Since the backend is running on `http://localhost:8001`, these requests never reach the FastAPI server.

### 2. Missing Backend Endpoint

The `documents.py` router currently generates these URLs but does not define a GET endpoint to actually stream the file content from the local storage directory.

- `GET /api/v1/documents/{document_id}/download` exists, but it only returns a JSON with the URL, it doesn't serve the file.
- The path returned by the storage service (`/api/v1/documents/download/{key}`) has no corresponding handler in `backend/app/api/v1/endpoints/documents.py`.

## Proposed Solution

1. **Backend Endpoint:** Implement the missing file serving route in `backend/app/api/v1/endpoints/documents.py`.
   - Use `FileResponse` to stream the file from the local upload directory.
   - Ensure proper security checks (verify user has access to the document).

2. **Frontend URL Decoration:** Update the frontend API client or the `DocumentViewerModal` to prepend the `NEXT_PUBLIC_API_URL` to relative links if they don't start with `http`.

## Verification Steps

1. Navigate to `http://localhost:3000/customers/1`.
2. Click "Documentos".
3. Click the "Eye" icon for a PDF.
4. Confirm "404" is visible in the modal.
