# Kaman İlan — İlan + Haber + Duyuru Platformu Konsept Raporu

**Tarih:** 2026-08-13
**Hazırlayan:** Claude Code (mimari/strateji)
**Uygulayıcı:** Codex — bu rapor + [ILAN-HABER-REKLAM-CHECKLIST.md](ILAN-HABER-REKLAM-CHECKLIST.md)
**Kaynak sistem:** hal-fiyatlari reklam motoru
(`~/Documents/Projeler/tarim-dijital-ekosistem/projects/hal-fiyatlari`)

---

## 1. Vizyon ve iş modeli

kamanilan.com, Kaman/Kırşehir odaklı **yerel ilan + haber + duyuru portalı** olur.
Gelir sırası bilinçli olarak şöyle kurgulanır:

| Faz | Gelir kaynağı | Ön koşul | Durum |
|---|---|---|---|
| **A — Reklam** | Yerel işletmelere banner/slot satışı (haldefiyat motoru) | Motorun portu + içerik hacmi | **Bu raporun kapsamı** |
| B — Öne çıkan ilan | Ücretli doping/vitrin (ilanlar ücretsiz kalır) | Faz A canlı + kart ödemesi | Sonra |
| C — Ürün satışı | Sepet + iyzipay ile e-ticaret | Kredi kartı ödeme aktifleşince | Sonra (kod hazır, rotalar kapalı) |

İlanlar **ücretsiz kalır** — arz büyütme aracıdır. Para reklamdan ve (sonra)
vitrin/üründen kazanılır. Haber/duyuru içeriği ise reklam envanterinin
gösterim hacmini üreten trafik motorudur: içerik → trafik → reklam geliri.

`docs/AD-READINESS-AUDIT-2026-08-12.md` bulgusu geçerliliğini korur: canlı
sitede yalnız **2 aktif ilan** var. Reklam satışı içerik hacmi olmadan
anlamsız — bu yüzden haber modülü reklam motoruyla **aynı öncelikte**dir.

---

## 2. Mevcut durum envanteri (kamanilan)

İnceleme 2026-08-13 checkout'una göredir.

### Zaten var olanlar

| Alan | Durum | Not |
|---|---|---|
| `modules/banner` (backend) | **Dekoratif hero banner** — 690 satır | Renk/buton/satır-sütun düzeni; ödeme, ölçüm, hedefleme YOK. Reklam motoru DEĞİL. |
| `modules/articles` + `haberler/` FE | Çalışıyor | SEO alanları (meta, excerpt, reading_time) mevcut; yorum+beğeni tabloları var |
| `modules/newsAggregator` | Çalışıyor | `news_sources` (rss/og/scrape) → cron fetch → `news_suggestions` (pending/approved/rejected) → onayda `articles` kaydı |
| `duyurular/` FE + `announcements` tablosu | Çalışıyor | Kategoriler: duyuru/haber/kampanya/etkinlik/güncelleme |
| `modules/_shared/aiChain.ts` | Hazır | groq→openai→anthropic→gemini zincirli sağlayıcı; env > DB config |
| `modules/photoQueue` | Hazır | Görsel işleme kuyruğu deseni (retry/failed/stats) — AI görsel akışına şablon |
| `cart` + `subscription` + iyzipay paketi | Kod var, **rotalar kapalı** | Faz C'de açılacak |
| `reklam-ver/` FE sayfası | Var | Şu an vitrin; self-servis akışına bağlanacak |
| Admin panel | articles, banners, news-sources, news-suggestions, newsletter bölümleri | Yeni reklam yönetimi buraya eklenecek |

### Eksikler (bu projenin kapsamı)

