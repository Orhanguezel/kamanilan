# Toplu Import — Mimari Tasarim

> **Hedef:** Emlakcinin elindeki ilan datasini (Excel/CSV veya Sahibinden-uyumlu XML) kamanilan'a saniyeler icinde aktarmak. Strateji blocker'i bu: altyapi hazir olmadan emlakci "tek tek gir" denince kacar.
>
> **Bu dokuman:** Codex'in implement edecegi mimari + API kontratlari + DB semasi. Claude Code tasarlar, Codex yazar, Antigravity dogrular.

---

## 1. Kapsam

Uc bilesen gelistirilecek:

1. **Excel/CSV Toplu Import** — tek seferlik batch yuklama + on-izleme + onayli commit
2. **Sahibinden-Uyumlu XML Feed** — periyodik cekim + diff + upsert
3. **ZIP Foto Eslestirme** — dosya adi ile ilan eslestirme + Cloudinary'e toplu yukleme

Hepsi **admin panel** ustunden yonetilir; emlakci hesabi `seller_id` ile scope'lanir. Subscription plan limiti toplu import'ta da gecerlidir.

---

## 2. Mevcut Altyapi (Dokunulmaz)

Hazır:

- [properties](../backend/src/modules/proporties/schema.ts) tablosu — ilan ana kaydi (slug unique, status, city/district, lat/lng, price, featured, image_url/image_asset_id)
- [property_assets](../backend/src/modules/proporties/schema.ts) — ilan fotograflari (is_cover, display_order)
- [property_tag_links](../backend/src/modules/proporties/schema.ts), [listingBrands](../backend/src/modules/listingBrands/schema.ts), [listingTags](../backend/src/modules/listingTags/schema.ts) — taksonomi
- [seller_stores](../backend/src/modules/seller/schema.ts) — emlakci magazasi
- [subscription_plans, user_subscriptions](../backend/src/modules/subscription/schema.ts) — plan + aktif abonelik
- [integration_settings](../backend/src/modules/integrationSettings/service.ts) — `site_settings` tablosunda `integration.<provider>.<field>` prefix key yapisi (secret alanlar maskelenir)
- `@vps/shared-backend/modules/storage/router.ts` — `POST /storage/:bucket/upload` Cloudinary upload endpoint (multipart)
- [newsAggregator/cron.ts](../backend/src/modules/newsAggregator/cron.ts) — **pattern reference**: setInterval tabanli cron, SIGTERM/SIGINT ile temiz kapanis, `app.ts` startup'ta cagrilir
- Admin create flow: `createPropertyAdmin` → `replacePropertyAssets` + `replacePropertyTagLinks` + `replaceVariantValues` — **import'ta bu fonksiyonlari yeniden kullan**

**Kritik kural — project CLAUDE.md**: `ALTER TABLE` yasak. Yeni tablolari `0XX_*_schema.sql` seed dosyasina `CREATE TABLE` olarak ekle, `db:seed:fresh` ile DB sıfırdan kur.

---

## 3. Yeni DB Semasi

Seed dosyasi: `src/db/seed/sql/110_imports_schema.sql`

### 3.1 Excel/CSV Import Tablolari

