// =============================================================
// FILE: src/app/(main)/admin/(admin)/imports/[id]/page.tsx
// =============================================================
import AdminImportDetailClient from "./admin-import-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AdminImportDetailClient id={id} />;
}
