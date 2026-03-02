import AdminSellersDetailClient from '../_components/admin-sellers-detail-client';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AdminSellersDetailClient mode="edit" id={id} />;
}
