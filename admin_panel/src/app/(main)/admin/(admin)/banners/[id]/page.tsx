import AdminBannersDetailClient from '../_components/admin-banners-detail-client';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (id === 'new') {
    return <AdminBannersDetailClient mode="create" />;
  }

  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) {
    return <AdminBannersDetailClient mode="create" />;
  }

  return <AdminBannersDetailClient mode="edit" id={numId} />;
}

