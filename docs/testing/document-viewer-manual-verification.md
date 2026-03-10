# Document Viewer — Manual Verification Report

**Date:** 2026-03-10  
**Status:** ⚠️ Partial Failure (UI works, content load fails)  
**Author:** Antigravity (QA Engineer)

## Overview

Manual verification of the Document Viewer Modal implemented in Phase 7. The verification focused on navigation, modal behavior, and content rendering for different file types (PDF, Images).

## Test Environment

- **URL:** `http://localhost:3000/customers/1`
- **User:** Carlos Ramirez (Test Customer)
- **Files tested:**
  - `CARTA TRABAJO SOLUFIME.pdf` (PDF)
  - `Cedula Delante.jpg` (Image)

## Verification Steps & Results

| Step | Action                            | Result                                            | Status  |
| ---- | --------------------------------- | ------------------------------------------------- | ------- |
| 1    | Navigate to Customer Detail       | Page loaded correctly                             | ✅ PASS |
| 2    | Switch to "Documentos" Tab        | List of uploaded files is visible                 | ✅ PASS |
| 3    | Click "Visualizar" (Eye) on PDF   | Modal opens with correct title                    | ✅ PASS |
| 4    | PDF Content Rendering             | Viewer shows "404 Page Not Found" (Port mismatch) | ❌ FAIL |
| 5    | Click "Visualizar" (Eye) on Image | Modal opens correctly                             | ✅ PASS |
| 6    | Image Content Rendering           | Shows broken image icon (Port mismatch)           | ❌ FAIL |
| 7    | Close Modal (X button)            | Modal closes and returns to list                  | ✅ PASS |

## Identified Bugs

### 1. Routing Mismatch (Port 3000 vs 8001)

The backend `LocalStorageService` returns relative URLs starting with `/api/v1/...`.
The frontend browser interprets this as `http://localhost:3000/api/v1/...` (Next.js server).
Since the actual API resides at `http://localhost:8001`, the request fails with a 404.

### 2. Missing Backend Logic

The backend router in `documents.py` provides the **location** of the file but does not have a route to **serve** the actual bytes from the disk to the client via HTTP.

## Next Steps

- [ ] Implement file serving route in `backend/app/api/v1/endpoints/documents.py`.
- [ ] Prepend `NEXT_PUBLIC_API_URL` to document links in the frontend `DocumentViewerModal`.

---

**Attachment:** [Known Issue Report](../knowledges/known_issue-document-viewer-404.md)
