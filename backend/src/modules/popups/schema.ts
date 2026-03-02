// =============================================================
// FILE: src/modules/popups/schema.ts
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

export const popups = mysqlTable(
  "popups",
  {
    id: int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),

    uuid: char("uuid", { length: 36 }).notNull(),

    /** topbar | sidebar_top | sidebar_center | sidebar_bottom */
    type: varchar("type", { length: 30 }).notNull().default("topbar"),

    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),

    /** Renk */
    background_color: varchar("background_color", { length: 30 }),
    text_color:       varchar("text_color",       { length: 30 }),

    /** Buton */
    button_text:       varchar("button_text",       { length: 100 }),
    button_color:      varchar("button_color",      { length: 30 }),
    button_hover_color: varchar("button_hover_color", { length: 30 }),
    button_text_color: varchar("button_text_color", { length: 30 }),

    link_url:    varchar("link_url",    { length: 500 }),
    link_target: varchar("link_target", { length: 20 }).notNull().default("_self"),

    /** Görsel (sidebar popup'lar için) */
    image_url:      text("image_url"),
    image_asset_id: char("image_asset_id", { length: 36 }),
    alt:            varchar("alt", { length: 255 }),

    /** Topbar davranışı: static | marquee */
    text_behavior: varchar("text_behavior", { length: 20 }).notNull().default("marquee"),
    scroll_speed:  int("scroll_speed",  { unsigned: true }).notNull().default(60),

    /** Gösterim kontrolü */
    closeable:         tinyint("closeable",         { unsigned: true }).notNull().default(1),
    delay_seconds:     int("delay_seconds",         { unsigned: true }).notNull().default(0),
    /** always | once | daily */
    display_frequency: varchar("display_frequency", { length: 20 }).notNull().default("always"),

    is_active:     tinyint("is_active",     { unsigned: true }).notNull().default(1),
    display_order: int("display_order",     { unsigned: true }).notNull().default(0),

    start_at: datetime("start_at", { fsp: 3 }),
    end_at:   datetime("end_at",   { fsp: 3 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    uniq_uuid:     uniqueIndex("uniq_popup_uuid").on(t.uuid),
    idx_type:      index("idx_popup_type").on(t.type),
    idx_active:    index("idx_popup_active").on(t.is_active),
    idx_order:     index("idx_popup_order").on(t.display_order),
    idx_img_asset: index("idx_popup_img_asset").on(t.image_asset_id),
  })
);

export type PopupRow = typeof popups.$inferSelect;
export type NewPopupRow = typeof popups.$inferInsert;
