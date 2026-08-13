# İlan, Haber ve Reklam Paketi — Üretim Çıkış Notu

Bu paket görünür müşteri sitesi değişiklikleri ve yeni veritabanı tabloları içerir.
Üretime çıkış yalnızca kullanıcı onayıyla yapılır.

## 1. Zorunlu ortam değişkenleri

Backend shared `.env` içinde mevcut DB, URL, SMTP ve OAuth değerlerine ek olarak:

```dotenv
JWT_SECRET=
COOKIE_SECRET=
AI_PROVIDER_ORDER=groq,openai,anthropic,gemini
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
INDEXNOW_KEY=
INDEXNOW_SITE_URL=https://www.kamanilan.com
```

- `JWT_SECRET` ve `COOKIE_SECRET` boş bırakılamaz; her biri benzersiz en az 32 bayt
  olmalıdır. Örnek üretim: `openssl rand -hex 40` (iki kez çalıştırın).
- AI zinciri için en az bir sağlayıcının anahtarı gerekir. Kullanılmayan anahtarlar
  boş kalabilir.
- Secret değerlerini repository'ye veya release artifact'ine eklemeyin.

## 2. Çıkış öncesi kapılar

```bash
cd backend && bun x tsc --noEmit && bun run test && bun run build
cd ../frontend && bun run test && bun x tsc --noEmit && bun run build
cd ../admin_panel && bun x tsc --noEmit && bun run build
```

Fresh seed tüm veriyi siler; yalnızca boş/staging veritabanında doğrulama içindir:

```bash
cd backend
bun run db:seed
```

Üretimde `db:seed:fresh` çalıştırmayın. Mevcut üretim verisini koruyan release
prosedürü ayrıca onaylanmadan şema adımı uygulanmamalıdır.

## 3. Release ve PM2 sırası

1. Mevcut veritabanı ile `shared/backend/.env` dosyasının yedeğini alın.
2. Prebuilt release artifact'ini `deploy/push-release.sh` ile yükleyin.
3. Release installer `current` symlink'ini değiştirir ve PM2'yi ecosystem dosyasıyla
   yeniden yükler. Elle müdahale gerekirse sıralama:

```bash
pm2 restart kamanilan-backend --update-env
pm2 restart kamanilan-frontend --update-env
pm2 restart kamanilan-admin-panel --update-env
pm2 save
```

Backend sağlık kontrolü başarılı olmadan frontend ve panel kabul testine geçmeyin.

## 4. Canlı smoke

- API sağlık endpoint'i ve `/api/v1/banners/slots` 200 döner.
- `/`, `/ilanlar`, bir ilan detayı, `/haberler`, bir haber detayı, `/duyurular`,
  `/magazalar` ve `/reklam-ver` açılır.
- Üç ayrı slotta test reklamı görünür; tıklama güvenli hedefe 302 döner.
- Telefon/WhatsApp aksiyonları GA4 DebugView'da görünür ve sponsor dönüşüm raporuna
  yalnızca bir kayıt düşer.
- Haber sitemap'i ve RSS parse edilir; tarayıcı konsolunda hata ve kırık görsel yoktur.

## 5. Geri alma

Önceki release dizinine `current` symlink'ini döndürün ve PM2 süreçlerini yukarıdaki
sırayla yeniden başlatın. Veritabanı değişikliği uygulandıysa yalnızca çıkış öncesi
alınan doğrulanmış yedekten, bakım penceresinde geri dönün.
