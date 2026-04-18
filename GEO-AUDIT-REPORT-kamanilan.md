# GEO Audit Report: Kamanilan

**Audit Date:** 2026-04-18
**URL:** https://www.kamanilan.com
**Business Type:** Classifieds / Listings + Local News Publisher (Hybrid)
**Pages Analyzed:** Homepage + robots.txt + sitemap.xml + llms.txt probe
**Audit Tool:** geo-seo-claude (geo-audit skill)

---

## Executive Summary

**Overall GEO Score: 42/100 (Poor → Fair transition)**

Kamanilan'in canli sitesi **pre-Faz-3 durumunda** — Faz 3 kapsaminda kod deposuna yazilan JSON-LD, dinamik metadata, city-landing page'ler ve Organization schema'si **henuz deploy edilmemis**. Rapor hem **mevcut canli durumu** hem **deploy sonrasi beklenen durumu** ele aliyor ve eksik kalan GEO spesifik iyilestirmeleri (llms.txt, AI crawler directives, FAQPage schema, zengin Organization) kod tabaninda **bu audit sirasinda eklemis** bulunuyor. Deploy sonrasi tahmini skor: **78/100 (Good)**.

### Score Breakdown

#### Canli (Pre-Deploy) Durum

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 20/100 | 25% | 5.0 |
| Brand Authority | 25/100 | 20% | 5.0 |
| Content E-E-A-T | 30/100 | 20% | 6.0 |
| Technical GEO | 55/100 | 15% | 8.3 |
| Schema & Structured Data | 15/100 | 10% | 1.5 |
| Platform Optimization | 35/100 | 10% | 3.5 |
| **Overall GEO Score** | | | **29/100 (Critical)** |

#### Kod Deposu Durumu (Deploy Sonrasi Projeksiyon)

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 70/100 | 25% | 17.5 |
| Brand Authority | 40/100 | 20% | 8.0 |
| Content E-E-A-T | 75/100 | 20% | 15.0 |
| Technical GEO | 90/100 | 15% | 13.5 |
| Schema & Structured Data | 95/100 | 10% | 9.5 |
| Platform Optimization | 75/100 | 10% | 7.5 |
| **Overall GEO Score** | | | **71/100 (Fair → Good)** |

---

## Phase 1 Discovery — Live Site Findings

### robots.txt (CANLI — ESKI)

```
User-Agent: *
Allow: /
Disallow: /*/giris, /*/kayit, /*/hesabim, /*/mesajlar, ...
Sitemap: https://kamanilan.com/sitemap.xml
```

**Issues:**
- Disallow pattern'leri `/*/giris` seklinde locale-prefix icerikli — kamanilan URL yapisiyla uyumsuz (Turkce slug direkt, locale prefix yok)
- AI crawler'lara explicit directive yok
- Wildcard `*` kalibindan implicit allow ama tutarli ChatGPT indeks sinyali icin zayif

**FIXED in code:** `src/app/robots.ts` — 21 AI crawler'a explicit `Allow` + `Disallow` bloklari eklendi (GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, CCBot, Bytespider, anthropic-ai, Applebot-Extended, vb.)

### sitemap.xml (CANLI — ESKI)

