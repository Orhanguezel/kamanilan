// =============================================================
// FILE: src/app/(main)/admin/(admin)/articles/[id]/page.tsx
// Admin Haber Create/Edit Page
// =============================================================

import AdminArticlesDetailClient from "../admin-articles-detail-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminArticlesDetailClient id={id} />;
}
