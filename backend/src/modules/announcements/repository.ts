// =============================================================
// FILE: src/modules/announcements/repository.ts
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { announcements, type AnnouncementRow } from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import { publicUrlOf } from "@/modules/_shared/repo-helpers";
import { randomUUID } from "crypto";
import type { AdminListQuery, CreateBody, PublicListQuery, UpdateBody } from "./validation";

export type AnnouncementWithAsset = {
  row:       AnnouncementRow;
  cover_url: string | null;
};

const ORDER = {
  published_at:  announcements.published_at,
  created_at:    announcements.created_at,
  display_order: announcements.display_order,
} as const;

function orderExpr(sort: keyof typeof ORDER, dir: "asc" | "desc") {
  const col = ORDER[sort] ?? ORDER.published_at;
  return dir === "asc" ? asc(col) : desc(col);
}

function baseSelect() {
  return db
    .select({
      row:          announcements,
      asset_bucket: storageAssets.bucket,
      asset_path:   storageAssets.path,
      asset_url0:   storageAssets.url,
    })
    .from(announcements)
    .leftJoin(storageAssets, eq(announcements.cover_asset_id, storageAssets.id));
}

function toWithAsset(r: {
  row:          AnnouncementRow;
  asset_bucket: string | null;
  asset_path:   string | null;
  asset_url0:   string | null;
}): AnnouncementWithAsset {
  return {
    row:       r.row,
    cover_url: publicUrlOf(r.asset_bucket, r.asset_path, r.asset_url0) ?? r.row.cover_image_url ?? null,
  };
}

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

/* ===================== PUBLIC ===================== */

