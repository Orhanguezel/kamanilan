import type { Metadata } from "next";
import { ArticleDetailClient } from "./article-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: { canonical: `/haberler/${slug}` },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetailClient slug={slug} />;
}
