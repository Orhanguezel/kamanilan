import AdminPopupsDetailClient from '../_components/admin-popups-detail-client';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (id === 'new') {
    return <AdminPopupsDetailClient mode="create" />;
  }
  return <AdminPopupsDetailClient mode="edit" id={id} />;
}

