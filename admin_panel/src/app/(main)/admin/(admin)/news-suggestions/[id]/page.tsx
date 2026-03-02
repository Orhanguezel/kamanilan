// =============================================================
// FILE: src/app/(main)/admin/(admin)/news-suggestions/[id]/page.tsx
// =============================================================
import AdminNewsSuggestionDetailClient from "./admin-news-suggestion-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AdminNewsSuggestionDetailClient id={id} />;
}
