// =========================================================
// FILE: src/modules/news/rss.service.ts
// Harici RSS kaynaklarından haber çeker, bellekte önbellekler.
// Ekstra npm bağımlılığı yok — yerleşik fetch + regex parser.
// =========================================================

export interface NewsItem {
  title:   string;
  link:    string;
  pubDate: string | null;
  source:  string;          // kaynak hostname (kirsehirhaberturk.com)
}

interface CacheEntry {
  items: NewsItem[];
  at:    number;
}

// ── RSS kaynakları ────────────────────────────────────────
const RSS_SOURCES: string[] = [
  "https://www.kirsehirhaberturk.com/rss.xml",
  "https://www.kirsehirhaberturk.com/rss/gundem.xml",
  "https://www.kirsehirhaberturk.com/rss/asayis.xml",
  "https://www.sondakika.com/kaman/rss/"  // henüz doğrulanmadı
];

const TTL_MS = 30 * 60_000; // 30 dakika önbellek
const feedCache = new Map<string, CacheEntry>();

// ── XML yardımcıları ──────────────────────────────────────

/** İlk eşleşen tag içeriğini döner; CDATA'yı soyar */
function extractFirst(xml: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    "i"
  );
  const m = xml.match(re);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim() || null;
}

/** <item> bloklarını ayrıştırır */
function parseItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block  = m[1];
    const title  = extractFirst(block, "title");
    const link   = extractFirst(block, "link") ?? extractFirst(block, "guid");
    const pubDate = extractFirst(block, "pubDate");
    if (title && link) {
      items.push({ title, link, pubDate: pubDate ?? null, source });
    }
  }
  return items;
}

/** Tek bir RSS URL'sini çeker ve önbellekler */
async function fetchFeed(url: string): Promise<NewsItem[]> {
  const source = new URL(url).hostname.replace("www.", "");
  const cached = feedCache.get(url);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.items;

  const res = await fetch(url, {
    headers: { "User-Agent": "KamanIlan/1.0 (+https://kamanilan.com)" },
    signal:  AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];

  const xml   = await res.text();
  const items = parseItems(xml, source);
  feedCache.set(url, { items, at: Date.now() });
  return items;
}

// ── Dışa açık fonksiyon ───────────────────────────────────

/**
 * Tüm kaynaklardan haberleri çeker, birleştirir, tarihe göre sıralar.
 * @param limit   Kaç haber döneceği (varsayılan 9)
 * @param filterKaman  true → yalnızca başlığında "Kaman" geçenler
 */
export async function getNewsFeed(
  limit = 9,
  filterKaman = false
): Promise<NewsItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  const filtered = filterKaman
    ? all.filter((i) => /kaman/i.test(i.title))
    : all;

  // pubDate varsa tarihe göre azalan sıra
  filtered.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  // Başlığa göre tekrarları kaldır
  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of filtered) {
    const key = item.title.toLowerCase().slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique.slice(0, limit);
}
