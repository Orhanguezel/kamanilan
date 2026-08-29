#!/usr/bin/env bash
# Haber toplayici teshis + onarim. Sunucuda calisir, seed CALISTIRMAZ.
# 1) cron env bayragini kontrol/duzelt  2) politika disi kaynaklari sil  3) backend reload
set -euo pipefail
ENVF=/var/www/vps-guezel/kamanilan/shared/backend/.env

echo "--- 1) cron bayragi ---"
if grep -q '^NEWS_AGGREGATOR_CRON_ENABLED=' "$ENVF"; then
  echo "mevcut: $(grep '^NEWS_AGGREGATOR_CRON_ENABLED=' "$ENVF")"
  sed -i 's/^NEWS_AGGREGATOR_CRON_ENABLED=.*/NEWS_AGGREGATOR_CRON_ENABLED=true/' "$ENVF"
else
  echo "tanimli degil -> ekleniyor"
  printf '\nNEWS_AGGREGATOR_CRON_ENABLED=true\n' >> "$ENVF"
fi
echo "yeni:   $(grep '^NEWS_AGGREGATOR_CRON_ENABLED=' "$ENVF")"

set -a; . "$ENVF"; set +a
MYSQL=(mysql -h"${DB_HOST:-127.0.0.1}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME")

echo "--- 2) politika disi ve bozuk kaynaklari sil ---"
"${MYSQL[@]}" -e "
  DELETE FROM news_suggestions
   WHERE source_name IN ('Sabah Gündem','Hürriyet Gündem','AA - Son Dakika',
                         'Kırşehir Haber Türk - Gündem','Kırşehir Haber Türk - Asayiş',
                         'Son Dakika - Kaman')
     AND status <> 'approved';
  DELETE FROM news_sources
   WHERE name IN ('Sabah Gündem','Hürriyet Gündem','AA - Son Dakika',
                  'Kırşehir Haber Türk - Gündem','Kırşehir Haber Türk - Asayiş',
                  'Son Dakika - Kaman');
  SELECT ROW_COUNT() AS silinen_kaynak;"

echo "--- 3) backend reload ---"
pm2 reload kamanilan-backend --update-env
echo "ilk fetch 30 sn sonra basliyor, bekleniyor..."
sleep 75

echo "--- 4) sonuc ---"
"${MYSQL[@]}" -e "
  SELECT id,name,is_enabled,error_count,last_fetched_at
    FROM news_sources ORDER BY display_order;
  SELECT COUNT(*) AS bekleyen_oneri FROM news_suggestions WHERE status='pending';"
pm2 logs kamanilan-backend --lines 30 --nostream 2>/dev/null | grep -i newsaggregator || echo "(logda newsAggregator satiri yok)"
