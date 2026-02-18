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
