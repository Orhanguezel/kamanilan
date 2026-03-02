import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { CustomPageClient } from "@/app/hakkimizda/about-client";

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
  const data = await getPageContent("misyon-vizyon");
  return {
    title: data?.meta_title || "Misyonumuz ve Vizyonumuz - Kaman İlan",
    description: data?.meta_description || "Kaman İlan misyon ve vizyon sayfası.",
    alternates: { canonical: "/misyon-vizyon" },
  };
}

export default async function MisyonVizyonPage() {
  const data = await getPageContent("misyon-vizyon");
  return (
    <CustomPageClient
      title={data?.title || "Misyonumuz - Vizyonumuz"}
      htmlContent={data?.content?.html ?? null}
      imageUrl={data?.image_url ?? null}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: data?.title || "Misyonumuz - Vizyonumuz" },
      ]}
    />
  );
}
