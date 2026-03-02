// =============================================================
// FILE: src/app/(main)/admin/(admin)/catalog/[id]/page.tsx
// Admin Catalog Request Detail Page
// =============================================================

import AdminCatalogDetailClient from '../_components/admin-catalog-detail-client';

export default function Page({ params }: { params: { id: string } }) {
  return <AdminCatalogDetailClient id={params.id} />;
}
