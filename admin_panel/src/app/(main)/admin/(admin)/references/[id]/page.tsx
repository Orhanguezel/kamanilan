import AdminReferenceDetailClient from '../_components/admin-references-detail-client';

export default async function AdminReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminReferenceDetailClient id={id} />;
}
