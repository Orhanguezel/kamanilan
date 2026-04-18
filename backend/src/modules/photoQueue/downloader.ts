// =============================================================
// FILE: src/modules/photoQueue/downloader.ts
// Tek bir queue row'unu isle: fetch URL → Cloudinary upload →
// storage_assets insert → property_assets update (hotlink → Cloudinary)
// =============================================================
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { property_assets } from "@/modules/proporties/schema";
import {
  getCloudinaryConfig,
  uploadBufferAuto,
  type Cfg,
  type UploadResult,
} from "@vps/shared-backend/modules/storage/cloudinary";
import { repoInsert as storageInsert } from "@vps/shared-backend/modules/storage/repository";
import type { PhotoQueueRow } from "./schema";

const DOWNLOAD_TIMEOUT_MS = 30_000;
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per photo

export type DownloadResult = {
  ok: boolean;
  asset_id: string | null;
  url: string | null;
  error: string | null;
};

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function filenameFromUrl(url: string, fallback: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname.split("/").filter(Boolean).pop() ?? fallback;
    return p.replace(/[^\w.\-]+/g, "_").slice(0, 180) || fallback;
  } catch {
    return fallback;
  }
}

function extFromMime(mime: string | null): string {
  if (!mime) return "";
  const m = mime.toLowerCase();
  if (m.includes("jpeg")) return ".jpg";
  if (m.includes("png")) return ".png";
  if (m.includes("webp")) return ".webp";
  if (m.includes("gif")) return ".gif";
  return "";
}

async function fetchToBuffer(url: string): Promise<{ buf: Buffer; mime: string | null }> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "KamanIlan-PhotoWorker/1.0" },
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const mime = res.headers.get("content-type");
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) throw new Error("file_too_large");

    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    if (buf.length > MAX_BYTES) throw new Error("file_too_large");
    return { buf, mime };
  } finally {
    clearTimeout(to);
  }
}

// -------------------------------------------------------------
// Cloudinary upload + storage_assets insert
// -------------------------------------------------------------
async function uploadToCloudinary(
  cfg: Cfg,
  buffer: Buffer,
  opts: { propertyId: string; filename: string; mime: string | null },
): Promise<{ asset_id: string; url: string }> {
  const bucket = "properties";
  const folder = `${bucket}/${opts.propertyId}`;
  const baseName = opts.filename.replace(/\.[^.]+$/, "");
  const publicId = `${baseName}-${Date.now().toString(36)}`;

  const up: UploadResult = await uploadBufferAuto(cfg, buffer, {
    folder,
    publicId,
    mime: opts.mime ?? undefined,
  });

  const ext = (up.format ? `.${up.format}` : extFromMime(opts.mime));
  const storagePath = `${folder}/${publicId}${ext}`;
  const storageId = randomUUID();

  await storageInsert({
    id:                     storageId,
    user_id:                null,
    name:                   `${publicId}${ext}`,
    bucket,
    path:                   storagePath,
    folder,
    mime:                   opts.mime ?? "application/octet-stream",
    size:                   up.bytes ?? buffer.length,
    width:                  up.width ?? null,
    height:                 up.height ?? null,
    url:                    up.secure_url ?? null,
    hash:                   up.etag ?? null,
    etag:                   up.etag ?? null,
    provider:               "cloudinary",
    provider_public_id:     up.public_id ?? null,
    provider_resource_type: up.resource_type ?? "image",
    provider_format:        up.format ?? null,
    provider_version:       typeof up.version === "number" ? up.version : null,
    metadata:               null,
  } as any);

  return { asset_id: storageId, url: up.secure_url ?? "" };
}

// -------------------------------------------------------------
// property_assets update — hotlink row'i Cloudinary'e bagla
// -------------------------------------------------------------
async function linkPropertyAsset(row: PhotoQueueRow, assetId: string, cloudinaryUrl: string): Promise<void> {
  // Ayni property_id + ayni source URL'le varsa UPDATE
  const existing = await db
    .select({ id: property_assets.id })
    .from(property_assets)
    .where(and(
      eq(property_assets.property_id, row.property_id),
      eq(property_assets.url, row.source_url),
    ))
    .limit(1);

  if (existing[0]) {
    await db.update(property_assets).set({
      asset_id:   assetId,
      url:        cloudinaryUrl,
      updated_at: new Date(),
    } as any).where(eq(property_assets.id, existing[0].id));
    return;
  }

  // Yoksa yeni bir property_assets satiri ekle (fallback)
  await db.insert(property_assets).values({
    id:            randomUUID(),
    property_id:   row.property_id,
    asset_id:      assetId,
    url:           cloudinaryUrl,
    alt:           row.alt_text,
    kind:          "image",
    is_cover:      row.is_cover ? 1 : 0,
    display_order: row.display_order,
    created_at:    new Date(),
    updated_at:    new Date(),
  } as any);
}

// -------------------------------------------------------------
// Public: processQueueRow
// -------------------------------------------------------------
export async function processQueueRow(row: PhotoQueueRow): Promise<DownloadResult> {
  const cfg = await getCloudinaryConfig();
  if (!cfg) {
    return { ok: false, asset_id: null, url: null, error: "storage_not_configured" };
  }
  if (cfg.driver !== "cloudinary") {
    return { ok: false, asset_id: null, url: null, error: "non_cloudinary_driver_unsupported" };
  }

  try {
    const { buf, mime } = await fetchToBuffer(row.source_url);
    const filename = filenameFromUrl(row.source_url, `photo-${row.display_order}`);
    const uploaded = await uploadToCloudinary(cfg, buf, {
      propertyId: row.property_id,
      filename,
      mime,
    });
    await linkPropertyAsset(row, uploaded.asset_id, uploaded.url);
    return { ok: true, asset_id: uploaded.asset_id, url: uploaded.url, error: null };
  } catch (err) {
    const msg = (err as Error)?.message || "download_failed";
    return { ok: false, asset_id: null, url: null, error: msg };
  }
}
