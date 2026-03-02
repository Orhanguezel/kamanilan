// =============================================================
// FILE: src/modules/properties/repository.ts
// CLEAN: category_id/sub_category_id; variant values support
// =============================================================
import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import {
  properties,
  property_assets,
  property_tag_links,
  type PropertyRow,
  type NewPropertyRow,
  type PropertyAssetRow,
  type NewPropertyAssetRow,
  type PropertyVariantValue,
  rowToPublicView,
  rowToAdminView,
  type PropertyPublicView,
  type PropertyAdminView,
} from "./schema";
import { categories } from "@/modules/categories/schema";
import { subCategories } from "@/modules/subcategories/schema";
import { users } from "@/modules/auth/schema";
import { profiles } from "@/modules/profiles/schema";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lte,
  like,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

// storage integration
import {
  getByIds as getStorageByIds,
  deleteManyByIds as deleteStorageManyByIds,
} from "@/modules/storage/repository";
import { destroyCloudinaryById, getCloudinaryConfig } from "@/modules/storage/cloudinary";
import { buildPublicUrl } from "@/modules/storage/util";

// flash sale integration
import {
  getActiveFlashSalesForProperty,
  batchGetActiveFlashSalesForProperties,
  type FlashSaleSnippet,
  type PropertyForFlashSale,
} from "@/modules/flashSale/repository";

type Sortable = "created_at" | "updated_at" | "price";
export type BoolLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";

export type ListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_active?: BoolLike;
  featured?: BoolLike;

  q?: string;
  slug?: string;
  district?: string;
  city?: string;
  neighborhood?: string;

  status?: string;
  brand_id?: string;
  category_id?: string;
  sub_category_id?: string;
  tag_ids?: string[] | string;

  price_min?: number;
  price_max?: number;

  created_from?: string;
  created_to?: string;
};

export type OwnerScope = {
  ownerUserId?: string;
  isAdmin?: boolean;
};

export type PropertyAssetAdminView = {
  id: string;
  asset_id: string | null;
  url: string | null;
  alt: string | null;
  kind: "image" | "video" | "plan" | string;
  mime: string | null;
  is_cover: boolean;
  display_order: number;
};

const to01 = (v: BoolLike | undefined): 0 | 1 | undefined => {
  if (v === true  || v === 1 || v === "1" || v === "true")  return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return undefined;
};

