// =============================================================
// FILE: src/modules/categories/schema.ts (i18n: parent + category_i18n)
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  longtext,
  text,
  int,
  tinyint,
  datetime,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ── Parent: categories (locale-independent) ──
export const categories = mysqlTable(
  "categories",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),

    module_key: varchar("module_key", { length: 64 }).notNull().default("general"),

    // Backward-compat: synced from category_i18n
    name: varchar("name", { length: 255 }),
    slug: varchar("slug", { length: 255 }),
    description: text("description"),

    image_url: longtext("image_url"),
    storage_asset_id: char("storage_asset_id", { length: 36 }),
    alt: varchar("alt", { length: 255 }),
    icon: varchar("icon", { length: 100 }),

    has_cart: tinyint("has_cart").notNull().default(1).$type<boolean>(),
    is_active: tinyint("is_active").notNull().default(1).$type<boolean>(),
    is_featured: tinyint("is_featured").notNull().default(0).$type<boolean>(),
    is_unlimited: tinyint("is_unlimited").notNull().default(0).$type<boolean>(),
    display_order: int("display_order").notNull().default(0),

    whatsapp_number: varchar("whatsapp_number", { length: 50 }),
    phone_number: varchar("phone_number", { length: 50 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    categories_active_idx: index("categories_active_idx").on(t.is_active),
    categories_order_idx: index("categories_order_idx").on(t.display_order),
    categories_module_idx: index("categories_module_idx").on(t.module_key),
    categories_storage_asset_idx: index("categories_storage_asset_idx").on(t.storage_asset_id),
  })
);

// ── Child: category_i18n (locale-dependent text) ──
export const categoryI18n = mysqlTable(
  "category_i18n",
  {
    category_id: char("category_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 8 }).notNull().default("tr"),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    alt: varchar("alt", { length: 255 }),
    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),
    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    ux_slug_locale: uniqueIndex("category_i18n_slug_locale_uq").on(t.slug, t.locale),
    i18n_locale_idx: index("category_i18n_locale_idx").on(t.locale),
    i18n_cat_idx: index("category_i18n_cat_idx").on(t.category_id),
  })
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type CategoryI18nRow = typeof categoryI18n.$inferSelect;
