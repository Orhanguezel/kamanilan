# CLAUDE.md — Kamanilan

## Proje Ozeti

Kaman İlan, Kaman/Kırşehir odaklı ilan, mağaza, haber, duyuru ve yerel reklam
platformudur. İlanlar ücretsiz kalır; ticari reklam motoru ayrı `modules/ads`
modülünde çalışır ve dekoratif `modules/banner` modülünün yerine geçmez.

## Workspace Haritasi

- `frontend/`: musteri web uygulamasi
- `admin_panel/`: yonetim paneli
- `backend/`: Fastify API ve veri katmani
- `deploy/`: release/deployment varliklari
- `backend/src/modules/ads/`: reklam yaşam döngüsü, envanter, ölçüm ve raporlar
- `backend/src/modules/newsAggregator/`: kaynak toplama ve AI haber işleme
- `content-images/`: kullanıcı tarafından üretilen haber görsellerinin kuyruğu

## Haber ve Görsel Akışı

1. Haber önerisi kaynak URL'siyle alınır.
2. `aiChain` sağlayıcı zinciri özgün metin, meta alanları, dahili bağlantılar ve
   görsel brifi üretir; kaynak atfı korunur.
3. Görsel API'si çağrılmaz. Görseller `content-images/gelen/<slug>.*` dizinine
   bırakılır ve `bun run gorsel:import` ile optimize edilip eşleştirilir.
4. Hazır içerik yayınlanınca NewsArticle, sitemap/RSS ve IndexNow akışı çalışır.

## Reklam ve Dönüşüm Akışı

- Ticari reklam API'si `/api/v1/banners/*`, kodu `backend/src/modules/ads/` altındadır.
- GA4/Ads olayları pazarlama ölçümü; `/banners/conversion` ise sponsor attribution
  raporu içindir. Tek kullanıcı aksiyonu her hedefe en fazla bir kez gönderilir.
- İmzalı attribution cookie için `COOKIE_SECRET` zorunludur ve fallback kullanılamaz.

## Calisma Kurallari

- Yerel pazar iş kurallarını README ve metadata ile tutarlı tut.
- Script veya klasor bilgisi yazarken mevcut checkout'taki dosyalari esas al.
- Iyzipay, OAuth veya i18n gibi entegrasyonlar degisirse dokumani metadata ile birlikte guncelle.

## Portfolio Metadata Rule

- Proje kokunde `project.portfolio.json` dosyasi zorunludur.
- Proje ozeti, stack, servis veya kategori degisirse once bu dosya guncellenir.
- `project.portfolio.json` yalnızca Claude Code tarafından güncellenir; Codex bu
  dosyaya dokunmaz.
