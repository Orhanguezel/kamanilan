// =============================================================
// FILE: src/modules/imports/repository.ts
// Import job + item CRUD
// =============================================================
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  importJobs,
  importJobItems,
  importColumnMappings,
  type ImportJobRow,
  type ImportJobItemRow,
  type ImportJobStatus,
  type ImportJobItemStatus,
} from "./schema";

// -------------------------------------------------------------
// JOBS
// -------------------------------------------------------------
export async function createJob(input: {
  user_id: string;
  seller_id?: string | null;
  source_type: "excel" | "csv";
  file_name: string;
  file_size: number;
  total_rows: number;
}): Promise<ImportJobRow> {
  const id = randomUUID();
  await db.insert(importJobs).values({
    id,
    user_id:     input.user_id,
    seller_id:   input.seller_id ?? null,
    source_type: input.source_type,
    file_name:   input.file_name,
    file_size:   input.file_size,
    total_rows:  input.total_rows,
    status:      "pending",
  } as any);
  const row = await getJobById(id);
  if (!row) throw new Error("import_job_create_failed");
  return row;
}

export async function getJobById(id: string): Promise<ImportJobRow | null> {
  const rows = await db.select().from(importJobs).where(eq(importJobs.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getJobForUser(id: string, userId: string): Promise<ImportJobRow | null> {
  const rows = await db
    .select()
    .from(importJobs)
    .where(and(eq(importJobs.id, id), eq(importJobs.user_id, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateJob(id: string, patch: Partial<{
  status: ImportJobStatus;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  imported_count: number;
  mapping_json: unknown;
  errors_json: unknown;
  started_at: Date | null;
  finished_at: Date | null;
}>): Promise<void> {
  const set: Record<string, unknown> = {};
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.total_rows !== undefined) set.total_rows = patch.total_rows;
  if (patch.valid_rows !== undefined) set.valid_rows = patch.valid_rows;
  if (patch.invalid_rows !== undefined) set.invalid_rows = patch.invalid_rows;
  if (patch.imported_count !== undefined) set.imported_count = patch.imported_count;
  if (patch.mapping_json !== undefined) set.mapping_json = patch.mapping_json;
  if (patch.errors_json !== undefined) set.errors_json = patch.errors_json;
  if (patch.started_at !== undefined) set.started_at = patch.started_at;
  if (patch.finished_at !== undefined) set.finished_at = patch.finished_at;
  if (Object.keys(set).length === 0) return;
  await db.update(importJobs).set(set as any).where(eq(importJobs.id, id));
}

export async function listJobsByUser(
  userId: string,
  opts: { limit?: number; offset?: number; status?: ImportJobStatus } = {},
): Promise<{ items: ImportJobRow[]; total: number }> {
  const limit = Math.min(opts.limit ?? 20, 100);
  const offset = opts.offset ?? 0;

  const conds = [eq(importJobs.user_id, userId)];
  if (opts.status) conds.push(eq(importJobs.status, opts.status));
  const where = conds.length > 1 ? and(...conds) : conds[0];

  const [items, countRows] = await Promise.all([
    db.select().from(importJobs)
      .where(where)
      .orderBy(desc(importJobs.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(importJobs)
      .where(where),
  ]);

  return { items, total: Number(countRows[0]?.total ?? 0) };
}

// -------------------------------------------------------------
// ITEMS
// -------------------------------------------------------------
export async function insertItemsBatch(rows: Array<{
  id?: string;
  job_id: string;
  row_index: number;
  raw_json: unknown;
  normalized_json?: unknown;
  status?: ImportJobItemStatus;
  errors_json?: unknown;
  photo_filenames_json?: unknown;
  property_id?: string | null;
}>): Promise<void> {
  if (rows.length === 0) return;
  const BATCH_SIZE = 500;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE).map((r) => ({
      id:                   r.id ?? randomUUID(),
      job_id:               r.job_id,
      row_index:            r.row_index,
      raw_json:             r.raw_json,
      normalized_json:      r.normalized_json ?? null,
      status:               r.status ?? "valid",
      errors_json:          r.errors_json ?? null,
      photo_filenames_json: r.photo_filenames_json ?? null,
      property_id:          r.property_id ?? null,
    }));
    await db.insert(importJobItems).values(chunk as any);
  }
}

export async function deleteItemsByJob(jobId: string): Promise<void> {
  await db.delete(importJobItems).where(eq(importJobItems.job_id, jobId));
}

export async function listItemsByJob(
  jobId: string,
  opts: { limit?: number; offset?: number; status?: ImportJobItemStatus } = {},
): Promise<{ items: ImportJobItemRow[]; total: number }> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;

  const conds = [eq(importJobItems.job_id, jobId)];
  if (opts.status) conds.push(eq(importJobItems.status, opts.status));
  const where = conds.length > 1 ? and(...conds) : conds[0];

  const [items, countRows] = await Promise.all([
    db.select().from(importJobItems)
      .where(where)
      .orderBy(asc(importJobItems.row_index))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(importJobItems)
      .where(where),
  ]);

  return { items, total: Number(countRows[0]?.total ?? 0) };
}

export async function updateItem(id: string, patch: Partial<{
  status: ImportJobItemStatus;
  property_id: string | null;
  normalized_json: unknown;
  errors_json: unknown;
}>): Promise<void> {
  const set: Record<string, unknown> = {};
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.property_id !== undefined) set.property_id = patch.property_id;
  if (patch.normalized_json !== undefined) set.normalized_json = patch.normalized_json;
  if (patch.errors_json !== undefined) set.errors_json = patch.errors_json;
  if (Object.keys(set).length === 0) return;
  await db.update(importJobItems).set(set as any).where(eq(importJobItems.id, id));
}

export async function getAllValidItemsByJob(jobId: string): Promise<ImportJobItemRow[]> {
  return db
    .select()
    .from(importJobItems)
    .where(and(eq(importJobItems.job_id, jobId), eq(importJobItems.status, "valid")))
    .orderBy(asc(importJobItems.row_index));
}

// -------------------------------------------------------------
// MAPPING TEMPLATES
// -------------------------------------------------------------
export async function saveMappingTemplate(input: {
  seller_id: string;
  source_type: "excel" | "csv";
  name: string;
  mapping: unknown;
}): Promise<void> {
  await db
    .insert(importColumnMappings)
    .values({
      id:           randomUUID(),
      seller_id:    input.seller_id,
      source_type:  input.source_type,
      name:         input.name,
      mapping_json: input.mapping,
    } as any)
    .$dynamic()
    .onDuplicateKeyUpdate({
      set: {
        mapping_json: input.mapping,
        source_type:  input.source_type,
        updated_at:   sql`CURRENT_TIMESTAMP(3)`,
      },
    });
}

export async function listMappingTemplates(sellerId: string) {
  return db
    .select()
    .from(importColumnMappings)
    .where(eq(importColumnMappings.seller_id, sellerId))
    .orderBy(desc(importColumnMappings.updated_at));
}
