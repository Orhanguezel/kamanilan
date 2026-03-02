import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AboutPageClient } from "./about-client";

async function getPageContent(slug: string) {
  try {
    const res = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, "tr");
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent("about");
  return {
    title: data?.meta_title || t("seo.about_title"),
    description: data?.meta_description || t("seo.about_description"),
    alternates: {
      canonical: "/hakkimizda",
    },
  };
}

export default async function AboutPage() {
  const data = await getPageContent("about");
  return (
    <AboutPageClient
      title={t("pages.about")}
      content={data?.content}
      breadcrumbs={[{ label: t("common.home"), href: "/" }, { label: t("pages.about") }]}
    />
  );
}
