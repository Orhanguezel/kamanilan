// =============================================================
// FILE: src/modules/newsAggregator/fetcher.ts
// RSS / OG tag fetcher — no external dependencies, uses fetch()
// =============================================================

export interface FetchedItem {
  source_url:      string;
  title:           string | null;
  excerpt:         string | null;
  content:         string | null;
  image_url:       string | null;
  author:          string | null;
  original_pub_at: Date | null;
}

// ──────────────────────────────────────────────────────────────
// Tiny XML helpers (no DOMParser in Bun server-side)
// ──────────────────────────────────────────────────────────────

/** İlk eşleşen tag içeriğini döner */
function extractTag(xml: string, tag: string): string | null {
  // CDATA bloklarını da destekle
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    "i"
  );
  const m = re.exec(xml);
  if (!m) return null;
  const raw = (m[1] ?? m[2] ?? "").trim();
  return raw || null;
}

/** İlk eşleşen attribute değerini döner — örn. <enclosure url="..."> */
function extractAttr(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i");
  const m = re.exec(xml);
  return m ? m[1].trim() || null : null;
}

/** HTML entity decode (basit) */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** HTML tag'lerini sil */
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

/** RSS <item> bloklarını böler */
function splitItems(xml: string): string[] {
  const items: string[] = [];
  let start = 0;
  while (true) {
    const s = xml.indexOf("<item>", start);
    if (s === -1) break;
    const e = xml.indexOf("</item>", s);
    if (e === -1) break;
    items.push(xml.slice(s, e + 7));
    start = e + 7;
  }
  // Atom <entry> fallback
  if (!items.length) {
    let s2 = 0;
    while (true) {
      const s = xml.indexOf("<entry>", s2);
      if (s === -1) break;
      const e = xml.indexOf("</entry>", s);
      if (e === -1) break;
      items.push(xml.slice(s, e + 8));
      s2 = e + 8;
    }
  }
  return items;
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ──────────────────────────────────────────────────────────────
// RSS / Atom parser
// ──────────────────────────────────────────────────────────────

export async function fetchRssFeed(url: string, limit = 30): Promise<FetchedItem[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KamanIlan-NewsBot/1.0)",
      "Accept": "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const itemBlocks = splitItems(xml);

  const results: FetchedItem[] = [];

  for (const block of itemBlocks.slice(0, limit)) {
    // URL — RSS: <link>, Atom: <link href="...">
    let link =
      extractTag(block, "link") ??
      extractAttr(block, "link", "href") ??
      extractTag(block, "guid");

    if (!link) continue;
    link = decodeEntities(link.trim());
    if (!link.startsWith("http")) continue;

    const rawTitle   = extractTag(block, "title")       ?? null;
    const rawExcerpt = extractTag(block, "description") ?? extractTag(block, "summary") ?? null;
    const rawContent = extractTag(block, "content:encoded") ?? extractTag(block, "content") ?? null;
    const rawAuthor  = extractTag(block, "author")      ?? extractTag(block, "dc:creator") ?? null;
    const rawDate    = extractTag(block, "pubDate")     ?? extractTag(block, "published")  ?? extractTag(block, "updated") ?? null;

    // Image: media:thumbnail, enclosure, og-fallback
    const imgFromMedia = extractAttr(block, "media:thumbnail", "url") ?? extractAttr(block, "media:content", "url");
    const imgFromEnc   = extractAttr(block, "enclosure", "url");
    const imgFromDesc  = /<img[^>]+src="([^"]+)"/.exec(rawContent ?? rawExcerpt ?? "")?.[1] ?? null;

    const title  = rawTitle   ? decodeEntities(stripHtml(rawTitle)).slice(0, 500) || null   : null;
    const excerpt = rawExcerpt ? decodeEntities(stripHtml(rawExcerpt)).slice(0, 2000) || null : null;
    const content = rawContent ? decodeEntities(rawContent).trim() || null : null;
    const author  = rawAuthor  ? decodeEntities(stripHtml(rawAuthor)).slice(0, 255) || null : null;

    results.push({
      source_url:      link,
      title,
      excerpt,
      content,
      image_url:       imgFromMedia ?? imgFromEnc ?? imgFromDesc ?? null,
      author,
      original_pub_at: parseDate(rawDate),
    });
  }

  return results;
}

// ──────────────────────────────────────────────────────────────
// Open Graph parser + makale içeriği çıkarma
// ──────────────────────────────────────────────────────────────

/** HTML sayfasından makale gövde metnini çıkarır → <p> tag'lı HTML döner */
function extractArticleText(html: string): string | null {
  // Priority-ordered container selectors (semantic → class-based → fallback)
  const containerPatterns: RegExp[] = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    // Turkish news site class names (case-insensitive substring match)
    /<div[^>]+class="[^"]*(?:article[-_]?(?:body|content|detail|text)|haber[-_]?(?:icerik|detay|metin)|news[-_]?(?:body|content|detail)|icerik|detay|manset)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]+class="[^"]*(?:content[-_]?body|post[-_]?content|entry[-_]?content|page[-_]?content|single[-_]?content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    // id-based
    /<div[^>]+id="[^"]*(?:article[-_]?(?:body|content)|haber[-_]?(?:icerik|detay)|content|detail)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let src: string | null = null;
  for (const pat of containerPatterns) {
    const m = pat.exec(html);
    if (m) {
      // Use the first non-empty capturing group
      src = m[1] ?? m[2] ?? null;
      if (src && src.length > 200) break;
    }
  }

  if (!src) return null;

  const parts: string[] = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const txt = stripHtml(decodeEntities(m[1])).replace(/\s+/g, " ").trim();
    if (txt.length >= 40) parts.push(`<p>${txt}</p>`);
  }
  return parts.length >= 2 ? parts.slice(0, 40).join("\n") : null;
}

/** Bir makale URL'sinden tam içerik çeker (RSS item'ı için yardımcı) */
export async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":     "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractArticleText(html);
  } catch {
    return null;
  }
}

export interface OgData {
  source_url:      string;
  title:           string | null;
  excerpt:         string | null;
  content:         string | null;
  image_url:       string | null;
  original_pub_at: Date | null;
}

export async function fetchOgData(url: string): Promise<OgData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();

  function metaContent(prop: string): string | null {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const m = re.exec(html);
    if (m) return decodeEntities(m[1]).trim() || null;
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i"
    );
    const m2 = re2.exec(html);
    return m2 ? decodeEntities(m2[1]).trim() || null : null;
  }

  const title =
    metaContent("og:title") ??
    metaContent("twitter:title") ??
    /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim() ?? null;

  const excerpt =
    metaContent("og:description") ??
    metaContent("twitter:description") ??
    metaContent("description") ??
    null;

  const image_url =
    metaContent("og:image") ??
    metaContent("twitter:image") ??
    null;

  const pubDateRaw =
    metaContent("article:published_time") ??
    metaContent("datePublished") ??
    null;

  const content = extractArticleText(html);

  return {
    source_url:      url,
    title:           title ? title.slice(0, 500) : null,
    excerpt:         excerpt ? excerpt.slice(0, 2000) : null,
    content,
    image_url:       image_url ? image_url.slice(0, 1000) : null,
    original_pub_at: parseDate(pubDateRaw),
  };
}
