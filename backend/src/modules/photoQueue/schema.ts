// =============================================================
// FILE: src/modules/photoQueue/schema.ts
// Fotograf indirme kuyrugu (XML feed + Excel import paylasimli)
// Mirror: src/db/seed/sql/112_photo_queue_schema.sql
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  int,
  tinyint,
  datetime,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { properties } from "@/modules/proporties/schema";

export const photoDownloadQueue = mysqlTable(
  "photo_download_queue",
  {
    id:          char("id",          { length: 36 }).primaryKey().notNull(),
    property_id: char("property_id", { length: 36 }).notNull(),

    source:        varchar("source",        { length: 24 }).notNull(),
    source_ref_id: char("source_ref_id",    { length: 36 }),

    source_url:    varchar("source_url", { length: 1000 }).notNull(),
    display_order: int("display_order").notNull().default(0),
    is_cover:      tinyint("is_cover").notNull().default(0),
    alt_text:      varchar("alt_text", { length: 255 }),

    status:      varchar("status", { length: 16 }).notNull().default("pending"),
    retry_count: tinyint("retry_count", { unsigned: true }).notNull().default(0),
    last_error:  varchar("last_error", { length: 500 }),

    asset_id: char("asset_id", { length: 36 }),

    created_at:   datetime("created_at",   { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    processed_at: datetime("processed_at", { fsp: 3 }),
    updated_at:   datetime("updated_at",   { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("idx_photo_queue_pending").on(t.status, t.retry_count),
    index("idx_photo_queue_property").on(t.property_id),
    index("idx_photo_queue_source").on(t.source, t.source_ref_id),
    foreignKey({
      columns:        [t.property_id],
      foreignColumns: [properties.id],
      name:           "fk_photo_queue_property",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

export type PhotoQueueRow    = typeof photoDownloadQueue.$inferSelect;
export type NewPhotoQueueRow = typeof photoDownloadQueue.$inferInsert;

export type PhotoQueueSource = "xml_feed" | "excel_import";
export type PhotoQueueStatus = "pending" | "downloading" | "done" | "failed";