export async function repoListPublic(q: PublicListQuery): Promise<AnnouncementWithAsset[]> {
  const conds: any[] = [
    eq(announcements.is_published, 1 as const),
    eq(announcements.locale, q.locale),
  ];
  if (q.category)                conds.push(eq(announcements.category, q.category));
  if (typeof q.featured === "boolean" && q.featured) conds.push(eq(announcements.is_featured, 1 as const));
  if (q.q) conds.push(like(announcements.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(and(...conds))
    .orderBy(orderExpr(q.sort, q.order), desc(announcements.published_at), asc(announcements.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoCountPublic(q: PublicListQuery): Promise<number> {
  const conds: any[] = [
    eq(announcements.is_published, 1 as const),
    eq(announcements.locale, q.locale),
  ];
  if (q.category) conds.push(eq(announcements.category, q.category));
  if (typeof q.featured === "boolean" && q.featured) conds.push(eq(announcements.is_featured, 1 as const));
  if (q.q) conds.push(like(announcements.title, `%${q.q.trim()}%`));

  const [{ cnt }] = await db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(announcements)
    .where(and(...conds));
  return Number(cnt);
}

export async function repoGetBySlugPublic(slug: string, locale: string): Promise<AnnouncementWithAsset | null> {
  const rows = await baseSelect()
    .where(and(
      eq(announcements.slug, slug),
      eq(announcements.locale, locale),
      eq(announcements.is_published, 1 as const)
    ))
    .limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

/* ===================== ADMIN ===================== */

export async function repoListAdmin(q: AdminListQuery): Promise<AnnouncementWithAsset[]> {
  const conds: any[] = [];
  if (q.locale)                                      conds.push(eq(announcements.locale, q.locale));
  if (typeof q.is_published === "boolean")           conds.push(eq(announcements.is_published, q.is_published ? 1 : 0));
  if (typeof q.is_featured  === "boolean")           conds.push(eq(announcements.is_featured,  q.is_featured  ? 1 : 0));
  if (q.category)                                    conds.push(eq(announcements.category, q.category));
  if (q.q)                                           conds.push(like(announcements.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(orderExpr(q.sort, q.order), desc(announcements.published_at), asc(announcements.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoGetById(id: number): Promise<AnnouncementWithAsset | null> {
  const rows = await baseSelect().where(eq(announcements.id, id)).limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

export async function repoCreate(b: CreateBody): Promise<AnnouncementWithAsset> {
  const maxOrder = await db
    .select({ v: sql<number>`COALESCE(MAX(${announcements.display_order}), 0)` })
    .from(announcements);

  const slug = (b.slug || buildSlug(b.title)).slice(0, 255);

  await db.insert(announcements).values({
    uuid:             randomUUID(),
    locale:           b.locale ?? "tr",
    title:            b.title,
    slug,
    excerpt:          b.excerpt          ?? null,
    content:          b.content          ?? null,
    category:         b.category         ?? "duyuru",
    cover_image_url:  b.cover_image_url  ?? null,
    cover_asset_id:   b.cover_asset_id   ?? null,
    alt:              b.alt              ?? null,
    author:           b.author           ?? null,
    meta_title:       b.meta_title       ?? null,
    meta_description: b.meta_description ?? null,
    is_published:     b.is_published ? 1 : 0,
    is_featured:      b.is_featured  ? 1 : 0,
    display_order:    b.display_order ?? (maxOrder[0]?.v ?? 0) + 1,
    published_at:     b.published_at ?? (b.is_published ? new Date() : null),
  } as any);

  const created = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(and(eq(announcements.slug, slug), eq(announcements.locale, b.locale ?? "tr")))
    .limit(1);

  if (!created.length) throw new Error("create_failed");
  const result = await repoGetById(created[0].id);
  if (!result) throw new Error("create_failed");
  return result;
}

export async function repoUpdate(id: number, b: UpdateBody): Promise<AnnouncementWithAsset | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.locale           !== undefined) set.locale           = b.locale;
  if (b.title            !== undefined) set.title            = b.title;
  if (b.slug             !== undefined) set.slug             = b.slug;
  if (b.excerpt          !== undefined) set.excerpt          = b.excerpt          ?? null;
  if (b.content          !== undefined) set.content          = b.content          ?? null;
  if (b.category         !== undefined) set.category         = b.category;
  if (b.cover_image_url  !== undefined) set.cover_image_url  = b.cover_image_url  ?? null;
  if (b.cover_asset_id   !== undefined) set.cover_asset_id   = b.cover_asset_id   ?? null;
  if (b.alt              !== undefined) set.alt              = b.alt              ?? null;
  if (b.author           !== undefined) set.author           = b.author           ?? null;
  if (b.meta_title       !== undefined) set.meta_title       = b.meta_title       ?? null;
  if (b.meta_description !== undefined) set.meta_description = b.meta_description ?? null;
  if (b.is_published     !== undefined) {
    set.is_published = b.is_published ? 1 : 0;
    if (b.is_published && !b.published_at) set.published_at = new Date();
  }
  if (b.is_featured      !== undefined) set.is_featured      = b.is_featured ? 1 : 0;
  if (b.display_order    !== undefined) set.display_order    = b.display_order;
  if (b.published_at     !== undefined) set.published_at     = b.published_at ?? null;

  await db.update(announcements).set(set as any).where(eq(announcements.id, id));
  return repoGetById(id);
}

export async function repoDelete(id: number): Promise<void> {
  await db.delete(announcements).where(eq(announcements.id, id));
}

export async function repoSetPublished(id: number, isPublished: boolean): Promise<AnnouncementWithAsset | null> {
  const set: any = {
    is_published: isPublished ? 1 : 0,
    updated_at:   sql`CURRENT_TIMESTAMP(3)`,
  };
  if (isPublished) set.published_at = new Date();

  await db.update(announcements).set(set).where(eq(announcements.id, id));
  return repoGetById(id);
}

/** RSS için son N yayınlanmış duyuru */
export async function repoRssFeed(locale: string, limit = 20): Promise<AnnouncementWithAsset[]> {
  const rows = await baseSelect()
    .where(and(
      eq(announcements.is_published, 1 as const),
      eq(announcements.locale, locale)
    ))
    .orderBy(desc(announcements.published_at), asc(announcements.id))
    .limit(limit);
  return (rows as any[]).map(toWithAsset);
}