```sql
-- Her upload bir job
CREATE TABLE import_jobs (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,
  seller_id     CHAR(36),
  source_type   VARCHAR(16) NOT NULL,   -- excel | csv
  file_name     VARCHAR(255) NOT NULL,
  file_size     INT UNSIGNED NOT NULL,
  status        VARCHAR(24) NOT NULL,   -- pending | parsed | review | importing | completed | failed
  total_rows    INT UNSIGNED DEFAULT 0,
  valid_rows    INT UNSIGNED DEFAULT 0,
  invalid_rows  INT UNSIGNED DEFAULT 0,
  imported_count INT UNSIGNED DEFAULT 0,
  mapping_json  JSON,                   -- emlakcinin kolon eslestirmesi
  errors_json   JSON,                   -- genel hata / warning listesi
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  started_at    DATETIME(3),
  finished_at   DATETIME(3),
  INDEX idx_import_jobs_user (user_id),
  INDEX idx_import_jobs_status (status),
  INDEX idx_import_jobs_created (created_at)
);

-- Her satir ayri bir item
CREATE TABLE import_job_items (
  id           CHAR(36) PRIMARY KEY,
  job_id       CHAR(36) NOT NULL,
  row_index    INT UNSIGNED NOT NULL,
  raw_json     JSON NOT NULL,          -- ham parse edilmis satir
  normalized_json JSON,                -- validation sonrasi normalize
  property_id  CHAR(36),               -- insert edildiyse
  status       VARCHAR(16) NOT NULL,   -- valid | invalid | imported | skipped | failed
  errors_json  JSON,
  photo_filenames_json JSON,           -- ZIP ile eslestirme icin ["a.jpg","b.jpg"]
  UNIQUE KEY ux_job_row (job_id, row_index),
  INDEX idx_items_job (job_id),
  INDEX idx_items_status (status),
  CONSTRAINT fk_items_job FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

-- Emlakcinin onceki mapping'i (UX: bir daha sorma)
CREATE TABLE import_column_mappings (
  id           CHAR(36) PRIMARY KEY,
  seller_id    CHAR(36) NOT NULL,
  source_type  VARCHAR(16) NOT NULL,
  name         VARCHAR(80) NOT NULL,   -- emlakci etiketi (ornek: "Sahibinden Export")
  mapping_json JSON NOT NULL,
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY ux_mapping_seller_name (seller_id, name)
);
```

### 3.2 XML Feed Tablolari

```sql
-- Emlakcinin XML feed konfigurasyonu
CREATE TABLE xml_feeds (
  id                CHAR(36) PRIMARY KEY,
  seller_id         CHAR(36),
  user_id           CHAR(36) NOT NULL,
  name              VARCHAR(120) NOT NULL,
  url               VARCHAR(500) NOT NULL,
  format            VARCHAR(32) NOT NULL DEFAULT 'sahibinden',  -- sahibinden | generic
  auth_header_name  VARCHAR(80),                  -- opsiyonel (ornek: "X-API-Key")
  auth_header_value VARCHAR(500),                 -- secret (service layer mask eder)
  interval_minutes  INT UNSIGNED NOT NULL DEFAULT 240,   -- 4 saat
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  last_fetched_at   DATETIME(3),
  last_status       VARCHAR(24),                  -- success | http_error | parse_error | partial
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_xml_feeds_user (user_id),
  INDEX idx_xml_feeds_active (is_active)
);

-- Her cekim denemesi
CREATE TABLE xml_feed_runs (
  id             CHAR(36) PRIMARY KEY,
  feed_id        CHAR(36) NOT NULL,
  started_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  finished_at    DATETIME(3),
  status         VARCHAR(24) NOT NULL,
  items_found    INT UNSIGNED DEFAULT 0,
  items_added    INT UNSIGNED DEFAULT 0,
  items_updated  INT UNSIGNED DEFAULT 0,
  items_skipped  INT UNSIGNED DEFAULT 0,
  items_failed   INT UNSIGNED DEFAULT 0,
  errors_json    JSON,
  INDEX idx_runs_feed (feed_id),
  CONSTRAINT fk_runs_feed FOREIGN KEY (feed_id) REFERENCES xml_feeds(id) ON DELETE CASCADE
);

-- Item seviyesi takip — idempotency + diff icin
CREATE TABLE xml_feed_items (
  id            CHAR(36) PRIMARY KEY,
  feed_id       CHAR(36) NOT NULL,
  external_id   VARCHAR(120) NOT NULL,    -- sahibinden ilan id'si
  property_id   CHAR(36),                  -- bizim DB'deki kayit
  last_hash     CHAR(64),                  -- SHA-256 — icerik degisti mi?
  last_seen_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  status        VARCHAR(16) NOT NULL,      -- active | stale | deleted
  UNIQUE KEY ux_feed_external (feed_id, external_id),
  INDEX idx_items_feed (feed_id),
  INDEX idx_items_property (property_id),
  CONSTRAINT fk_feed_items_feed FOREIGN KEY (feed_id) REFERENCES xml_feeds(id) ON DELETE CASCADE
);

-- Kategori mapping — XML'deki "Daire > 2+1" bizim local kategori/subkategoriye
CREATE TABLE xml_feed_category_map (
  id                 CHAR(36) PRIMARY KEY,
  feed_id            CHAR(36) NOT NULL,
  external_category  VARCHAR(200) NOT NULL,
  local_category_id  CHAR(36),
  local_subcategory_id CHAR(36),
  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY ux_feed_external_cat (feed_id, external_category),
  CONSTRAINT fk_cat_map_feed FOREIGN KEY (feed_id) REFERENCES xml_feeds(id) ON DELETE CASCADE
);
```

