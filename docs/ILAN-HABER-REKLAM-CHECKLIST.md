# Kaman İlan — Reklam Motoru Portu + Haber Genişletmesi CHECKLIST

**Uygulayıcı:** Codex
**Konsept/gerekçe:** [ILAN-HABER-REKLAM-KONSEPT.md](ILAN-HABER-REKLAM-KONSEPT.md) — önce onu oku.
**Kaynak repo:** `~/Documents/Projeler/tarim-dijital-ekosistem/projects/hal-fiyatlari` (aşağıda `HF`)
**Hedef repo:** `~/Documents/Projeler/vps-guezel/kamanilan` (aşağıda `KI`)

## Kilitli tasarım yönü (uygulamada kaynak)

- **Ana görsel referans:**
  [`../tasarim-konseptleri/02-modern-ilan-pazaryeri.png`](../tasarim-konseptleri/02-modern-ilan-pazaryeri.png)
- **İlan detay referansları:**
  [`../tasarim-konseptleri/04-ilan-detay-emlak.png`](../tasarim-konseptleri/04-ilan-detay-emlak.png) ve
  [`../tasarim-konseptleri/05-ilan-detay-tarim-araci.png`](../tasarim-konseptleri/05-ilan-detay-tarim-araci.png)
- Tasarım yönü: modern ve premium yerel pazar; kırık beyaz zemin, koyu kahve/siyah
  yüzeyler, Kaman altın tonu, editoryal serif başlıklar ve sade sans-serif arayüz metni.
- `01-editoryal-yerel-pazar.png` ve `03-haber-reklam-ticaret.png` alternatifleri
  uygulanmayacak; tasarım kararı `02-modern-ilan-pazaryeri.png` ile kilitlidir.
- Konseptteki metin, ilan sayısı, hava/fiyat verisi ve marka örnekleri gerçek veri
  değildir. Uygulama mevcut API verisini kullanır; veri yoksa sahte içerik göstermez.
- Konsept masaüstü kompozisyon referansıdır; mobil/tablet düzen aşağıdaki responsive
  kabul kriterleriyle ayrıca uygulanır.

## Değişmez kurallar (her WP için geçerli)

- **ALTER TABLE yasak** (lokalde ve seed dosyalarında). Şema değişikliği =
  seed SQL'de CREATE TABLE'ı güncelle + `bun run build && bun run db:seed:fresh`.
- Secret fallback yasak: `COOKIE_SECRET`, `JWT_SECRET` → `requireEnv`. `.env.example`'da boş satır.
- Mevcut `KI/backend/src/modules/banner` (hero) modülüne **dokunma** — yeni motor `modules/ads`.
- Her WP sonunda: `bun run typecheck` yeşil + ilgili testler yeşil + tek commit.
- Kopyalama aşamasında davranış değiştirme; uyarlama minimum diff ile yapılır.

---

## WP-0 — Hazırlık (küçük)

- [x] `KI/backend`: `bun add sanitize-html @fastify/rate-limit && bun add -d @types/sanitize-html`
- [x] `@fastify/rate-limit` app.ts'te kayıtlı değilse global değil **route-config** modunda ekle
  (HF banners `config.rateLimit` kullanıyor)
- [x] `KI/backend/src/core` (veya eşdeğeri) `requireEnv` var mı kontrol et; `COOKIE_SECRET`
  requireEnv'e bağla, `@fastify/cookie`'ye `secret` ver (imzalı cookie dönüşüm atıfı için şart)
- [x] `@vps/shared-backend`'de `isBotUserAgent` var mı bak; yoksa
  `HF/backend/../@agro/shared-backend/modules/audit/helpers.ts`'ten fonksiyonu
  `KI/backend/src/modules/_shared/botDetect.ts` olarak kopyala
- [x] Kabul: typecheck yeşil, mevcut davranış değişmedi

## WP-1 — Reklam motoru RAW KOPYA

- [x] `HF/backend/src/modules/banners/` → `KI/backend/src/modules/ads/` (index.ts + repository.ts)
- [x] `HF/frontend/src/components/ads/` → `KI/frontend/src/components/ads/`
      (BannerSlot, TemplateBanner, ResilientAdImage, AdConversionTracker, BannerVisual.test;
      VistaSeeds* özel bileşenlerini **alma**)
