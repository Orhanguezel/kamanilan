import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";

async function getPageContent(slug: string) {
  try {
    const res = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, "tr");
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent("terms");
  return {
    title: data?.meta_title || t("seo.terms_title"),
    description: data?.meta_description || t("seo.terms_description"),
    alternates: {
      canonical: "/kullanim-kosullari",
    },
  };
}

export default async function TermsPage() {
  const data = await getPageContent("terms");
  return (
    <ContentPageClient
      title={t("pages.terms")}
      content={data?.content}
      breadcrumbs={[{ label: t("common.home"), href: "/" }, { label: t("pages.terms") }]}
    />
  );
}
