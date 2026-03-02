// =============================================================
// FILE: src/modules/properties/schema.ts
// CLEAN: category_id/sub_category_id; kind/specs_json removed
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  datetime,
  uniqueIndex,
  index,
  foreignKey,
  int,
  decimal,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { listingBrands } from "@/modules/listingBrands/schema";
import { listingTags } from "@/modules/listingTags/schema";

export const properties = mysqlTable(
  "properties",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    user_id: char("user_id", { length: 36 }),

    title:   varchar("title",   { length: 255 }).notNull(),
    slug:    varchar("slug",    { length: 255 }).notNull(),
    excerpt: text("excerpt"),

    // Primary taxonomy
    category_id:     char("category_id",     { length: 36 }),
    sub_category_id: char("sub_category_id", { length: 36 }),
    brand_id:        char("brand_id",        { length: 36 }),

    status: varchar("status", { length: 64 }).notNull(),

    // Location
    address:      varchar("address",      { length: 500 }).notNull(),
    district:     varchar("district",     { length: 255 }).notNull(),
    city:         varchar("city",         { length: 255 }).notNull(),
    neighborhood: varchar("neighborhood", { length: 255 }),

    lat: decimal("lat", { precision: 10, scale: 6 }).$type<string | null>(),
    lng: decimal("lng", { precision: 10, scale: 6 }).$type<string | null>(),

    description: text("description"),

    // Price
    price:           decimal("price",           { precision: 12, scale: 2 }).$type<string>(),
    currency:        varchar("currency",        { length: 8 }).notNull().default("TRY"),
    is_negotiable:   tinyint("is_negotiable",   { unsigned: true }).notNull().default(0),
    min_price_admin: decimal("min_price_admin", { precision: 12, scale: 2 }).$type<string>(),

    // Admin metadata
    admin_note:    varchar("admin_note",    { length: 2000 }),
    note_admin:    varchar("note_admin",    { length: 2000 }),
    internal_note: varchar("internal_note", { length: 2000 }),
    listing_no:    varchar("listing_no",    { length: 32 }),
    badge_text:    varchar("badge_text",    { length: 40 }),

    // SEO
    meta_title:       varchar("meta_title",       { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    // Flags
    featured:         tinyint("featured",         { unsigned: true }).notNull().default(0),
    has_map:          tinyint("has_map",          { unsigned: true }).notNull().default(1),
    has_video:        tinyint("has_video",        { unsigned: true }).notNull().default(0),
    has_clip:         tinyint("has_clip",         { unsigned: true }).notNull().default(0),
    has_virtual_tour: tinyint("has_virtual_tour", { unsigned: true }).notNull().default(0),

    // Cover image
    image_url:       text("image_url"),
    image_asset_id:  char("image_asset_id", { length: 36 }),
    alt:             varchar("alt", { length: 255 }),

    // Publish
    is_active:     tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),
    view_count:    int("view_count", { unsigned: true }).notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_properties_slug").on(t.slug),

    index("properties_created_idx").on(t.created_at),
    index("properties_updated_idx").on(t.updated_at),
    index("properties_is_active_idx").on(t.is_active),
    index("properties_featured_idx").on(t.featured),
    index("properties_display_order_idx").on(t.display_order),

    index("properties_category_id_idx").on(t.category_id),
    index("properties_sub_category_id_idx").on(t.sub_category_id),
    index("properties_brand_id_idx").on(t.brand_id),

    index("properties_status_idx").on(t.status),
    index("properties_district_idx").on(t.district),
    index("properties_city_idx").on(t.city),
    index("properties_price_idx").on(t.price),

    index("properties_user_id_idx").on(t.user_id),
    index("properties_image_asset_idx").on(t.image_asset_id),

    foreignKey({
      columns: [t.brand_id],
      foreignColumns: [listingBrands.id],
      name: "fk_properties_brand_id",
    }).onDelete("set null").onUpdate("cascade"),
  ],
);

