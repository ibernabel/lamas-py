# Phase 4: Frontend Foundation

**Status**: ✅ Complete  
**Completed**: 2026-02-18  
**Duration**: 1 day

---

## Overview

Phase 4 establishes the Next.js 16 frontend with App Router, Tailwind CSS 4, shadcn/ui, NextAuth.js v5 JWT authentication, TanStack Query API client, and the full dashboard layout shell.

---

## Tech Stack

| Package        | Version       | Purpose                      |
| -------------- | ------------- | ---------------------------- |
| Next.js        | 16.1.6        | App Router framework         |
| React          | 19.2.3        | UI library                   |
| TypeScript     | 5.9.3         | Type safety                  |
| Tailwind CSS   | 4.2.0         | Utility-first CSS            |
| shadcn/ui      | 3.8.5         | Accessible component library |
| NextAuth.js    | 5.0.0-beta.30 | JWT authentication           |
| TanStack Query | 5.90.21       | Server state management      |
| axios          | 1.13.5        | HTTP client                  |
| zod            | 4.3.6         | Schema validation            |
| lucide-react   | latest        | Icon library                 |

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx        # Login page (public)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Authenticated shell
│   │   └── page.tsx              # Dashboard home
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts              # NextAuth route handler
│   ├── layout.tsx                # Root layout (Inter, QueryProvider, Toaster)
│   ├── globals.css               # Tailwind 4 + shadcn/ui CSS variables
│   └── not-found.tsx             # Global 404 page
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── header.tsx            # Top bar with user menu
│   └── ui/                       # shadcn/ui components (12 installed)
├── lib/api/
│   ├── client.ts                 # Axios instance with auth interceptors
│   ├── types.ts                  # TypeScript interfaces (backend schemas)
│   ├── customers.ts              # Customer API functions
│   └── loan-applications.ts      # Loan application API functions
├── providers/
│   └── query-provider.tsx        # TanStack Query provider
├── types/
│   └── next-auth.d.ts            # NextAuth type augmentation
├── auth.ts                       # NextAuth.js v5 config
├── proxy.ts                      # Route protection (Next.js 16 proxy)
├── .env.local.example            # Environment variables template
└── next.config.ts                # Next.js config (turbopack.root)
```

---

## Authentication Flow

```
User → /login → LoginForm → signIn("credentials")
→ NextAuth Credentials provider → POST /api/v1/auth/login (FastAPI)
→ { access_token, user } → JWT session callback stores token
→ session.accessToken available in all components
→ axios interceptor attaches Bearer token to all API requests
```

**Route protection**: `proxy.ts` intercepts all requests. Unauthenticated users → `/login`. Authenticated users visiting `/login` → `/`.

---

## shadcn/ui Components Installed

`button`, `input`, `card`, `badge`, `table`, `dialog`, `dropdown-menu`, `separator`, `skeleton`, `sonner`, `avatar`, `sheet`

---

## Verification

```bash
# Build (TypeScript + static generation)
cd frontend && pnpm run build
# Result: Exit code 0, 5 pages generated

# Dev server
pnpm run dev
# App runs at http://localhost:3000
```

**Build output:**

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
└ ○ /login

ƒ Proxy (Middleware)
```

### 🔄 Local Fixes & Adjustments

During initial browser verification, the following adjustments were made to ensure the local environment matched the expected architecture:

1.  **Middleware Renaming**: Renamed `frontend/proxy.ts` to `frontend/middleware.ts`. In Next.js 16/App Router, custom middleware must be named `middleware.ts` at the root/src level to be recognized by the framework.
2.  **Boilerplate Cleanup**: Moved the default `frontend/app/page.tsx` (Next.js starter template) to `page.tsx.bak` to allow the dashboard route in `(dashboard)/page.tsx` to handle the root URL.
3.  **Database Seeding**: Created `backend/scripts/init_db.py` to initialize SQLModel tables in the PostgreSQL container and seed a default administrative user.

### ✅ Initial Browser Verification (2026-02-18)

The frontend foundation was verified using a browser agent with the following results:

- **Login Page**: Successfully rendered at `/login`.
- **Authentication**: Verified login with `test@example.com` / `testpass`.
- **Dashboard Shell**: Successfully redirected to `/` after login, displaying the Sidebar and Header components.
- **Components**: Navigation sidebar links (Dashboard, Customers, Loan Applications) are visible and functional.
- **Stats Cards**: Dashboard stats grid is visible with data placeholders ready for Phase 5/6.

**Test Report**: [Frontend Verification Report](../testing/frontend-verification.md)

---

### 📂 Public Assets Migration (2026-02-18)

Consolidated visual identity elements from the legacy structure to the new frontend:

- **Images**: Migrated `legacy/public/img/` → `frontend/public/img/`.
- **Favicons**: Migrated `legacy/public/favicons/` → `frontend/public/favicons/`.
- **Next.js Integration**: Updated `frontend/app/layout.tsx` metadata to reference migrated favicons.
- **Relative Links**: Updated root `README.md` to point to the new image paths.

Migrated files include:

- `lamas-id-mini.png` (used in README)
- `logo.png`
- `favicon.ico`
- `coins-solid.ico`
- SVG assets (`coins-solid.svg`, `dollar-sign-solid.svg`)

This migration ensures that branding assets are centralized in the active frontend package while maintaining compatibility with top-level documentation.