- [x] `HF/frontend/src/lib/banners.ts` + `lib/ad-conversions.ts` (+testi) → `KI/frontend/src/lib/`
- [x] `HF/admin_panel/.../banners/` → `KI/admin_panel/src/app/(main)/admin/(admin)/ads/`
      (page.tsx, [id]/page.tsx, _components/banner-detail-client.tsx;
      vistaseeds-preview* **alma**)
- [x] `HF/backend/test/banner-*.test.ts` (5 dosya) → `KI/backend/test/`
- [x] `HF/backend/src/cron.ts` içindeki 5 reklam cron bloğunu `KI` cron altyapısına taşı
      (banner-lifecycle */5, source-audit, performance, reports, archive)
- [x] Commit: `port: haldefiyat reklam motoru raw kopya` (derlenmiyor olabilir — normal)

## WP-2 — Derleme uyarlaması

- [x] Import eşleme: `@agro/shared-backend/*` → `@vps/shared-backend/*` karşılıkları
      (`requireAuth`, `getAuthUserId`) + WP-0'daki `isBotUserAgent`
- [x] `@/core/env` → KI env modülü; `env.JWT_SECRET` kullanımı KI'deki isimle eşleşsin
- [x] `getListingCreative` → `KI/backend/src/modules/ads/listingSource.ts` adaptörü yaz:
      `proporties`/ilan tablosundan `{id, slug, title, productName→category, citySlug,
      priceMin/Max, priceUnit, currency, images, status, isSuspicious, validUntil}` dön
      (KI ilan şemasındaki gerçek karşılıklarla; olmayan alan için güvenli varsayılan)
- [x] Pozisyon enum'unu değiştir → konsept raporu §3.5'teki **14 kamanilan slotKey**'i
- [x] Kapsam enum'undan `market` çıkar (8 kapsam kalır); `firm` → `seller` yeniden adlandır
      (tablo/kolon/endpoint isimlerinde tutarlı)
- [x] `hf_` tablo öneklerini kaldır (`banners` hero tablosuyla çakışmasın diye motor
      tabloları `ads_*` önekiyle: `ads_banners`, `ads_slots`, `ads_targets`, …)
- [x] PDF başlıklarındaki HALDEFIYAT.COM → KAMANILAN.COM; `hf_ad_campaign` cookie → `ki_ad_campaign`
- [x] Kabul: `bun run typecheck` yeşil (testler henüz kırmızı olabilir — DB gerekiyor)

## WP-3 — Konsolide DB şemaları (ALTER'sız)

- [x] `HF/backend/src/db/seed/sql/040 + 058–079` (22 dosya) oku; her tablonun **nihai**
      kolon setini çıkar (ALTER'lar dahil edilmiş hali)
- [x] KI'ye yeni seri yaz (CREATE TABLE IF NOT EXISTS, nihai kolonlar, index'ler):
  - [x] `130_ads_core_schema.sql` — ads_banners, ads_slots, ads_targets
  - [x] `131_ads_commerce_schema.sql` — ads_packages, ads_package_slots, ads_payments,
        ads_price_overrides, ads_waitlist
  - [x] `132_ads_metrics_schema.sql` — ads_daily_metrics, ads_metric_uniques,
        ads_visitor_frequency, ads_conversions
  - [x] `133_ads_selfservice_audit_schema.sql` — seller_members, ads_self_service_requests,
        ads_audit_logs
  - [x] `134_ads_slots_seed.sql` — 14 slot kaydı (label, pageType, kapasiteler,
        mobileBehavior, recommendedSize, taban fiyat: makul TRY başlangıç değerleri)
- [x] `db:seed` index'ine yeni dosyaları kaydet; `bun run db:seed:fresh` hatasız
- [x] 5 test dosyasını yeni tablo/enum isimlerine uyarla; **testler yeşil**
- [x] Kabul: fresh kurulum + testler + typecheck

## WP-4 — Frontend/admin bağlama

- [x] **Tasarım temeli:** `02-modern-ilan-pazaryeri.png` yönünü semantik tasarım
      token'larına aktar: kırık beyaz zemin, koyu kahve/siyah ana yüzey, altın vurgu,
      zeytin footer, sınır/gölge/radius, serif display ve sans-serif UI tipografisi.
      Sayfalarda tek seferlik hard-coded renkleri çoğaltma; mevcut global token'ları
      güncelle veya ortak token ekle.
