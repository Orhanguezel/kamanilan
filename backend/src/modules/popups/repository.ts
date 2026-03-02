// =============================================================
// FILE: src/modules/popups/repository.ts
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { popups, type PopupRow } from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import { publicUrlOf } from "@/modules/_shared/repo-helpers";
import { randomUUID } from "crypto";
import type {
  AdminListQuery,
  CreateBody,
  PublicListQuery,
  UpdateBody,
} from "./validation";

export type PopupWithAsset = { row: PopupRow; image_url: string | null };

const ORDER = {
  display_order: popups.display_order,
  created_at:    popups.created_at,
  updated_at:    popups.updated_at,
} as const;

function orderExpr(sort: keyof typeof ORDER, dir: "asc" | "desc") {
  const col = ORDER[sort] ?? ORDER.display_order;
  return dir === "asc" ? asc(col) : desc(col);
}

function baseSelect() {
  return db
    .select({
      row:          popups,
      asset_bucket: storageAssets.bucket,
      asset_path:   storageAssets.path,
      asset_url0:   storageAssets.url,
    })
    .from(popups)
    .leftJoin(storageAssets, eq(popups.image_asset_id, storageAssets.id));
}

function toWithAsset(r: {
  row: PopupRow;
  asset_bucket: string | null;
  asset_path:   string | null;
  asset_url0:   string | null;
}): PopupWithAsset {
  return {
    row:       r.row,
    image_url: publicUrlOf(r.asset_bucket, r.asset_path, r.asset_url0) ?? r.row.image_url ?? null,
  };
}

/* ===================== PUBLIC ===================== */

export async function repoListPublic(q: PublicListQuery): Promise<PopupWithAsset[]> {
  const conds: any[] = [eq(popups.is_active, 1 as const)];
  if (q.type) conds.push(eq(popups.type, q.type));
  if (q.q)    conds.push(like(popups.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(and(...conds))
    .orderBy(orderExpr(q.sort, q.order), asc(popups.display_order), asc(popups.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

/* ===================== ADMIN ===================== */

export async function repoListAdmin(q: AdminListQuery): Promise<PopupWithAsset[]> {
  const conds: any[] = [];
  if (typeof q.is_active === "boolean") conds.push(eq(popups.is_active, q.is_active ? 1 : 0));
  if (q.type) conds.push(eq(popups.type, q.type));
  if (q.q)    conds.push(like(popups.title, `%${q.q.trim()}%`));

  const rows = await baseSelect()
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(orderExpr(q.sort, q.order), asc(popups.display_order), asc(popups.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoGetById(id: number): Promise<PopupWithAsset | null> {
  const rows = await baseSelect().where(eq(popups.id, id)).limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

export async function repoCreate(b: CreateBody): Promise<PopupWithAsset> {
  const maxOrder = await db
    .select({ v: sql<number>`COALESCE(MAX(${popups.display_order}), 0)` })
    .from(popups);

  await db.insert(popups).values({
    uuid:              randomUUID(),
    type:              b.type ?? "topbar",
    title:             b.title,
    content:           b.content ?? null,
    background_color:  b.background_color ?? null,
    text_color:        b.text_color ?? null,
    button_text:       b.button_text ?? null,
    button_color:      b.button_color ?? null,
    button_hover_color: b.button_hover_color ?? null,
    button_text_color: b.button_text_color ?? null,
    link_url:          b.link_url ?? null,
    link_target:       b.link_target ?? "_self",
    image_url:         b.image_url ?? null,
    image_asset_id:    b.image_asset_id ?? null,
    alt:               b.alt ?? null,
    text_behavior:     b.text_behavior ?? "marquee",
    scroll_speed:      b.scroll_speed ?? 60,
    closeable:         b.closeable ? 1 : 0,
    delay_seconds:     b.delay_seconds ?? 0,
    display_frequency: b.display_frequency ?? "always",
    is_active:         b.is_active ? 1 : 0,
    display_order:     b.display_order ?? (maxOrder[0]?.v ?? 0) + 1,
    start_at:          b.start_at ?? null,
    end_at:            b.end_at ?? null,
  } as any);

  const created = await db
    .select({ id: popups.id })
    .from(popups)
    .orderBy(desc(popups.id))
    .limit(1);

  if (!created.length) throw new Error("create_failed");
  const result = await repoGetById(created[0].id);
  if (!result) throw new Error("create_failed");
  return result;
}

export async function repoUpdate(id: number, b: UpdateBody): Promise<PopupWithAsset | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.type              !== undefined) set.type              = b.type;
  if (b.title             !== undefined) set.title             = b.title;
  if (b.content           !== undefined) set.content           = b.content ?? null;
  if (b.background_color  !== undefined) set.background_color  = b.background_color ?? null;
  if (b.text_color        !== undefined) set.text_color        = b.text_color ?? null;
  if (b.button_text       !== undefined) set.button_text       = b.button_text ?? null;
  if (b.button_color      !== undefined) set.button_color      = b.button_color ?? null;
  if (b.button_hover_color !== undefined) set.button_hover_color = b.button_hover_color ?? null;
  if (b.button_text_color !== undefined) set.button_text_color = b.button_text_color ?? null;
  if (b.link_url          !== undefined) set.link_url          = b.link_url ?? null;
  if (b.link_target       !== undefined) set.link_target       = b.link_target;
  if (b.image_url         !== undefined) set.image_url         = b.image_url ?? null;
  if (b.image_asset_id    !== undefined) set.image_asset_id    = b.image_asset_id ?? null;
  if (b.alt               !== undefined) set.alt               = b.alt ?? null;
  if (b.text_behavior     !== undefined) set.text_behavior     = b.text_behavior;
  if (b.scroll_speed      !== undefined) set.scroll_speed      = b.scroll_speed;
  if (b.closeable         !== undefined) set.closeable         = b.closeable ? 1 : 0;
  if (b.delay_seconds     !== undefined) set.delay_seconds     = b.delay_seconds;
  if (b.display_frequency !== undefined) set.display_frequency = b.display_frequency;
  if (b.is_active         !== undefined) set.is_active         = b.is_active ? 1 : 0;
  if (b.display_order     !== undefined) set.display_order     = b.display_order;
  if (b.start_at          !== undefined) set.start_at          = b.start_at ?? null;
  if (b.end_at            !== undefined) set.end_at            = b.end_at ?? null;

  await db.update(popups).set(set as any).where(eq(popups.id, id));
  return repoGetById(id);
}

export async function repoDelete(id: number): Promise<void> {
  await db.delete(popups).where(eq(popups.id, id));
}

export async function repoReorder(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(popups)
      .set({ display_order: i + 1, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
      .where(eq(popups.id, ids[i]));
  }
}

export async function repoSetStatus(id: number, isActive: boolean): Promise<PopupWithAsset | null> {
  await db
    .update(popups)
    .set({ is_active: isActive ? 1 : 0, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
    .where(eq(popups.id, id));
  return repoGetById(id);
}
