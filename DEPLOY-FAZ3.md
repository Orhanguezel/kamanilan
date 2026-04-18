# Faz 3 Deploy Rehberi — Kamanilan

Bu rehber, **Faz 2 backend** (imports + xmlFeeds + photoQueue) + **Faz 3 frontend** (SEO + GEO + landing pages + Kaman haberleri) degisikliklerini canli VPS'e yayilama adimlarini kapsar.

## On Kosullar

- VPS'e SSH erisimi
- VPS'te repo `~/kamanilan` (veya benzeri) altinda clone edilmis
- PM2 ile frontend + backend ayri prosesler olarak yonetiliyor
- Nginx reverse proxy `kamanilan.com → frontend:3003`, `kamanilan.com/api → backend:8078`
- MySQL 8 `x_ilan` database

---

## 1. Pre-Deploy Local Dogrulama (Onceden Tamamlandi)

Bu local build artifact'lari pre-deploy olarak test edildi:

- [x] `bun x tsc --noEmit` (frontend + backend + admin_panel) → **0 error**
- [x] `bun run build` → **exit 0**, tum route'lar (178 URL sitemap)
- [x] Local `next start -p 4444` ile HTTP endpoint testi:
  - `GET /robots.txt` → **22 User-Agent bloku** (1 default + 21 AI crawler)
  - `GET /llms.txt` → **200 OK, 5297 bytes**
  - `GET /sitemap.xml` → **178 URL** (statik + kategori × sehir kombinasyonlari)
  - `GET /` → Organization + WebSite JSON-LD (zengin)
  - `GET /hakkimizda` → Organization + WebSite + **FAQPage** (6 Q&A)
  - `GET /ilan/:slug`, `/haberler/:slug`, `/kategori/:slug`, `/kategori/:slug/:city` → 4 route tipi 200

Post-deploy'da bu endpoint'ler gercek domain ile dogrulanacak.

---

## 2. Deploy Komutlari (VPS)

### 2.1 Repo Guncelle

```bash
cd ~/kamanilan
git status                # temiz olmali
git pull origin main      # Faz 2 + Faz 3 commit'leri
```

### 2.2 Backend Deploy

```bash
cd backend

# Paketleri guncelle (xlsx, fast-xml-parser, adm-zip yeni bagimliliklarla)
bun install

# Typecheck + build
bun run build

# Yeni DB tablolarini ekle (drop olmadan, sadece yeni seed dosyalari)
# 110_imports_schema.sql, 111_xml_feeds_schema.sql, 112_photo_queue_schema.sql
# 120_articles_kaman_seed.sql (Kaman haberleri)
bun src/db/seed/index.ts --only=110,111,112,120 --no-drop

# Subscription feature'larin guncellenmesi gerekiyorsa (launch defaults):
# bun src/db/seed/index.ts --only=87 --no-drop
# NOT: 87 DROP'li oldugu icin subscription tablolari sifirlanir. Dikkat.
# Mevcut abonelikler korumak icin manuel UPDATE yapilabilir.

# PM2 restart
pm2 restart kamanilan-backend
pm2 logs kamanilan-backend --lines 30
```

**Beklenen backend boot log'u:**
```
MySQL connected
[newsAggregator] Cron başlatıldı — fetch: 30 dk, temizlik: 24 saat.
[xmlFeeds] Cron baslatildi — her 5 dk'da bir tarama.
[photoQueue] Cron baslatildi — 30 sn'de bir, batch 5.
Server listening on 8078
```

### 2.3 Frontend Deploy

```bash
cd ../frontend

bun install
bun run build

# NEXT_PUBLIC_SITE_URL .env.local'de "https://www.kamanilan.com" olmali
# NEXT_PUBLIC_REST_API_ENDPOINT "https://www.kamanilan.com/api/v1" olmali
cat .env.local | grep -E "NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_REST_API_ENDPOINT"

pm2 restart kamanilan-frontend
pm2 logs kamanilan-frontend --lines 20
```

**Beklenen frontend log:**
```
✓ Ready in ~1s
Local: http://localhost:3003
```

### 2.4 Admin Panel Deploy (Opsiyonel — imports/xml-feeds/photo-queue UI)

```bash
cd ../admin_panel

bun install
bun run build
pm2 restart kamanilan-admin   # port 3002 veya config'te ne varsa
```

---

## 3. Post-Deploy Smoke Test

### 3.1 Public URL Testleri

```bash
# GEO-kritik dosyalar
curl -I https://www.kamanilan.com/robots.txt   # beklenen: 200
curl -I https://www.kamanilan.com/llms.txt     # beklenen: 200 (onceden 404'ti)
curl -I https://www.kamanilan.com/sitemap.xml  # beklenen: 200

# URL sayisi
curl -s https://www.kamanilan.com/sitemap.xml | grep -c "<loc>"
# Beklenen: 150+ (33'ten yukari)

# robots.txt AI crawler dogrulama
curl -s https://www.kamanilan.com/robots.txt | grep -c "^User-Agent:"
# Beklenen: 22

# Homepage JSON-LD
curl -s https://www.kamanilan.com/ | grep -c 'application/ld\+json'
# Beklenen: 2 (Organization + WebSite)

# Hakkimizda FAQPage
curl -s https://www.kamanilan.com/hakkimizda | grep -o '"@type":"FAQPage"'
# Beklenen: 1 match

# Bir kaman haber detayi (DB'de seed var)
curl -s https://www.kamanilan.com/haberler/kaman-ceviz-festivali-2026 | grep -o '"@type":"NewsArticle"'
# Beklenen: 1 match
```

