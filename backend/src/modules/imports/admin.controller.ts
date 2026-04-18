// =============================================================
// FILE: src/modules/imports/admin.controller.ts
// 7 endpoint: upload, mapping, detail, list-items, commit, list-jobs, photos-zip
// =============================================================
import type { RouteHandler, FastifyRequest, FastifyReply } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";

import { parseSpreadsheet } from "./parser";
import { importJobs } from "./schema";
import {
  importMappingSchema,
  loadTaxonomyCache,
  validateRow,
  type ImportMapping,
  type NormalizedProperty,
} from "./validator";
import {
  createJob,
  updateJob,
  getJobForUser,
  listJobsByUser,
  insertItemsBatch,
  listItemsByJob,
  updateItem,
  getAllValidItemsByJob,
  deleteItemsByJob,
} from "./repository";
import {
  hasFeature,
  canImportMore,
  getMaxPhotosPerListing,
} from "@/modules/subscription/service";
import { createProperty, replacePropertyAssets } from "@/modules/proporties/repository";
import { enqueuePhotosBatch } from "@/modules/photoQueue/repository";
import type { ImportJobItemStatus } from "./schema";

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
type AuthedRequest = FastifyRequest & {
  user?: { id?: string; sub?: string; seller_id?: string } | null;
  file?: () => Promise<MultipartFile | undefined>;
};

function actorId(req: AuthedRequest): string | null {
  const u = req.user ?? {};
  return (typeof u.id === "string" && u.id) || (typeof u.sub === "string" && u.sub) || null;
}

function actorSellerId(req: AuthedRequest): string | null {
  const u = req.user ?? {};
  return typeof u.seller_id === "string" && u.seller_id ? u.seller_id : null;
}

function bad(reply: FastifyReply, code: number, message: string, extra?: Record<string, unknown>) {
  return reply.code(code).send({ error: { message, ...(extra ?? {}) } });
}

// -------------------------------------------------------------
// POST /admin/imports/upload
// multipart dosya → parse → import_jobs (pending) + items (raw_json)
// -------------------------------------------------------------
export const uploadImport: RouteHandler = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  // Feature guard
  if (!(await hasFeature(user_id, "bulk_import_enabled"))) {
    return bad(reply, 403, "feature_not_available", { feature: "bulk_import_enabled" });
  }

  let mp: MultipartFile | undefined;
  try {
    mp = await (req as AuthedRequest).file?.();
  } catch {
    return bad(reply, 400, "invalid_multipart_body");
  }
  if (!mp) return bad(reply, 400, "file_required");

  const filename = mp.filename ?? "upload";
  const mime = mp.mimetype ?? null;

  let buf: Buffer;
  try {
    buf = await mp.toBuffer();
  } catch {
    return bad(reply, 400, "file_read_failed");
  }
  if (buf.length === 0) return bad(reply, 400, "file_empty");

  let parsed;
  try {
    parsed = parseSpreadsheet(buf, { mime, filename });
  } catch (err) {
    (req.log as any).error({ err }, "import_parse_failed");
    return bad(reply, 400, "parse_failed");
  }

  if (parsed.rows.length === 0) {
    return bad(reply, 400, "no_rows_detected", { columns: parsed.columns });
  }

  const seller_id = actorSellerId(req as AuthedRequest);
  const job = await createJob({
    user_id,
    seller_id,
    source_type: parsed.source_type,
    file_name:   filename.slice(0, 255),
    file_size:   buf.length,
    total_rows:  parsed.total_rows,
  });

  // Raw rows'u items tablosuna yaz (normalized yok, status=pending)
  await insertItemsBatch(
    parsed.rows.map((r, i) => ({
      job_id:    job.id,
      row_index: i,
      raw_json:  r,
      status:    "valid" as ImportJobItemStatus,  // initial - mapping'den once status belirsiz; 'valid' default
    })),
  );

  return reply.code(201).send({
    job_id:           job.id,
    status:           "pending",
    source_type:      parsed.source_type,
    file_name:        job.file_name,
    file_size:        job.file_size,
    total_rows:       parsed.total_rows,
    detected_columns: parsed.columns,
    preview_rows:     parsed.rows.slice(0, 5),
  });
};

