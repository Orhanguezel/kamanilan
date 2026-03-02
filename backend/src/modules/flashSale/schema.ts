import {
  mysqlTable,
  char,
  varchar,
  datetime,
  decimal,
  int,
  tinyint,
  uniqueIndex,
  index,
  primaryKey,
  customType,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const longtext = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'longtext';
  },
});

export const flashSales = mysqlTable(
  'flash_sales',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 190 }).notNull(),
    locale: varchar('locale', { length: 10 }).notNull().default('tr'),
    description: longtext('description'),
    discount_type: varchar('discount_type', { length: 16 }).notNull().default('percent'),
    discount_value: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
    start_at: datetime('start_at', { fsp: 3 }).notNull(),
    end_at: datetime('end_at', { fsp: 3 }).notNull(),
    is_active: tinyint('is_active').notNull().default(1),
    scope_type: varchar('scope_type', { length: 20 }).notNull().default('all'),
    cover_image_url: longtext('cover_image_url'),
    cover_asset_id: char('cover_asset_id', { length: 36 }),
    background_color: varchar('background_color', { length: 20 }),
    title_color: varchar('title_color', { length: 20 }),
    description_color: varchar('description_color', { length: 20 }),
    button_text: varchar('button_text', { length: 100 }),
    button_url: varchar('button_url', { length: 500 }),
    button_bg_color: varchar('button_bg_color', { length: 20 }),
    button_text_color: varchar('button_text_color', { length: 20 }),
    timer_bg_color: varchar('timer_bg_color', { length: 20 }),
    timer_text_color: varchar('timer_text_color', { length: 20 }),
    display_order: int('display_order').notNull().default(0),
    created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('ux_flash_sales_slug_locale').on(t.slug, t.locale),
    index('idx_flash_sales_locale').on(t.locale),
    index('idx_flash_sales_active').on(t.is_active),
    index('idx_flash_sales_window').on(t.start_at, t.end_at),
    index('idx_flash_sales_order').on(t.display_order),
    index('idx_flash_sales_scope').on(t.scope_type),
  ],
);

/* ── Junction tablolar ───────────────────────────────────── */

export const flashSaleCategories = mysqlTable(
  'flash_sale_categories',
  {
    flash_sale_id: char('flash_sale_id', { length: 36 }).notNull(),
    category_id: char('category_id', { length: 36 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.flash_sale_id, t.category_id] }),
    index('idx_fsc_category').on(t.category_id),
  ],
);

export const flashSaleSubcategories = mysqlTable(
  'flash_sale_subcategories',
  {
    flash_sale_id: char('flash_sale_id', { length: 36 }).notNull(),
    sub_category_id: char('sub_category_id', { length: 36 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.flash_sale_id, t.sub_category_id] }),
    index('idx_fss_subcategory').on(t.sub_category_id),
  ],
);

export const flashSaleProperties = mysqlTable(
  'flash_sale_properties',
  {
    flash_sale_id: char('flash_sale_id', { length: 36 }).notNull(),
    property_id: char('property_id', { length: 36 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.flash_sale_id, t.property_id] }),
    index('idx_fsp_property').on(t.property_id),
  ],
);

export const flashSaleSellers = mysqlTable(
  'flash_sale_sellers',
  {
    flash_sale_id: char('flash_sale_id', { length: 36 }).notNull(),
    seller_id: char('seller_id', { length: 36 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.flash_sale_id, t.seller_id] }),
    index('idx_fsls_seller').on(t.seller_id),
  ],
);

export type FlashSaleRow = typeof flashSales.$inferSelect;
export type NewFlashSaleRow = typeof flashSales.$inferInsert;
export type FlashSaleScopeType = 'all' | 'categories' | 'subcategories' | 'properties' | 'sellers';
