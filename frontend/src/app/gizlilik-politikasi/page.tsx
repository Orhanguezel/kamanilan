import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";

async function getPageContent(slug: string) {
  try {
    const res = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/by-slug/${slug}`, {}, "tr");
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent("gizlilik-politikasi");
  return {
    title: data?.meta_title || t("seo.privacy_title"),
    description: data?.meta_description || t("seo.privacy_description"),
    alternates: {
      canonical: "/gizlilik-politikasi",
    },
  };
}

export default async function PrivacyPage() {
  const data = await getPageContent("gizlilik-politikasi");
  return (
    <ContentPageClient
      title={data?.title || t("pages.privacy")}
      content={data?.content}
      breadcrumbs={[{ label: t("common.home"), href: "/" }, { label: data?.title || t("pages.privacy") }]}
    />
  );
}
