// =============================================================
// FILE: src/modules/announcements/schema.ts
// =============================================================
import {
  mysqlTable,
  int,
  char,
  varchar,
  tinyint,
  datetime,
  index,
  uniqueIndex,
  customType,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

const longtext = customType<{ data: string; driverData: string }>({
  dataType() { return "longtext"; },
});

export const announcements = mysqlTable(
  "announcements",
  {
    id:     int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),
    uuid:   char("uuid",   { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull().default("tr"),

    title:    varchar("title",   { length: 255 }).notNull(),
    slug:     varchar("slug",    { length: 255 }).notNull(),
    excerpt:  varchar("excerpt", { length: 500 }),

    /** Rich HTML içerik */
    content: longtext("content"),

    /** duyuru | haber | kampanya | etkinlik | guncelleme */
    category: varchar("category", { length: 100 }).notNull().default("duyuru"),

    /** Kapak görseli */
    cover_image_url:  varchar("cover_image_url",  { length: 500 }),
    cover_asset_id:   char("cover_asset_id",      { length: 36 }),
    alt:              varchar("alt",              { length: 255 }),

    author: varchar("author", { length: 255 }),

    /** SEO */
    meta_title:       varchar("meta_title",       { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    is_published: tinyint("is_published", { unsigned: true }).notNull().default(0),
    is_featured:  tinyint("is_featured",  { unsigned: true }).notNull().default(0),
    display_order: int("display_order",   { unsigned: true }).notNull().default(0),

    published_at: datetime("published_at", { fsp: 3 }),
    created_at:   datetime("created_at",   { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at:   datetime("updated_at",   { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    uniq_uuid:     uniqueIndex("uniq_ann_uuid").on(t.uuid),
    uniq_slug:     uniqueIndex("uniq_ann_slug_locale").on(t.slug, t.locale),
    idx_locale:    index("idx_ann_locale").on(t.locale),
    idx_category:  index("idx_ann_category").on(t.category),
    idx_published: index("idx_ann_published").on(t.is_published),
    idx_featured:  index("idx_ann_featured").on(t.is_featured),
    idx_pub_at:    index("idx_ann_pub_at").on(t.published_at),
    idx_asset:     index("idx_ann_cover_asset").on(t.cover_asset_id),
  })
);

export type AnnouncementRow = typeof announcements.$inferSelect;
export type NewAnnouncementRow = typeof announcements.$inferInsert;
