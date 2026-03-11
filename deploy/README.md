# Kamanilan Deploy

Bu klasor iki ayri deploy yolunu tutar:

- `deploy/docker-compose.yml`: container tabanli calistirma
- `.github/workflows/deploy-production.yml`: CI'da build alip sunucuya prebuilt release gonderen production akisi

## Production mimarisi

- Build yalnizca CI'da alinir
- Sunucuya `tar.gz` release artifact'i gider
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

## Docker secenegi

1. `cp deploy/.env.example deploy/.env`
2. `deploy/.env` icinde domain, port ve secret degerlerini doldur
3. `docker compose --env-file deploy/.env -f deploy/docker-compose.yml build`
4. `docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d`
