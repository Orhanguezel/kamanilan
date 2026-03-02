// =============================================================
// FILE: src/modules/banner/schema.ts
// =============================================================
import {
  mysqlTable,
  int,
  char,
  varchar,
  text,
  tinyint,
  datetime,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const banners = mysqlTable(
  "banners",
  {
    id: int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),

    uuid: char("uuid", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),

    subtitle: varchar("subtitle", { length: 255 }),
    description: text("description"),

    /** Arka plan görseli (tam kaplama) */
    image_url: text("image_url"),
    image_asset_id: char("image_asset_id", { length: 36 }),
    alt: varchar("alt", { length: 255 }),

    /** Küçük / ön plan görseli (sağ köşe) */
    thumbnail_url: text("thumbnail_url"),
    thumbnail_asset_id: char("thumbnail_asset_id", { length: 36 }),

    /** Renk ayarları */
    background_color: varchar("background_color", { length: 30 }),
    title_color: varchar("title_color", { length: 30 }),
    description_color: varchar("description_color", { length: 30 }),

    /** Buton */
    button_text: varchar("button_text", { length: 100 }),
    button_color: varchar("button_color", { length: 30 }),
    button_hover_color: varchar("button_hover_color", { length: 30 }),
    button_text_color: varchar("button_text_color", { length: 30 }),

    link_url: varchar("link_url", { length: 500 }),
    link_target: varchar("link_target", { length: 20 }).notNull().default("_self"),

    is_active: tinyint("is_active", { unsigned: true }).notNull().default(1),
    display_order: int("display_order", { unsigned: true }).notNull().default(0),

    /** Ana sayfadaki satır numarası (1, 2, 3). 0 = ana sayfada yok. */
    desktop_row: int("desktop_row", { unsigned: true }).notNull().default(0),
    /** O satırdaki sütun sayısı (1=tam genişlik, 2=yarım, 3=üçte bir) */
    desktop_columns: int("desktop_columns", { unsigned: true }).notNull().default(1),

    start_at: datetime("start_at", { fsp: 3 }),
    end_at: datetime("end_at", { fsp: 3 }),

    /** Reklamveren takibi (admin için) */
    advertiser_name: varchar("advertiser_name", { length: 255 }),
    contact_info: varchar("contact_info", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    uniq_uuid: uniqueIndex("uniq_banner_uuid").on(t.uuid),
    uniq_slug: uniqueIndex("uniq_banner_slug").on(t.slug),
    idx_active: index("idx_banner_active").on(t.is_active),
    idx_order: index("idx_banner_order").on(t.display_order),
    idx_image_asset: index("idx_banner_image_asset").on(t.image_asset_id),
    idx_thumb_asset: index("idx_banner_thumb_asset").on(t.thumbnail_asset_id),
  })
);

export type BannerRow = typeof banners.$inferSelect;
export type NewBannerRow = typeof banners.$inferInsert;
