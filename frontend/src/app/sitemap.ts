import type { MetadataRoute } from "next";
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
  "https://sportoonline.com/api/v1";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sportoonline.com";

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { per_page: 1000, language: "tr" },
      timeout: 10000,
    });
    const items = res.data?.data ?? [];
    return items.map((item: { slug: string }) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["tr", "en"];
  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/kampanyalar", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/magazalar", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/kuponlar", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/hakkimizda", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/iletisim", priority: 0.3, changeFrequency: "monthly" as const },
    {
      path: "/kullanim-kosullari",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
    {
      path: "/gizlilik-politikasi",
      priority: 0.2,
      changeFrequency: "monthly" as const,
    },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  // Dynamic pages — fetch slugs in parallel
  const [productSlugs, categorySlugs, brandSlugs, blogSlugs, storeSlugs] =
    await Promise.all([
      fetchSlugs("/product-list"),
      fetchSlugs("/product-category/list"),
      fetchSlugs("/brand-list"),
      fetchSlugs("/blogs"),
      fetchSlugs("/store-list"),
    ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  // Products
  for (const slug of productSlugs) {
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/urun/${slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/urun/${slug}`])
          ),
        },
      });
    }
  }

  // Categories
  for (const slug of categorySlugs) {
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/kategori/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/kategori/${slug}`])
          ),
        },
      });
    }
  }

  // Brands
  for (const slug of brandSlugs) {
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/marka/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/marka/${slug}`])
          ),
        },
      });
    }
  }

  // Blog posts
  for (const slug of blogSlugs) {
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`])
          ),
        },
      });
    }
  }

  // Stores
  for (const slug of storeSlugs) {
    for (const locale of locales) {
      dynamicEntries.push({
        url: `${SITE_URL}/${locale}/magaza/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/magaza/${slug}`])
          ),
        },
      });
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
