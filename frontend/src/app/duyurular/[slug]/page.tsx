import type { Metadata } from "next";
import { AnnouncementDetailClient } from "./announcement-detail-client";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { AnnouncementItem } from "@/modules/announcement/announcement.type";
import { JsonLd } from "@/components/seo/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";
async function fetchAnnouncement(slug: string) {
  try { return await fetchAPI<AnnouncementItem>(`${API_ENDPOINTS.ANNOUNCEMENTS}/${encodeURIComponent(slug)}`, {}, "tr"); } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchAnnouncement(slug);
  return {
    title: item?.meta_title || item?.title,
    description: item?.meta_description || item?.excerpt || undefined,
    alternates: { canonical: `/duyurular/${slug}` },
    openGraph: item ? { type: "article", title: item.title, description: item.excerpt || undefined, url: `${SITE_URL}/duyurular/${slug}`, publishedTime: item.published_at ?? item.created_at, images: item.cover_image_url ? [item.cover_image_url] : undefined } : undefined,
  };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await fetchAnnouncement(slug);
  const jsonLd = item ? { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.excerpt, image: item.cover_image_url ? [item.cover_image_url] : undefined, datePublished: item.published_at ?? item.created_at, author: { "@type": "Organization", name: item.author || "Kaman İlan" }, publisher: { "@type": "Organization", name: "Kaman İlan" }, mainEntityOfPage: `${SITE_URL}/duyurular/${slug}` } : null;
  return <><JsonLd data={jsonLd} id="announcement" /><AnnouncementDetailClient slug={slug} /></>;
}
