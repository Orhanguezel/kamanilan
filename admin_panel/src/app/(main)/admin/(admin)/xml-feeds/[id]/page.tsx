// =============================================================
// FILE: src/app/(main)/admin/(admin)/xml-feeds/[id]/page.tsx
// =============================================================
import AdminXmlFeedDetailClient from "./admin-xml-feed-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AdminXmlFeedDetailClient id={id} />;
}
