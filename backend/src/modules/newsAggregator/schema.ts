// =============================================================
// FILE: src/modules/newsAggregator/schema.ts
// Haber Toplayıcı: news_sources + news_suggestions
// =============================================================
import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  tinyint,
  datetime,
  index,
  uniqueIndex,
  customType,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

const longtext = customType<{ data: string; driverData: string }>({
  dataType() { return "longtext"; },
});

// ──────────────────────────────────────────────────────────────
// news_sources — haber kaynakları (RSS / OG / scrape)
// ──────────────────────────────────────────────────────────────
export const newsSources = mysqlTable(
  "news_sources",
  {
    id:                 int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),
    name:               varchar("name", { length: 255 }).notNull(),
    url:                varchar("url",  { length: 1000 }).notNull(),
    source_type:        mysqlEnum("source_type", ["rss", "og", "scrape"]).notNull().default("rss"),
    is_enabled:         tinyint("is_enabled", { unsigned: true }).notNull().default(1),
    fetch_interval_min: int("fetch_interval_min", { unsigned: true }).notNull().default(30),
    last_fetched_at:    datetime("last_fetched_at", { fsp: 3 }),
    error_count:        int("error_count", { unsigned: true }).notNull().default(0),
    last_error:         varchar("last_error", { length: 500 }),
    notes:              varchar("notes", { length: 1000 }),
    display_order:      int("display_order", { unsigned: true }).notNull().default(0),
    created_at:         datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at:         datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    uniq_url: uniqueIndex("uniq_ns_url").on(t.url),
  })
);

export type NewsSourceRow    = typeof newsSources.$inferSelect;
export type NewNewsSourceRow = typeof newsSources.$inferInsert;

// ──────────────────────────────────────────────────────────────
// news_suggestions — scrape edilen / önerilen haberler
// ──────────────────────────────────────────────────────────────
export const newsSuggestions = mysqlTable(
  "news_suggestions",
  {
    id:              int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),
    source_id:       int("source_id", { unsigned: true }),
    source_url:      varchar("source_url",  { length: 1000 }).notNull(),
    title:           varchar("title",       { length: 500 }),
    excerpt:         varchar("excerpt",     { length: 2000 }),
    content:         longtext("content"),
    image_url:       varchar("image_url",   { length: 1000 }),
    source_name:     varchar("source_name", { length: 255 }),
    author:          varchar("author",      { length: 255 }),
    category:        varchar("category",    { length: 100 }).default("genel"),
    tags:            varchar("tags",        { length: 500 }),
    original_pub_at: datetime("original_pub_at", { fsp: 3 }),
    status:          mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("pending"),
    article_id:      int("article_id", { unsigned: true }),
    reject_reason:   varchar("reject_reason", { length: 500 }),
    ai_status:       mysqlEnum("ai_status", ["none", "queued", "done", "failed"]).notNull().default("none"),
    ai_title:        varchar("ai_title", { length: 500 }),
    ai_excerpt:      varchar("ai_excerpt", { length: 2000 }),
    ai_content:      longtext("ai_content"),
    ai_meta_title:   varchar("ai_meta_title", { length: 255 }),
    ai_meta_description: varchar("ai_meta_description", { length: 500 }),
    ai_tags:         varchar("ai_tags", { length: 500 }),
    image_brief:     text("image_brief"),
    image_status:    mysqlEnum("image_status", ["none", "waiting", "received", "attached"]).notNull().default("none"),
    internal_links:  text("internal_links"),
    created_at:      datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at:      datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    uniq_source_url: uniqueIndex("uniq_nsugg_url").on(t.source_url),
    idx_status:      index("idx_nsugg_status").on(t.status),
    idx_ai_status:   index("idx_nsugg_ai_status").on(t.ai_status),
    idx_image_status:index("idx_nsugg_image_status").on(t.image_status),
    idx_source:      index("idx_nsugg_source").on(t.source_id),
    idx_article:     index("idx_nsugg_article").on(t.article_id),
    idx_created:     index("idx_nsugg_created").on(t.created_at),
  })
);

export type NewsSuggestionRow    = typeof newsSuggestions.$inferSelect;
export type NewNewsSuggestionRow = typeof newsSuggestions.$inferInsert;
