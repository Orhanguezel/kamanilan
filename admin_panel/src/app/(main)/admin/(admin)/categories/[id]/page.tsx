// =============================================================
// FILE: src/app/(main)/admin/(admin)/categories/[id]/page.tsx
// Admin Category Detail/Edit Page (App Router)
// Route: /admin/categories/:id  (id: "new" | UUID)
// =============================================================

import CategoryDetailClient from '../_components/category-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> | Params }) {
  const p = (await params) as Params;
  return <CategoryDetailClient id={p.id} />;
}