1. Ticari reklam motoru (slot kataloğu, yaşam döngüsü, ödeme, ölçüm, hedefleme…)
2. Haber içeriklerinin AI ile yeniden yazımı + yerel görsel üretim akışı
3. Haber SEO/GEO derinliği (NewsArticle JSON-LD, haber sitemap'i, RSS çıkışı)
4. Dönüşüm olayları (audit P0-2: `sign_up`, `listing_submit`, telefon/WA tıklaması)

---

## 3. Kaynak sistem: hal-fiyatlari reklam motoru — yetenek haritası

Kopyalanacak motorun tamamı. **Hiçbir yetenek atlanmaz** — kullanıcı kararı:
"kabiliyetlerin tamamını alalım, kodu tekrar yazmayalım."

### 3.1 Kod envanteri

| Katman | Dosyalar | Boyut |
|---|---|---|
| Backend modül | `backend/src/modules/banners/{index.ts, repository.ts}` | 1 209 + 1 792 ≈ 3 000 satır |
| DB şemaları | `backend/src/db/seed/sql/040 + 058–079` (22 dosya) | 15 tablo |
| Cron | `backend/src/cron.ts` içinde 5 iş | lifecycle, source-audit, performance, reports, archive |
| Frontend | `components/ads/` (BannerSlot, TemplateBanner, ResilientAdImage, AdConversionTracker, …) + `lib/banners.ts` + `lib/ad-conversions.ts` | ≈ 500 satır |
| Admin | `admin/(admin)/banners/` liste (845) + detay client (1 208) + önizleme bileşenleri | ≈ 2 100 satır |
| Test | `test/banner-{measurement,authorization,rotation,targeting,workflow}.test.ts` | 5 dosya |

### 3.2 Tablolar (hf_ öneki kamanilan'da kaldırılacak)

`hf_banners`, `hf_ad_slots`, `hf_banner_targets`, `hf_ad_waitlist`,
`hf_ad_packages`, `hf_ad_package_slots`, `hf_ad_price_overrides`,
`hf_ad_payments`, `hf_banner_visitor_frequency`, `hf_banner_daily_metrics`,
`hf_banner_metric_uniques`, `hf_banner_conversions`, `hf_firm_members`,
`hf_ad_self_service_requests`, `hf_ad_audit_logs`.

### 3.3 Yetenekler (tam liste)

**Envanter ve satış**
- Slot kataloğu (`ad_slots`): sayfa tipi, masaüstü/mobil kapasite, mobil davranış
  (stack/hide/single/scroll), teslim modu (fixed/rotation), önerilen görsel ölçüsü
- Takvim envanteri (93 güne kadar doluluk), tarih bazlı uygunluk sorgusu, satır/sütun
  çakışma kontrolü (`findLayoutConflicts`)
- Bekleme listesi + alternatif slot önerisi (aynı sayfa tipinde boş slot eşleme)
- Reklam paketleri (günlük/haftalık/aylık/özel; gösterim/tıklama limitli)
- Fiyat motoru: taban günlük fiyat × trafik × görünürlük × cihaz çarpanları,
  hedefleme kapsamına göre; manuel fiyat/indirim **gerekçe zorunlu** + override kaydı

**Yaşam döngüsü ve finans**
- 10 durumlu lifecycle: draft → proposal → reserved → payment_pending → scheduled
  → live → completed / cancelled / problem / archived; geçiş matrisi zorunlu
- Rezervasyona otomatik ödeme penceresi (varsayılan 72 saat), süresi dolan
  rezervasyonların cron'la iptali
- Ödeme kayıtları (nakit/havale/kart/diğer), kısmi tahsilat, iade (tahsilatı aşamaz),
  vadesi geçen ödeme uyarıları, ödeme olmadan yayına çıkamama (gerekçeli istisna hariç)
- Teklif PDF'i, performans PDF/CSV raporu, fatura/sözleşme/kreatif dosya linkleri
- Finansal etkili her işlem `ad_audit_logs`'a before/after snapshot ile yazılır

**Hedefleme ve sunum**
- 9 kapsam tipi: global, page_type, city, district, product, category, market, firm, listing
- Ziyaretçi frekans sınırı (SHA-256 anonim hash; IP+UA+secret) — günlük ve kampanya
  bazında gösterim tavanı, sayfa bazlı tekrarlama koruması
- Ağırlıklı rotasyon + A/B varyant (`experimentKey`/`creativeVariant`) +
  otomatik ağırlık optimizasyonu (min gösterim eşiği sonrası CTR'a göre; cron)
- Cihaz hedefleme (all/desktop/mobile — UA'dan), bot/ölü trafik filtresi
  (UA + `x-bot-score`/`cf-bot-score`)

**Kreatif ve kalite**
- 8 kreatif şablon: image, firm, listing, sponsorship, leaderboard, split, mpu, mobile
- `creativeConfig`: renkler, animasyon, odak noktası (focalX/Y), fit, ölçü, bayt
- Yayın öncesi kalite raporu: alt metin, HTTPS, link erişilebilirliği (HEAD),
  `rel="sponsored nofollow noopener"` zorunluluğu, başlık/CTA uzunluğu, görsel
  ağırlığı (1,5 MB), ölçü/oran uyumu, WCAG kontrast (4.5), animasyon uyarısı
- Hata varsa yayın engellenir; uyarı varsa **gerekçeli override** şart
- `code` tipi reklamlarda sanitize-html beyaz listesi (script imkânsız)
- İlan kaynaklı reklamda ilan onaylı/şüpheli-değil/süresi-geçmemiş kontrolü (cron da denetler)

**Ölçüm ve raporlama**
- Gösterim/tekil gösterim/tıklama/tekil tıklama; günlük metrik + tekil tablosu
- Dönüşüm atıfı: imzalı cookie (30 gün) → listing_view, offer_submit, phone_click,
  whatsapp_click, firm_contact, directions_click, favorite_add
- CTR/CPM/CPC/CPA hesaplı kampanya raporu; gelir raporu; dağılım raporu;
  sponsora zamanlanmış haftalık e-posta raporu (cron)
- Tıklama endpoint'i: rate-limit'li, güvenli hedef doğrulaması (`safeAdDestination`), 302

**Self-servis**
- Firma üyeleri (`firm_members`) kendi kampanyalarını görür, PDF rapor indirir,
  kreatif değişikliği/uzatma/yeni slot/destek talebi açar; admin onay/red/revizyon akışı

### 3.4 Taşınabilirlik notları (uyarlama gerektirir)

1. **`@agro/shared-backend` → `@vps/shared-backend`**: `requireAuth`,
   `getAuthUserId`, `isBotUserAgent` importları. kamanilan'daki karşılıklar
   kullanılacak; `isBotUserAgent` yoksa helper modülle birlikte kopyalanır.
2. **Migrasyon stili çelişkisi:** hal-fiyatlari 058–079 dosyaları `ALTER TABLE`
   kullanıyor. kamanilan CLAUDE.md kuralı gereği ALTER **yasak** — 22 dosya,
   nihai kolon setiyle **konsolide `CREATE TABLE`** dosyalarına indirgenecek
   (yeni `13x_ads_*.sql` serisi) ve `db:seed:fresh` ile kurulacak.
3. **Bağımlılık eksikleri:** `sanitize-html` ve `@fastify/rate-limit`
   kamanilan backend'de yok — eklenecek. `@fastify/cookie` var; imzalı cookie
   için `COOKIE_SECRET` **`requireEnv` ile** (fallback YASAK — güvenlik kuralı).
4. **`firm` kavramı → `seller` (mağaza):** haldefiyat'ta firma ne ise kamanilan'da
   mağaza odur. `firm_members` → `seller_members`; self-servis mağaza hesabına bağlanır.
5. **`getListingCreative`**: kamanilan `proporties`/`myListings` modülündeki ilan
   verisiyle yeniden eşlenir (onay durumu, şüpheli bayrağı, geçerlilik, görsel).
6. **Pozisyon anahtarları** kamanilan sayfalarına göre yeniden tanımlanır (aşağıda).
7. **Mevcut `modules/banner` (hero) DOKUNULMAZ** — dekoratif içerik olarak kalır.
   Yeni motor ayrı `modules/ads` adıyla gelir; isim çakışması yok.

### 3.5 kamanilan slot planı (ilk katalog)

| slotKey | Sayfa | Yer |
|---|---|---|
| `global_top` | Tüm sayfalar | Header altı şerit |
| `global_footer` | Tüm sayfalar | Footer üstü |
| `home_hero_below` | Ana sayfa | Hero altı |
| `home_mid` | Ana sayfa | Kategori vitrin arası |
| `listings_top` | /ilanlar | Liste üstü |
| `listings_sidebar` | /ilanlar | Filtre kenarı |
| `listing_detail_sidebar` | /ilan/[slug] | Detay kenarı |
| `listing_detail_below` | /ilan/[slug] | Açıklama altı |
| `category_inline` | /kategori/[slug] | Liste içi (3. sıradan sonra) |
| `news_top` | /haberler | Liste üstü |
| `news_detail_inline` | /haberler/[slug] | İçerik ortası |
| `news_detail_sidebar` | /haberler/[slug] | Kenar |
| `announcements_top` | /duyurular | Liste üstü |
| `store_detail_sidebar` | /magazalar/[slug] | Mağaza kenarı |

Hedefleme kapsamları kamanilan taksonomisine çevrilir:
`city/district` → il/ilçe/mahalle-köy, `product` → alt kategori, `market` → **kaldırılır**,
`firm` → mağaza, `listing` → ilan. (Kapsam enum'undan `market` çıkarılır; kalan 8 tip.)

---

## 4. Haber modülü genişletmesi — AI içerik + yerel görsel hattı

### 4.1 Mevcut akış ve eklenecek katman

```
MEVCUT:  news_sources ──cron──▶ news_suggestions ──admin onay──▶ articles ──▶ /haberler
EKLENEN:                              │
                                      ▼
                          [AI YENİDEN YAZIM — aiChain]
                          başlık + özet + gövde + meta + etiket + görsel brifi
                                      │
                                      ▼
                          [GÖRSEL KUYRUĞU — token'sız]
                          brif listesi → kullanıcı görselleri CHAT'te üretir
                          → content-images/gelen/ klasörüne koyar
                          → import script eşleştirir + WebP optimize eder
                                      │
                                      ▼
                          [YAYIN KAPISI] görsel + AI metin hazır → yayınla
                          NewsArticle JSON-LD + OG + haber sitemap + RSS + IndexNow ping
```

### 4.2 AI yeniden yazım (metin — aiChain üzerinden, ucuz modeller)

`news_suggestions`'a yeni kolonlar: `ai_status` (none/queued/done/failed),
`ai_title`, `ai_excerpt`, `ai_content`, `ai_meta_title`, `ai_meta_description`,
`ai_tags`, `image_brief`, `image_status` (none/waiting/received/attached).

Kurallar:
- Kaynağa atıf korunur (`source`, `source_url` alanları zaten var) — yeniden
  yazım **özgünleştirme**dir, intihal değil: yerel bağlam (Kaman/Kırşehir açısı)
  eklenir, yapı değiştirilir, kaynak linki verilir.
- Çıktı şeması zorunlu JSON; başarısızlıkta `ai_status=failed` + admin'de tekrar butonu.
- aiChain'in mevcut sırası kullanılır (groq önce = ucuz/hızlı); token maliyeti
  metin için düşüktür, **görsel için API kullanılmaz** (aşağıda).

### 4.3 Görsel hattı — token harcamadan (kullanıcı kararı)

Görseller API ile DEĞİL, kullanıcının kendisi tarafından **bu chat üzerinden**
üretilir. Sistemin görevi bunu zahmetsiz kılmak:

1. AI yeniden yazım her haber için bir **görsel brifi** üretir (tek paragraf
   sahne tarifi + stil + `slug` dosya adı; 1200×675 ana + 1080×1080 kare).
2. Admin panelde "Görsel Kuyruğu" sayfası brifleri listeler; **"Brifleri kopyala"**
   butonu tümünü panoya markdown olarak verir → kullanıcı chat'e yapıştırır,
   görselleri üretir, `content-images/gelen/<slug>.png` olarak kaydeder.
3. `scripts/gorsel-import.ts`: klasörü tarar, slug ile eşleştirir, WebP'ye çevirir
   (kapak + kare + thumb), Cloudinary'ye/statik dizine koyar, `image_status=received`.
4. Görseli gelen + AI metni hazır haber tek tıkla (veya `auto_publish` açıksa
   otomatik) yayınlanır.

photoQueue modülündeki retry/failed/stats deseni bu kuyruğun şablonudur.

### 4.4 SEO/GEO uyum paketi (haber tarafı)

- `NewsArticle` JSON-LD (headline, datePublished/Modified, author→Organization,
  image 16:9+1:1, isBasedOn=source_url) — ilan detayda mevcut yapı örnek alınır
- `/haberler-sitemap.xml` (son 48 saat için Google News uzantılı; eskiler normal)
- `/haberler/rss.xml` çıkış beslemesi (site kendi kaynağını sendikasyona açar)
- IndexNow ping (hal-fiyatlari `modules/indexnow` birebir kopyalanabilir — küçük modül)
- Yayında dahili bağlantı: haber gövdesine ilgili kategori/ilan linki (AI yazımda
  `internal_links` önerisi), her haberde min 2 dahili link hedefi
- `duyurular` aynı meta disiplinine çekilir (canonical, OG, JSON-LD `SpecialAnnouncement`
  yalnız uygunsa; değilse `Article`)
- Reklam yüzeyleri `rel="sponsored"` + CLS-güvenli sabit yükseklik konteyneri
  (audit'teki LCP/CLS kazanımlarını reklamlar geri yememeli — slot bileşeni
  rezerve alanla render edilir)

---

## 5. Uygulama stratejisi — "önce kopyala, sonra uyarla"

Kullanıcının açık kararı: kod yeniden yazılmaz. Sıra şöyledir:

1. **KOPYALA (birebir):** banners modülü, ads SQL dosyaları, ads frontend
   bileşenleri, admin banner sayfaları, 5 test dosyası, cron blokları →
   kamanilan'a `modules/ads` + `components/ads` + `admin/ads` olarak.
   Bu aşamada import yolları kırık olabilir; commit "port: raw copy" olur.
2. **UYARLA (derleninceye kadar):** import eşleme (@agro→@vps), env, tablo
   önekleri, pozisyon/kapsam enum'ları, seller/ilan eşlemesi, mevcut auth guard.
3. **KONSOLİDE ET:** 22 SQL → yeni seri `130_ads_core.sql`–`134_ads_reports.sql`
   (nihai kolon setli CREATE TABLE; ALTER yok) + `135_ads_slots_seed.sql`
   (kamanilan slot kataloğu + varsayılan fiyatlar).
4. **BAĞLA:** frontend sayfalarına slot yerleşimi, admin menü, cron kayıt,
   `reklam-ver` sayfasını self-servis talebine bağlama.
5. **HABER GENİŞLETMESİ:** AI yazım + görsel kuyruğu + SEO paketi (ayrı iş paketi).

Ayrıntılı iş paketleri ve kabul kriterleri: [ILAN-HABER-REKLAM-CHECKLIST.md](ILAN-HABER-REKLAM-CHECKLIST.md)

---

## 6. Riskler ve ön koşullar

| Risk | Etki | Önlem |
|---|---|---|
| İlan arzı 2 adet (audit P0-1) | Reklam satışı inandırıcı olmaz | `ilan-bootstrap-plani.md` + haber trafiği önce; reklam satışı içerik hacmiyle başlar |
| ALTER'lı kaynak migrasyonlar | Fresh deploy'da şema sapması | Konsolide CREATE TABLE (strateji md. 5.3) — pazarlık edilemez |
| Reklamların CWV'ye etkisi | LCP 8.14 sn zaten sınırda | Rezerve alanlı slot, lazy hydrate, görsel WebP + boyut zorunluluğu (kalite kontrolü motorda var) |
| AI içerikte telif/atıf | Kaynak siteyle ihtilaf | Özgünleştirme + görünür kaynak atıfı + isBasedOn; şüpheli kaynak admin'de kapatılır |
| COOKIE_SECRET/JWT fallback | Güvenlik ihlali (workspace kuralı) | `requireEnv` — fallback'li hiçbir secret merge edilmez |
| Ödeme henüz kapalı | Reklam tahsilatı manuel | Motor zaten nakit/havale kaydı destekliyor; kart Faz C'de iyzipay'e bağlanır |

## 7. Başarı ölçütleri (Faz A sonu)

- 14 slot kataloğu canlı, en az 3'ünde gerçek yerel reklam kampanyası
- Haber hattı: haftada ≥ 10 AI-işlenmiş, özgün görselli, JSON-LD'li haber
- Dönüşüm olayları GA4/Ads'te doğrulanmış (audit P0-2 kapanmış)
- Reklam eklenmiş sayfalarda CLS ≤ 0.05 korunmuş, LCP gerilememiş
- `bun run typecheck` + 5 banner test dosyası kamanilan'da yeşil
