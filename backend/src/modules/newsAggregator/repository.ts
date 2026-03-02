// =============================================================
// FILE: src/modules/newsAggregator/repository.ts
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, isNotNull, like, sql } from "drizzle-orm";
import { newsSources, newsSuggestions } from "./schema";
import type { NewsSuggestionRow } from "./schema";
import { articles } from "@/modules/articles/schema";
import type {
  SourceCreateBody,
  SourceUpdateBody,
  SourcesListQuery,
  SuggestionsListQuery,
  SuggestionUpdateBody,
} from "./validation";

// ──────────────────────────────────────────────────────────────
// SOURCES
// ──────────────────────────────────────────────────────────────

export async function repoListSources(q: SourcesListQuery) {
  const conds: any[] = [];
  if (q.enabled_only) conds.push(eq(newsSources.is_enabled, 1 as any));

  return db
    .select()
    .from(newsSources)
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(asc(newsSources.display_order), asc(newsSources.id))
    .limit(q.limit)
    .offset(q.offset);
}

export async function repoGetSourceById(id: number) {
  const rows = await db
    .select()
    .from(newsSources)
    .where(eq(newsSources.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function repoCreateSource(b: SourceCreateBody) {
  const maxOrder = await db
    .select({ v: sql<number>`COALESCE(MAX(${newsSources.display_order}), 0)` })
    .from(newsSources);

  await db.insert(newsSources).values({
    name:               b.name,
    url:                b.url,
    source_type:        b.source_type ?? "rss",
    is_enabled:         b.is_enabled ?? 1,
    fetch_interval_min: b.fetch_interval_min ?? 30,
    notes:              b.notes ?? null,
    display_order:      b.display_order ?? (maxOrder[0]?.v ?? 0) + 1,
  } as any);

  const created = await db
    .select()
    .from(newsSources)
    .orderBy(desc(newsSources.id))
    .limit(1);
  return created[0] ?? null;
}

export async function repoUpdateSource(id: number, b: SourceUpdateBody) {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.name               !== undefined) set.name               = b.name;
  if (b.url                !== undefined) set.url                = b.url;
  if (b.source_type        !== undefined) set.source_type        = b.source_type;
  if (b.is_enabled         !== undefined) set.is_enabled         = b.is_enabled;
  if (b.fetch_interval_min !== undefined) set.fetch_interval_min = b.fetch_interval_min;
  if (b.notes              !== undefined) set.notes              = b.notes ?? null;
  if (b.display_order      !== undefined) set.display_order      = b.display_order;

  await db.update(newsSources).set(set as any).where(eq(newsSources.id, id));
  return repoGetSourceById(id);
}

export async function repoDeleteSource(id: number) {
  await db.delete(newsSources).where(eq(newsSources.id, id));
}

export async function repoMarkSourceFetched(id: number, error?: string | null) {
  const set: any = {
    last_fetched_at: new Date(),
    updated_at:      sql`CURRENT_TIMESTAMP(3)`,
  };
  if (error) {
    set.error_count = sql`${newsSources.error_count} + 1`;
    set.last_error  = String(error).slice(0, 500);
  } else {
    set.error_count = 0;
    set.last_error  = null;
  }
  await db.update(newsSources).set(set).where(eq(newsSources.id, id));
}

// ──────────────────────────────────────────────────────────────
// SUGGESTIONS
// ──────────────────────────────────────────────────────────────

export async function repoListSuggestions(q: SuggestionsListQuery) {
  const conds: any[] = [];
  if (q.status && q.status !== "all") conds.push(eq(newsSuggestions.status, q.status as any));
  if (q.source_id)                    conds.push(eq(newsSuggestions.source_id, q.source_id));
  if (q.q)                            conds.push(like(newsSuggestions.title, `%${q.q}%`));

  return db
    .select()
    .from(newsSuggestions)
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(desc(newsSuggestions.created_at))
    .limit(q.limit)
    .offset(q.offset);
}

export async function repoCountSuggestions(q: SuggestionsListQuery): Promise<number> {
  const conds: any[] = [];
  if (q.status && q.status !== "all") conds.push(eq(newsSuggestions.status, q.status as any));
  if (q.source_id)                    conds.push(eq(newsSuggestions.source_id, q.source_id));
  if (q.q)                            conds.push(like(newsSuggestions.title, `%${q.q}%`));

  const [{ cnt }] = await db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(newsSuggestions)
    .where(conds.length ? and(...conds) : undefined as any);
  return Number(cnt);
}

export async function repoGetSuggestionById(id: number) {
  const rows = await db
    .select()
    .from(newsSuggestions)
    .where(eq(newsSuggestions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** URL varsa mevcut kaydı döner, yoksa insert eder.
 *  Duplicate durumunda: content ve image_url eksikse günceller. */
export async function repoUpsertSuggestion(data: {
  source_id?:      number | null;
  source_url:      string;
  title?:          string | null;
  excerpt?:        string | null;
  content?:        string | null;
  image_url?:      string | null;
  source_name?:    string | null;
  author?:         string | null;
  category?:       string | null;
  tags?:           string | null;
  original_pub_at?: Date | null;
}): Promise<{ inserted: boolean }> {
  const result = await db.insert(newsSuggestions).values({
    source_id:       data.source_id ?? null,
    source_url:      data.source_url,
    title:           data.title           ?? null,
    excerpt:         data.excerpt         ?? null,
    content:         data.content         ?? null,
    image_url:       data.image_url       ?? null,
    source_name:     data.source_name     ?? null,
    author:          data.author          ?? null,
    category:        data.category        ?? "genel",
    tags:            data.tags            ?? null,
    original_pub_at: data.original_pub_at ?? null,
    status:          "pending",
  } as any).onDuplicateKeyUpdate({
    set: {
      // Fill in missing content / image_url only — never overwrite existing data
      content:   sql`IF(content IS NULL AND VALUES(content) IS NOT NULL, VALUES(content), content)`,
      image_url: sql`IF(image_url IS NULL AND VALUES(image_url) IS NOT NULL, VALUES(image_url), image_url)`,
    },
  });
  // MySQL affectedRows: 1 = new insert, 2 = row updated, 0 = no change
  return { inserted: (result as any).affectedRows === 1 };
}

/** Sadece NULL olan alanları doldurur (mevcut veriyi korur) */
export async function repoFillMissingSuggestionFields(
  id: number,
  data: { title?: string | null; excerpt?: string | null; content?: string | null; image_url?: string | null },
): Promise<NewsSuggestionRow | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (data.title     != null) set.title     = sql`COALESCE(title, ${data.title})`;
  if (data.excerpt   != null) set.excerpt   = sql`COALESCE(excerpt, ${data.excerpt})`;
  if (data.content   != null) set.content   = sql`COALESCE(content, ${data.content})`;
  if (data.image_url != null) set.image_url = sql`COALESCE(image_url, ${data.image_url})`;
  if (Object.keys(set).length > 1) {
    await db.update(newsSuggestions).set(set as any).where(eq(newsSuggestions.id, id));
  }
  return repoGetSuggestionById(id);
}

export async function repoUpdateSuggestion(id: number, b: SuggestionUpdateBody) {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.title           !== undefined) set.title           = b.title;
  if (b.excerpt         !== undefined) set.excerpt         = b.excerpt;
  if (b.content         !== undefined) set.content         = b.content;
  if (b.image_url       !== undefined) set.image_url       = b.image_url ?? null;
  if (b.author          !== undefined) set.author          = b.author;
  if (b.category        !== undefined) set.category        = b.category;
  if (b.tags            !== undefined) set.tags            = b.tags;
  if (b.original_pub_at !== undefined) set.original_pub_at = b.original_pub_at ? new Date(b.original_pub_at) : null;

  await db.update(newsSuggestions).set(set as any).where(eq(newsSuggestions.id, id));
  return repoGetSuggestionById(id);
}

export async function repoApproveSuggestion(id: number, articleId: number) {
  await db
    .update(newsSuggestions)
    .set({ status: "approved", article_id: articleId, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
    .where(eq(newsSuggestions.id, id));
}

export async function repoRejectSuggestion(id: number, reason?: string | null) {
  await db
    .update(newsSuggestions)
    .set({
      status:        "rejected",
      reject_reason: reason ? String(reason).slice(0, 500) : null,
      updated_at:    sql`CURRENT_TIMESTAMP(3)`,
    } as any)
    .where(eq(newsSuggestions.id, id));
}

export async function repoDeleteSuggestion(id: number) {
  await db.delete(newsSuggestions).where(eq(newsSuggestions.id, id));
}

/**
 * Live feed'de gösterilmemesi gereken URL'lerin kümesini döner:
 * - articles tablosundaki source_url'ler (onaylanmış makaleler)
 * - news_suggestions tablosunda status='rejected' olanlar (reddedilmiş/gizlenmiş)
 */
export async function repoGetBlockedFeedUrls(): Promise<Set<string>> {
  const [fromArticles, fromRejected] = await Promise.all([
    db
      .select({ url: articles.source_url })
      .from(articles)
      .where(isNotNull(articles.source_url)),
    db
      .select({ url: newsSuggestions.source_url })
      .from(newsSuggestions)
      .where(eq(newsSuggestions.status, "rejected" as any)),
  ]);

  const blocked = new Set<string>();
  for (const r of fromArticles) if (r.url) blocked.add(r.url);
  for (const r of fromRejected) if (r.url) blocked.add(r.url);
  return blocked;
}

/**
 * Canlı haber öğesini kalıcı olarak gizle:
 * news_suggestions tablosuna rejected kaydı ekler.
 * URL zaten varsa reject_reason'ı günceller.
 */
export async function repoInsertDismissedUrl(
  sourceUrl: string,
  title?: string | null,
): Promise<void> {
  await db
    .insert(newsSuggestions)
    .values({
      source_url:    sourceUrl,
      title:         title ?? null,
      status:        "rejected",
      reject_reason: "dismissed_from_feed",
    } as any)
    .onDuplicateKeyUpdate({
      set: {
        status:        "rejected" as any,
        reject_reason: "dismissed_from_feed",
        updated_at:    sql`CURRENT_TIMESTAMP(3)`,
      },
    });
}

/**
 * Belirtilen gün sayısından eski pending/rejected önerileri sil.
 * Onaylanmış (approved) olanlar silinmez — makale kaydı zaten oluşturuldu.
 */
export async function repoDeleteOldSuggestions(olderThanDays = 7): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const result = await db
    .delete(newsSuggestions)
    .where(
      and(
        sql`${newsSuggestions.created_at} < ${cutoff}`,
        sql`${newsSuggestions.status} != 'approved'`
      )
    );

  return (result as any)?.[0]?.affectedRows ?? 0;
}
