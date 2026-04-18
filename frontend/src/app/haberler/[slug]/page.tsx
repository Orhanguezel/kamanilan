import type { Metadata } from "next";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Article } from "@/modules/articles/articles.types";
import { ArticleDetailClient } from "./article-detail-client";
import { JsonLd } from "@/components/seo/json-ld";
import { buildNewsArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { t } from "@/lib/t";

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";
const SITE_NAME = "Kamanilan";

async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const path = API_ENDPOINTS.ARTICLE_BY_SLUG.replace(":slug", encodeURIComponent(slug));
    return await fetchAPI<Article>(path, {}, "tr");
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return { alternates: { canonical: `/haberler/${slug}` } };
  }

  const title = article.title;
  const description = article.excerpt || t("seo.articles_description") || article.title;
  const image = article.cover_image_url || article.cover_url;

  return {
    title,
    description,
    alternates: { canonical: `/haberler/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/haberler/${article.slug}`,
      publishedTime: article.published_at ?? article.created_at,
      modifiedTime: article.updated_at,
      authors: article.author ? [article.author] : undefined,
      images: image ? [image] : undefined,
      section: article.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  const jsonLd = article
    ? [
        buildNewsArticleJsonLd({
          slug:          article.slug,
          title:         article.title,
          description:   article.excerpt ?? null,
          body:          article.content,
          coverImageUrl: article.cover_image_url || article.cover_url || null,
          author:        article.author,
          publishedAt:   article.published_at ?? article.created_at,
          updatedAt:     article.updated_at,
          category:      article.category,
          siteName:      SITE_NAME,
          siteLogoUrl:   `${SITE_URL}/favicon/favicon.png`,
        }),
        buildBreadcrumbJsonLd([
          { name: "Anasayfa", url: "/" },
          { name: "Haberler", url: "/haberler" },
          { name: article.title, url: `/haberler/${article.slug}` },
        ]),
      ]
    : null;

  return (
    <>
      <JsonLd data={jsonLd} id="article" />
      <ArticleDetailClient slug={slug} />
    </>
  );
}