### 3.3 Foto Indirme Kuyrugu

```sql
CREATE TABLE photo_download_queue (
  id             CHAR(36) PRIMARY KEY,
  property_id    CHAR(36) NOT NULL,
  source         VARCHAR(24) NOT NULL,     -- xml_feed | excel_import
  source_ref_id  CHAR(36),                 -- feed_id veya job_id
  source_url     VARCHAR(1000) NOT NULL,
  display_order  INT NOT NULL DEFAULT 0,
  is_cover       TINYINT(1) DEFAULT 0,
  alt_text       VARCHAR(255),
  status         VARCHAR(16) NOT NULL DEFAULT 'pending',  -- pending | downloading | done | failed
  retry_count    TINYINT UNSIGNED DEFAULT 0,
  last_error     VARCHAR(500),
  asset_id       CHAR(36),                 -- download sonrasi storage_assets.id
  created_at     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processed_at   DATETIME(3),
  INDEX idx_queue_status (status, retry_count),
  INDEX idx_queue_property (property_id)
);
```

---

## 4. Modul Yapisi

Yeni backend modulleri (proje-spesifik, lokal kalir — shared'e tasinmaz):

```
backend/src/modules/
  imports/                  # Excel/CSV import
    schema.ts               # Drizzle tablolari
    parser.ts               # xlsx + csv-parse
    validator.ts            # row-level Zod + taxonomy lookup
    repository.ts           # job/item CRUD
    admin.controller.ts     # upload/mapping/preview/commit
    admin.routes.ts
    index.ts
  xmlFeeds/                 # XML feed
    schema.ts
    parser.ts               # fast-xml-parser + sahibinden schema
    fetcher.ts              # HTTP GET + parse + diff + upsert
    cron.ts                 # setInterval worker
    admin.controller.ts
    admin.routes.ts
    index.ts
  photoQueue/               # Fotograf indirme
    schema.ts
    downloader.ts           # fetch URL → Cloudinary upload → storage_assets
    cron.ts                 # queue isleyici
    admin.routes.ts         # (opsiyonel) status endpoint
    index.ts
```

Route kayit: [routes/kamanilan.ts](../backend/src/routes/kamanilan.ts) dosyasina 3 yeni modul eklenir.

App startup: [app.ts](../backend/src/app.ts) dosyasina `startXmlFeedCron()` ve `startPhotoDownloadCron()` cagrilari eklenir (mevcut `startNewsAggregatorCron()` yaninda).

---

## 5. API Kontratlari

### 5.1 Excel/CSV Import Endpoint'leri

Base: `/api/v1/admin/imports`  
Auth: `requireAuth + requireAdmin + makeAdminPermissionGuard('admin.imports')`  
Scope: `user_id = req.user.id` veya seller_id uzerinden

#### `POST /admin/imports/upload`

**Body:** `multipart/form-data` — `file` alani (xlsx veya csv, max 10MB)

**Response 201:**
```json
{
  "job_id": "uuid",
  "status": "pending",
  "file_name": "ilanlar.xlsx",
  "detected_columns": ["Baslik","Fiyat","Sehir","Ilce","m2","Oda","Foto"],
  "preview_rows": [ /* ilk 5 satir ham */ ]
}
```

**Davranis:**
- Dosya boyutu/uzantisi kontrolu
- xlsx → ilk sheet; csv → UTF-8 BOM tolere
- Parse hatasi → `status=failed`, 400 + error detay
- Basarida `status=parsed`, kolon adlari ve ilk 5 satir preview

#### `PUT /admin/imports/:job_id/mapping`

**Body:**
```json
{
  "mapping": {
    "title": "Baslik",
    "price": "Fiyat",
    "currency": "TRY",
    "city": "Sehir",
    "district": "Ilce",
    "neighborhood": "Mahalle",
    "address": "Adres",
    "description": "Aciklama",
    "category_slug": "Kategori",
    "sub_category_slug": "Alt Kategori",
    "status": "Durum",
    "external_id": "Ilan No",
    "photos": "Foto"
  },
  "save_as": "Sahibinden Export"  // opsiyonel, mapping kaydet
}
```

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "review",
  "total_rows": 187,
  "valid_rows": 172,
  "invalid_rows": 15,
  "preview": {
    "valid_sample": [ /* ilk 5 normalize edilmis satir */ ],
    "invalid_sample": [
      {"row_index": 12, "errors": ["invalid_price","missing_city"]}
    ]
  }
}
```

**Davranis:**
- Her satir icin `validator.validateRow()` → Zod schema + taxonomy lookup
- `import_job_items` satirlari insert (raw_json + normalized_json + errors_json)
- Kategori/subcategory slug'lari `categories.slug` ile lookup; bulunmazsa error

#### `GET /admin/imports/:job_id`

**Response 200:** job durumu + istatistik

#### `GET /admin/imports/:job_id/items?status=invalid&limit=50&offset=0`

**Response 200:** item listesi (paginated)

#### `POST /admin/imports/:job_id/commit`

**Body:**
```json
{
  "skip_invalid": true,
  "default_status": "draft"
}
```

**Response 202:**
```json
{ "job_id": "uuid", "status": "importing", "estimated_count": 172 }
```

**Davranis:**
- Subscription plan limitini kontrol: `getActiveListingsCount(userId) + valid_rows <= plan.max_active_listings`
  - Limit asildi → `402 Payment Required`, upgrade mesaji
- Valid item'lar icin `createPropertyAdmin` mantigini yeniden kullan:
  - Her insert ayri transaction (tek satir hatasi diger hic birini dusurmesin)
  - Slug uniqueness carpismasi → `-2`, `-3` suffix ile coz
- Her item icin `photo_download_queue`'ya `photos` URL'leri eklenir
- Job `completed` veya `failed` statusune gecer

#### `POST /admin/imports/:job_id/photos-zip`

**Body:** `multipart/form-data` — `file` (zip, max 100MB)  
Yalnizca `status=review` veya `completed` job'larda gecerli.

**Response 202:** queue'ya N foto eklendi.

#### `GET /admin/imports`

**Query:** `status`, `limit`, `offset`  
**Response:** emlakciye ait job listesi.

### 5.2 XML Feed Endpoint'leri

Base: `/api/v1/admin/xml-feeds`

#### CRUD (standart)

- `GET /admin/xml-feeds` — liste (emlakciye ait)
- `POST /admin/xml-feeds` — yeni feed (url + interval + format + optional auth)
- `GET /admin/xml-feeds/:id` — detay (auth_header_value **maskelenir**)
- `PATCH /admin/xml-feeds/:id` — guncelle
- `DELETE /admin/xml-feeds/:id` — sil (runs + items cascade)

#### `POST /admin/xml-feeds/:id/run`

Manuel tetikleme — cron'u beklemeden hemen cekim baslatir.

**Response 202:**
```json
{ "run_id": "uuid", "status": "started" }
```

#### `GET /admin/xml-feeds/:id/runs`

Son 50 run — istatistik + hata ozetleri.

#### `GET /admin/xml-feeds/:id/category-map`  /  `PUT /admin/xml-feeds/:id/category-map`

XML'den gelen "Daire > 2+1 Satilik" string'lerini local kategori ID'sine esle. Ilk run'dan sonra bilinmeyen kategoriler `property.status='unmapped'` olarak durur, admin bu ekranda eslesitirir.

### 5.3 Foto Queue (Opsiyonel Admin Gorunumu)

- `GET /admin/photo-queue?status=failed` — basarisiz olanlari gor
- `POST /admin/photo-queue/:id/retry` — manuel retry

---

## 6. XML Parser Kontrati (Sahibinden Format)

**Karar:** Sprint 3'te **yalnizca `sahibinden` formati** desteklenir. Generic/emlakjet/hepsiemlak adaptorleri ileriki bir sprint'te, talep gelince eklenir. Veritabanindaki `xml_feeds.format` kolonu hazirlikli — yeni adaptor plug-in eklemek tek dosya (`parser.ts`'e yeni fonksiyon + format switch).

Kabul edilen XML yapisi (yaygin sahibinden export seması):

```xml
<realty>
  <item>
    <id>12345</id>
    <title>3+1 Satilik Daire Kaman Merkez</title>
    <description><![CDATA[...]]></description>
    <price currency="TRY">1850000</price>
    <city>Kirsehir</city>
    <district>Kaman</district>
    <neighborhood>Cumhuriyet</neighborhood>
    <address>Cumhuriyet Mah. 123. Sok.</address>
    <category>Konut</category>
    <sub_category>Daire / 3+1</sub_category>
    <area>120</area>
    <rooms>3+1</rooms>
    <status>active</status>
    <photos>
      <photo order="1"><url>https://.../1.jpg</url></photo>
      <photo order="2"><url>https://.../2.jpg</url></photo>
    </photos>
    <updated_at>2026-04-10T14:30:00+03:00</updated_at>
  </item>
  <item>...</item>
