// =============================================================
// FILE: src/modules/xmlFeeds/repository.ts
// Feed + run + item + category_map CRUD
// =============================================================
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  xmlFeeds,
  xmlFeedRuns,
  xmlFeedItems,
  xmlFeedCategoryMap,
  type XmlFeedRow,
  type XmlFeedRunRow,
  type XmlFeedItemRow,
  type XmlFeedCategoryMapRow,
  type XmlFeedFormat,
  type XmlFeedRunStatus,
  type XmlFeedItemStatus,
} from "./schema";

// -------------------------------------------------------------
// FEEDS
// -------------------------------------------------------------
export async function createFeed(input: {
  user_id: string;
  seller_id?: string | null;
  name: string;
  url: string;
  format?: XmlFeedFormat;
  auth_header_name?: string | null;
  auth_header_value?: string | null;
  interval_minutes?: number;
  is_active?: boolean;
}): Promise<XmlFeedRow> {
  const id = randomUUID();
  await db.insert(xmlFeeds).values({
    id,
    user_id:           input.user_id,
    seller_id:         input.seller_id ?? null,
    name:              input.name,
    url:               input.url,
    format:            input.format ?? "sahibinden",
    auth_header_name:  input.auth_header_name ?? null,
    auth_header_value: input.auth_header_value ?? null,
    interval_minutes:  input.interval_minutes ?? 240,
    is_active:         input.is_active === false ? 0 : 1,
  } as any);
  const row = await getFeedById(id);
  if (!row) throw new Error("xml_feed_create_failed");
  return row;
}

