# Kamanilan i18n Migration + Shared-Backend Plan

Kamanilan backend'ini `@vps/shared-backend` ortak merkezinden cekecek sekilde yeniden yapilandirma plani.

## Sorun

Kamanilan flat schema kullaniyor (i18n tablosu yok), shared-backend ise i18n pattern (parent + child) kullaniyor. Bu uyumsuzluk nedeniyle shared-backend modulleri kullanilemiyor.

## Cozum

1. Seed SQL dosyalarini i18n pattern'e uyumlu hale getir (sadece `tr` locale)
2. Backend mimarisini guezelwebdesign pattern'ine donustur
3. Local modulleri sil, shared-backend'den cek

---

## Faz 1 — Seed SQL Guncellemeleri (7 tablo)

### 1.1 site_settings (`60_site_settings_schema.sql`)

- [ ] `locale VARCHAR(8) NOT NULL DEFAULT 'tr'` kolonu ekle (`key` kolonundan sonra)
- [ ] UNIQUE constraint: `(key)` → `(key, locale)` olarak degistir
- [ ] Tum INSERT satirlarina `locale` degeri ekle (`'tr'` veya `'*'`)
- [ ] `79_site_settings_seo_seed.sql` — ayni locale ekleme

### 1.2 faqs (`83_faqs.sql`)

- [ ] `faqs` parent tablo: sadece `id, is_active, display_order, created_at, updated_at`
- [ ] `faqs_i18n` child tablo: `id, faq_id FK, locale, question, answer, slug, created_at, updated_at`
- [ ] UNIQUE: `(faq_id, locale)` + `(locale, slug)`
- [ ] Mevcut seed verilerini parent + i18n olarak ikiye bol

### 1.3 reviews (`85_reviews.sql`)

- [ ] `reviews` parent tablo: mevcut + `target_type, target_id, role, company, avatar_url, logo_url, profile_href, likes_count, dislikes_count, helpful_count, submitted_locale` ekle
- [ ] `review_i18n` child tablo: `id, review_id FK, locale, title, comment, admin_reply, created_at, updated_at`
- [ ] `comment` kolonunu parent'tan kaldir, i18n'e tasi
- [ ] Mevcut seed verilerini guncelle (60-63 dosyalari)

### 1.4 slider (`97_slider.sql`)

- [ ] `slider` parent tablo: `id, uuid, image_url, image_asset_id, image2_url, badge_text, badge_color, gradient, featured, is_active, display_order, created_at, updated_at`
- [ ] `slider_i18n` child tablo: `id, slider_id FK, locale, name, slug, description, alt, button_text, button_link`
- [ ] UNIQUE: `(slider_id, locale)` + `(slug, locale)`
- [ ] `191_slider_full_seed.sql` — i18n INSERT'leri ekle

### 1.5 custom_pages (`76_custom_pages_schema.sql`)

- [ ] `custom_pages` parent tablo: `id, module_key, is_published, display_order, featured_image, storage_asset_id, images JSON, storage_image_ids JSON, created_at, updated_at`
- [ ] `custom_pages_i18n` child tablo: `page_id FK, locale, title, slug, content, summary, meta_title, meta_description`
- [ ] UNIQUE: `(locale, slug)`
- [ ] `80_custom_pages_core_seed.sql` + `051_*` dosyalari — i18n INSERT'leri ekle

### 1.6 categories (`50_categories_schema.sql`)

- [ ] `categories` parent tablo: mevcut + `module_key VARCHAR(64)` ekle, `name/slug/description` kaldir
- [ ] `category_i18n` child tablo: `category_id FK, locale, name, slug, description, alt, meta_title, meta_description`
- [ ] UNIQUE: `(slug, locale)`
- [ ] Kamanilan-spesifik kolonlar parent'ta kalsin: `has_cart, is_unlimited, whatsapp_number, phone_number`
- [ ] `51_sub_categories_seed.sql` deki seed'ler de guncellenmeli

### 1.7 sub_categories (`50_categories_schema.sql` icerisinde)

- [ ] `sub_categories` parent tablo: mevcut, `name/slug/description` kaldir
- [ ] `sub_category_i18n` child tablo: `sub_category_id FK, locale, name, slug, description`
- [ ] UNIQUE: `(slug, locale)`
- [ ] Kamanilan-spesifik kolon: `has_cart` parent'ta kalsin

### Zaten Uyumlu (degisiklik yok)

- [x] `menu_items` + `menu_items_i18n` — zaten i18n pattern
- [x] `footer_sections` + `footer_sections_i18n` — zaten i18n pattern

