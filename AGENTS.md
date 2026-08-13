# AGENTS.md — Kamanilan (Codex talimatları)

## Aktif iş: Reklam motoru portu + AI haber hattı

Sıra ve kurallar burada:

1. **Konsept/gerekçe:** [docs/ILAN-HABER-REKLAM-KONSEPT.md](docs/ILAN-HABER-REKLAM-KONSEPT.md)
2. **İş paketleri (WP-0..WP-9) ve kabul kriterleri:** [docs/ILAN-HABER-REKLAM-CHECKLIST.md](docs/ILAN-HABER-REKLAM-CHECKLIST.md)

Checklist'teki sırayı izle; her WP tek commit; WP kabul kriteri sağlanmadan
sonrakine geçme.

## Kesin kurallar

- **ALTER TABLE yasak.** Şema değişikliği = `src/db/seed/sql/` içindeki CREATE TABLE
  güncellenir + `bun run build && bun run db:seed:fresh`.
- **Secret fallback yasak.** `JWT_SECRET`, `COOKIE_SECRET` → `requireEnv`; `.env.example`'da boş.
- Mevcut `backend/src/modules/banner` (dekoratif hero) modülüne **dokunma** —
  yeni reklam motoru `backend/src/modules/ads` altına gelir.
- Runtime: bun. Her WP sonunda `bun run typecheck` + ilgili testler yeşil.
- Canlıya deploy etme; deploy kararı kullanıcıya ait (müşteri sitesinde görünür
  değişiklik kuralı). İş lokalde biter, deploy notu `deploy/` altına yazılır.

## Kaynak sistem

Reklam motoru buradan kopyalanır (yeniden yazılmaz):
`~/Documents/Projeler/tarim-dijital-ekosistem/projects/hal-fiyatlari`
— `backend/src/modules/banners`, `db/seed/sql/040+058-079`, `components/ads`,
admin `banners/` sayfaları, `test/banner-*.test.ts`, cron blokları.

## Yapı özeti

- `frontend/` — müşteri sitesi (Next.js, App Router, sayfalar: ilanlar, haberler,
  duyurular, kategoriler, magazalar, reklam-ver)
- `admin_panel/` — yönetim (articles, banners, news-sources, news-suggestions var;
  `ads/` bölümü eklenecek)
- `backend/` — Fastify + Drizzle + MySQL; modüller `src/modules/`, şema
  `src/db/seed/sql/` (numaralı, fresh-seed düzeni)
- AI sağlayıcı zinciri: `backend/src/modules/_shared/aiChain.ts` (groq→openai→anthropic→gemini)
- Görsel üretimi API ile YAPILMAZ — brif üret, kullanıcı görseli chat'te üretip
  `content-images/gelen/` klasörüne bırakır, `bun run gorsel:import` eşleştirir (WP-6).