export async function getFeedById(id: string): Promise<XmlFeedRow | null> {
  const rows = await db.select().from(xmlFeeds).where(eq(xmlFeeds.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getFeedForUser(id: string, userId: string): Promise<XmlFeedRow | null> {
  const rows = await db
    .select()
    .from(xmlFeeds)
    .where(and(eq(xmlFeeds.id, id), eq(xmlFeeds.user_id, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listFeedsByUser(
  userId: string,
  opts: { limit?: number; offset?: number; is_active?: boolean } = {},
): Promise<{ items: XmlFeedRow[]; total: number }> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;

  const conds = [eq(xmlFeeds.user_id, userId)];
  if (opts.is_active !== undefined) {
    conds.push(eq(xmlFeeds.is_active, opts.is_active ? 1 : 0));
  }
  const where = conds.length > 1 ? and(...conds) : conds[0];

  const [items, countRows] = await Promise.all([
    db.select().from(xmlFeeds)
      .where(where)
      .orderBy(desc(xmlFeeds.updated_at))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(xmlFeeds)
      .where(where),
  ]);

  return { items, total: Number(countRows[0]?.total ?? 0) };
}

export async function updateFeed(id: string, patch: Partial<{
  name: string;
  url: string;
  format: XmlFeedFormat;
  auth_header_name: string | null;
  auth_header_value: string | null;
  interval_minutes: number;
  is_active: boolean;
  last_status: string;
  last_fetched_at: Date | null;
}>): Promise<void> {
  const set: Record<string, unknown> = {};
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.url !== undefined) set.url = patch.url;
  if (patch.format !== undefined) set.format = patch.format;
  if (patch.auth_header_name !== undefined) set.auth_header_name = patch.auth_header_name;
  if (patch.auth_header_value !== undefined) set.auth_header_value = patch.auth_header_value;
  if (patch.interval_minutes !== undefined) set.interval_minutes = patch.interval_minutes;
  if (patch.is_active !== undefined) set.is_active = patch.is_active ? 1 : 0;
  if (patch.last_status !== undefined) set.last_status = patch.last_status;
  if (patch.last_fetched_at !== undefined) set.last_fetched_at = patch.last_fetched_at;
  if (Object.keys(set).length === 0) return;
  await db.update(xmlFeeds).set(set as any).where(eq(xmlFeeds.id, id));
}

export async function deleteFeed(id: string): Promise<void> {
  await db.delete(xmlFeeds).where(eq(xmlFeeds.id, id));
}

/** Cron: cekim zamani gelmis feed'leri listele */
export async function listDueFeeds(now: Date = new Date()): Promise<XmlFeedRow[]> {
  const nowIso = now.toISOString().slice(0, 23).replace("T", " ");
  return db
    .select()
    .from(xmlFeeds)
    .where(
      and(
        eq(xmlFeeds.is_active, 1),
        or(
          isNull(xmlFeeds.last_fetched_at),
          sql`DATE_ADD(${xmlFeeds.last_fetched_at}, INTERVAL ${xmlFeeds.interval_minutes} MINUTE) <= ${nowIso}`,
        ),
      ),
    )
    .limit(50);
}

// -------------------------------------------------------------
// RUNS
// -------------------------------------------------------------
export async function createRun(feedId: string): Promise<XmlFeedRunRow> {
  const id = randomUUID();
  await db.insert(xmlFeedRuns).values({
    id,
    feed_id: feedId,
    status:  "started",
  } as any);
  const rows = await db.select().from(xmlFeedRuns).where(eq(xmlFeedRuns.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new Error("xml_feed_run_create_failed");
  return row;
}

export async function finalizeRun(id: string, patch: {
  status: XmlFeedRunStatus;
  items_found?: number;
  items_added?: number;
  items_updated?: number;
  items_skipped?: number;
  items_failed?: number;
  errors?: unknown;
}): Promise<void> {
  await db.update(xmlFeedRuns).set({
    status:        patch.status,
    items_found:   patch.items_found   ?? 0,
    items_added:   patch.items_added   ?? 0,
    items_updated: patch.items_updated ?? 0,
    items_skipped: patch.items_skipped ?? 0,
    items_failed:  patch.items_failed  ?? 0,
    errors_json:   patch.errors ?? null,
    finished_at:   new Date(),
  } as any).where(eq(xmlFeedRuns.id, id));
}

export async function listRunsByFeed(feedId: string, limit = 50): Promise<XmlFeedRunRow[]> {
  return db
    .select()
    .from(xmlFeedRuns)
    .where(eq(xmlFeedRuns.feed_id, feedId))
    .orderBy(desc(xmlFeedRuns.started_at))
    .limit(Math.min(limit, 200));
}

// -------------------------------------------------------------
// ITEMS
// -------------------------------------------------------------
export async function findFeedItem(
  feedId: string,
  externalId: string,
): Promise<XmlFeedItemRow | null> {
  const rows = await db
    .select()
    .from(xmlFeedItems)
    .where(and(eq(xmlFeedItems.feed_id, feedId), eq(xmlFeedItems.external_id, externalId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertFeedItem(input: {
  feed_id: string;
  external_id: string;
  property_id: string | null;
  last_hash: string;
  status?: XmlFeedItemStatus;
}): Promise<void> {
  const existing = await findFeedItem(input.feed_id, input.external_id);
  const now = new Date();
  if (existing) {
    await db.update(xmlFeedItems).set({
      property_id:  input.property_id,
      last_hash:    input.last_hash,
      last_seen_at: now,
      status:       input.status ?? "active",
    } as any).where(eq(xmlFeedItems.id, existing.id));
  } else {
    await db.insert(xmlFeedItems).values({
      id:           randomUUID(),
      feed_id:      input.feed_id,
      external_id:  input.external_id,
      property_id:  input.property_id,
      last_hash:    input.last_hash,
      last_seen_at: now,
      status:       input.status ?? "active",
    } as any);
  }
}

/**
 * Bu run'da gorulmeyen item'lari 'stale' isaretle.
 * seenExternalIds bos ise hic kaldirma yapilmaz.
 */
export async function markMissingItemsStale(feedId: string, seenExternalIds: string[]): Promise<number> {
  if (seenExternalIds.length === 0) return 0;
  const BATCH = 500;
  let total = 0;
  // "NOT IN (...)" yerine tum aktif'leri cek, orada olmayani stale yap (buyuk listelerde IN patlar)
  const active = await db
    .select({ id: xmlFeedItems.id, external_id: xmlFeedItems.external_id })
    .from(xmlFeedItems)
    .where(and(eq(xmlFeedItems.feed_id, feedId), eq(xmlFeedItems.status, "active")));

  const seen = new Set(seenExternalIds);
  const staleIds = active.filter((r) => !seen.has(r.external_id)).map((r) => r.id);
  for (let i = 0; i < staleIds.length; i += BATCH) {
    const chunk = staleIds.slice(i, i + BATCH);
    await db.update(xmlFeedItems)
      .set({ status: "stale" as any, updated_at: new Date() } as any)
      .where(inArray(xmlFeedItems.id, chunk));
    total += chunk.length;
  }
  return total;
}

export async function listItemsByFeed(
  feedId: string,
  opts: { limit?: number; offset?: number; status?: XmlFeedItemStatus } = {},
): Promise<{ items: XmlFeedItemRow[]; total: number }> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;

  const conds = [eq(xmlFeedItems.feed_id, feedId)];
  if (opts.status) conds.push(eq(xmlFeedItems.status, opts.status));
  const where = conds.length > 1 ? and(...conds) : conds[0];

  const [items, countRows] = await Promise.all([
    db.select().from(xmlFeedItems)
      .where(where)
      .orderBy(asc(xmlFeedItems.external_id))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(xmlFeedItems)
      .where(where),
  ]);

  return { items, total: Number(countRows[0]?.total ?? 0) };
}

// -------------------------------------------------------------
// CATEGORY MAP
// -------------------------------------------------------------
export async function listCategoryMap(feedId: string): Promise<XmlFeedCategoryMapRow[]> {
  return db
    .select()
    .from(xmlFeedCategoryMap)
    .where(eq(xmlFeedCategoryMap.feed_id, feedId))
    .orderBy(asc(xmlFeedCategoryMap.external_category));
}

export async function buildCategoryMapLookup(feedId: string): Promise<Map<string, {
  category_id: string | null;
  sub_category_id: string | null;
}>> {
  const rows = await listCategoryMap(feedId);
  const map = new Map<string, { category_id: string | null; sub_category_id: string | null }>();
  for (const r of rows) {
    map.set(r.external_category.toLowerCase(), {
      category_id:     r.local_category_id ?? null,
      sub_category_id: r.local_subcategory_id ?? null,
    });
  }
  return map;
}

export async function upsertCategoryMap(input: {
  feed_id: string;
  external_category: string;
  local_category_id: string | null;
  local_subcategory_id: string | null;
}): Promise<void> {
  const existing = await db
    .select()
    .from(xmlFeedCategoryMap)
    .where(and(
      eq(xmlFeedCategoryMap.feed_id, input.feed_id),
      eq(xmlFeedCategoryMap.external_category, input.external_category),
    ))
    .limit(1);

  if (existing[0]) {
    await db.update(xmlFeedCategoryMap).set({
      local_category_id:    input.local_category_id,
      local_subcategory_id: input.local_subcategory_id,
    } as any).where(eq(xmlFeedCategoryMap.id, existing[0].id));
  } else {
    await db.insert(xmlFeedCategoryMap).values({
      id:                   randomUUID(),
      feed_id:              input.feed_id,
      external_category:    input.external_category,
      local_category_id:    input.local_category_id,
      local_subcategory_id: input.local_subcategory_id,
    } as any);
  }
}

export async function deleteCategoryMapEntry(id: string, feedId: string): Promise<void> {
  await db.delete(xmlFeedCategoryMap).where(and(
    eq(xmlFeedCategoryMap.id, id),
    eq(xmlFeedCategoryMap.feed_id, feedId),
  ));
}