- [x] Ortak site kabuğunu konsepte göre yenile: logo/wordmark, kategori odaklı masaüstü
      navigasyon, `İlan Ver`, favoriler, giriş/profil aksiyonları ve mobil menü. Mevcut
      çalışan auth/favori/arama davranışları korunacak; kişisel e-posta varsayılanı veya
      autofill örneği kullanılmayacak.
- [x] **Ana sayfa hero:** solda koyu yüzey üzerinde yerel değer önerisi, birleşik
      metin+kategori araması ve sayılı kategori kısayolları; sağda Kaman'ı anlatan
      emlak/tarım/yerel yaşam görsel mozaiği. Görseller `next/image` ile doğru `sizes`,
      öncelikli LCP görseli ve statik boyut/oranla render edilecek.
- [x] Hero altı yerel bilgi şeridini gerçek/verilebilir kaynaklarla kur: tarih ve konum
      her zaman gösterilebilir; hava, tarım fiyatı, akaryakıt ve nöbetçi eczane yalnız
      güvenilir veri varsa gösterilir. Veri yokken uydurma değer yerine ilgili hücre
      gizlenir veya nötr boş durum kullanılır.
- [x] Ana sayfada **Yeni İlanlar** alanını yatay premium kart düzeninde uygula:
      görsel, kategori etiketi, başlık, konum, fiyat ve favori aksiyonu. Kartın tamamı
      klavye ile erişilebilir tek birincil detay bağlantısına sahip olacak; favori
      butonu ayrı erişilebilir aksiyon olacak.
- [x] Ana sayfada **Gündem** alanını editoryal haber düzeninde uygula: bir öne çıkan
      haber + zaman/kaynak bilgili kompakt haber listesi. Haber bulunmadığında bölüm
      boş iskelet bırakmayacak.
- [x] **Sponsorlu İşletmeler** bölümünü reklam motorunun mağaza/işletme kreatiflerine
      bağla; görünür `Sponsorlu` etiketi, sabit oranlı görsel ve kaydırılabilir kartlar.
      Konseptteki işletme adları/verileri seed veya placeholder olarak eklenmeyecek.
- [x] Gelecekteki ürün satışı için ana sayfada **Kaman Sepeti** yüzeyini özellik
      bayrağıyla hazırla: Faz C kapalıyken yalnız gerçek katalog verisi varsa ve
      `commerce` özelliği açıksa render et; çalışmayan fiyat/sepet CTA'sı gösterme.
- [x] `/ilanlar` ve `/kategori/[slug]` sayfalarını aynı sistemle yenile: belirgin sonuç
      başlığı, masaüstünde filtre paneli, mobilde sheet/drawer filtre, sıralama, seçili
      filtre chip'leri, grid/list görünümü, sonuç/boş/hata/loading durumları ve liste
      içine yerleşen `category_inline` reklamı.
- [x] `/ilan/[slug]` detayını `04-ilan-detay-emlak.png` ve
      `05-ilan-detay-tarim-araci.png` referanslarına göre kategori bağımsız ortak kabukla
      uygula: breadcrumb, başlık/fiyat/konum, büyük galeri+thumbnail, temel özellikler,
      kategoriye özel nitelik tablosu, açıklama, güvenlik uyarısı, satıcı/mağaza kartı,
      telefon/WhatsApp/mesaj/favori/paylaş aksiyonları ve benzer ilanlar.
- [x] İlan detayında mobil dönüşüm çubuğunu sticky uygula; telefon/WhatsApp gibi
      aksiyonlar yalnız veri/izin varsa render edilsin. Görsel yoksa tasarım sistemine
      uygun placeholder kullan; bozuk uzak görsel sayfayı düşürmesin.
- [x] `/haberler`, `/haberler/[slug]`, `/duyurular` ve duyuru detaylarını aynı editoryal
      dilde yenile: okunabilir metin genişliği, güçlü kapak görseli, kaynak/tarih/yazar,
      dahili bağlantılar, ilgili içerikler ve reklam slotları. Reklam, haber görseliyle
      karışmayacak biçimde açıkça etiketlenecek.
- [x] `/magazalar` ve `/magazalar/[slug]` sayfalarını sponsorlu işletme kartlarıyla
      tutarlı yap: kapak/logo, doğrulama/konum/iletişim, mağaza ilanları ve
      `store_detail_sidebar` reklamı; olmayan işletme bilgisi için sahte içerik yok.
