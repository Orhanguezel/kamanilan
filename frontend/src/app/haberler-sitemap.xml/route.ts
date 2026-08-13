const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";
const rawApiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || `${SITE_URL}/api/v1`;
const API_URL = rawApiUrl.endsWith("/api") ? `${rawApiUrl}/v1` : rawApiUrl;

type Article = { slug: string; title: string; published_at?: string | null; updated_at?: string | null; created_at: string };
const esc = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char] ?? char);

export async function GET() {
  const articles: Article[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const response = await fetch(`${API_URL}/articles?limit=100&page=${page}&sort=published_at&order=desc`, { cache: "no-store" });
    if (!response.ok) break;
    const payload = await response.json();
    const batch: Article[] = Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? []);
    articles.push(...batch);
    if (batch.length < 100) break;
  }
  const recentCutoff = Date.now() - 48 * 60 * 60 * 1000;
  const urls = articles.map((article) => {
    const published = article.published_at ?? article.created_at;
    const news = new Date(published).getTime() >= recentCutoff ? `<news:news><news:publication><news:name>Kaman İlan</news:name><news:language>tr</news:language></news:publication><news:publication_date>${esc(new Date(published).toISOString())}</news:publication_date><news:title>${esc(article.title)}</news:title></news:news>` : "";
    return `<url><loc>${SITE_URL}/haberler/${esc(article.slug)}</loc><lastmod>${esc(new Date(article.updated_at ?? published).toISOString())}</lastmod>${news}</url>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
