const rawApiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://www.kamanilan.com/api/v1";
const API_URL = rawApiUrl.endsWith("/api") ? `${rawApiUrl}/v1` : rawApiUrl;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";

export async function GET() {
  const response = await fetch(`${API_URL}/articles/rss?limit=50&locale=tr`, { cache: "no-store" });
  if (!response.ok) return new Response("RSS üretilemedi", { status: 502 });
  let xml = await response.text();
  xml = xml
    .replaceAll("https://example.com", SITE_URL)
    .replaceAll("/articles/", "/haberler/")
    .replace("<title>Haberler</title>", "<title>Kaman İlan Haberleri</title>")
    .replace("<description>Son haberler</description>", "<description>Kaman ve Kırşehir'den güncel yerel haberler</description>");
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