- [x] Footer'ı konsepte göre sade zeytin/koyu yüzeyde uygula: Kaman/Kırşehir konumu,
      Hakkımızda, Kullanım Koşulları, Gizlilik, İletişim ve yalnız tanımlı sosyal/telefon
      bağlantıları. Birleştirilen misyon-vizyon/kalite sayfalarına eski bağımsız menü
      bağlantıları geri eklenmeyecek.
- [x] `BannerSlot`'u kilitli KI tasarım diline uyarla; **rezerve yükseklik** zorunlu
      (CLS koruması — audit kazanımları gerilemesin). Reklam yüzeyi içerikten görsel
      olarak ayrışmalı, `Sponsorlu` etiketi ve `rel="sponsored nofollow noopener"`
      kuralları korunmalı.
- [x] Slot yerleşimi (konsept §3.5): ana sayfa, /ilanlar, /ilan/[slug], /kategori/[slug],
      /haberler, /haberler/[slug], /duyurular, /magazalar/[slug], global top/footer
- [x] `AdConversionTracker`'ı telefon/WhatsApp tıklama noktalarına bağla
      (ilan detay + mağaza sayfası); eventType'lar motordakiyle birebir
- [x] Admin menüye "Reklamlar" bölümü: liste + detay + slotlar + paketler + takvim +
      bekleme listesi + self-servis talepleri + raporlar (kopyalanan sayfalar çalışır durumda)
- [x] `/reklam-ver` sayfasını self-servis akışına bağla: giriş yapmış mağaza →
      talep formu (`POST /banners/self-service/requests`); girişsiz → tanıtım + iletişim
- [x] Responsive kabul: 360, 390, 768, 1024 ve 1440 px genişliklerde yatay taşma yok;
      hero mozaiği mobilde içerik önceliğine göre sadeleşir, kart/grid kolonları kırılır,
      dokunma hedefleri en az 44×44 px olur ve temel işlevler yalnız hover'a bağlı kalmaz.
- [x] Erişilebilirlik kabul: tek H1, mantıklı başlık sırası, görünür focus, yeterli renk
      kontrastı, dekoratif görsellerde boş alt ve içerik görsellerinde anlamlı alt,
      ikon-only düğmelerde erişilebilir ad, klavye ile menü/galeri/filtre/favori kullanımı.
- [x] Görsel regresyon kabul: ana sayfa masaüstü görünümü
      `02-modern-ilan-pazaryeri.png`, iki ilan detay kategorisi ise ilgili `04`/`05`
      referanslarıyla Playwright screenshot üzerinden karşılaştırılır; birebir demo veri
      değil, düzen/hiyerarşi/renk/tipografi uyumu aranır.
- [x] Teknik kabul: dev ortamda 3 farklı slotta test banner'ı dönüyor; tıklama 302 +
      sayaç; admin CRUD + takvim çalışıyor; ana sayfa ve ilan detayında console error yok;
      404 görsel isteği yok; Lighthouse masaüstü/mobilde CLS ≤ 0.05, erişilebilirlik ≥ 95,
      SEO ≥ 95 ve mevcut performans skoru gerilemiyor.

## WP-5 — Haber: AI yeniden yazım katmanı

- [x] `101_news_aggregator_schema.sql` CREATE TABLE'ına kolonları ekle (ALTER değil):
      `ai_status ENUM('none','queued','done','failed') DEFAULT 'none'`,
      `ai_title`, `ai_excerpt`, `ai_content` LONGTEXT, `ai_meta_title`,
      `ai_meta_description`, `ai_tags`, `image_brief` TEXT,
      `image_status ENUM('none','waiting','received','attached') DEFAULT 'none'`,
      `internal_links` TEXT
- [x] `KI/backend/src/modules/newsAggregator/aiRewrite.ts`: aiChain ile zorunlu-JSON çıktı
      (başlık, özet ≤ 300, gövde HTML, meta_title ≤ 60, meta_description ≤ 155,
      5-8 etiket, görsel brifi, 2+ dahili link önerisi). Prompt kuralları:
      Kaman/Kırşehir yerel bağlamı ekle, kaynağa atıf cümlesi koru, kopya cümle kurma
- [x] Admin news-suggestions sayfasına: "AI ile işle" (tek + toplu), ai_status rozetleri,
      AI çıktısını düzenlenebilir önizleme, "failed → tekrar dene"
