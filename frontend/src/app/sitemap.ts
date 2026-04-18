import type { MetadataRoute } from "next";
import { priorityCities } from "@/lib/cities";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";

let API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://www.kamanilan.com/api/v1";
if (API_URL.endsWith("/api")) {
  API_URL += "/v1";
}

async function fetchSlugs(
  endpoint: string,
  slugField = "slug",
): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}?limit=500&sort=created_at&order=desc`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: unknown[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
          ? json.data
          : [];
    return items
      .map((item) => (item as Record<string, string>)[slugField])
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // ── Statik sayfalar ─────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                    lastModified: now, priority: 1.0,  changeFrequency: "daily"   },
    { url: `${SITE_URL}/ilanlar`,             lastModified: now, priority: 0.9,  changeFrequency: "hourly"  },
    { url: `${SITE_URL}/haberler`,            lastModified: now, priority: 0.8,  changeFrequency: "daily"   },
    { url: `${SITE_URL}/kategoriler`,         lastModified: now, priority: 0.7,  changeFrequency: "weekly"  },
    { url: `${SITE_URL}/duyurular`,           lastModified: now, priority: 0.7,  changeFrequency: "daily"   },
    { url: `${SITE_URL}/kampanyalar`,         lastModified: now, priority: 0.6,  changeFrequency: "daily"   },
    { url: `${SITE_URL}/magazalar`,           lastModified: now, priority: 0.6,  changeFrequency: "weekly"  },
    { url: `${SITE_URL}/ilan-ver`,            lastModified: now, priority: 0.8,  changeFrequency: "monthly" },
    { url: `${SITE_URL}/reklam-ver`,          lastModified: now, priority: 0.5,  changeFrequency: "monthly" },
    { url: `${SITE_URL}/hakkimizda`,          lastModified: now, priority: 0.4,  changeFrequency: "monthly" },
    { url: `${SITE_URL}/misyon-vizyon`,       lastModified: now, priority: 0.4,  changeFrequency: "monthly" },
    { url: `${SITE_URL}/kalite-politikamiz`, lastModified: now, priority: 0.3,  changeFrequency: "yearly"  },
    { url: `${SITE_URL}/kuponlar`,           lastModified: now, priority: 0.5,  changeFrequency: "daily"   },
    { url: `${SITE_URL}/iletisim`,            lastModified: now, priority: 0.4,  changeFrequency: "monthly" },
    { url: `${SITE_URL}/gizlilik-politikasi`, lastModified: now, priority: 0.2,  changeFrequency: "yearly"  },
    { url: `${SITE_URL}/kullanim-kosullari`,  lastModified: now, priority: 0.2,  changeFrequency: "yearly"  },
  ];

  // ── Dinamik sayfalar ─────────────────────────────────────
  const [listingSlugs, categorySlugs, articleSlugs, announcementSlugs] =
    await Promise.all([
      fetchSlugs("/properties"),
      fetchSlugs("/categories"),
      fetchSlugs("/articles"),
      fetchSlugs("/announcements"),
    ]);

  const listingEntries: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${SITE_URL}/ilan/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/kategori/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ── Category × City kombinasyonlari (SEO long-tail) ─────
  const cities = priorityCities();
  const categoryCityEntries: MetadataRoute.Sitemap = [];
  for (const catSlug of categorySlugs) {
    for (const city of cities) {
      categoryCityEntries.push({
        url: `${SITE_URL}/kategori/${catSlug}/${city.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: Math.max(0.4, Math.min(0.7, city.priority * 0.7)),
      });
    }
  }

  const articleEntries: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${SITE_URL}/haberler/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const announcementEntries: MetadataRoute.Sitemap = announcementSlugs.map((slug) => ({
    url: `${SITE_URL}/duyurular/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categoryEntries,
    ...categoryCityEntries,
    ...listingEntries,
    ...articleEntries,
    ...announcementEntries,
  ];
}
