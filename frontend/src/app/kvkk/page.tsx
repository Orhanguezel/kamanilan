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
  const data = await getPageContent("kvkk-aydinlatma-metni");
  return {
    title: data?.meta_title || "KVKK Aydınlatma Metni | Kaman İlan",
    description: data?.meta_description || "KVKK kapsamında kişisel verilerinizin korunması ve işlenmesi hakkında bilgilendirme metni.",
    alternates: {
      canonical: "/kvkk",
    },
  };
}

export default async function KVKKPage() {
  const data = await getPageContent("kvkk-aydinlatma-metni");
  return (
    <ContentPageClient
      title={data?.title || "KVKK Aydınlatma Metni"}
      content={data?.content}
      breadcrumbs={[{ label: t("common.home"), href: "/" }, { label: "KVKK" }]}
    />
  );
}