---

## Faz 2 — Backend Mimari (guezelwebdesign pattern)

### 2.1 package.json

- [ ] `@vps/shared-backend: "workspace:*"` ekle
- [ ] `fastify-plugin: "^5.1.0"` ekle
- [ ] `build` script: `fix-esm-extensions.mjs` kaldir

### 2.2 Bootstrap dosyalari

- [ ] `src/app.ts` — guezelwebdesign pattern (cors, cookie, jwt, authPlugin, mysqlPlugin, multipart, staticUploads, registerAllRoutes, errorHandlers)
- [ ] `src/app.helpers.ts` — parseCorsOrigins, pickUploadsRoot, pickUploadsPrefix
- [ ] `src/index.ts` — createApp + listen + startNewsAggregatorCron
- [ ] `src/plugins/staticUploads.ts` — @fastify/static uploads

### 2.3 Route dosyalari

- [ ] `src/routes.ts` — ana router: `/api` → `/v1` → admin + public
- [ ] `src/routes/shared.ts` — @vps/shared-backend modulleri (auth, health, storage, siteSettings, userRoles, notifications, audit, contacts, customPages, mail, emailTemplates, faqs, menuItems, slider, footerSections, reviews, chat, aiChat, popups, announcements, flashSale, orders, wallet, support, coupons, theme, newsletter, telegram + admin karsiliklari)
- [ ] `src/routes/kamanilan.ts` — proje-spesifik (proporties, categories, subcategories, units, variants, listingBrands, listingTags, banner, myListings, articles, news, cart, seller, subscription, integrationSettings, newsAggregator + admin karsiliklari)

### 2.4 Type augmentations

- [ ] `src/types/fastify.d.ts` — MySQLPromisePool, FastifyContextConfig (auth, admin, public, rateLimit)

---

## Faz 3 — Modul Temizligi

### 3.1 Silinecek moduller (shared-backend'den gelecek)

```
auth, userRoles, profiles, storage, notifications, siteSettings,
faqs, review, slider, customPages, menuItems, footerSections,
mail, email-templates, contact, chat, ai_chat, telegram,
popups, announcements, flashSale, theme, orders, wallet,
support, coupons, dashboard, db_admin, newsletter
```

### 3.2 Silinecek ortak dizinler

```
common/middleware/  (requireAuth, requireAdmin → @vps/shared-backend/middleware)
common/utils/       (queryParser, contentRange → @vps/shared-backend/modules/_shared)
```

### 3.3 Kalacak proje-spesifik moduller

```
proporties, categories*, subcategories*, articles, banner, cart,
integrationSettings, listingBrands, listingTags, myListings,
news, newsAggregator, seller, subscription, units, variants,
_shared (aiChain, normalizers, repo-helpers)
```

*categories ve subcategories: shared-backend'de `has_cart`, `is_unlimited`, `whatsapp_number`, `phone_number` kolonlari yok. Bu moduller local kalacak ama i18n tablolarini kullanacak.

### 3.4 Import guncellemeleri (proje-spesifik modullerde)

| Eski import | Yeni import |
|-------------|-------------|
| `@/common/middleware/auth` | `@vps/shared-backend/middleware/auth` |
| `@/common/middleware/roles` | `@vps/shared-backend/middleware/roles` |
| `@/common/middleware/permissions` | `@vps/shared-backend/middleware/permissions` |
| `@/modules/siteSettings/schema` | `@vps/shared-backend/modules/siteSettings/schema` |
| `@/modules/siteSettings/service` | `@vps/shared-backend/modules/siteSettings/service` |
| `@/modules/storage/schema` | `@vps/shared-backend/modules/storage/schema` |
| `@/modules/storage/repository` | `@vps/shared-backend/modules/storage/repository` |
| `@/modules/storage/cloudinary` | `@vps/shared-backend/modules/storage/cloudinary` |
| `@/modules/storage/util` | `@vps/shared-backend/modules/storage/util` |
| `@/modules/auth/schema` | `@vps/shared-backend/modules/auth/schema` |
| `@/modules/profiles/schema` | `@vps/shared-backend/modules/profiles/schema` |
| `@/modules/flashSale/repository` | `@vps/shared-backend/modules/flashSale/repository` |
| `@/modules/notifications/schema` | `@vps/shared-backend/modules/notifications/schema` |
| `@/modules/telegram/telegram.notifier` | `@vps/shared-backend/modules/telegram/helpers/telegram.notifier` |