export const property_assets = mysqlTable(
  "property_assets",
  {
    id:          char("id",          { length: 36 }).primaryKey().notNull(),
    property_id: char("property_id", { length: 36 }).notNull(),

    asset_id: char("asset_id", { length: 36 }),
    url:      text("url"),
    alt:      varchar("alt", { length: 255 }),

    kind: varchar("kind", { length: 24 }).notNull().default("image"),
    mime: varchar("mime", { length: 100 }),

    is_cover:      tinyint("is_cover",      { unsigned: true }),
    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("property_assets_property_idx").on(t.property_id),
    index("property_assets_asset_idx").on(t.asset_id),
    index("property_assets_cover_idx").on(t.property_id, t.is_cover),
    index("property_assets_order_idx").on(t.property_id, t.display_order),
  ],
);

export const property_tag_links = mysqlTable(
  "property_tag_links",
  {
    property_id: char("property_id", { length: 36 }).notNull(),
    tag_id:      char("tag_id",      { length: 36 }).notNull(),
    created_at:  datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    index("idx_property_tag_links_property").on(t.property_id),
    index("idx_property_tag_links_tag").on(t.tag_id),
    uniqueIndex("ux_property_tag_links").on(t.property_id, t.tag_id),
    foreignKey({
      columns:        [t.property_id],
      foreignColumns: [properties.id],
      name: "fk_property_tag_links_property",
    }).onDelete("cascade").onUpdate("cascade"),
    foreignKey({
      columns:        [t.tag_id],
      foreignColumns: [listingTags.id],
      name: "fk_property_tag_links_tag",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

export type PropertyRow    = typeof properties.$inferSelect;
export type NewPropertyRow = typeof properties.$inferInsert;

export type PropertyAssetRow    = typeof property_assets.$inferSelect;
export type NewPropertyAssetRow = typeof property_assets.$inferInsert;

export type PropertyTagLinkRow    = typeof property_tag_links.$inferSelect;
export type NewPropertyTagLinkRow = typeof property_tag_links.$inferInsert;

// =============================================================
// Variant value type (queried via raw SQL)
// =============================================================
export type PropertyVariantValue = {
  variant_id:   string;
  value:        string;
  variant_name: string;
  variant_slug: string;
  value_type:   string;
  options:      string[] | null;
  unit_symbol:  string | null;
  unit_name:    string | null;
};

// =============================================================
// Helpers
// =============================================================
const toNumNullable = (v: unknown): number | null => {
  if (v == null) return null;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
};

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

export function rowToPublicView(r: PropertyRow) {
  const lat = toNumNullable(r.lat);
  const lng = toNumNullable(r.lng);

  return {
    id:      r.id,
    title:   r.title,
    slug:    r.slug,
    excerpt: r.excerpt ?? null,

    category_id:     r.category_id     ?? null,
    sub_category_id: r.sub_category_id ?? null,
    brand_id:        r.brand_id        ?? null,

    status: r.status,

    address:      r.address,
    district:     r.district,
    city:         r.city,
    neighborhood: r.neighborhood ?? null,

    coordinates: lat != null && lng != null ? { lat, lng } : null,

    description: r.description ?? null,

    price:         r.price    ?? null,
    currency:      r.currency,
    is_negotiable: toBool(r.is_negotiable),

    listing_no: r.listing_no ?? null,
    badge_text: r.badge_text ?? null,
    featured:   toBool(r.featured),

    meta_title:       r.meta_title       ?? null,
    meta_description: r.meta_description ?? null,

    has_video:        toBool(r.has_video),
    has_clip:         toBool(r.has_clip),
    has_virtual_tour: toBool(r.has_virtual_tour),
    has_map:          toBool(r.has_map),

    image_url:      r.image_url      ?? null,
    image_asset_id: r.image_asset_id ?? null,
    alt:            r.alt            ?? null,

    is_active:     r.is_active === 1,
    display_order: r.display_order,
    view_count:    r.view_count ?? 0,

    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function rowToAdminView(r: PropertyRow) {
  return {
    ...rowToPublicView(r),
    user_id:         r.user_id         ?? null,
    min_price_admin: r.min_price_admin ?? null,
    admin_note:      r.admin_note      ?? null,
    note_admin:      r.note_admin      ?? null,
    internal_note:   r.internal_note   ?? null,
  };
}

export type PropertyPublicView = ReturnType<typeof rowToPublicView>;
export type PropertyAdminView  = ReturnType<typeof rowToAdminView>;