// -------------------------------------------------------------
// PUT /admin/imports/:id/mapping
// Mapping + validation tum rows uzerinde
// -------------------------------------------------------------
export const putMapping: RouteHandler<{
  Params: { id: string };
  Body: { mapping?: unknown };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");
  if (job.status !== "pending" && job.status !== "parsed" && job.status !== "review") {
    return bad(reply, 409, "job_locked", { status: job.status });
  }

  const parsedMapping = importMappingSchema.safeParse((req.body as any)?.mapping ?? {});
  if (!parsedMapping.success) {
    return bad(reply, 400, "invalid_mapping", { issues: parsedMapping.error.issues });
  }
  const mapping: ImportMapping = parsedMapping.data;

  // Taxonomy cache (tek defa)
  const taxonomy = await loadTaxonomyCache("tr");
  const usedSlugs = new Set<string>();

  // Tum items'i sirayla dolasip status + normalized_json update et
  const BATCH = 200;
  let offset = 0;
  let validCount = 0;
  let invalidCount = 0;

  while (true) {
    const { items } = await listItemsByJob(job.id, { limit: BATCH, offset });
    if (items.length === 0) break;

    for (const item of items) {
      const raw = item.raw_json as Record<string, string>;
      const result = validateRow(raw, mapping, taxonomy, usedSlugs);
      const status: ImportJobItemStatus = result.ok ? "valid" : "invalid";
      await updateItem(item.id, {
        status,
        normalized_json: result.normalized as unknown,
        errors_json:     result.errors.length > 0 ? result.errors : null,
      });
      if (result.ok) validCount++;
      else invalidCount++;
    }
    offset += items.length;
    if (items.length < BATCH) break;
  }

  await updateJob(job.id, {
    status:       "review",
    mapping_json: mapping,
    valid_rows:   validCount,
    invalid_rows: invalidCount,
  });

  // On-izleme icin ilk 5 valid + 5 invalid item'i ver
  const { items: validSample } = await listItemsByJob(job.id, { status: "valid",   limit: 5 });
  const { items: invalidSample } = await listItemsByJob(job.id, { status: "invalid", limit: 5 });

  return reply.send({
    job_id:       job.id,
    status:       "review",
    total_rows:   job.total_rows,
    valid_rows:   validCount,
    invalid_rows: invalidCount,
    preview: {
      valid_sample:   validSample.map((i) => ({
        row_index: i.row_index,
        normalized: i.normalized_json,
      })),
      invalid_sample: invalidSample.map((i) => ({
        row_index: i.row_index,
        errors:    i.errors_json,
        raw:       i.raw_json,
      })),
    },
  });
};

// -------------------------------------------------------------
// GET /admin/imports/:id
// -------------------------------------------------------------
export const getJob: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");
  return reply.send(job);
};

// -------------------------------------------------------------
// GET /admin/imports/:id/items
// -------------------------------------------------------------
const ALLOWED_STATUSES: ReadonlyArray<ImportJobItemStatus> = [
  "valid", "invalid", "imported", "skipped", "failed",
];