### 3.5 proporties/local-schemas.ts guncelleme

categories ve subcategories artik i18n olacak ama proporties modulu `has_cart`, `name` gibi kamanilan-spesifik kolonlara ihtiyac duyuyor. `local-schemas.ts`'de flat schema tutulacak (runtime'da tablo SELECT'leri icin).

---

## Faz 4 — Test

### 4.1 Build

- [ ] `bun run build` → 0 hata

### 4.2 Database

- [ ] `bun run db:seed` → tum tablolar olusur, i18n verileri yuklenir
- [ ] site_settings'te `locale` kolonu var
- [ ] faqs_i18n, review_i18n, slider_i18n, custom_pages_i18n, category_i18n, sub_category_i18n tablolari olusmus
- [ ] Mevcut veriler `locale='tr'` ile i18n tablolarina kopyalanmis

### 4.3 Endpoint'ler

Tum endpointler 200 donmeli:

```
categories, sub-categories, site_settings, sliders, properties,
popups, menu_items, footer_sections, flash-sale, theme, faqs,
reviews, custom_pages, cart_items, announcements, articles,
news/feed, auth/status, health
```

### 4.4 Frontend

- [ ] `next.config.ts` proxy: `/api/proxy/:path*` → `${apiUrl}/v1/:path*`
- [ ] `admin_panel/next.config.mjs`: `/api/:path*` → `${base}/api/v1/:path*`
- [ ] Frontend restart sonrasi tum sayfalar hatasiz yuklenme
- [ ] Favicon, logo dogru gorunme
- [ ] Console'da `href=""` hatasi yok

---

## Dosya Listesi (Dokunulacak)

### Seed SQL (Faz 1)

| # | Dosya | Islem |
|---|-------|-------|
| 1 | `src/db/seed/sql/50_categories_schema.sql` | Yeniden yaz (parent + category_i18n + sub_category_i18n) |
| 2 | `src/db/seed/sql/51_sub_categories_seed.sql` | Yeniden yaz (parent + i18n INSERT) |
| 3 | `src/db/seed/sql/60_site_settings_schema.sql` | locale kolonu ekle, INSERT'lere locale ekle |
| 4 | `src/db/seed/sql/76_custom_pages_schema.sql` | Yeniden yaz (parent + i18n CREATE) |
| 5 | `src/db/seed/sql/79_site_settings_seo_seed.sql` | INSERT'lere locale ekle |
| 6 | `src/db/seed/sql/80_custom_pages_core_seed.sql` | i18n INSERT ekle |
| 7 | `src/db/seed/sql/051_*_custom_pages_*.sql` (6 dosya) | i18n INSERT ekle |
| 8 | `src/db/seed/sql/83_faqs.sql` | Yeniden yaz (parent + faqs_i18n) |
| 9 | `src/db/seed/sql/85_reviews.sql` | Yeniden yaz (parent + review_i18n) |
| 10 | `src/db/seed/sql/060_reviews_*.sql` (3 dosya) | i18n INSERT ekle |
| 11 | `src/db/seed/sql/97_slider.sql` | Yeniden yaz (parent + slider_i18n) |
| 12 | `src/db/seed/sql/191_slider_full_seed.sql` | i18n INSERT ekle |

### Backend Mimari (Faz 2)

| # | Dosya | Islem |
|---|-------|-------|
| 13 | `package.json` | Guncelle |
| 14 | `src/app.ts` | Yeniden yaz |
| 15 | `src/app.helpers.ts` | Yeni olustur |
| 16 | `src/index.ts` | Yeniden yaz |
| 17 | `src/routes.ts` | Yeni olustur |
| 18 | `src/routes/shared.ts` | Yeni olustur |
| 19 | `src/routes/kamanilan.ts` | Yeni olustur |
| 20 | `src/plugins/staticUploads.ts` | Yeni olustur |
| 21 | `src/types/fastify.d.ts` | Guncelle |

### Modul Temizligi (Faz 3)

| # | Islem |
|---|-------|
| 22 | 29 shared modul dizini sil |
| 23 | `common/` dizini sil |
| 24 | Proje-spesifik modullerdeki import'lari guncelle |
| 25 | `proporties/local-schemas.ts` guncelle |

### Frontend (Faz 4)

| # | Dosya | Islem |
|---|-------|-------|
| 26 | `frontend/next.config.ts` | Proxy: `/v1/` prefix ekle |
| 27 | `admin_panel/next.config.mjs` | Proxy: `/v1/` prefix ekle |
