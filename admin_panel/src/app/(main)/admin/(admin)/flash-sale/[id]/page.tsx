import AdminFlashSaleDetailClient from '../_components/admin-flash-sale-detail-client';

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (id === 'new') {
    return <AdminFlashSaleDetailClient mode="create" />;
  }
  return <AdminFlashSaleDetailClient mode="edit" id={id} />;
}

