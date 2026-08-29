// =============================================================
// FILE: src/app/(main)/admin/(admin)/reviews/[id]/page.tsx
// FINAL — Admin Review Detail/Edit Page
// =============================================================

import AdminReviewsDetailClient from '../_components/admin-reviews-detail-client';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminReviewsDetailClient id={(await params).id} />;
}