### 3.2 Backend API

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.kamanilan.com/api/health
# Beklenen: 200 (veya /api/v1/health)

# Kategori listesi dolu mu
curl -s "https://www.kamanilan.com/api/v1/categories?limit=5" | head -c 200
```

### 3.3 Cron Aktif Mi

```bash
# Backend log'larinda son 5 dk'da cron tick gormek icin
pm2 logs kamanilan-backend --lines 100 | grep -E "xmlFeeds|photoQueue|newsAggregator"
```

---

## 4. Google Search Console (Post-Deploy)

1. **Sitemap resubmit:** Search Console → Sitemaps → `https://www.kamanilan.com/sitemap.xml` → Submit
2. **URL Inspection Tool:** `https://www.kamanilan.com/hakkimizda`, `/ilan/...`, `/haberler/kaman-ceviz-festivali-2026` — index requestle
3. **Rich Results Test:** [search.google.com/test/rich-results](https://search.google.com/test/rich-results) — 5 sayfa tipi icin validate:
   - `https://www.kamanilan.com/` (Organization + WebSite)
   - `https://www.kamanilan.com/hakkimizda` (FAQPage)
   - `https://www.kamanilan.com/ilan/[bir-ilan-slug]` (Product + Offer + Breadcrumb)
   - `https://www.kamanilan.com/haberler/kaman-ceviz-festivali-2026` (NewsArticle + Breadcrumb)
   - `https://www.kamanilan.com/kategori/emlak-kira` (CollectionPage + ItemList + Breadcrumb)

---

## 5. Bing Webmaster + Diger Arama Motorlari

- **Bing:** [bing.com/webmasters](https://www.bing.com/webmasters) → Submit sitemap
- **Yandex:** Yandex.Webmaster (opsiyonel, TR'de trafik az)

---

## 6. Rollback Plani

Sorun cikarsa:

```bash
cd ~/kamanilan
git log --oneline -10   # son commitleri gor
git reset --hard <onceki-stable-sha>
cd frontend && bun run build && pm2 restart kamanilan-frontend
cd ../backend && bun run build && pm2 restart kamanilan-backend
```

**Data rollback:** Yeni tablolar (import_jobs, xml_feeds, photo_download_queue) geriye ek — silinebilir. Bozmamaları icin:
```sql
DROP TABLE IF EXISTS photo_download_queue;
DROP TABLE IF EXISTS xml_feed_items, xml_feed_runs, xml_feed_category_map, xml_feeds;
DROP TABLE IF EXISTS import_job_items, import_jobs, import_column_mappings;
```

Kaman haberleri (120 seed) INSERT IGNORE — silinmek isterse:
```sql
DELETE FROM articles WHERE slug LIKE 'kaman-%' OR slug LIKE 'kirsehir-kaman-%';
```

---

## 7. Post-Deploy Re-Audit

Deploy tamamlandiktan **en az 5 dakika sonra** (CDN cache + DNS TTL icin):

```
/geo audit https://www.kamanilan.com
```

Sonuc yeni `GEO-AUDIT-REPORT-kamanilan-<tarih>.md` olarak kaydedilecek.

**Before/After karsilastirma:**
```
/geo compare GEO-AUDIT-REPORT-kamanilan.md GEO-AUDIT-REPORT-kamanilan-<yeni-tarih>.md
```

Beklenen skor degisimi:
- **Before:** 29/100 (Critical)
- **After:** 70-75/100 (Fair → Good)

Yuksek etki bekleyen kategoriler:
- Schema & Structured Data: 15 → 95 (+80)
- Technical GEO: 55 → 90 (+35)
- AI Citability: 20 → 70 (+50)

---

## 8. Deploy Checklist Ozeti

- [ ] `git pull origin main`
- [ ] `backend/`: `bun install && bun run build && bun src/db/seed/index.ts --only=110,111,112,120 --no-drop && pm2 restart kamanilan-backend`
- [ ] `frontend/`: `.env.local` kontrol + `bun install && bun run build && pm2 restart kamanilan-frontend`
- [ ] `admin_panel/` (opsiyonel): `bun install && bun run build && pm2 restart kamanilan-admin`
- [ ] Smoke test curl'leri calistir (§3)
- [ ] Google Search Console → sitemap submit + 5 sayfa Rich Results validate
- [ ] Re-audit (`/geo audit https://www.kamanilan.com`) + compare

## 9. Notlar

- **DB destructive aksiyonlardan kacin:** `--no-drop` bayragi zorunlu; yeni seed dosyalari (110, 111, 112, 120) `DROP TABLE IF EXISTS` barindirir ama yalnizca yeni olusturdugumuz tablolari etkiler.
- **.env secret:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_REST_API_ENDPOINT` dogru olmali. `localhost:3003` gibi dev URL'i olmadigindan emin ol.
- **PM2 config:** `ecosystem.config.js` veya startup script ayni kalmali, sadece process restart.
- **Cloudinary:** Foto kuyrugu Cloudinary kullanir; `.env`'de `CLOUDINARY_API_KEY/SECRET/CLOUD_NAME` dogru olmali. Yoksa worker `storage_not_configured` hatasi dondurur (kritik degil, foto indirme durur, deploy bloklamaz).
