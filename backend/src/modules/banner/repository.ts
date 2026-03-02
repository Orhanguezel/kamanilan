// =============================================================
// FILE: src/modules/banner/repository.ts
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, inArray, like, sql } from "drizzle-orm";
import { banners, type BannerRow } from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import { publicUrlOf } from "@/modules/_shared/repo-helpers";
import { randomUUID } from "crypto";
import type {
  AdminListQuery,
  CreateBody,
  PublicListQuery,
  UpdateBody,
  SetImageBody,
} from "./validation";

export type BannerWithAsset = { row: BannerRow; asset_url: string | null; thumb_url: string | null };

const ORDER = {
  display_order: banners.display_order,
  title: banners.title,
  created_at: banners.created_at,
  updated_at: banners.updated_at,
} as const;

function orderExpr(sort: keyof typeof ORDER, dir: "asc" | "desc") {
  const col = ORDER[sort] ?? ORDER.display_order;
  return dir === "asc" ? asc(col) : desc(col);
}

function baseSelect() {
  return db
    .select({
      row: banners,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(banners)
    .leftJoin(storageAssets, eq(banners.image_asset_id, storageAssets.id));
}

function toWithAsset(r: {
  row: BannerRow;
  asset_bucket: string | null;
  asset_path: string | null;
  asset_url0: string | null;
}): BannerWithAsset {
  return {
    row: r.row,
    asset_url: publicUrlOf(r.asset_bucket, r.asset_path, r.asset_url0) ?? r.row.image_url ?? null,
    thumb_url: r.row.thumbnail_url ?? null,
  };
}

/* ===================== PUBLIC ===================== */

export async function repoListPublic(q: PublicListQuery): Promise<BannerWithAsset[]> {
  const conds: any[] = [eq(banners.is_active, 1 as const)];

  if (q.ids) {
    const parsedIds = q.ids.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
    if (parsedIds.length > 0) conds.push(inArray(banners.id, parsedIds));
  }

  if (typeof q.desktop_row === "number") {
    conds.push(eq(banners.desktop_row, q.desktop_row));
  }

  if (q.q) conds.push(like(banners.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(and(...conds))
    .orderBy(orderExpr(q.sort, q.order), asc(banners.display_order), asc(banners.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

/* ===================== ADMIN ===================== */

export async function repoListAdmin(q: AdminListQuery): Promise<BannerWithAsset[]> {
  const conds: any[] = [];
  if (typeof q.is_active === "boolean") conds.push(eq(banners.is_active, q.is_active ? 1 : 0));
  if (q.ids) {
    const parsedIds = q.ids.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
    if (parsedIds.length > 0) conds.push(inArray(banners.id, parsedIds));
  }
  if (q.q) conds.push(like(banners.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(orderExpr(q.sort, q.order), asc(banners.display_order), asc(banners.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoGetById(id: number): Promise<BannerWithAsset | null> {
  const rows = await baseSelect().where(eq(banners.id, id)).limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

export async function repoCreate(b: CreateBody): Promise<BannerWithAsset> {
  const maxOrder = await db
    .select({ v: sql<number>`COALESCE(MAX(${banners.display_order}), 0)` })
    .from(banners);

  const slug = (
    b.slug ||
    b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  ).slice(0, 255);

  await db.insert(banners).values({
    uuid: randomUUID(),
    title: b.title,
    slug,
    subtitle: b.subtitle ?? null,
    description: b.description ?? null,
    image_url: b.image_url ?? null,
    image_asset_id: b.image_asset_id ?? null,
    alt: b.alt ?? null,
    thumbnail_url: b.thumbnail_url ?? null,
    thumbnail_asset_id: b.thumbnail_asset_id ?? null,
    background_color: b.background_color ?? null,
    title_color: b.title_color ?? null,
    description_color: b.description_color ?? null,
    button_text: b.button_text ?? null,
    button_color: b.button_color ?? null,
    button_hover_color: b.button_hover_color ?? null,
    button_text_color: b.button_text_color ?? null,
    link_url: b.link_url ?? null,
    link_target: b.link_target ?? "_self",
    is_active: b.is_active ? 1 : 0,
    display_order: b.display_order ?? (maxOrder[0]?.v ?? 0) + 1,
    desktop_row: (b as any).desktop_row ?? 0,
    desktop_columns: (b as any).desktop_columns ?? 1,
    advertiser_name: (b as any).advertiser_name ?? null,
    contact_info: (b as any).contact_info ?? null,
    start_at: b.start_at ?? null,
    end_at: b.end_at ?? null,
  } as any);

  const created = await db
    .select({ id: banners.id })
    .from(banners)
    .where(eq(banners.slug, slug))
    .limit(1);

  if (!created.length) throw new Error("create_failed");
  const result = await repoGetById(created[0].id);
  if (!result) throw new Error("create_failed");
  return result;
}

export async function repoUpdate(id: number, b: UpdateBody): Promise<BannerWithAsset | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.title !== undefined) set.title = b.title;
  if (b.slug !== undefined) set.slug = b.slug;
  if (b.subtitle !== undefined) set.subtitle = b.subtitle ?? null;
  if (b.description !== undefined) set.description = b.description ?? null;
  if (b.image_url !== undefined) set.image_url = b.image_url ?? null;
  if (b.image_asset_id !== undefined) set.image_asset_id = b.image_asset_id ?? null;
  if (b.alt !== undefined) set.alt = b.alt ?? null;
  if (b.thumbnail_url !== undefined) set.thumbnail_url = b.thumbnail_url ?? null;
  if (b.thumbnail_asset_id !== undefined) set.thumbnail_asset_id = b.thumbnail_asset_id ?? null;
  if (b.background_color !== undefined) set.background_color = b.background_color ?? null;
  if (b.title_color !== undefined) set.title_color = b.title_color ?? null;
  if (b.description_color !== undefined) set.description_color = b.description_color ?? null;
  if (b.button_text !== undefined) set.button_text = b.button_text ?? null;
  if (b.button_color !== undefined) set.button_color = b.button_color ?? null;
  if (b.button_hover_color !== undefined) set.button_hover_color = b.button_hover_color ?? null;
  if (b.button_text_color !== undefined) set.button_text_color = b.button_text_color ?? null;
  if (b.link_url !== undefined) set.link_url = b.link_url ?? null;
  if (b.link_target !== undefined) set.link_target = b.link_target;
  if (b.is_active !== undefined) set.is_active = b.is_active ? 1 : 0;
  if (b.display_order !== undefined) set.display_order = b.display_order;
  if ((b as any).desktop_row !== undefined) set.desktop_row = (b as any).desktop_row ?? 0;
  if ((b as any).desktop_columns !== undefined) set.desktop_columns = (b as any).desktop_columns ?? 1;
  if ((b as any).advertiser_name !== undefined) set.advertiser_name = (b as any).advertiser_name ?? null;
  if ((b as any).contact_info !== undefined) set.contact_info = (b as any).contact_info ?? null;
  if (b.start_at !== undefined) set.start_at = b.start_at ?? null;
  if (b.end_at !== undefined) set.end_at = b.end_at ?? null;

  await db.update(banners).set(set as any).where(eq(banners.id, id));
  return repoGetById(id);
}

export async function repoDelete(id: number): Promise<void> {
  await db.delete(banners).where(eq(banners.id, id));
}

export async function repoReorder(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(banners)
      .set({ display_order: i + 1, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
      .where(eq(banners.id, ids[i]));
  }
}

export async function repoSetStatus(id: number, isActive: boolean): Promise<BannerWithAsset | null> {
  await db
    .update(banners)
    .set({ is_active: isActive ? 1 : 0, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
    .where(eq(banners.id, id));
  return repoGetById(id);
}

export async function repoSetImage(id: number, body: SetImageBody): Promise<BannerWithAsset | null> {
  const assetId = body.asset_id ?? null;
  if (!assetId) {
    await db
      .update(banners)
      .set({ image_url: null, image_asset_id: null, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
      .where(eq(banners.id, id));
    return repoGetById(id);
  }

  const [asset] = await db
    .select({ bucket: storageAssets.bucket, path: storageAssets.path, url: storageAssets.url })
    .from(storageAssets)
    .where(eq(storageAssets.id, assetId))
    .limit(1);

  if (!asset) return null;
  const url = publicUrlOf(asset.bucket, asset.path, asset.url ?? null);

  await db
    .update(banners)
    .set({ image_url: url, image_asset_id: assetId, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
    .where(eq(banners.id, id));

  return repoGetById(id);
}
