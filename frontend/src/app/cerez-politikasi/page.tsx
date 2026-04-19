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
  const data = await getPageContent("cerez-politikasi");
  return {
    title: data?.meta_title || "Çerez Politikası - Kaman İlan",
    description: data?.meta_description || "Kaman İlan çerez kullanımı ve politikası hakkında bilgiler.",
    alternates: {
      canonical: "/cerez-politikasi",
    },
  };
}

export default async function CookiePolicyPage() {
  const data = await getPageContent("cerez-politikasi");
  return (
    <ContentPageClient
      title={data?.title || "Çerez Politikası"}
      content={data?.content?.html ?? data?.content}
      breadcrumbs={[{ label: t("common.home"), href: "/" }, { label: data?.title || "Çerez Politikası" }]}
    />
  );
}
