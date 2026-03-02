import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { CustomPageClient } from "./about-client";

interface CustomPageData {
  id: string;
  title: string;
  slug: string;
  content: { html?: string } | null;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

async function getPageContent(slug: string): Promise<CustomPageData | null> {
  try {
    const data = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/by-slug/${slug}`, {}, "tr");
    if (!data) return null;
    // Backend stores content as JSON string — parse it
    if (typeof data.content === "string") {
      try { data.content = JSON.parse(data.content); } catch { data.content = null; }
    }
    return data as CustomPageData;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent("hakkimizda");
  return {
    title: data?.meta_title || t("seo.about_title"),
    description: data?.meta_description || t("seo.about_description"),
    alternates: { canonical: "/hakkimizda" },
  };
}

export default async function HakkimizdaPage() {
  const data = await getPageContent("hakkimizda");
  return (
    <CustomPageClient
      title={data?.title || t("pages.about")}
      htmlContent={data?.content?.html ?? null}
      imageUrl={data?.image_url ?? null}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: data?.title || t("pages.about") },
      ]}
    />
  );
}
