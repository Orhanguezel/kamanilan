# CLAUDE.md — Kamanilan Frontend

Musteri tarafi web uygulamasi. `vps-guezel` monorepo workspace'i altinda, Fastify backend'e (port 8078) baglanir.

## Stack

- **Next.js 16** App Router + Turbopack
- **React 19**, TypeScript strict
- **Tailwind CSS v3** + Shadcn/ui + Radix UI
- **Zustand** (auth, cart, recently-viewed, chat widget)
- **TanStack Query v5** (server state)
- **react-hook-form** + **Zod** (form validation)
- **axios** + **js-cookie** (API + session cookie)
- **Iyzipay** uclu odeme akisi
- **Backend:** Fastify + Drizzle ORM + MySQL (monorepo: `@vps/shared-backend`)

## Komutlar

```bash
bun run dev          # 3003 portunda dev server (Turbopack)
bun run dev:no-turbo # Turbopack olmadan
bun run build        # Production build
bun run start        # 3003 portunda production
bun run lint         # ESLint
```

Root workspace'ten: `bun run dev:kamanilan:fe`.

## Routing — Tek Dil, Turkce Slug'lar

Kamanilan **TR tek dil**. App router'da **`[locale]` prefix'i yok** — tum sayfalar dogrudan Turkce slug uzerinden.

Route sabitleri: [src/config/routes.ts](src/config/routes.ts)

```
/, /giris, /kayit, /ilanlar, /ilan/[slug], /ilan-ver, /ilanlarim,
/kategori/[slug], /kategoriler, /ara, /duyurular, /haberler/[slug],
/sepet, /odeme, /hesabim (+ alt sayfalar), /mesajlar, /bildirimler,
/kampanyalar, /kuponlar, /magazalar, /iletisim, /hakkimizda,
/gizlilik-politikasi, /kullanim-kosullari, /misyon-vizyon, /kalite-politikamiz
```

## i18n — Cookie Tabanli, TR Varsayilan

next-intl **kullanilmaz**. Basit cookie + JSON sozluk sistemi:

- **Sozlukler:** [src/locales/tr.json](src/locales/tr.json) (EN tutuluyor ama aktif degil)
- **Yardimci:** [src/lib/t.ts](src/lib/t.ts) — `t("key", {}, locale?)` cagrisi
- **Locale kaynagi:** `lang` cookie (server'da `cookies()`, client'ta `js-cookie`)
- **Backend locale header:** `x-lang` veya `X-Locale` ile istek atilir (backend `APP_LOCALES=tr` ile yalnizca `tr` kabul eder)

**Cift-locale bug'i yok** — route'larda locale prefix bulunmadigi icin `Link`/`useRouter` dogrudan `next/link` ve `next/navigation`'dan import edilir.

## API Entegrasyonu — Dual Strategy

- **Server Components (SSR):** [src/lib/api-server.ts](src/lib/api-server.ts) — dogrudan axios + locale header
- **Client Components:** [src/lib/base-service.ts](src/lib/base-service.ts) — `useBaseService<T>(route)` TanStack hook'u (findAll, find, findBySlug, create, update, patch, delete) + otomatik 401 refresh kuyruk yonetimi
- **Proxy (dev):** Tarayici istekleri `/api/proxy/*` uzerinden gider ([src/proxy.ts](src/proxy.ts) + Next.js rewrite) — CORS'u atlar. Prod'da dogrudan API.
- **Endpoint sabitleri:** `src/endpoints/api-endpoints.ts`

## State Management

- **Zustand** [src/stores/](src/stores/): `auth-store.ts`, `cart-store.ts`, `recently-viewed-store.ts`, `chat-widget-store.ts`. Gereklilere gore `persist` middleware ile localStorage.
- **TanStack Query v5** [src/lib/query-provider.tsx](src/lib/query-provider.tsx): 10 dk stale, 30 dk gc, window focus'ta refetch kapali.

## Modul Deseni

Feature kodu [src/modules/{feature}/](src/modules/) altinda:
- `*.service.ts` — TanStack Query hook'lari
- `*.type.ts` — TypeScript interface'leri

Mevcut modeller: `address, ai-chat, announcement, articles, auth, banner, cart, chat, checkout, contact, favorites, flash-sale, listing, news, notification, order, popup, profile, site, storage, support, theme, wallet`.

## Dinamik Tema

[src/app/layout.tsx](src/app/layout.tsx) tema renklerini backend `siteSettings`'ten ceker, HEX→HSL cevirir, inline `<style>` enjekte eder. Istemci tarafi [src/components/providers/theme-provider.tsx](src/components/providers/theme-provider.tsx) dinamik guncellemeyi yonetir. Tum renkler `hsl(var(--primary))` pattern'inde (Shadcn/Radix konvansiyonu).

## Environment Variables

`@t3-oss/env-nextjs` + Zod ile dogrulanir ([src/env.mjs](src/env.mjs)):

- `NEXT_PUBLIC_REST_API_ENDPOINT` — Backend API URL (zorunlu, ornek: `http://localhost:8078/api`)
- `NEXT_PUBLIC_SITE_URL` — Frontend URL (zorunlu)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth (opsiyonel)
- `NEXT_PUBLIC_FACEBOOK_APP_ID` — Facebook OAuth (opsiyonel)

## Auth Akisi

Token'lar cookie'de (`access_token` — backend HttpOnly set eder). 401'de [base-service.ts](src/lib/base-service.ts) `/api/v1/auth/refresh`'e refresh atar, bekleyen istekleri kuyrukla tekrar dener. Refresh basarisizsa `/giris` yonlendirmesi.

## Kritik Kurallar

1. **Locale prefix eklenmez** — `/tr/ilan/...` gibi URL **olusturma**. Rotalar direkt Turkce slug.
2. **`lang` cookie TR varsayilan** — backend `APP_LOCALES=tr` ile yalnizca `tr` dondurur; `en.json` sozluk var ama aktif degil.
3. **`@/` path alias** ile cross-module import.
4. **Hardcoded API URL yasak** — her zaman `env.NEXT_PUBLIC_REST_API_ENDPOINT`.
5. **Ana sayfa `Promise.allSettled` ile paralel veri cekmeli** — tek section'in hatasi tum sayfayi dusurmesin.
6. **Shadcn bilesenleri [src/components/ui/](src/components/ui/) altinda.** Yeni bilesen eklemeden once shared-ui paketine tasinabilir mi kontrol et (`@vps/shared-ui` — henuz entegre degil).

## Monorepo Notu

Frontend su an **`@vps/*` paketlerinden import etmiyor**. Faz 1'de `@vps/core` (API fetch) + `@vps/shared-ui` (Shadcn bilesenler + SEO) + `@vps/shared-types` entegrasyonu planlaniyor. Detay: [../CLAUDE.md](../CLAUDE.md), [../strateji.md](../strateji.md).
