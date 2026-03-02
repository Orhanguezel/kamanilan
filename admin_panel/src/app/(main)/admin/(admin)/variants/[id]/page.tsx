import AdminVariantsDetailClient from '../_components/admin-variants-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AdminVariantsDetailClient id={id} />;
}
