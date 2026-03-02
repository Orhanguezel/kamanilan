// =============================================================
// FILE: src/modules/newsAggregator/fetchService.ts
// Kaynak bazlı fetch + DB'ye kayıt
// =============================================================
import type { NewsSourceRow } from "./schema";
import {
  repoMarkSourceFetched,
  repoListSources,
  repoUpsertSuggestion,
} from "./repository";
import { fetchRssFeed, fetchOgData, fetchArticleContent } from "./fetcher";

const FETCH_LIMIT_PER_SOURCE = 30;
// İçerik eksik RSS item'ları için makale sayfasından çekilecek max item sayısı
const CONTENT_FETCH_CONCURRENCY = 5;

export async function fetchSource(source: NewsSourceRow): Promise<{
  inserted: number;
  skipped:  number;
  error:    string | null;
}> {
  let inserted = 0;
  let skipped  = 0;
  let errorMsg: string | null = null;

  try {
    let items: Array<{
      source_url:      string;
      title:           string | null;
      excerpt:         string | null;
      content?:        string | null;
      image_url:       string | null;
      author?:         string | null;
      original_pub_at: Date | null;
    }> = [];

    if (source.source_type === "rss") {
      items = await fetchRssFeed(source.url, FETCH_LIMIT_PER_SOURCE);

      // İçeriği eksik olan item'lar için makale sayfasından çek
      const noContent = items
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => !item.content && !!item.source_url);

      for (let i = 0; i < noContent.length; i += CONTENT_FETCH_CONCURRENCY) {
        const batch = noContent.slice(i, i + CONTENT_FETCH_CONCURRENCY);
        await Promise.allSettled(
          batch.map(async ({ item, idx }) => {
            const c = await fetchArticleContent(item.source_url);
            if (c) items[idx].content = c;
          }),
        );
      }
    } else if (source.source_type === "og") {
      // OG: kaynak URL doğrudan bir sayfa URL'si
      const og = await fetchOgData(source.url);
      items = [og];
    } else {
      // scrape tipi — şimdilik OG fallback
      const og = await fetchOgData(source.url);
      items = [og];
    }

    for (const item of items) {
      if (!item.source_url) continue;
      const { inserted: ok } = await repoUpsertSuggestion({
        source_id:       source.id,
        source_url:      item.source_url,
        title:           item.title,
        excerpt:         item.excerpt,
        content:         item.content ?? null,
        image_url:       item.image_url,
        source_name:     source.name,
        author:          item.author ?? null,
        category:        "genel",
        tags:            null,
        original_pub_at: item.original_pub_at,
      });
      if (ok) inserted++;
      else skipped++;
    }

    await repoMarkSourceFetched(source.id, null);
  } catch (err: unknown) {
    // Drizzle wraps mysql2 errors in err.cause — extract the real error message
    const cause = (err as any)?.cause;
    if (cause instanceof Error) {
      const code = (cause as any).code ?? "";
      errorMsg = code ? `[${code}] ${cause.message}` : cause.message;
    } else if (err instanceof Error) {
      // Fallback: last line of Drizzle's "Failed query: ..." message
      const lines = err.message.split("\n").map((l) => l.trim()).filter(Boolean);
      errorMsg = lines[lines.length - 1] || err.message;
    } else {
      errorMsg = String(err);
    }
    await repoMarkSourceFetched(source.id, errorMsg.slice(0, 450));
  }

  return { inserted, skipped, error: errorMsg };
}

/** Tüm aktif kaynakları fetch et */
export async function fetchAllSources(): Promise<{
  total:    number;
  inserted: number;
  skipped:  number;
  errors:   number;
}> {
  const sources = await repoListSources({ enabled_only: true, limit: 500, offset: 0 });
  let totalInserted = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  for (const source of sources) {
    const r = await fetchSource(source);
    totalInserted += r.inserted;
    totalSkipped  += r.skipped;
    if (r.error) totalErrors++;
  }

  return { total: sources.length, inserted: totalInserted, skipped: totalSkipped, errors: totalErrors };
}
