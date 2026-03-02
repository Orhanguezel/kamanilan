# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Customer-facing e-commerce frontend for QuickEcommerce. Built with **Next.js 16** (App Router, Turbopack), **TypeScript strict**, **next-intl** for i18n, and connects to a **Laravel backend** REST API. Part of a monorepo (`quickecommerce/`) alongside `admin-panel/`, `backend-laravel/`, and `customer-app-and-web-flutter/`.

## Commands

```bash
bun run dev          # Dev server on port 3003 (Turbopack)
bun run dev:no-turbo # Dev server without Turbopack
bun run build        # Production build
bun run start        # Production server on port 3003
bun run lint         # ESLint
```

## Architecture

### Routing — Turkish-First URLs

All routes use **Turkish slugs**. Route constants are in `src/config/routes.ts`:

```
/giris, /kayit, /sepet, /odeme, /urun/[slug], /kategori/[slug],
/magazalar, /blog, /hakkimizda, /iletisim, /kuponlar,
/hesabim, /siparislerim, /favorilerim, /adreslerim, /cuzdan, /destek
```

Routes are locale-prefixed via next-intl: `/tr/urun/iphone-15`, `/en/urun/iphone-15`.

### i18n (next-intl)

- Locales: `tr` (default), `en`
- Config: `src/i18n/routing.ts`
- Translations: `public/locales/tr.json`, `public/locales/en.json`
- **CRITICAL:** Always use `Link`, `useRouter`, `usePathname` from `@/i18n/routing` — they auto-add the locale prefix. **Never manually prepend** `/${locale}/` to hrefs (causes `/tr/tr/` double-locale bug).

### API Integration — Dual Strategy

**Server Components (SSR):** `src/lib/api-server.ts` — direct axios calls with locale header.

**Client Components:** `src/lib/base-service.ts` — `useBaseService<DataType>(route)` hook returns `findAll`, `find`, `findBySlug`, `create`, `update`, `patch`, `delete`. Includes automatic token refresh on 401 (queues concurrent requests).

**API proxy:** In development, browser requests go through `/api/proxy/*` (Next.js rewrite) to avoid CORS. In production, direct API calls. Logic in `src/lib/api-url.ts`.

**Endpoints:** All 100+ API route strings in `src/endpoints/api-endpoints.ts`.

### State Management

- **Zustand** (`src/stores/`): `auth-store.ts` (user/auth state), `cart-store.ts` (local cart). Both persist to localStorage.
- **TanStack Query v5** (`src/lib/query-provider.tsx`): Server state. 10min stale time, 30min GC, no refetch on window focus.

### Module Pattern

Feature code lives in `src/modules/{feature}/`:
- `*.service.ts` — TanStack Query hooks (queries + mutations)
- `*.type.ts` — TypeScript interfaces

Modules: auth, banner, blog, cart, chat, checkout, flash-deal, newsletter, notification, order, product, profile, site, store, support, theme, wallet, wishlist.

### Dynamic Theming

`src/app/[locale]/layout.tsx` fetches theme colors from the API, converts HEX→HSL, and injects CSS variables as inline `<style>`. Client-side `ThemeProvider` in `src/components/providers/theme-provider.tsx` updates dynamically. All colors use `hsl(var(--primary))` pattern (Shadcn/Radix UI convention).

### UI Stack

Shadcn/ui components in `src/components/ui/` (40+ files), built on Radix UI primitives with Tailwind CSS. Icons: lucide-react.

### Environment Variables

Validated via `@t3-oss/env-nextjs` + Zod in `src/env.mjs`:
- `NEXT_PUBLIC_REST_API_ENDPOINT` — Backend API URL (required)
- `NEXT_PUBLIC_SITE_URL` — Frontend URL (required)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth (optional)
- `NEXT_PUBLIC_FACEBOOK_APP_ID` — Facebook OAuth (optional)

### Auth Flow

Tokens stored in cookies (`auth_token`, `auth_user`). On 401, `base-service.ts` attempts refresh via `/customer/refresh-token`, queues concurrent failing requests, and retries. On refresh failure, redirects to `/giris`.

### Docker Deployment

Multi-stage build (Node 22 Alpine), standalone output, runs as non-root user on port 3000. CI/CD via GitHub Actions → GHCR → SSH deploy.

## Critical Rules

1. **Never patch the database directly** — all data changes must go through Laravel seeders. Local DB changes don't reach production.
2. **Seeder URLs must match frontend routes** — Menu URLs in `MenuSeeder.php` must use Turkish slugs (`magazalar`, not `store/list`).
3. **Use `Link`/`useRouter` from `@/i18n/routing`** — never from `next/link` or `next/navigation` for navigable links.
4. **Use `@/` path aliases** for all cross-module imports.
5. **Homepage uses `Promise.allSettled`** for parallel data fetching — individual section failures don't cascade.