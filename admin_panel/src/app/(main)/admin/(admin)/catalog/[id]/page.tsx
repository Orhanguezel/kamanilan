// =============================================================
// FILE: src/app/(main)/admin/(admin)/catalog/[id]/page.tsx
// Admin Catalog Request Detail Page
// =============================================================

import AdminCatalogDetailClient from '../_components/admin-catalog-detail-client';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminCatalogDetailClient id={(await params).id} />;
}