export const listItems: RouteHandler<{
  Params: { id: string };
  Querystring: { status?: string; limit?: string; offset?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");

  const statusQ = req.query?.status;
  const status = ALLOWED_STATUSES.includes(statusQ as ImportJobItemStatus)
    ? (statusQ as ImportJobItemStatus)
    : undefined;

  const limit = Math.min(Number(req.query?.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(req.query?.offset ?? 0) || 0, 0);

  const { items, total } = await listItemsByJob(job.id, { status, limit, offset });
  reply.header("x-total-count", String(total));
  return reply.send(items);
};

// -------------------------------------------------------------
// POST /admin/imports/:id/commit
// Valid items → properties + replacePropertyAssets
// -------------------------------------------------------------
export const commitImport: RouteHandler<{
  Params: { id: string };
  Body: { skip_invalid?: boolean; default_status?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");
  if (job.status !== "review") return bad(reply, 409, "job_not_ready", { status: job.status });

  if (!(await hasFeature(user_id, "bulk_import_enabled"))) {
    return bad(reply, 403, "feature_not_available", { feature: "bulk_import_enabled" });
  }

  const defaultStatus = (req.body?.default_status ?? "active").slice(0, 64);

  // Subscription limit kontrolu
  const validItems = await getAllValidItemsByJob(job.id);
  if (validItems.length === 0) return bad(reply, 400, "no_valid_items");

  const capacity = await canImportMore(user_id, validItems.length);
  if (!capacity.allowed) {
    return reply.code(402).send({
      error: {
        message: "listing_limit_exceeded",
        current: capacity.current,
        limit:   capacity.limit,
        overage: capacity.overage,
      },
    });
  }

  await updateJob(job.id, { status: "importing", started_at: new Date() });

  // Per-plan foto limiti (launch Ucretsiz=20, Temel=15, Pro=50)
  const maxPhotos = await getMaxPhotosPerListing(user_id);

  let imported = 0;
  let failed = 0;
  const errorSample: Array<{ row_index: number; message: string }> = [];

  for (const item of validItems) {
    const n = item.normalized_json as NormalizedProperty | null;
    if (!n) {
      failed++;
      await updateItem(item.id, {
        status:      "failed",
        errors_json: ["missing_normalized"],
      });
      continue;
    }

    try {
      await createProperty(
        {
          id:              n.id,
          user_id,
          title:           n.title,
          slug:            n.slug,
          status:          n.status || defaultStatus,
          address:         n.address,
          district:        n.district,
          city:            n.city,
          neighborhood:    n.neighborhood ?? null,
          excerpt:         n.excerpt ?? null,
          description:     n.description ?? null,
          price:           n.price != null ? n.price.toFixed(2) : null,
          currency:        n.currency,
          category_id:     n.category_id ?? null,
          sub_category_id: n.sub_category_id ?? null,
          brand_id:        n.brand_id ?? null,
          is_active:       1,
          display_order:   0,
          created_at:      new Date(),
          updated_at:      new Date(),
        } as any,
        { ownerUserId: user_id, isAdmin: true },
      );

      // 1) property_assets'e hotlink URL'leri immediate yaz (site hemen foto gostersin)
      // 2) photo_download_queue'ya ekle — cron Cloudinary'e tasiyacak
      if (n.photos.length > 0) {
        const capped = n.photos.slice(0, maxPhotos);
        await replacePropertyAssets(
          n.id,
          capped.map((url, idx) => ({
            id:            `tmp-${idx}`,
            url,
            kind:          "image" as const,
            is_cover:      idx === 0 ? 1 : 0,
            display_order: idx,
          })),
        );
        await enqueuePhotosBatch(
          capped.map((url, idx) => ({
            property_id:   n.id,
            source:        "excel_import" as const,
            source_ref_id: job.id,
            source_url:    url,
            display_order: idx,
            is_cover:      idx === 0,
          })),
        );
      }

      await updateItem(item.id, {
        status:      "imported",
        property_id: n.id,
      });
      imported++;
    } catch (err: unknown) {
      failed++;
      const msg = (err as { code?: string; message?: string })?.code === "ER_DUP_ENTRY"
        ? "slug_conflict"
        : (err as Error)?.message || "import_failed";
      await updateItem(item.id, {
        status:      "failed",
        errors_json: [msg],
      });
      if (errorSample.length < 10) {
        errorSample.push({ row_index: item.row_index, message: msg });
      }
    }
  }

  const finalStatus = failed === 0 ? "completed" : (imported > 0 ? "completed" : "failed");
  await updateJob(job.id, {
    status:         finalStatus,
    imported_count: imported,
    finished_at:    new Date(),
    errors_json:    errorSample.length > 0 ? errorSample : null,
  });

  return reply.code(202).send({
    job_id:         job.id,
    status:         finalStatus,
    imported_count: imported,
    failed_count:   failed,
    error_sample:   errorSample,
  });
};

// -------------------------------------------------------------
// GET /admin/imports
// -------------------------------------------------------------
export const listJobs: RouteHandler<{
  Querystring: { status?: string; limit?: string; offset?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const limit = Math.min(Number(req.query?.limit ?? 20) || 20, 100);
  const offset = Math.max(Number(req.query?.offset ?? 0) || 0, 0);

  const { items, total } = await listJobsByUser(user_id, {
    limit,
    offset,
    status: (req.query?.status as any) || undefined,
  });

  reply.header("x-total-count", String(total));
  return reply.send(items);
};

// -------------------------------------------------------------
// POST /admin/imports/:id/photos-zip (Sprint 4)
// Stub — queue insert Sprint 4 worker'i tamamlayacak
// -------------------------------------------------------------
export const uploadPhotosZip: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");

  return reply.code(501).send({
    error: { message: "not_implemented_yet", sprint: 4 },
  });
};

// -------------------------------------------------------------
// DELETE /admin/imports/:id
// Opsiyonel — pending/review asamasinda iptal
// -------------------------------------------------------------
export const deleteJob: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const job = await getJobForUser(req.params.id, user_id);
  if (!job) return bad(reply, 404, "job_not_found");
  if (job.status === "importing") return bad(reply, 409, "job_in_progress");

  await deleteItemsByJob(job.id);
  await db.delete(importJobs).where(eq(importJobs.id, job.id));

  return reply.code(204).send();
};
