import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { CustomPageClient } from "./about-client";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { QUALITY_PRINCIPLES } from "@/config/corporate-content";

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
    const data = await fetchAPI<any>(
      `${API_ENDPOINTS.PAGES}/by-slug/${slug}`,
      {},
      "tr",
    );
    if (!data) return null;
    // Backend stores content as JSON string — parse it
    if (typeof data.content === "string") {
      try {
        data.content = JSON.parse(data.content);
      } catch {
        data.content = null;
      }
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

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Anasayfa", url: "/" },
      { name: data?.title || t("pages.about"), url: "/hakkimizda" },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} id="about" />
      <CustomPageClient
        title={data?.title || t("pages.about")}
        htmlContent={data?.content?.html ?? null}
        imageUrl={data?.image_url ?? null}
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: data?.title || t("pages.about") },
        ]}
      />

      <section className="container mx-auto max-w-4xl px-4 pb-20">
        <div className="border-t border-line pt-12">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            Kalite Politikamız
          </p>
          <h2 className="mb-8 font-fraunces text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Hizmet ilkelerimiz
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {QUALITY_PRINCIPLES.map((principle) => (
              <article key={principle.title}>
                <h3 className="mb-2 font-fraunces text-xl font-medium text-ink">
                  {principle.title}
                </h3>
                <p className="leading-relaxed text-text-2">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
