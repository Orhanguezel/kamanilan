// =============================================================
// FILE: src/modules/photoQueue/repository.ts
// photo_download_queue CRUD
// =============================================================
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  photoDownloadQueue,
  type PhotoQueueRow,
  type PhotoQueueSource,
  type PhotoQueueStatus,
} from "./schema";

const MAX_RETRY = 3;

// -------------------------------------------------------------
// ENQUEUE
// -------------------------------------------------------------
export async function enqueuePhoto(input: {
  property_id: string;
  source: PhotoQueueSource;
  source_ref_id?: string | null;
  source_url: string;
  display_order?: number;
  is_cover?: boolean;
  alt_text?: string | null;
}): Promise<void> {
  await db.insert(photoDownloadQueue).values({
    id:            randomUUID(),
    property_id:   input.property_id,
    source:        input.source,
    source_ref_id: input.source_ref_id ?? null,
    source_url:    input.source_url,
    display_order: input.display_order ?? 0,
    is_cover:      input.is_cover ? 1 : 0,
    alt_text:      input.alt_text ?? null,
    status:        "pending",
    retry_count:   0,
  } as any);
}

export async function enqueuePhotosBatch(items: Array<{
  property_id: string;
  source: PhotoQueueSource;
  source_ref_id?: string | null;
  source_url: string;
  display_order?: number;
  is_cover?: boolean;
  alt_text?: string | null;
}>): Promise<void> {
  if (items.length === 0) return;
  const BATCH = 200;
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH).map((x) => ({
      id:            randomUUID(),
      property_id:   x.property_id,
      source:        x.source,
      source_ref_id: x.source_ref_id ?? null,
      source_url:    x.source_url,
      display_order: x.display_order ?? 0,
      is_cover:      x.is_cover ? 1 : 0,
      alt_text:      x.alt_text ?? null,
      status:        "pending" as PhotoQueueStatus,
      retry_count:   0,
    }));
    await db.insert(photoDownloadQueue).values(chunk as any);
  }
}

// -------------------------------------------------------------
// PICK PENDING (worker)
// -------------------------------------------------------------
/**
 * Pending + retry_count < MAX_RETRY olanlari al + status='downloading' isaretle.
 * Ayni saniyede ikinci bir cron tick olsa bile `downloading` filtresi ile cakisma olmaz
 * (bu proje single-instance cron'a guveniyor; ileride SKIP LOCKED eklenebilir).
 */
export async function pickPending(limit: number = 5): Promise<PhotoQueueRow[]> {
  const candidates = await db
    .select()
    .from(photoDownloadQueue)
    .where(and(
      eq(photoDownloadQueue.status, "pending"),
      lt(photoDownloadQueue.retry_count, MAX_RETRY),
    ))
    .orderBy(asc(photoDownloadQueue.created_at))
    .limit(Math.min(limit, 20));

  if (candidates.length === 0) return [];

  const ids = candidates.map((c) => c.id);
  await db.update(photoDownloadQueue)
    .set({ status: "downloading", updated_at: new Date() } as any)
    .where(inArray(photoDownloadQueue.id, ids));

  return candidates.map((c) => ({ ...c, status: "downloading" }));
}

// -------------------------------------------------------------
// COMPLETE / FAIL
// -------------------------------------------------------------
export async function markDone(id: string, assetId: string | null): Promise<void> {
  await db.update(photoDownloadQueue).set({
    status:       "done",
    asset_id:     assetId,
    processed_at: new Date(),
    last_error:   null,
  } as any).where(eq(photoDownloadQueue.id, id));
}

export async function markFailed(id: string, error: string, hardFail = false): Promise<void> {
  const rows = await db
    .select({ retry_count: photoDownloadQueue.retry_count })
    .from(photoDownloadQueue)
    .where(eq(photoDownloadQueue.id, id))
    .limit(1);
  const current = Number(rows[0]?.retry_count ?? 0);
  const next = current + 1;
  const finalStatus: PhotoQueueStatus = hardFail || next >= MAX_RETRY ? "failed" : "pending";
  await db.update(photoDownloadQueue).set({
    status:      finalStatus,
    retry_count: next,
    last_error:  error.slice(0, 500),
    processed_at: finalStatus === "failed" ? new Date() : null,
  } as any).where(eq(photoDownloadQueue.id, id));
}

// -------------------------------------------------------------
// QUERIES
// -------------------------------------------------------------
export async function listByProperty(propertyId: string): Promise<PhotoQueueRow[]> {
  return db
    .select()
    .from(photoDownloadQueue)
    .where(eq(photoDownloadQueue.property_id, propertyId))
    .orderBy(asc(photoDownloadQueue.display_order));
}

export async function countByStatus(status: PhotoQueueStatus): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(photoDownloadQueue)
    .where(eq(photoDownloadQueue.status, status));
  return Number(rows[0]?.total ?? 0);
}

export async function listFailed(limit = 50, offset = 0): Promise<{
  items: PhotoQueueRow[];
  total: number;
}> {
  const lim = Math.min(limit, 200);
  const [items, totalRows] = await Promise.all([
    db.select().from(photoDownloadQueue)
      .where(eq(photoDownloadQueue.status, "failed"))
      .orderBy(desc(photoDownloadQueue.updated_at))
      .limit(lim)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(photoDownloadQueue)
      .where(eq(photoDownloadQueue.status, "failed")),
  ]);
  return { items, total: Number(totalRows[0]?.total ?? 0) };
}

export async function resetForRetry(id: string): Promise<void> {
  await db.update(photoDownloadQueue).set({
    status:      "pending",
    retry_count: 0,
    last_error:  null,
    processed_at: null,
  } as any).where(eq(photoDownloadQueue.id, id));
}
