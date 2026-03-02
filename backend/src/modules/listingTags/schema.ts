import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  int,
  datetime,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { categories } from '@/modules/categories/schema';
import { subCategories } from '@/modules/subcategories/schema';

export const listingTags = mysqlTable(
  'listing_tags',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    name: varchar('name', { length: 140 }).notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    description: varchar('description', { length: 500 }),
    category_id: char('category_id', { length: 36 }).notNull(),
    sub_category_id: char('sub_category_id', { length: 36 }),
    is_active: tinyint('is_active').notNull().default(1),
    display_order: int('display_order').notNull().default(0),
    created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('ux_listing_tags_scope_slug').on(t.category_id, t.sub_category_id, t.slug),
    index('idx_listing_tags_category').on(t.category_id),
    index('idx_listing_tags_sub_category').on(t.sub_category_id),
    index('idx_listing_tags_active').on(t.is_active),
    index('idx_listing_tags_order').on(t.display_order),
    foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: 'fk_listing_tags_category',
    }).onDelete('restrict').onUpdate('cascade'),
    foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: 'fk_listing_tags_sub_category',
    }).onDelete('set null').onUpdate('cascade'),
  ],
);

export type ListingTagRow = typeof listingTags.$inferSelect;
export type NewListingTagRow = typeof listingTags.$inferInsert;
