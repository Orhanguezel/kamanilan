// =============================================================
// FILE: src/app/(main)/admin/(admin)/offer/[id]/page.tsx
// Admin Offer Detail Page
// =============================================================

import AdminOfferDetailClient from '../_components/admin-offer-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> | Params }) {
  const p = (await params) as Params;
  return <AdminOfferDetailClient id={p.id} />;
}
