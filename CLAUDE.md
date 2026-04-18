# CLAUDE.md — Kamanilan

## Proje Ozeti

Kamanilan, emlak ilanlari ve yonetim akislarini kapsayan bir full-stack platformdur. Mevcut workspace icinde musteri sitesi, yonetim paneli, backend ve deployment klasorleri bulunur.

## Workspace Haritasi

- `frontend/`: musteri web uygulamasi
- `admin_panel/`: yonetim paneli
- `backend/`: Fastify API ve veri katmani
- `deploy/`: release/deployment varliklari

## Calisma Kurallari

- Emlak odakli is kurallarini README ve metadata ile tutarli tut.
- Script veya klasor bilgisi yazarken mevcut checkout'taki dosyalari esas al.
- Iyzipay, OAuth veya i18n gibi entegrasyonlar degisirse dokumani metadata ile birlikte guncelle.

## Portfolio Metadata Rule

- Proje kokunde `project.portfolio.json` dosyasi zorunludur.
- Proje ozeti, stack, servis veya kategori degisirse once bu dosya guncellenir.
- Portfolio ve seed senkronu icin metadata guncel tutulur.
