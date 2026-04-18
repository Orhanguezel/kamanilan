# Kamanilan

Kamanilan, ilan ve emlak yonetimi icin gelistirilmis bir full-stack platform workspace'idir. Mevcut yapida musteri sitesi, yonetim paneli ve backend bulunur.

## Workspace Yapisi

- `frontend/`: Next.js tabanli musteri web uygulamasi
- `admin_panel/`: Next.js tabanli yonetim paneli
- `backend/`: Fastify API ve veri katmani
- `deploy/`: release ve deployment notlari
- `prime-frontend-nextjs/`: ek frontend varyanti

## Dogrulanmis Teknoloji Yigini

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- Backend: Fastify, Drizzle ORM, MySQL, Bun, Zod
- Entegrasyonlar: next-intl, React Query, Cloudinary, Nodemailer, JWT, Iyzipay, Google OAuth

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
```

## Dokumantasyon Notu

Bu projede dogru portfolio kaynagi `project.portfolio.json`'dur. Ozette, servislerde, stack'te veya URL bilgisinde degisiklik olursa once metadata guncellenmelidir.
