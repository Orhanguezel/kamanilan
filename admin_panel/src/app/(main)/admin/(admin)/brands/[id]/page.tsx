import AdminBrandsDetailClient from '../_components/admin-brands-detail-client';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (id === 'new') {
    return <AdminBrandsDetailClient mode="create" />;
  }

  return <AdminBrandsDetailClient mode="edit" id={id} />;
}
