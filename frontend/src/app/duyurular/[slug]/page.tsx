import type { Metadata } from "next";
import { AnnouncementDetailClient } from "./announcement-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: { canonical: `/duyurular/${slug}` },
  };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  return <AnnouncementDetailClient slug={slug} />;
}
