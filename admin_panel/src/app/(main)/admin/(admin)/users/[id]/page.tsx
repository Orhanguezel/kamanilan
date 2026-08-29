// src/app/(main)/admin/users/[id]/page.tsx

import UserDetailClient from '../_components/user-detail-client';

type Params = { id: string };

// Next 16: params daima Promise'tir (PageProps sozlesmesi bunu zorunlu kilar)
export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
