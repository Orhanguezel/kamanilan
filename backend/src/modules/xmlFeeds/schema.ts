// =============================================================
// FILE: src/modules/xmlFeeds/schema.ts
// Sahibinden-uyumlu XML feed — Drizzle schema
// Mirror: src/db/seed/sql/111_xml_feeds_schema.sql
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  int,
  tinyint,
  datetime,
  json,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ------------------------------------------------------------
// xml_feeds — emlakcinin feed konfigurasyonu
// ------------------------------------------------------------
export const xmlFeeds = mysqlTable(
  "xml_feeds",
  {
    id:        char("id",        { length: 36 }).primaryKey().notNull(),
    seller_id: char("seller_id", { length: 36 }),
    user_id:   char("user_id",   { length: 36 }).notNull(),

    name:   varchar("name",   { length: 120 }).notNull(),
    url:    varchar("url",    { length: 500 }).notNull(),
    format: varchar("format", { length: 32  }).notNull().default("sahibinden"),

    auth_header_name:  varchar("auth_header_name",  { length: 80  }),
    auth_header_value: varchar("auth_header_value", { length: 500 }),

    interval_minutes: int("interval_minutes", { unsigned: true }).notNull().default(240),
    is_active:        tinyint("is_active").notNull().default(1),

    last_status:     varchar("last_status", { length: 24 }),
    last_fetched_at: datetime("last_fetched_at", { fsp: 3 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("idx_xml_feeds_user").on(t.user_id),
    index("idx_xml_feeds_seller").on(t.seller_id),
    index("idx_xml_feeds_active").on(t.is_active),
    index("idx_xml_feeds_due").on(t.is_active, t.last_fetched_at),
  ],
);

// ------------------------------------------------------------
// xml_feed_runs — her cekim denemesi
// ------------------------------------------------------------
export const xmlFeedRuns = mysqlTable(
  "xml_feed_runs",
  {
    id:      char("id",      { length: 36 }).primaryKey().notNull(),
    feed_id: char("feed_id", { length: 36 }).notNull(),

    started_at:  datetime("started_at",  { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    finished_at: datetime("finished_at", { fsp: 3 }),

    status: varchar("status", { length: 24 }).notNull().default("started"),

    items_found:   int("items_found",   { unsigned: true }).notNull().default(0),
    items_added:   int("items_added",   { unsigned: true }).notNull().default(0),
    items_updated: int("items_updated", { unsigned: true }).notNull().default(0),
    items_skipped: int("items_skipped", { unsigned: true }).notNull().default(0),
    items_failed:  int("items_failed",  { unsigned: true }).notNull().default(0),

    errors_json: json("errors_json"),
  },
  (t) => [
    index("idx_xml_feed_runs_feed").on(t.feed_id),
    index("idx_xml_feed_runs_started").on(t.started_at),
    foreignKey({
      columns:        [t.feed_id],
      foreignColumns: [xmlFeeds.id],
      name:           "fk_xml_feed_runs_feed",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

// ------------------------------------------------------------
// xml_feed_items — item seviyesi diff / idempotency
// ------------------------------------------------------------
export const xmlFeedItems = mysqlTable(
  "xml_feed_items",
  {
    id:      char("id",      { length: 36 }).primaryKey().notNull(),
    feed_id: char("feed_id", { length: 36 }).notNull(),

    external_id: varchar("external_id", { length: 120 }).notNull(),
    property_id: char("property_id",    { length: 36  }),
    last_hash:   char("last_hash",      { length: 64  }),

    last_seen_at: datetime("last_seen_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    status:       varchar("status", { length: 16 }).notNull().default("active"),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_xml_feed_items_feed_external").on(t.feed_id, t.external_id),
    index("idx_xml_feed_items_feed").on(t.feed_id),
    index("idx_xml_feed_items_property").on(t.property_id),
    foreignKey({
      columns:        [t.feed_id],
      foreignColumns: [xmlFeeds.id],
      name:           "fk_xml_feed_items_feed",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

// ------------------------------------------------------------
// xml_feed_category_map — XML kategorilerini local taksonomiye esle
// ------------------------------------------------------------
export const xmlFeedCategoryMap = mysqlTable(
  "xml_feed_category_map",
  {
    id:      char("id",      { length: 36 }).primaryKey().notNull(),
    feed_id: char("feed_id", { length: 36 }).notNull(),

    external_category:    varchar("external_category", { length: 200 }).notNull(),
    local_category_id:    char("local_category_id",    { length: 36 }),
    local_subcategory_id: char("local_subcategory_id", { length: 36 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_xml_feed_cat_map_feed_external").on(t.feed_id, t.external_category),
    index("idx_xml_feed_cat_map_feed").on(t.feed_id),
    foreignKey({
      columns:        [t.feed_id],
      foreignColumns: [xmlFeeds.id],
      name:           "fk_xml_feed_cat_map_feed",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

export type XmlFeedRow    = typeof xmlFeeds.$inferSelect;
export type NewXmlFeedRow = typeof xmlFeeds.$inferInsert;

export type XmlFeedRunRow    = typeof xmlFeedRuns.$inferSelect;
export type NewXmlFeedRunRow = typeof xmlFeedRuns.$inferInsert;

export type XmlFeedItemRow    = typeof xmlFeedItems.$inferSelect;
export type NewXmlFeedItemRow = typeof xmlFeedItems.$inferInsert;

export type XmlFeedCategoryMapRow    = typeof xmlFeedCategoryMap.$inferSelect;
export type NewXmlFeedCategoryMapRow = typeof xmlFeedCategoryMap.$inferInsert;

export type XmlFeedFormat = "sahibinden" | "generic";
export type XmlFeedRunStatus =
  | "started"
  | "success"
  | "http_error"
  | "parse_error"
  | "partial"
  | "failed";
export type XmlFeedItemStatus = "active" | "stale" | "deleted" | "unmapped";
