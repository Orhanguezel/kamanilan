// =============================================================
// FILE: src/app/(main)/admin/(admin)/announcements/[id]/page.tsx
// Admin Duyuru Detail (App Router)
// Route: /admin/announcements/:id  (id: "new" | numeric)
// =============================================================

import AdminAnnouncementsDetailClient from "../admin-announcements-detail-client";

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> | Params }) {
  const p = (await params) as Params;
  return <AdminAnnouncementsDetailClient id={p.id} />;
}
