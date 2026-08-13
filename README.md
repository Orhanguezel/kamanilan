# Kaman İlan

Kaman İlan; Kaman ve Kırşehir odaklı ilan, mağaza, haber ve duyuru platformudur.
Müşteri sitesi, yönetim paneli ve Fastify API aynı workspace içinde geliştirilir.

## Workspace Yapisi

- `frontend/`: Next.js tabanli musteri web uygulamasi
- `admin_panel/`: Next.js tabanli yonetim paneli
- `backend/`: Fastify API, veri katmanı, reklam motoru ve haber işleme hattı
- `backend/src/modules/ads/`: ticari reklam envanteri, hedefleme, ölçüm, ödeme ve raporlama
- `backend/src/modules/newsAggregator/`: kaynak toplama ve AI destekli haber hazırlama
- `content-images/`: token kullanmayan haber görsel kuyruğunun gelen/işlenen dosyaları
- `deploy/`: release ve deployment notlari
- `prime-frontend-nextjs/`: ek frontend varyanti

## Dogrulanmis Teknoloji Yigini

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- Backend: Fastify, Drizzle ORM, MySQL, Bun, Zod
- Entegrasyonlar: React Query, Cloudinary, Nodemailer, JWT, Iyzipay, Google OAuth,
  GA4/Google Ads dönüşüm olayları ve IndexNow

## Ana Modüller

- Reklam motoru: 14 site slotu, mağaza/ilan hedefleme, rotasyon, frekans sınırı,
  self-servis talepleri, finans ve sponsor dönüşüm raporları.
- AI haber hattı: RSS/web önerilerini `groq → openai → anthropic → gemini`
  zinciriyle özgün yerel habere dönüştürür; kaynak bağlantısını korur.
- Görsel kuyruğu: AI görsel API'si kullanmaz. Admin brifleri dışa aktarır; kullanıcı
  görseli `content-images/gelen/<slug>.*` altına bırakır ve `gorsel:import` kapak,
  kare ve thumbnail WebP türevlerini üretir.
- SEO/GEO: NewsArticle yapılandırılmış verisi, haber sitemap/RSS ve IndexNow.
- Dönüşüm ölçümü: GA4/Ads pazarlama olayları ile sponsor attribution kayıtları ayrı
  hedeflere, aynı kullanıcı aksiyonundan birer kez gönderilir.

## Komutlar

Frontend:

```bash
cd frontend
bun run dev
bun run build
bun run start
```

Admin panel:

```bash
cd admin_panel
npm run dev
npm run build
npm run start
npm run check:fix
```

Backend:

```bash
cd backend
bun run dev
bun run build
bun run start
bun run db:seed
# Haber görsellerini içe aktar
bun run gorsel:import
```

Fresh seed, mevcut veritabanını yeniden kurar ve yalnızca geliştirme/test ortamında
çalıştırılmalıdır. Üretim çıkış sırası için `deploy/ILAN-HABER-REKLAM-RELEASE.md`
dosyasını izleyin.

## Dokumantasyon Notu

Bu projede doğru portfolio kaynağı `project.portfolio.json`'dur. Bu dosya yalnızca
mimari sahibi tarafından güncellenir.
