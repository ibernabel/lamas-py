# ADR 002: Authenticated Proxy for Local Document File Serving

**Date:** 2026-03-10
**Status:** Accepted
**Context:** Document Viewer Modal — Phase 7 Extension

---

## Context

The document viewer modal uses `<iframe>` and `<img>` tags to display files inline. Browsers do not send `Authorization: Bearer` headers when loading resources via `src` attributes. This makes it impossible to protect a FastAPI file-serving endpoint via JWT Bearer token when accessed directly from the browser.

## Decision

Implement a **Next.js Route Handler proxy** at `app/api/proxy/documents/[...path]/route.ts`.

**Flow:**

1. Browser requests `GET /api/proxy/documents/{file_key}` (same origin, port 3000).
2. Next.js verifies the `NextAuth` session via `auth()`.
3. If authenticated, fetches the file from FastAPI (`/api/v1/documents/download/{file_key}`) with the user's Bearer token.
4. Streams the response back, preserving `Content-Type` and `Content-Disposition: inline`.

`resolveDocumentUrl()` in `lib/utils/document-url.ts` rewrites all relative backend URLs to the proxy path before use in `<iframe>`, `<img>`, or `window.open()`.

## Consequences

**Good:**

- File access requires a valid NextAuth session — unauthenticated requests return `401`.
- No changes needed to the axios client or Bearer token flow.
- Works identically for iframe, img, and download button cases.
- R2 presigned URLs pass through `resolveDocumentUrl()` unchanged (already absolute + authenticated by signing).

**Bad / Trade-offs:**

- Adds one extra network hop (browser → Next.js → FastAPI) for local dev file serving.
- In production with R2, this proxy is never invoked (R2 URLs are absolute and bypass the rewrite).

## Future Work

- Add role/permission checks to the proxy route when RBAC is implemented.
- Consider streaming large files with `ReadableStream` if memory pressure is observed.
