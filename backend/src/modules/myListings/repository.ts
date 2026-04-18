// =============================================================
// FILE: src/modules/myListings/repository.ts
// Kullanıcıya ait ilanlar — CRUD (user_id scoped)
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { properties, rowToPublicView, type PropertyRow } from "@/modules/proporties/schema";
import { storageAssets } from "@vps/shared-backend/modules/storage/schema";
import { publicUrlOf } from "@/modules/_shared/repo-helpers";
import { dec6orNull, dec2orNull } from "@/modules/_shared/normalizers";
import { randomUUID } from "crypto";
import type { ListQuery, CreateListing, UpdateListing } from "./validation";

export type ListingWithAsset = {
  row: PropertyRow;
  asset_url: string | null;
};

const SORT_MAP = {
  created_at: properties.created_at,
  updated_at: properties.updated_at,
  price: properties.price,
  display_order: properties.display_order,
} as const;

function orderExpr(sort: keyof typeof SORT_MAP, dir: "asc" | "desc") {
  const col = SORT_MAP[sort] ?? SORT_MAP.created_at;
  return dir === "asc" ? asc(col) : desc(col);
}

function baseSelect() {
  return db
    .select({
      row: properties,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(properties)
    .leftJoin(storageAssets, eq(properties.image_asset_id, storageAssets.id));
}

function toWithAsset(r: {
  row: PropertyRow;
  asset_bucket: string | null;
  asset_path: string | null;
  asset_url0: string | null;
}): ListingWithAsset {
  return {
    row: r.row,
    asset_url: publicUrlOf(r.asset_bucket, r.asset_path, r.asset_url0) ?? r.row.image_url ?? null,
  };
}

/* ===================== QUERIES ===================== */

export async function repoMyList(userId: string, q: ListQuery): Promise<{ items: ListingWithAsset[]; total: number }> {
  const conds: any[] = [eq((properties as any).user_id, userId)];
  if (typeof q.is_active === "boolean")
    conds.push(eq(properties.is_active, q.is_active ? 1 : 0));
  if (q.type) conds.push(eq((properties as any).type, q.type));
  if (q.status) conds.push(eq(properties.status, q.status));
  if (q.q) conds.push(like(properties.title, `%${q.q.trim()}%`));

  const [countRes, rows] = await Promise.all([
    db
      .select({ total: sql<number>`COUNT(*)` })
      .from(properties)
      .where(and(...conds)),
    baseSelect()
      .where(and(...conds))
      .orderBy(orderExpr(q.sort, q.order), desc(properties.created_at))
      .limit(q.limit)
      .offset(q.offset),
  ]);

  return {
    items: (rows as any[]).map(toWithAsset),
    total: countRes[0]?.total ?? 0,
  };
}

export async function repoMyGetById(userId: string, id: string): Promise<ListingWithAsset | null> {
  const rows = await baseSelect()
    .where(and(eq(properties.id, id), eq((properties as any).user_id, userId)))
    .limit(1);

  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

export async function repoMyCreate(userId: string, b: CreateListing): Promise<ListingWithAsset> {
  const id = randomUUID();
  const slug = (
    b.slug ||
    b.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
  ).slice(0, 255) + "-" + id.split("-")[0];

  await db.insert(properties).values({
    id,
    user_id: userId,
    category_id:     (b as any).category_id     ?? null,
    sub_category_id: (b as any).sub_category_id ?? null,
    title: b.title,
    slug,
    type: b.type,
    status: b.status,
    sub_type: b.sub_type ?? null,
    address: b.address,
    district: b.district,
    city: b.city,
    neighborhood: b.neighborhood ?? null,
    lat: dec6orNull(b.lat as any),
    lng: dec6orNull(b.lng as any),
    description: b.description ?? null,
    specs_json: (b.specs_json ?? null) as any,
    price: dec2orNull(b.price as any),
    currency: b.currency ?? "TRY",
    badge_text: b.badge_text ?? null,
    featured: b.featured ? 1 : 0,
    gross_m2: b.gross_m2 ?? null,
    net_m2: b.net_m2 ?? null,
    rooms: b.rooms ?? null,
    bedrooms: b.bedrooms ?? null,
    building_age: b.building_age ?? null,
    floor: b.floor ?? null,
    floor_no: b.floor_no ?? null,
    total_floors: b.total_floors ?? null,
    heating: b.heating ?? null,
    usage_status: b.usage_status ?? null,
    furnished: b.furnished ? 1 : 0,
    in_site: b.in_site ? 1 : 0,
    has_elevator: b.has_elevator ? 1 : 0,
    has_parking: b.has_parking ? 1 : 0,
    has_balcony: b.has_balcony ? 1 : 0,
    has_garden: b.has_garden ? 1 : 0,
    has_terrace: b.has_terrace ? 1 : 0,
    credit_eligible: b.credit_eligible ? 1 : 0,
    swap: b.swap ? 1 : 0,
    image_url: b.image_url ?? null,
    image_asset_id: b.image_asset_id ?? null,
    alt: b.alt ?? null,
    is_active: b.is_active ? 1 : 0,
    display_order: b.display_order ?? 0,
  } as any);

  const created = await repoMyGetById(userId, id);
  if (!created) throw new Error("create_failed");
  return created;
}

export async function repoMyUpdate(
  userId: string,
  id: string,
  b: UpdateListing,
): Promise<ListingWithAsset | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };

  if (b.title !== undefined) set.title = b.title;
  if (b.type !== undefined) set.type = b.type;
  if (b.status !== undefined) set.status = b.status;
  if (b.sub_type !== undefined) set.sub_type = b.sub_type ?? null;
  if (b.address !== undefined) set.address = b.address;
  if (b.district !== undefined) set.district = b.district;
  if (b.city !== undefined) set.city = b.city;
  if (b.neighborhood !== undefined) set.neighborhood = b.neighborhood ?? null;
  if (b.lat !== undefined) set.lat = dec6orNull(b.lat as any);
  if (b.lng !== undefined) set.lng = dec6orNull(b.lng as any);
  if (b.description !== undefined) set.description = b.description ?? null;
  if (b.specs_json !== undefined) set.specs_json = b.specs_json ?? null;
  if (b.price !== undefined) set.price = dec2orNull(b.price as any);
  if (b.currency !== undefined) set.currency = b.currency;
  if (b.badge_text !== undefined) set.badge_text = b.badge_text ?? null;
  if (b.featured !== undefined) set.featured = b.featured ? 1 : 0;
  if (b.gross_m2 !== undefined) set.gross_m2 = b.gross_m2 ?? null;
  if (b.net_m2 !== undefined) set.net_m2 = b.net_m2 ?? null;
  if (b.rooms !== undefined) set.rooms = b.rooms ?? null;
  if (b.bedrooms !== undefined) set.bedrooms = b.bedrooms ?? null;
  if (b.building_age !== undefined) set.building_age = b.building_age ?? null;
  if (b.floor !== undefined) set.floor = b.floor ?? null;
  if (b.floor_no !== undefined) set.floor_no = b.floor_no ?? null;
  if (b.total_floors !== undefined) set.total_floors = b.total_floors ?? null;
  if (b.heating !== undefined) set.heating = b.heating ?? null;
  if (b.usage_status !== undefined) set.usage_status = b.usage_status ?? null;
  if (b.furnished !== undefined) set.furnished = b.furnished ? 1 : 0;
  if (b.in_site !== undefined) set.in_site = b.in_site ? 1 : 0;
  if (b.has_elevator !== undefined) set.has_elevator = b.has_elevator ? 1 : 0;
  if (b.has_parking !== undefined) set.has_parking = b.has_parking ? 1 : 0;
  if (b.has_balcony !== undefined) set.has_balcony = b.has_balcony ? 1 : 0;
  if (b.has_garden !== undefined) set.has_garden = b.has_garden ? 1 : 0;
  if (b.has_terrace !== undefined) set.has_terrace = b.has_terrace ? 1 : 0;
  if (b.credit_eligible !== undefined) set.credit_eligible = b.credit_eligible ? 1 : 0;
  if (b.swap !== undefined) set.swap = b.swap ? 1 : 0;
  if (b.image_url !== undefined) set.image_url = b.image_url ?? null;
  if (b.image_asset_id !== undefined) set.image_asset_id = b.image_asset_id ?? null;
  if (b.alt !== undefined) set.alt = b.alt ?? null;
  if (b.display_order !== undefined) set.display_order = b.display_order;

  await db
    .update(properties)
    .set(set as any)
    .where(and(eq(properties.id, id), eq((properties as any).user_id, userId)));

  return repoMyGetById(userId, id);
}

export async function repoMyDelete(userId: string, id: string): Promise<void> {
  await db
    .delete(properties)
    .where(and(eq(properties.id, id), eq((properties as any).user_id, userId)));
}

export async function repoMyToggle(
  userId: string,
  id: string,
  isActive: boolean,
): Promise<ListingWithAsset | null> {
  await db
    .update(properties)
    .set({ is_active: isActive ? 1 : 0, updated_at: sql`CURRENT_TIMESTAMP(3)` } as any)
    .where(and(eq(properties.id, id), eq((properties as any).user_id, userId)));
  return repoMyGetById(userId, id);
}