- [x] Onay akışı güncelle: onayda articles kaydına **AI alanları** yazılır
      (ai_* doluysa onlar, değilse ham alanlar); `source`/`source_url` daima korunur
- [x] Kabul: örnek RSS kaydı uçtan uca — fetch → AI işle → düzenle → onayla → /haberler'de
      meta'larıyla görünüyor

## WP-6 — Haber: token'sız görsel kuyruğu

- [x] Admin "Görsel Kuyruğu" sayfası: `image_status=waiting` kayıtlar, brif metinleri,
      **"Brifleri panoya kopyala"** (markdown: slug + brif + 1200×675 ve 1080×1080 notu)
- [x] `KI/backend/scripts/gorsel-import.ts` (bun): `content-images/gelen/<slug>.{png,jpg,webp}`
      tara → suggestion eşleştir → sharp ile WebP (kapak 1200×675, kare 1080×1080,
      thumb 480) → mevcut görsel depolama düzenine yaz (Cloudinary/statik — articles
      kapak akışı hangisiyse o) → `image_status=received`, işlenen dosyayı `islendi/`ye taşı
- [x] package.json script: `"gorsel:import": "bun run scripts/gorsel-import.ts"`
- [x] Yayın kapısı: `auto_publish` site ayarı; açıksa ai_status=done + image_status=received
      → otomatik yayınla; kapalıysa admin tek tık
- [x] Kabul: klasöre atılan 2 test görseli import → habere bağlandı → yayınlandı

## WP-7 — Haber SEO/GEO paketi

- [x] `/haberler/[slug]`: `NewsArticle` JSON-LD (headline, datePublished/Modified,
      author→Organization "Kaman İlan", image [16:9, 1:1], `isBasedOn: source_url`)
- [x] `/haberler-sitemap.xml`: son 48 saat Google News uzantılı + tüm yayınlar standart;
      ana sitemap index'e ekle
- [x] `/haberler/rss.xml` çıkış beslemesi (son 50, tam meta)
- [x] `HF/backend/src/modules/indexnow` → KI'ye kopyala/uyarl; haber+duyuru yayınında ping
- [x] `duyurular` detayına canonical + OG + `Article` JSON-LD (mevcutta eksikse)
- [x] Haber gövdesinde `internal_links` önerilerini render et (min 2 dahili link)
- [x] Kabul: Rich Results Test NewsArticle geçer; sitemap'ler valid; RSS parse ediliyor

## WP-8 — Dönüşüm olayları (audit P0-2 kapanışı)

- [x] GA4/Ads olayları: `sign_up`, `listing_submit` (başlangıç/hata/başarı),
      `generate_lead`, `phone_click`, `whatsapp_click` — ilan+kategori kimliğiyle
- [x] Reklam motoru `POST /banners/conversion` çağrısı aynı noktalardan (çift kayıt değil:
      GA4 pazarlama, motor sponsor raporu için)
- [x] Kabul: DebugView'da olaylar görünüyor; motor conversion raporu doluyor

## WP-9 — Kapanış

- [x] `KI/README.md` + `CLAUDE.md`: yeni modüller (ads, AI haber hattı, görsel kuyruğu)
- [x] `project.portfolio.json`: techs/features doğrulandı; AGENTS.md sahiplik kuralı gereği
      Codex tarafından değiştirilmedi (mevcut metadata korunuyor)
- [x] `.env.example`: yeni değişkenler (COOKIE_SECRET boş, AI anahtar isimleri)
- [x] Tam regresyon: typecheck + tüm testler + fresh seed + dev smoke (ana rotalar 200)
- [x] Deploy notu hazırla (deploy/ altına): env listesi, seed sırası, PM2 restart sırası —
      **canlıya çıkış kullanıcı onayıyla** (müşteri sitesinde görünür değişiklik kuralı)

---

## Sıralama ve bağımlılık

```
WP-0 → WP-1 → WP-2 → WP-3 → WP-4 ──────────────┐
                     └→ WP-5 → WP-6 → WP-7 ─────┼→ WP-8 → WP-9
```

WP-5..7 (haber hattı) WP-3'ten sonra WP-4 ile **paralel** yürüyebilir —
farklı dosya kümeleri, çakışma yok. Tek ajan çalışıyorsa yukarıdaki düz sıra izlenir.
