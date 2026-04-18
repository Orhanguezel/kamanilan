# Kamanilan Deploy

Bu klasor iki ayri deploy yolunu tutar:

- `deploy/docker-compose.yml`: container tabanli calistirma
- `.github/workflows/deploy-production.yml`: CI'da prebuilt release artifact ureten production akisi
- `deploy/push-release.sh`: prebuilt artifact'i sunucuya gonderip aktive eden sifir-build deploy komutu
- `deploy/nginx/*.conf`: production Nginx site config kaynaklari

## Production mimarisi

- Build yalnizca CI'da alinir
- CI `tar.gz` release artifact'i uretir
- Aktivasyon OpenClaw/lokal makineden `deploy/push-release.sh` ile yapilir
- Sunucu release'i `/var/www/kamanilan/releases/<sha>` altina acar
- `current` symlink yeni release'e doner
- `.env` dosyalari ve `uploads/` `shared/` altinda kalir
- PM2 uygulamalari `current` altindaki prebuilt dosyalardan restart edilir

## Ilk kurulum

1. GitHub Actions secrets:
   - `GZL_WEB_HOST`
   - `GZL_WEB_USER`
   - `GZL_WEB_SSH_KEY`
2. GitHub Actions vars:
   - `KAMANILAN_DEPLOY_BASE`
   - `KAMANILAN_DEFAULT_LOCALE`
   - `KAMANILAN_APP_ENV`
   - `KAMANILAN_FRONTEND_API_URL`
   - `KAMANILAN_FRONTEND_SOCKET_URL`
   - `KAMANILAN_FRONTEND_SITE_URL`
   - `KAMANILAN_ADMIN_SITE_URL`
   - `KAMANILAN_GTM_ID`
   - `KAMANILAN_GTM_SECONDARY_ID`
   - `KAMANILAN_GA_ID`
   - `KAMANILAN_RECAPTCHA_SITE_KEY`

## Nginx

1. `deploy/nginx/kamanilan.com.conf` dosyasini `/etc/nginx/sites-available/kamanilan.com` olarak kur
2. `deploy/nginx/panel.kamanilan.com.conf` dosyasini `/etc/nginx/sites-available/panel.kamanilan.com` olarak kur
3. `sudo nginx -t`
4. `sudo systemctl reload nginx`

Bu dosyalar production CSP allowlist'ini da tasir. Google login, GTM, GA ve Facebook entegrasyonlari icin gerekli `connect-src` origin'leri burada tanimlidir.

## Docker secenegi

1. `cp deploy/.env.example deploy/.env`
2. `deploy/.env` icinde domain, port ve secret degerlerini doldur
3. `docker compose --env-file deploy/.env -f deploy/docker-compose.yml build`
4. `docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d`