const parseOrder = (
  orderParam?: string,
  sort?: Sortable,
  ord?: "asc" | "desc",
): { col: Sortable; dir: "asc" | "desc" } | null => {
  if (orderParam) {
    const m   = orderParam.match(/^([a-zA-Z0-9_]+)\.(asc|desc)$/);
    const col = m?.[1] as Sortable | undefined;
    const dir = m?.[2] as "asc" | "desc" | undefined;
    if (col && dir) {
      const ok: Sortable[] = ["created_at", "updated_at", "price"];
      if (ok.includes(col)) return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

const isNonEmpty = (s?: string | null) => typeof s === "string" && s.trim().length > 0;

function isUuid36(x: unknown): x is string {
  return typeof x === "string" && x.length === 36;
}

function toArray(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) {
    const out = v.map((x) => String(x).trim()).filter(Boolean);
    return out.length ? out : undefined;
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return undefined;
    if (s.includes(",")) {
      const out = s.split(",").map((x) => x.trim()).filter(Boolean);
      return out.length ? out : undefined;
    }
    return [s];
  }
  return undefined;
}

function buildWhere(params: ListParams): SQL | undefined {
  const filters: SQL[] = [];

  const act = to01(params.is_active);
  if (act !== undefined) filters.push(eq(properties.is_active, act));

  const feat = to01(params.featured);
  if (feat !== undefined) filters.push(eq(properties.featured, feat));

  if (isNonEmpty(params.slug))            filters.push(eq(properties.slug,            params.slug!.trim()));
  if (isNonEmpty(params.district))        filters.push(eq(properties.district,        params.district!.trim()));
  if (isNonEmpty(params.city))            filters.push(eq(properties.city,            params.city!.trim()));
  if (isNonEmpty(params.neighborhood))    filters.push(eq(properties.neighborhood,    params.neighborhood!.trim()));
  if (isNonEmpty(params.status))          filters.push(eq(properties.status,          params.status!.trim()));
  if (isNonEmpty(params.brand_id))        filters.push(eq(properties.brand_id,        params.brand_id!.trim()));
  if (isNonEmpty(params.category_id))     filters.push(eq(properties.category_id,     params.category_id!.trim()));
  if (isNonEmpty(params.sub_category_id)) filters.push(eq(properties.sub_category_id, params.sub_category_id!.trim()));

  const tagIds = toArray(params.tag_ids)?.filter(isUuid36);
  if (tagIds?.length) {
    const tagSql = sql.join(tagIds.map((id) => sql`${id}`), sql`, `);
    filters.push(
      sql`EXISTS (
        SELECT 1
        FROM ${property_tag_links}
        WHERE ${property_tag_links.property_id} = ${properties.id}
          AND ${property_tag_links.tag_id} IN (${tagSql})
      )`,
    );
  }

  if (typeof params.price_min === "number") {
    filters.push(gte(sql`CAST(${properties.price} AS DECIMAL(12,2))`, params.price_min));
  }
  if (typeof params.price_max === "number") {
    filters.push(lte(sql`CAST(${properties.price} AS DECIMAL(12,2))`, params.price_max));
  }

  if (isNonEmpty(params.created_from)) {
    filters.push(gte(properties.created_at, sql`CAST(${params.created_from!.trim()} AS DATETIME)`));
  }
  if (isNonEmpty(params.created_to)) {
    filters.push(lte(properties.created_at, sql`CAST(${params.created_to!.trim()} AS DATETIME)`));
  }

  if (isNonEmpty(params.q)) {
    const s = `%${params.q!.trim()}%`;
    filters.push(
      or(
        like(properties.title,        s),
        like(properties.address,      s),
        like(properties.district,     s),
        like(properties.city,         s),
        like(properties.neighborhood, s),
        like(properties.status,       s),
        like(properties.listing_no,   s),
      ) as SQL,
    );
  }

  return filters.length ? (and(...filters) as SQL) : undefined;
}

function withOwnerScope(
  whereExpr: SQL | undefined,
  scope?: OwnerScope,
): SQL | undefined {
  if (scope?.isAdmin) return whereExpr;
  if (!scope?.ownerUserId) return whereExpr;

  const ownExpr = eq(properties.user_id, scope.ownerUserId);
  return whereExpr ? (and(whereExpr, ownExpr) as SQL) : (ownExpr as SQL);
}

/* -------------------------------------------------------------------------- */
/*                          VARIANT VALUES HELPERS                             */
/* -------------------------------------------------------------------------- */

export async function getVariantValues(propertyId: string): Promise<PropertyVariantValue[]> {
  const result = await db.execute(sql`
    SELECT
      pvv.variant_id,
      pvv.value,
      lv.name         AS variant_name,
      lv.slug         AS variant_slug,
      lv.value_type,
      lv.options_json,
      u.symbol        AS unit_symbol,
      u.name          AS unit_name
    FROM  property_variant_values pvv
    JOIN  listing_variants lv ON lv.id = pvv.variant_id
    LEFT  JOIN units u        ON u.id  = lv.unit_id
    WHERE pvv.property_id = ${propertyId}
    ORDER BY lv.display_order ASC
  `);

  // drizzle mysql2 returns [rows, fields] tuple
  const rows = (Array.isArray(result) ? result[0] : result) as unknown as any[];
  if (!Array.isArray(rows)) return [];

  return rows.map((r: any) => ({
    variant_id:   String(r.variant_id   ?? ""),
    value:        String(r.value        ?? ""),
    variant_name: String(r.variant_name ?? ""),
    variant_slug: String(r.variant_slug ?? ""),
    value_type:   String(r.value_type   ?? "text"),
    options: r.options_json
      ? (typeof r.options_json === "string" ? JSON.parse(r.options_json) : r.options_json)
      : null,
    unit_symbol: r.unit_symbol ? String(r.unit_symbol) : null,
    unit_name:   r.unit_name   ? String(r.unit_name)   : null,
  }));
}

export async function replaceVariantValues(
  propertyId: string,
  values: Array<{ variant_id: string; value: string }>,
) {
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`DELETE FROM property_variant_values WHERE property_id = ${propertyId}`,
    );

    const clean = values.filter(
      (v) => typeof v.variant_id === "string" && v.variant_id.length === 36 && v.value != null,
    );
    if (!clean.length) return;

    for (const v of clean) {
      await tx.execute(
        sql`INSERT INTO property_variant_values (property_id, variant_id, value)
            VALUES (${propertyId}, ${v.variant_id}, ${String(v.value)})`,
      );
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                               ASSETS HELPERS                               */
/* -------------------------------------------------------------------------- */

export type ReplaceAssetInput = {
  id?: string;
  asset_id?: string | null;
  url?: string | null;
  alt?: string | null;
  kind?: "image" | "video" | "plan" | string;
  mime?: string | null;
  is_cover?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  display_order?: number;
};

const toCover01 = (v: ReplaceAssetInput["is_cover"]): 0 | 1 => {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  return 0;
};

async function assertStorageAssetIdsExist(assetIds: string[]) {
  if (!assetIds.length) return;
  const rows = await getStorageByIds(assetIds);
  if (rows.length !== assetIds.length) {
    throw new Error("invalid_asset_ids");
  }
}

/** Admin: property gallery list + resolved URLs */
export async function listPropertyAssetsAdmin(propertyId: string): Promise<PropertyAssetAdminView[]> {
  const rows = await db
    .select()
    .from(property_assets)
    .where(eq(property_assets.property_id, propertyId))
    .orderBy(desc(property_assets.is_cover), asc(property_assets.display_order), asc(property_assets.created_at));

  if (!rows.length) return [];

  const assetIds = rows.map((r) => r.asset_id).filter((x): x is string => isUuid36(x));

  const [cfg, storageRows] = await Promise.all([
    getCloudinaryConfig(),
    assetIds.length ? getStorageByIds(assetIds) : Promise.resolve([]),
  ]);

  const storageMap = new Map<string, any>();
  for (const s of storageRows) storageMap.set(String(s.id), s);

  return rows.map((r) => {
    const storage     = r.asset_id ? storageMap.get(String(r.asset_id)) : null;
    const resolvedUrl = storage
      ? buildPublicUrl(storage.bucket, storage.path, storage.url, cfg ?? undefined)
      : (r.url ?? null);

    return {
      id:            r.id,
      asset_id:      r.asset_id ?? null,
      url:           resolvedUrl,
      alt:           r.alt ?? null,
      kind:          (r.kind ?? "image") as any,
      mime:          r.mime ?? null,
      is_cover:      r.is_cover === 1,
      display_order: r.display_order ?? 0,
    };
  });
}

export async function replacePropertyAssets(propertyId: string, assets: ReplaceAssetInput[]) {
  const assetIdsToCheck = assets
    .map((a) => (a.asset_id ? String(a.asset_id) : null))
    .filter((x): x is string => isUuid36(x));

  await assertStorageAssetIdsExist(assetIdsToCheck);

  await db.transaction(async (tx) => {
    await tx.delete(property_assets).where(eq(property_assets.property_id, propertyId));
    if (!assets.length) {
      await tx
        .update(properties)
        .set({ image_asset_id: null, image_url: null, alt: null, updated_at: new Date() } as any)
        .where(eq(properties.id, propertyId));
      return;
    }

    const lastCoverReverseIdx = [...assets].reverse().findIndex((a) => toCover01(a.is_cover) === 1);
    const coverIndex = lastCoverReverseIdx >= 0 ? assets.length - 1 - lastCoverReverseIdx : 0;
    const now = new Date();

    const inserts: NewPropertyAssetRow[] = assets.map((a, i) => {
      const id       = isUuid36(a.id) ? String(a.id) : randomUUID();
      const asset_id = a.asset_id ? String(a.asset_id) : null;
      const url      = a.url ? String(a.url) : null;

      if (!asset_id && !(url && url.trim().length)) {
        throw new Error("asset_id_or_url_required");
      }

      return {
        id,
        property_id:   propertyId,
        asset_id,
        url,
        alt:           typeof a.alt === "string" ? a.alt : null,
        kind:          (a.kind ?? "image") as any,
        mime:          a.mime ? String(a.mime) : null,
        is_cover:      i === coverIndex ? 1 : 0,
        display_order: typeof a.display_order === "number" ? Math.trunc(a.display_order) : i,
        created_at:    now,
        updated_at:    now,
      };
    });

    await tx.insert(property_assets).values(inserts as any);

    const cover = inserts[coverIndex];
    const patch: Partial<NewPropertyRow> = { alt: cover?.alt ?? null, updated_at: new Date() };

    if (cover?.asset_id) {
      patch.image_asset_id = cover.asset_id;
      patch.image_url      = null;
    } else {
      patch.image_asset_id = null;
      patch.image_url      = cover?.url ?? null;
    }

    await tx.update(properties).set(patch as any).where(eq(properties.id, propertyId));
  });
}

export async function syncPropertyCoverFromAssets(propertyId: string) {
  const rows = await db
    .select()
    .from(property_assets)
    .where(eq(property_assets.property_id, propertyId))
    .orderBy(desc(property_assets.is_cover), asc(property_assets.display_order), asc(property_assets.created_at))
    .limit(1);

  const cover = rows[0] as PropertyAssetRow | undefined;

  if (!cover) {
    await db
      .update(properties)
      .set({ image_asset_id: null, image_url: null, alt: null, updated_at: new Date() } as any)
      .where(eq(properties.id, propertyId));
    return;
  }

  const patch: Partial<NewPropertyRow> = { alt: cover.alt ?? null, updated_at: new Date() };
  if (cover.asset_id) {
    patch.image_asset_id = cover.asset_id;
    patch.image_url      = null;
  } else {
    patch.image_asset_id = null;
    patch.image_url      = cover.url ?? null;
  }

  await db.update(properties).set(patch as any).where(eq(properties.id, propertyId));
}

export async function listPropertyTagIds(propertyId: string): Promise<string[]> {
  const rows = await db
    .select({ tag_id: property_tag_links.tag_id })
    .from(property_tag_links)
    .where(eq(property_tag_links.property_id, propertyId))
    .orderBy(asc(property_tag_links.created_at));
  return rows.map((r) => String(r.tag_id));
}

export async function replacePropertyTagLinks(propertyId: string, tagIds: string[]) {
  const clean = Array.from(new Set((tagIds ?? []).filter(isUuid36)));
  await db.transaction(async (tx) => {
    await tx.delete(property_tag_links).where(eq(property_tag_links.property_id, propertyId));
    if (!clean.length) return;
    await tx.insert(property_tag_links).values(
      clean.map((tagId) => ({ property_id: propertyId, tag_id: tagId, created_at: new Date() })),
    );
  });
}

async function attachTagIds<T extends { id: string }>(
  items: T[],
): Promise<Array<T & { tag_ids: string[] }>> {
  if (!items.length) return items.map((i) => ({ ...i, tag_ids: [] }));
  const ids = Array.from(new Set(items.map((i) => String(i.id)).filter(isUuid36)));
  if (!ids.length) return items.map((i) => ({ ...i, tag_ids: [] }));

  const links = await db
    .select({ property_id: property_tag_links.property_id, tag_id: property_tag_links.tag_id })
    .from(property_tag_links)
    .where(inArray(property_tag_links.property_id, ids));

  const map = new Map<string, string[]>();
  for (const link of links) {
    const key = String(link.property_id);
    const arr = map.get(key) ?? [];
    arr.push(String(link.tag_id));
    map.set(key, arr);
  }
  return items.map((i) => ({ ...i, tag_ids: map.get(String(i.id)) ?? [] }));
}

/* -------------------------------------------------------------------------- */
/*                            COVER URL RESOLVE                                */
/* -------------------------------------------------------------------------- */

async function enrichCoverUrlIfNeeded(view: any) {
  const cfg = await getCloudinaryConfig();

  if (view?.image_asset_id) {
    const storage = await getStorageByIds([String(view.image_asset_id)]);
    const s = storage[0];
    if (s) {
      view.image_url = buildPublicUrl(s.bucket, s.path, s.url, cfg ?? undefined);
    }
  }

  return view;
}

/* -------------------------------------------------------------------------- */
/*                    STORAGE CLEANUP ON PROPERTY DELETE                       */
/* -------------------------------------------------------------------------- */

async function cleanupStorageAssetsByIds(assetIds: string[]) {
  const ids = Array.from(new Set(assetIds.filter(isUuid36)));
  if (!ids.length) return;

  const rows = await getStorageByIds(ids);

  for (const r of rows as any[]) {
    const publicId = r.provider_public_id || String(r.path || "").replace(/\.[^.]+$/, "");
    try {
      await destroyCloudinaryById(
        publicId,
        r.provider_resource_type || undefined,
        r.provider || undefined,
      );
    } catch { /* non-fatal */ }
  }

  await deleteStorageManyByIds(ids);
}

/* -------------------------------------------------------------------------- */
/*                               LIST / GET                                    */
/* -------------------------------------------------------------------------- */

export async function listPropertiesPublic(params: ListParams) {
  const whereExpr = buildWhere(params);

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? ord.dir === "asc" ? asc(properties[ord.col]) : desc(properties[ord.col])
    : asc(properties.display_order);

  const take = params.limit  && params.limit  > 0 ? params.limit  : 100;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const [rows, cnt] = await Promise.all([
    db
      .select({
        property: properties,
        cat_has_cart: categories.has_cart,
        sub_has_cart: subCategories.has_cart,
      })
      .from(properties)
      .leftJoin(categories, eq(properties.category_id, categories.id))
      .leftJoin(subCategories, eq(properties.sub_category_id, subCategories.id))
      .where(whereExpr)
      .orderBy(orderBy)
      .limit(take)
      .offset(skip),
    db.select({ c: sql<number>`COUNT(1)` }).from(properties).where(whereExpr),
  ]);

  const baseItems: PropertyPublicView[] = rows.map((r) => {
    const base = rowToPublicView(r.property as PropertyRow);
    // has_cart logic: subcategory has priority if exists, otherwise category
    const has_cart = r.sub_has_cart ?? r.cat_has_cart ?? true;
    return { ...base, has_cart: Boolean(has_cart) };
  });
  const withTags = await attachTagIds(baseItems as Array<PropertyPublicView & { id: string }>);

  // Flash sale bilgisi toplu ekle
  const propRefs: PropertyForFlashSale[] = withTags.map((p) => ({
    id: p.id,
    category_id: p.category_id ?? null,
    sub_category_id: p.sub_category_id ?? null,
  }));
  const flashSaleMap = await batchGetActiveFlashSalesForProperties(propRefs);
  const items = withTags.map((p) => ({ ...p, flash_sales: flashSaleMap.get(p.id) ?? [] }));

  const total = cnt[0]?.c ?? 0;
  return { items, total };
}

export async function listPropertiesAdmin(params: ListParams, scope?: OwnerScope) {
  const whereExpr = withOwnerScope(buildWhere(params), scope);

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? ord.dir === "asc" ? asc(properties[ord.col]) : desc(properties[ord.col])
    : asc(properties.display_order);

  const take = params.limit  && params.limit  > 0 ? params.limit  : 100;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const [rows, cnt] = await Promise.all([
    db
      .select({
        property: properties,
        owner_profile_name: profiles.full_name,
        owner_user_name: users.full_name,
        owner_email: users.email,
        category_name: categories.name,
        sub_category_name: subCategories.name,
      })
      .from(properties)
      .leftJoin(users, eq(properties.user_id, users.id))
      .leftJoin(profiles, eq(properties.user_id, profiles.id))
      .leftJoin(categories, eq(properties.category_id, categories.id))
      .leftJoin(subCategories, eq(properties.sub_category_id, subCategories.id))
      .where(whereExpr)
      .orderBy(orderBy)
      .limit(take)
      .offset(skip),
    db.select({ c: sql<number>`COUNT(1)` }).from(properties).where(whereExpr),
  ]);

  const baseItems: PropertyAdminView[] = (rows as any[]).map((r) => {
    const base = rowToAdminView(r.property as PropertyRow) as any;
    base.owner_name = r.owner_profile_name ?? r.owner_user_name ?? r.owner_email ?? null;
    base.owner_email = r.owner_email ?? null;
    base.category_name = r.category_name ?? null;
    base.sub_category_name = r.sub_category_name ?? null;
    return base as PropertyAdminView;
  });
  const items = await attachTagIds(baseItems as Array<PropertyAdminView & { id: string }>);
  const total = cnt[0]?.c ?? 0;
  return { items, total };
}

/** get by id (ADMIN) + assets + variant_values + cover resolved */
export async function getPropertyByIdAdmin(id: string, scope?: OwnerScope) {
  const whereExpr = withOwnerScope(eq(properties.id, id) as SQL, scope);
  const rows = await db
    .select({
      property: properties,
      owner_profile_name: profiles.full_name,
      owner_user_name: users.full_name,
      owner_email: users.email,
    })
    .from(properties)
    .leftJoin(users, eq(properties.user_id, users.id))
    .leftJoin(profiles, eq(properties.user_id, profiles.id))
    .where(whereExpr)
    .limit(1);
  if (!rows[0]) return null;

  const base = rowToAdminView(rows[0].property as PropertyRow) as any;
  base.owner_name = rows[0].owner_profile_name ?? rows[0].owner_user_name ?? rows[0].owner_email ?? null;
  base.owner_email = rows[0].owner_email ?? null;
  await enrichCoverUrlIfNeeded(base);

  const [assets, tagIds, variantValues] = await Promise.all([
    listPropertyAssetsAdmin(String(base.id)),
    listPropertyTagIds(String(base.id)),
    getVariantValues(String(base.id)),
  ]);

  base.assets         = assets;
  base.tag_ids        = tagIds;
  base.variant_values = variantValues;
  return base as PropertyAdminView & {
    assets: PropertyAssetAdminView[];
    variant_values: PropertyVariantValue[];
  };
}

/** get by slug (ADMIN) */
export async function getPropertyBySlugAdmin(slug: string, scope?: OwnerScope) {
  const whereExpr = withOwnerScope(eq(properties.slug, slug) as SQL, scope);
  const rows = await db
    .select({
      property: properties,
      owner_profile_name: profiles.full_name,
      owner_user_name: users.full_name,
      owner_email: users.email,
    })
    .from(properties)
    .leftJoin(users, eq(properties.user_id, users.id))
    .leftJoin(profiles, eq(properties.user_id, profiles.id))
    .where(whereExpr)
    .limit(1);
  if (!rows[0]) return null;

  const base = rowToAdminView(rows[0].property as PropertyRow) as any;
  base.owner_name = rows[0].owner_profile_name ?? rows[0].owner_user_name ?? rows[0].owner_email ?? null;
  base.owner_email = rows[0].owner_email ?? null;
  await enrichCoverUrlIfNeeded(base);

  const [assets, tagIds, variantValues] = await Promise.all([
    listPropertyAssetsAdmin(String(base.id)),
    listPropertyTagIds(String(base.id)),
    getVariantValues(String(base.id)),
  ]);

  base.assets         = assets;
  base.tag_ids        = tagIds;
  base.variant_values = variantValues;
  return base as PropertyAdminView & {
    assets: PropertyAssetAdminView[];
    variant_values: PropertyVariantValue[];
  };
}

export async function createProperty(values: NewPropertyRow, scope?: OwnerScope) {
  const payload: NewPropertyRow = {
    ...values,
    user_id: values.user_id ?? scope?.ownerUserId ?? null,
  };
  await db.insert(properties).values(payload as any);
  return getPropertyByIdAdmin(payload.id, scope);
}

export async function updateProperty(id: string, patch: Partial<NewPropertyRow>, scope?: OwnerScope) {
  const whereExpr = withOwnerScope(eq(properties.id, id) as SQL, scope);
  const res = await db
    .update(properties)
    .set({ ...patch, updated_at: new Date() } as any)
    .where(whereExpr)
    .execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  if (!affected) return null;
  return getPropertyByIdAdmin(id, scope);
}

export async function deleteProperty(id: string, scope?: OwnerScope) {
  const ownerWhere = withOwnerScope(eq(properties.id, id) as SQL, scope);
  const target = await db
    .select({ id: properties.id, image_asset_id: properties.image_asset_id })
    .from(properties)
    .where(ownerWhere)
    .limit(1);
  if (!target[0]) return 0;

  const galleryRows = await db
    .select({ asset_id: property_assets.asset_id })
    .from(property_assets)
    .where(eq(property_assets.property_id, id));

  const assetIds: string[] = [];
  for (const r of galleryRows) {
    if (isUuid36(r.asset_id)) assetIds.push(String(r.asset_id));
  }
  const coverId = target[0]?.image_asset_id;
  if (isUuid36(coverId)) assetIds.push(String(coverId));

  await db.delete(property_assets).where(eq(property_assets.property_id, id));

  const res = await db.delete(properties).where(eq(properties.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;

  if (affected > 0) {
    await cleanupStorageAssetsByIds(assetIds);
  }

  return affected;
}

export async function listDistricts(): Promise<string[]> {
  const rows = await db
    .select({ d: properties.district })
    .from(properties)
    .groupBy(properties.district)
    .orderBy(asc(properties.district));
  return rows.map((r) => r.d);
}

export async function listCities(): Promise<string[]> {
  const rows = await db
    .select({ c: properties.city })
    .from(properties)
    .groupBy(properties.city)
    .orderBy(asc(properties.city));
  return rows.map((r) => r.c);
}

export async function listNeighborhoods(): Promise<string[]> {
  const rows = await db
    .select({ n: properties.neighborhood })
    .from(properties)
    .where(sql`${properties.neighborhood} IS NOT NULL`)
    .groupBy(properties.neighborhood)
    .orderBy(asc(properties.neighborhood));
  return rows.map((r) => String(r.n));
}

export async function listStatuses(): Promise<string[]> {
  const rows = await db
    .select({ s: properties.status })
    .from(properties)
    .groupBy(properties.status)
    .orderBy(asc(properties.status));
  return rows.map((r) => r.s);
}

/* -------------------------------------------------------------------------- */
/*                           PUBLIC ASSETS HELPERS                             */
/* -------------------------------------------------------------------------- */

export type PropertyAssetPublicView = {
  id: string;
  url: string;
  alt: string | null;
  kind: "image" | "video" | "plan" | string;
  mime: string | null;
  is_cover: boolean;
  display_order: number;
};

async function listPropertyAssetsPublic(propertyId: string): Promise<PropertyAssetPublicView[]> {
  const rows = await db
    .select()
    .from(property_assets)
    .where(eq(property_assets.property_id, propertyId))
    .orderBy(desc(property_assets.is_cover), asc(property_assets.display_order), asc(property_assets.created_at));

  if (!rows.length) return [];

  const assetIds = rows.map((r) => r.asset_id).filter((x): x is string => isUuid36(x));

  const [cfg, storageRows] = await Promise.all([
    getCloudinaryConfig(),
    assetIds.length ? getStorageByIds(assetIds) : Promise.resolve([]),
  ]);

  const storageMap = new Map<string, any>();
  for (const s of storageRows) storageMap.set(String(s.id), s);

  return rows
    .map((r) => {
      const storage     = r.asset_id ? storageMap.get(String(r.asset_id)) : null;
      const resolvedUrl = storage
        ? buildPublicUrl(storage.bucket, storage.path, storage.url, cfg ?? undefined)
        : (r.url ?? "");

      const url = String(resolvedUrl || "").trim();
      if (!url) return null;

      return {
        id:            String(r.id),
        url,
        alt:           r.alt ?? null,
        kind:          (r.kind ?? "image") as any,
        mime:          r.mime ?? null,
        is_cover:      r.is_cover === 1,
        display_order: r.display_order ?? 0,
      } as PropertyAssetPublicView;
    })
    .filter(Boolean) as PropertyAssetPublicView[];
}

function attachPublicGallery(base: any, assets: PropertyAssetPublicView[]) {
  const sorted = [...assets].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  const images = sorted
    .filter((a) => (a.kind || "").toString().toLowerCase() === "image")
    .map((a) => a.url);

  const cover       = typeof base?.image_url === "string" ? base.image_url.trim() : "";
  const imagesFinal = images.length ? images : (cover ? [cover] : []);

  return { ...base, assets: sorted, images: imagesFinal, image: imagesFinal[0] ?? cover ?? null };
}

function stripPublicSensitiveFields(view: any) {
  const v = { ...view };
  if ("min_price_admin" in v) v.min_price_admin = null;
  if ("admin_note"      in v) v.admin_note       = null;
  if ("note_admin"      in v) v.note_admin        = null;
  if ("internal_note"   in v) v.internal_note     = null;
  return v;
}

export async function getPropertyByIdPublic(id: string) {
  const rows = await db
    .select({
      property: properties,
      cat_has_cart: categories.has_cart,
      sub_has_cart: subCategories.has_cart,
    })
    .from(properties)
    .leftJoin(categories, eq(properties.category_id, categories.id))
    .leftJoin(subCategories, eq(properties.sub_category_id, subCategories.id))
    .where(eq(properties.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const row = rows[0];
  const basePure = rowToPublicView(row.property as PropertyRow);
  const has_cart_raw = row.sub_has_cart ?? row.cat_has_cart ?? true;
  let base: any = { ...basePure, has_cart: Boolean(has_cart_raw) };

  base = await enrichCoverUrlIfNeeded(base);

  const [assets, tagIds, variantValues, flashSales] = await Promise.all([
    listPropertyAssetsPublic(String(base.id)),
    listPropertyTagIds(String(base.id)),
    getVariantValues(String(base.id)),
    getActiveFlashSalesForProperty({
      id: String(base.id),
      category_id: base.category_id ?? null,
      sub_category_id: base.sub_category_id ?? null,
    }),
  ]);

  base = attachPublicGallery(base, assets);
  base = stripPublicSensitiveFields(base);
  base.tag_ids        = tagIds;
  base.variant_values = variantValues;
  base.flash_sales    = flashSales;

  return base as (PropertyPublicView & {
    assets:         PropertyAssetPublicView[];
    images:         string[];
    image:          string | null;
    variant_values: PropertyVariantValue[];
    flash_sales:    FlashSaleSnippet[];
  });
}

export async function getPropertyBySlugPublic(slug: string) {
  const rows = await db
    .select({
      property: properties,
      cat_has_cart: categories.has_cart,
      sub_has_cart: subCategories.has_cart,
    })
    .from(properties)
    .leftJoin(categories, eq(properties.category_id, categories.id))
    .leftJoin(subCategories, eq(properties.sub_category_id, subCategories.id))
    .where(eq(properties.slug, slug))
    .limit(1);

  if (!rows[0]) return null;

  const row = rows[0];
  const basePure = rowToPublicView(row.property as PropertyRow);
  const has_cart_raw = row.sub_has_cart ?? row.cat_has_cart ?? true;
  let base: any = { ...basePure, has_cart: Boolean(has_cart_raw) };

  base = await enrichCoverUrlIfNeeded(base);

  const [assets, tagIds, variantValues, flashSales] = await Promise.all([
    listPropertyAssetsPublic(String(base.id)),
    listPropertyTagIds(String(base.id)),
    getVariantValues(String(base.id)),
    getActiveFlashSalesForProperty({
      id: String(base.id),
      category_id: base.category_id ?? null,
      sub_category_id: base.sub_category_id ?? null,
    }),
  ]);

  base = attachPublicGallery(base, assets);
  base = stripPublicSensitiveFields(base);
  base.tag_ids        = tagIds;
  base.variant_values = variantValues;
  base.flash_sales    = flashSales;

  return base as (PropertyPublicView & {
    assets:         PropertyAssetPublicView[];
    images:         string[];
    image:          string | null;
    variant_values: PropertyVariantValue[];
    flash_sales:    FlashSaleSnippet[];
  });
}