</realty>
```

**Parser adaptoru:** `parser.ts` icinde `parseSahibindenXml(xml: string): ParsedFeedItem[]` fonksiyonu. Diger formatlar (generic/emlakjet) icin ayri adaptor eklenebilir — `format` alanina gore secim.

**Hash hesaplama:** `SHA-256(JSON.stringify(normalizedItem))` — degisiklik yoksa atla.

---

## 7. Cron Pattern

[newsAggregator/cron.ts](../backend/src/modules/newsAggregator/cron.ts) birebir kopyalanir:

```typescript
// modules/xmlFeeds/cron.ts
const FEED_POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 dk — her feed kendi interval_minutes'inu yonetir

export function startXmlFeedCron() {
  // setTimeout ile 60sn sonra ilk run
  // setInterval ile 5 dk'da bir "fetch-due-feeds" kontrolu
  //   - xml_feeds WHERE is_active=1 AND (last_fetched_at IS NULL OR last_fetched_at + interval_minutes < NOW())
  //   - Her biri icin fetcher.run(feed)
}
```

```typescript
// modules/photoQueue/cron.ts
const QUEUE_POLL_INTERVAL_MS = 30 * 1000; // 30 sn
const BATCH_SIZE = 5;  // paralel 5 foto

export function startPhotoDownloadCron() {
  // setInterval: status='pending' AND retry_count < 3 LIMIT 5
  // Her biri icin: URL'den fetch → Buffer → storage.uploadToBucket → property_assets insert
}
```

Startup: [app.ts:83](../backend/src/app.ts#L83) `startNewsAggregatorCron()` yanina eklenir.

---

## 8. Subscription — Acilis Donemi Stratejisi

### 8.1 Karar: Launch Faz = Her Sey Ucretsiz

Kamanilan yeni acildi. Kullanicilar kacinilmasin, ozellikler acik olmali. Mevcut 3-plan yapisi ([87_subscription_schema.sql:69-74](../backend/src/db/seed/sql/87_subscription_schema.sql#L69)) korunur ama **launch faz'i icin `free` plan'inin feature degerleri genisletilir**. Paid planlar (Temel 149 TL, Pro 349 TL) seed'de zaten var ama kimseye atanmaz — monetization gununde tek satir seed update ile `free` plan'i kisitlayip kullanicilari uygun plana yonlendiririz.

### 8.2 Pricing Tablosu

| Plan | Launch Degeri | Monetization Sonrasi |
|------|---------------|----------------------|
| **Ucretsiz** (default) | Sinirsiz ilan + import + XML feed | 3 ilan, 30 gun, import/XML yok |
| **Temel** (149 TL/ay, 990 TL/yil) | (kimse atanmaz) | 50 ilan, 60 gun, import acik, XML yok |
| **Pro** (349 TL/ay, 2990 TL/yil) | (kimse atanmaz) | Sinirsiz ilan, import+XML, 50 foto, video, one cikarma |

### 8.3 Feature Key'leri (subscription_plan_features)

Seed update — [87_subscription_schema.sql](../backend/src/db/seed/sql/87_subscription_schema.sql) dosyasina yeni `INSERT` satirlari eklenir (ALTER yok, schema DROP/CREATE-based):

```sql
-- Ucretsiz (id=1) — LAUNCH DEFAULTS
(1, 'max_active_listings',    '-1',    1),   -- degisti: 2 → -1
(1, 'listing_duration_days',  '-1',    1),   -- degisti: 30 → -1
(1, 'can_add_video',          'true',  1),   -- degisti: false → true
(1, 'can_feature_listing',    'false', 1),   -- ayni (gelir kaynagi, launch'ta da kapali)
(1, 'can_boost_listing',      'false', 1),   -- ayni
(1, 'bulk_import_enabled',    'true',  1),   -- YENI
(1, 'xml_feed_enabled',       'true',  1),   -- YENI
(1, 'max_photos_per_listing', '20',    1),   -- YENI

-- Temel (id=2) — HAZIR AMA KIMSEYE ATANMIYOR
(2, 'max_active_listings',    '50',    1),   -- degisti: 15 → 50
(2, 'listing_duration_days',  '60',    1),
(2, 'can_add_video',          'false', 1),
(2, 'can_feature_listing',    'false', 1),
(2, 'can_boost_listing',      'false', 1),
(2, 'bulk_import_enabled',    'true',  1),   -- YENI — import bu plandan
(2, 'xml_feed_enabled',       'false', 1),   -- YENI — XML Pro'ya ozel
(2, 'max_photos_per_listing', '15',    1),   -- YENI

-- Pro (id=3)
(3, 'max_active_listings',    '-1',    1),
(3, 'listing_duration_days',  '-1',    1),
(3, 'can_add_video',          'true',  1),
(3, 'can_feature_listing',    'true',  1),
(3, 'can_boost_listing',      'true',  1),
(3, 'bulk_import_enabled',    'true',  1),   -- YENI
(3, 'xml_feed_enabled',       'true',  1),   -- YENI
(3, 'max_photos_per_listing', '50',    1);   -- YENI
```

**Monetization gununde:** Tek is `free` plan'in 3 satirini guncelemek (`max_active_listings: 3`, `listing_duration_days: 30`, `bulk_import_enabled: false`, `xml_feed_enabled: false`, `max_photos_per_listing: 5`) + kullanicilari Iyzipay ile Temel/Pro'ya yonlendirmek.

### 8.4 `subscription/helpers.ts` (Yeni Dosya)

```typescript
export async function getUserPlanFeature(
  userId: string,
  key: string
): Promise<string | null>;

export async function getActiveListingsCount(userId: string): Promise<number>;

// max_active_listings = "-1" ise limit yok
export async function canImportMore(userId: string, count: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number | null;  // null = sinirsiz
  overage: number;
}>;

// feature_value === "true" iff enabled
export async function hasFeature(
  userId: string,
  key: 'bulk_import_enabled' | 'xml_feed_enabled' | 'can_add_video' | ...
): Promise<boolean>;
```

### 8.5 Enforcement Noktalari

| Endpoint | Kontrol |
|----------|---------|
| `POST /admin/imports/upload` | `hasFeature(userId, 'bulk_import_enabled')` — yoksa 403 + upgrade mesaji |
| `POST /admin/imports/:id/commit` | `canImportMore(userId, valid_rows)` — asildi → 402 + "ilk N'yi import edelim" opsiyonu |
| `POST /admin/xml-feeds` | `hasFeature(userId, 'xml_feed_enabled')` — yoksa 403 |
| `POST /my/listings` (tekli) | `canImportMore(userId, 1)` |
| ZIP foto upload | per-ilan `max_photos_per_listing` kontrolu |

**Launch faz'da:** Tum bu kontroller calisir ama Ucretsiz plan'in feature degerleri sinirsiz oldugu icin **hic bir kullanici engellenmez**. Altyapi hazir, monetization gununde seed update yeter.

---

## 9. Paketler

[backend/package.json](../backend/package.json) dependencies eklenmeli:

```jsonc
{
  "dependencies": {
    "xlsx": "^0.18.5",           // Excel parse
    "papaparse": "^5.4.1",       // CSV parse (veya csv-parse)
    "fast-xml-parser": "^4.5.0", // XML parse
    "adm-zip": "^0.5.16"         // ZIP unpack
  }
}
```

Not: `exceljs` daha kapsamli ama `xlsx` (SheetJS community) daha hafif ve Bun-uyumlu. Import icin `xlsx` yeterli.

---

## 10. Frontend (Admin Panel) Ekranlari

Codex + Antigravity gelistirecek — bu dokumanda spec:

### 10.1 `/admin/imports` — Toplu Import Ekrani

**Adim 1:** Drag-drop dosya yukleme (xlsx/csv)  
**Adim 2:** Kolon eslestirme — sol tarafa dosyadan gelen kolonlar, saga bizim alanlar; dropdown ile esle. Ontanimli mapping secimi varsa "Sahibinden Export" gibi kayitli template'lerden sec.  
**Adim 3:** On-izleme — "187 satir: 172 gecerli, 15 hatali". Hatalari tablo ile goster; kullanici "Hatali olanlari atla, gecerli 172'yi import et" butonu.  
**Adim 4:** Commit — progress bar + final rapor.  
**Adim 5:** ZIP foto upload (opsiyonel).

Bilesen: `@vps/shared-ui/admin/data-table` entegre edildiginde kolay kullanılır (Faz 1 sonrasi). Su an kendi shadcn Table bilesenleriyle.

### 10.2 `/admin/xml-feeds` — XML Feed Yonetimi

**Liste:** feed'ler + son cekim durumu + manuel tetikle butonu  
**Detay:** feed config + son 10 run + kategori mapping ekrani  
**Ekle/Duzenle:** URL, interval, auth (opsiyonel), format secimi

### 10.3 Ilan Verme Ekranina "Import'tan Ekle" CTA

Emlakciya "Elinde XML var mi? Bir sefer ekle, her gun otomatik cekelim" sticky banner.

---

## 11. Implementasyon Sirasi (Codex)

**Sprint 1 — DB + Paketler (1 gun)**
- [ ] `110_imports_schema.sql` + `111_xml_feeds_schema.sql` + `112_photo_queue_schema.sql` olustur
- [ ] `bun add xlsx papaparse fast-xml-parser adm-zip`
- [ ] Drizzle schema dosyalari (`modules/imports/schema.ts`, `modules/xmlFeeds/schema.ts`, `modules/photoQueue/schema.ts`)
- [ ] `bun run build && bun run db:seed:fresh` — dogrula

**Sprint 2 — Excel/CSV Import (2-3 gun)**
- [ ] `modules/imports/parser.ts` — xlsx + csv reader
- [ ] `modules/imports/validator.ts` — Zod + kategori/slug lookup + slug generator (TR karakterler → ascii, collision suffix)
- [ ] `modules/imports/repository.ts` — job/item CRUD
- [ ] `modules/imports/admin.controller.ts` — 7 endpoint
- [ ] `modules/imports/admin.routes.ts` + `index.ts`
- [ ] [routes/kamanilan.ts](../backend/src/routes/kamanilan.ts)'e register
- [ ] Admin UI (Antigravity dogrulamasi)

**Sprint 3 — XML Feed (2-3 gun)**
- [ ] `modules/xmlFeeds/parser.ts` — sahibinden adapter
- [ ] `modules/xmlFeeds/fetcher.ts` — HTTP + parse + diff + upsert
- [ ] `modules/xmlFeeds/cron.ts` — interval worker
- [ ] `modules/xmlFeeds/admin.controller.ts` + routes
- [ ] [app.ts](../backend/src/app.ts) startup call
- [ ] Admin UI

**Sprint 4 — Foto Queue (1-2 gun)**
- [ ] `modules/photoQueue/downloader.ts` — fetch → Cloudinary upload
- [ ] `modules/photoQueue/cron.ts`
- [ ] Admin UI (opsiyonel queue gorunum)

**Sprint 5 — Subscription Enforcement (0.5 gun)**
- [ ] `modules/subscription/helpers.ts` — `hasFeature`, `canImportMore`, `getActiveListingsCount`
- [ ] 5 enforcement noktasina helper call ekle (bkz. §8.5)
- [ ] [87_subscription_schema.sql](../backend/src/db/seed/sql/87_subscription_schema.sql) seed update — Ucretsiz launch defaults (max_active_listings=-1, bulk_import_enabled=true, xml_feed_enabled=true, max_photos_per_listing=20)
- [ ] `db:seed:fresh` ile dogrula

**Toplam tahmin:** 7-10 gun (1 full-time developer).

---

## 12. Risk & Edge Case Listesi

| Risk | Hafifletme |
|------|------------|
| Emlakci buyuk XLSX (10k satir) yukler → memory patlar | `xlsx` stream mode + `total_rows > 5000` durumunda paralel 500'luk chunk |
| Sahibinden XML formati emlakciya gore degisir | `format` kolonu — yeni adaptor `parser.ts`'e plug-in; `detected_format` fallback ile best-effort |
| Cloudinary 429 (rate limit) | `photoQueue` retry_count 3 + exponential backoff (10s, 60s, 300s) |
| Import sirasinda backend restart | `status=importing` job'lar startup'ta `status=review` geri alinir; kullanici yeniden commit etsin |
| Slug collision | Validator slug generator `-2`, `-3` suffix dener |
| Kategori XML'de yok / yeni | `property.status='unmapped'`, `category_id=NULL` → admin `xml_feed_category_map` ekranindan eslestirir |
| Ayni XML feed uzun parse | HTTP timeout 60sn + stream parse; feed max 5000 item/run |
| KVKK — XML'de telefon/email | Validator opsiyonel `strip_pii: true` — aciklamadan kisisel veri regex temizligi |
| Import commit'te subscription limit asildi | 402 + upgrade CTA + "ilk N tanesini import edelim, gerisini upgrade sonrasi" opsiyonu |

---

## 13. Test Plani

**Backend:**
- Unit: parser (Excel/CSV/XML — ornek dosyalar `__fixtures__/` altinda)
- Integration: upload → mapping → commit akisi (Vitest)
- Subscription limit testi — farkli planlarla

**E2E (manuel veya Playwright):**
- Gercek sahibinden XML'iyle bir feed ekle, run tetikle, ilanlarin properties tablosunda oldugunu dogrula
- Foto kuyrugu temizlendikten sonra `property_assets` dolu mu

**Yuk testi:**
- 1000 satirlik XLSX ile commit — bellek ve DB yazma suresi olc

---

## 14. Monorepo Notu

Bu moduller **kamanilan-ozgu** (emlak bootstrap). Baska projeler de toplu ilan import isterse, ilerleyen donemde `@vps/shared-backend/modules/imports` seklinde generic'lestirilebilir — su an **erken abstraction yapma**, kamanilan'a ozel kalsin.

Faz 1'den sonra (frontend paket entegrasyonu) import ekrani `@vps/shared-ui/admin/data-table` uzerine oturacak. Su an kendi shadcn Table'iyla yapilmali.

---

## 15. Yapilmayacaklar (netlik)

- **Scrape** — sahibinden/hepsiemlak/emlakjet'ten kopya ilan cekme (KVKK + telif + dava riski, [ilan-bootstrap-plani.md:13](../ilan-bootstrap-plani.md#L13))
- **Sahte ilan seed** — gercek olmayan ilanla vitrin doldurma (ilk kullanici kacar)
- **Emlakci hesabi olmadan import** — her import bir `user_id`'ye bagli olmak zorunda
- **Fotograflari base64 inline yukleme** — her zaman multipart veya URL
