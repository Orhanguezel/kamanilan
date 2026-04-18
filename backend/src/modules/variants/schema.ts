import {
  mysqlTable,
  char,
  varchar,
  json,
  tinyint,
  int,
  datetime,
  decimal,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { categories } from '@vps/shared-backend/modules/categories/schema';
import { subCategories } from '@vps/shared-backend/modules/subcategories/schema';
import { units } from '@/modules/units/schema';
import { properties } from '@/modules/proporties/schema';

export const listingVariants = mysqlTable(
  'listing_variants',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    name: varchar('name', { length: 140 }).notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    description: varchar('description', { length: 500 }),
    value_type: varchar('value_type', { length: 24 }).notNull().default('text'),
    category_id: char('category_id', { length: 36 }).notNull(),
    sub_category_id: char('sub_category_id', { length: 36 }),
    unit_id: char('unit_id', { length: 36 }),
    options_json: json('options_json').$type<string[] | null>(),
    is_required: tinyint('is_required').notNull().default(0),
    is_filterable: tinyint('is_filterable').notNull().default(1),
    is_active: tinyint('is_active').notNull().default(1),
    display_order: int('display_order').notNull().default(0),
    created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('ux_listing_variants_scope_slug').on(t.category_id, t.sub_category_id, t.slug),
    index('idx_listing_variants_cat').on(t.category_id),
    index('idx_listing_variants_subcat').on(t.sub_category_id),
    index('idx_listing_variants_unit').on(t.unit_id),
    index('idx_listing_variants_active').on(t.is_active),
    index('idx_listing_variants_order').on(t.display_order),
    foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: 'fk_listing_variants_category',
    }).onDelete('restrict').onUpdate('cascade'),
    foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: 'fk_listing_variants_sub_category',
    }).onDelete('set null').onUpdate('cascade'),
    foreignKey({
      columns: [t.unit_id],
      foreignColumns: [units.id],
      name: 'fk_listing_variants_unit',
    }).onDelete('set null').onUpdate('cascade'),
  ],
);

export const propertyVariantValues = mysqlTable(
  'property_variant_values',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    property_id: char('property_id', { length: 36 }).notNull(),
    variant_id: char('variant_id', { length: 36 }).notNull(),
    value_text: varchar('value_text', { length: 500 }),
    value_number: decimal('value_number', { precision: 14, scale: 4 }),
    value_bool: tinyint('value_bool', { unsigned: true }),
    value_json: json('value_json').$type<Record<string, unknown> | string[] | null>(),
    created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('ux_property_variant_values_pair').on(t.property_id, t.variant_id),
    index('idx_property_variant_values_property').on(t.property_id),
    index('idx_property_variant_values_variant').on(t.variant_id),
    foreignKey({
      columns: [t.property_id],
      foreignColumns: [properties.id],
      name: 'fk_property_variant_values_property',
    }).onDelete('cascade').onUpdate('cascade'),
    foreignKey({
      columns: [t.variant_id],
      foreignColumns: [listingVariants.id],
      name: 'fk_property_variant_values_variant',
    }).onDelete('cascade').onUpdate('cascade'),
  ],
);

export type ListingVariantRow = typeof listingVariants.$inferSelect;
export type NewListingVariantRow = typeof listingVariants.$inferInsert;
export type PropertyVariantValueRow = typeof propertyVariantValues.$inferSelect;
export type NewPropertyVariantValueRow = typeof propertyVariantValues.$inferInsert;