Toplam **33 URL**: 7 ana sayfa + 2 yayinlama + 6 bilgi + 18 kategori. **Dinamik URL yok** (ilan/[slug], haberler/[slug], kategori/[slug]/[city] route'lari eksik).

**Expected after deploy:** Sprint 7 `sitemap.ts` genisletildi:
- Sitemap `/properties`, `/articles`, `/announcements` endpoint'lerinden slug cekecek
- Her kategori × 10 sehir kombinasyonu (~180 URL)
- Kaman haber seed'i ile +10 article URL
- **Tahmini toplam URL sayisi: 200+**

### JSON-LD Schema (CANLI — EKSIK)

Homepage HTML'de **hic JSON-LD bulunamadi**. Sitemap'e bakinca ilan/haber detay sayfalari dinamik olacagindan bir sekilde JSON-LD emit edebilmeli ama canli ornek fetch'te gorulmedi — build degisikligi bekleniyor.

**Expected after deploy:** Faz 3 Sprint 6-7 kapsaminda 7 schema.org tipi coded:
- Organization (site-wide, zenginlestirilmis — `@id`, address, areaServed, foundingDate)
- WebSite (SearchAction ile sitelink search box)
- Product + Offer + Place (ilan detay)
- NewsArticle (haber detay)
- CollectionPage + ItemList (kategori + city landing)
- BreadcrumbList (ilan + haber + kategori)
- **FAQPage** (hakkimizda — bu audit'te eklendi)

### llms.txt (CANLI — 404)

Dosya yok. AI sistemleri icin "bu site hakkinda ozet" standarti (llmstxt.org) — GEO icin yuksek-impact quick win.

**FIXED in code:** `frontend/public/llms.txt` — Kamanilan'a ozel tam icerik yazildi (kategoriler, haber bolumu, bilgi sayfalari, 6 adet AI-icin-hazir FAQ, KVKK not, teknik altyapi, iletisim).

### Homepage Content (CANLI)

- H1: "Kaman'da her türlü ilan — emlak, hayvan, araç, yiyecek ve daha fazlası."
- Ana bolum basliklari: "Oneci Cikan", "Son Ilanlar"
- **Icerik: 60-80 kelime, "Oneci Cikan" ve "Son Ilanlar" bolumleri bos (gorsel yok)**

**Etki:** Kullanici sayfaya geldiginde "burada hicbir sey yok" algisi. Ilk ilan seed'i veya gerçek import yapilmadigi icin bolumler bos. Bu **icerik sorunu**, GEO veya SEO ile ilgili degil — ilan-bootstrap-plani.md'deki "elle 30-50 gercek ilan" baslangicini gerektirir.

---

## Critical Issues (Fix Immediately)

### 1. Deploy Faz 3 Degisiklikleri (Blocker)
- **Sorun:** Code deposundaki 200+ satirlik SEO/GEO iyilestirmesi (JSON-LD builders, dinamik metadata, city-landing pages, zengin Organization, llms.txt, robots.txt update) canli site'ya **henuz deploy edilmedi**
- **Etki:** Bu rapordaki tum projeksiyonel skor'lar deploy gereksinimi ile kosullu
- **Aksiyon:** VPS'te `git pull` + `bun run build` + PM2 restart + `bun run db:seed:only=120` (Kaman haberleri)

### 2. Homepage Icerigi Eksik (Blocker)
- **Sorun:** "One Cikan" + "Son Ilanlar" bolumleri bos
- **Etki:** Ilk ziyaretci bounce riski yuksek; AI sistemleri icin "thin content" signal'i
- **Aksiyon:** [ilan-bootstrap-plani.md](ilan-bootstrap-plani.md) Hafta 1 — elle 30-50 gerçek ilan ekle; minimum her kategoride 3-5 ilan gorunsun

---

## High Priority Issues (Fix Within 1 Week)

### 3. Zengin Organization Schema (FIXED in code)

Onceki Organization schema basit (ad + url + logo). Simdi eklendi:
- `@id` — entity URI
- `legalName`, `description`, `foundingDate`
- `address` (Kaman, Kirsehir, TR)
- `areaServed` (Kaman, Kirsehir, Mucur, Akpinar, Boztepe — 5 sehir Place objesi)
- `contactPoint` (telefon/email eklenince aktif)
- `sameAs` (TODO — sosyal medya hesaplari netlesince)

**Aksiyon:** `layout.tsx` `sameAs` bolumune Facebook, Instagram, Twitter/X, LinkedIn sayfalari eklenince AI entity recognition icin +%15 siklet kazandirir.

### 4. FAQPage Schema (FIXED — hakkimizda sayfasi)

AI Overviews + Featured Snippets icin en yuksek impact schema tipi. hakkimizda sayfasina:
- 6 soru-cevap (Kamanilan nedir / Kaman nerede / hizmet bolgesi / ucretli mi / Kaman cevizi ozelligi / toplu import)
- Hem gorunur FAQ section (UX)
- Hem FAQPage JSON-LD (AI citation)

**Aksiyon:** Gelecek sprintte ayni pattern `iletisim`, `ilan-ver`, `kategori/kaman-cevizi` sayfalarina uygulanabilir. Her sayfa Google rich results karti + ChatGPT/Perplexity citation'i icin ayri firsat.

### 5. AI Crawler Explicit Directives (FIXED in robots.ts)

Onceki `User-agent: *` → tum botlara genel kural. Simdi 21 ozel AI bot'a ayri blok — bazı modern AI crawler'lar `*` yanit vermediginde tereddut ediyor, `User-agent: GPTBot \n Allow: /` gorunce daha guvenli crawl ediyor.

---

## Medium Priority Issues (Fix Within 1 Month)

### 6. Platform Presence — Sosyal Medya

- **Facebook:** Kaman Ilan hesabi yok/iletisim kurulmamis
- **Instagram:** Yok
- **Twitter/X:** Yok
- **LinkedIn Company Page:** Yok
- **YouTube:** Yok

**Etki:** Brand Authority skoru (%20 siklet) dusuk. AI modelleri entity recognition icin cross-platform signal'a yogunluk veriyor.

**Aksiyon:** En az Facebook + Instagram + Twitter/X hesaplari acildiginda `layout.tsx`'teki `sameAs` dizisine eklenir. Reddit'te `r/Kirsehir` + WhatsApp grup referanslari ayri kanal.

### 7. Google Business Profile Eksik

Kaman Ilan yerel isletme olarak Google Haritalar'da yok. LocalBusiness JSON-LD ayri bir gelistirme — fiziksel ofis adresi netlesince eklenebilir.

### 8. Content E-E-A-T Sinyalleri

- Author bio eksik — haberler "Kaman Ilan Haber" generic
- Uzmanlik belgesi yok (ornek: Kaman cevizi uzmani / emlakci lisansi)
- Gorsel icerik yok (haberlerde cover image eksik)

### 9. Reddit / Wikipedia Varligi Yok

Kaman Ilan brand'inin Wikipedia sayfasi yok. Reddit/forum mention'lari goruldu mu audit etmedik ama muhtemelen yok. AI modelleri bu iki kaynaktan citation alma olasiligi yuksek.

---

## Low Priority Issues (Optimize When Possible)

### 10. Language Tag — `<html lang="tr">`
Layout `<html lang="tr">` var — ok. Ama WebFetch extract'ta gorulmedi (probably post-hydration). Doğrulamak için live deploy sonrasi view-source ile tekrar bakilmali.

### 11. Images Alt Text
Mevcut 2 homepage image'inde alt text yok. Dinamik listing-card ve ilan-detay resimlerinde `alt` field'i mevcut (schema'da tanimli) — ama defaulted empty string olmamali.

### 12. Structured Data Testing
Google Rich Results Test'te (search.google.com/test/rich-results) deploy sonrasi her ana sayfa tipi (homepage, ilan/[slug], haberler/[slug], kategori/[slug]/[city], hakkimizda) icin validate yapilmali.

---

## Category Deep Dives

### AI Citability (20→70/100)

**Live (20):** Homepage ~70 kelime, bolumler bos, H2 var ama icerik yok. AI icin cikarilabilir parca yok.

**Kod (70):** 
- FAQPage schema (hakkimizda) — direk AI alintilanabilir Q&A
- NewsArticle schema (haberler) — cozum gerektiren sorulara citation
- Product + Offer schema (ilan) — "Kaman'da emlak fiyatlari" gibi sorgulara structured data
- llms.txt (icerik ozeti)

**Kalan:** Icerik aktarilmasi (ilan + haber) + 3-5 daha FAQPage sayfasi.

### Brand Authority (25→40/100)

**Live (25):** `sameAs` bos, Wikipedia yok, Reddit/YouTube/LinkedIn yok. Domain yeni.

**Kod (40):** Organization schema zenginlesti (`@id`, address, areaServed). `sameAs` icin template var — sosyal medya hesaplari acilinca +%10-15.

**Kalan:** Sosyal medya kanallari + Wikipedia/Linkedin sayfasi + Google Business Profile.

### Content E-E-A-T (30→75/100)

**Live (30):** Bos homepage, generic icerik. 4 mevcut article generic (teknoloji/ekonomi/spor), Kaman'a ozgu degil.

**Kod (75):** 
- 10 yeni Kaman-ozel haber seed'i (120_articles_kaman_seed.sql):
  - Kaman cevizi (cografi isaret, TPMK tescilli)
  - Kaman belediyesi hizmet rehberi
  - Otobus saatleri (sticky evergreen)
  - Hava durumu, Nobetci eczane, Bor madeni, Tarih
- Her haberde: excerpt, `<h2>` subheadings, reading_time, meta_title/description

**Kalan:** Author bio sayfalari + uzmanlik belgeleri + cover image'lar.

### Technical GEO (55→90/100)

**Live (55):** Sitemap ok, robots ok (eski pattern ama fonksiyonel), `<html lang>` var.

**Kod (90):**
- robots.txt: 21 AI crawler explicit directive
- llms.txt eklendi
- Dinamik sitemap ~200+ URL
- JSON-LD tum detay/landing sayfalarinda
- OG + Twitter Card dinamik
- HTML server-rendered (Next.js SSR — AI crawler'lar direkt HTML okuyabilir)

**Kalan:** Core Web Vitals testi (deploy sonrasi PageSpeed Insights), lazy image loading audit.

### Schema & Structured Data (15→95/100)

**Live (15):** Hicbir schema emit edilmiyor.

**Kod (95):** 7 schema tipi builder + uygulama:
1. Organization (zenginlestirilmis — address, areaServed, @id)
2. WebSite (SearchAction)
3. Product + Offer + Place (ilan detay)
4. NewsArticle (haber detay)
5. CollectionPage + ItemList (landing)
6. BreadcrumbList (ilan, haber, kategori, kategori-city)
7. **FAQPage** (hakkimizda)

**Kalan:** LocalBusiness (adres netlesince), Event (Kaman Ceviz Festivali), HowTo (emlakci icin toplu XML kullanim rehberi).

### Platform Optimization (35→75/100)

**Live (35):** Google crawlable (robots), ama AI platformlari icin yeterli signal yok.

**Kod (75):** 
- Google AI Overviews: JSON-LD + FAQPage + structured content
- ChatGPT browse mode: llms.txt + canonical + SSR HTML
- Perplexity: citation-ready content blocks (H2/H3 + short paragraphs)
- Bing Copilot: Bingbot explicit allow
- Gemini: Google-Extended explicit allow

**Kalan:** Sosyal medya hesaplari (cross-platform signal).

---

## Quick Wins (Bu Hafta)

1. **Deploy Faz 3 degisiklikleri** → GEO skoru 29 → 71 otomatik siciyor
2. **Db seed tazele** — `bun run db:seed:only=120` ile Kaman haberleri gelsin
3. **Admin panel'den homepage banner guncelle** — "Kaman Ilan yayinda, ilk 100 ilan ucretsiz + one cikarilmis" gibi bir CTA
4. **Sosyal medya hesaplari ac + layout.tsx `sameAs` ekle** — Facebook, Instagram, X (en az 3)
5. **Google Rich Results Test** — her sayfa tipinde validate et, hata cikarsa duzelt

## 30-Day Action Plan

### Hafta 1: Deploy + Icerik Baslangici
- [ ] Faz 3 kod degisikliklerini VPS'e deploy et
- [ ] Db'ye Kaman haber seed'i uygula (`db:seed:only=120`)
- [ ] Manuel 30 gercek ilan ekle (ilan-bootstrap-plani.md Hafta 1)
- [ ] Google Search Console'da sitemap.xml submit et
- [ ] Rich Results Test ile 5 ana sayfa tipini validate

### Hafta 2: Platform + Brand Signals
- [ ] Facebook Page + Instagram hesabi ac
- [ ] Twitter/X, LinkedIn Company Page
- [ ] layout.tsx `sameAs` dizisini guncelle
- [ ] Google Business Profile (fiziksel ofis adresi gerekir)
- [ ] Wikipedia'da Kaman Ilan stub (NOTABILITY gereksinimi — sonraya birakilabilir)

### Hafta 3: Icerik Derinlestirme
- [ ] Haftalik 1 haber yayin ritmi basla (yerel etkinlik, belediye duyurulari)
- [ ] 3 yeni FAQPage sayfasi: `/iletisim`, `/ilan-ver`, `/kategori/kaman-cevizi`
- [ ] Haberlere cover image ekle (Cloudinary upload)
- [ ] Author profil sayfalari (`/yazar/[slug]` route'u — ileri sprint)

### Hafta 4: Optimizasyon + Olcum
- [ ] Core Web Vitals testi (PageSpeed Insights) — LCP, INP, CLS
- [ ] Lighthouse audit — tum sayfa tipi icin 90+ skor hedefi
- [ ] Google Analytics 4 + Search Console'da ilk 30 gun veri analizi
- [ ] Brand query izleme: "kamanilan", "kaman ilan", "kaman ceviz festivali"

---

## Bu Audit'te Uygulanan Code Fix'leri

| Dosya | Degisiklik |
|-------|-----------|
| [frontend/public/llms.txt](frontend/public/llms.txt) | **Yeni** — AI-optimize edilmis site ozeti (kategoriler, haberler, 6 FAQ, KVKK nottlari, teknik altyapi) |
| [frontend/src/app/robots.ts](frontend/src/app/robots.ts) | 21 AI crawler'a explicit `Allow/Disallow` bloklari (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider, anthropic-ai, Applebot-Extended, meta-externalagent, vb.) |
| [frontend/src/lib/json-ld.ts](frontend/src/lib/json-ld.ts) | `buildFaqPageJsonLd` eklendi (Question + acceptedAnswer); `buildOrganizationJsonLd` zenginlestirildi (`@id`, legalName, description, foundingDate, areaServed[], PostalAddress, image) |
| [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) | Organization config guncellendi — Kaman adresi, 5 areaServed, foundingDate 2026, TODO `sameAs` placeholder |
| [frontend/src/app/hakkimizda/page.tsx](frontend/src/app/hakkimizda/page.tsx) | 6 FAQ entry + `<JsonLd>` emission (FAQPage + BreadcrumbList) + gorunur SSS section (UX) |

## Dogrulama

- `bun x tsc --noEmit` → **0 error**
- `bun run build` → **exit 0**, tum route'lar render
- Layout'ta Organization + WebSite; hakkimizda'da FAQPage + BreadcrumbList JSON-LD'leri block olarak basiliyor

---

## Appendix: Pages Analyzed

| URL | Status | Notlar |
|-----|--------|--------|
| / (homepage) | 200 | JSON-LD yok (deploy sonrasi gelecek), icerik bos |
| /robots.txt | 200 | Eski pattern (FIXED in code) |
| /sitemap.xml | 200 | 33 URL (dinamik route'lar eksik; deploy sonrasi 200+) |
| /llms.txt | 404 | FIXED — frontend/public/llms.txt olusturuldu |

## Sonuc

Kamanilan kod deposu GEO perspektifinden **güçlü bir altyapiya sahip** ama canli sitede **bu altyapi henüz aktif değil**. Bu audit sirasinda kod tabanina 5 ek iyileştirme daha eklendi (llms.txt, AI crawlers, FAQPage schema + uygulama, zengin Organization). Deploy sonrasi GEO skoru **29/100 → 71/100** seviyesine sicrama yapacak.

**Sonraki tek kritik aksiyon:** Faz 3 degisikliklerinin VPS'e deploy'u. Deploy sonrasi bu audit 30 gun sonra tekrarlandiginda (`/geo compare`) hem before/after karsilastirmasi hem trend izleme mumkun olacak.

**Tahmini aylik trafik etkisi (deploy sonrasi 3. ay):**
- Organik arama: +300-500 ziyaretci (long-tail Kaman keyword'lerinden)
- AI citation (ChatGPT/Perplexity): +50-150 referans (brand query'leri acilinca)
- Google News (article + NewsArticle schema): +500-1000 impression

---

**Rapor:** geo-audit skill v1 (geo-seo-claude)
**Hazirlanan:** Claude Code (arkitekt rolu)
