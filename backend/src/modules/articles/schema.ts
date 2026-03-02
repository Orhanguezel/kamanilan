// =============================================================
// FILE: src/modules/articles/schema.ts
// Kendi haberlerimiz – Articles (haber) modülü
// =============================================================
import {
  mysqlTable,
  int,
  char,
  varchar,
  tinyint,
  text,
  datetime,
  index,
  uniqueIndex,
  primaryKey,
  customType,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

const longtext = customType<{ data: string; driverData: string }>({
  dataType() { return "longtext"; },
});

export const articles = mysqlTable(
  "articles",
  {
    id:     int("id", { unsigned: true }).autoincrement().notNull().primaryKey(),
    uuid:   char("uuid",   { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull().default("tr"),

    title:    varchar("title",   { length: 255 }).notNull(),
    slug:     varchar("slug",    { length: 255 }).notNull(),
    excerpt:  varchar("excerpt", { length: 500 }),

    /** Rich HTML içerik */
    content: longtext("content"),

    /**
     * Haber kategorisi
     * gundem | spor | ekonomi | teknoloji | kultur | saglik | dunya | yerel | genel
     */
    category: varchar("category", { length: 100 }).notNull().default("genel"),

    /** Kapak görseli */
    cover_image_url:  varchar("cover_image_url",  { length: 500 }),
    cover_asset_id:   char("cover_asset_id",      { length: 36 }),
    alt:              varchar("alt",              { length: 255 }),

    /** Video içerik */
    video_url: varchar("video_url", { length: 500 }),

    /** Yazar / kaynak bilgisi */
    author:     varchar("author",     { length: 255 }),
    source:     varchar("source",     { length: 255 }),
    source_url: varchar("source_url", { length: 500 }),

    /** Etiketler (virgülle ayrılmış) */
    tags: varchar("tags", { length: 500 }),

    /** Tahmini okuma süresi (dakika) */
    reading_time: int("reading_time", { unsigned: true }).default(0),

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
    uniq_uuid:     uniqueIndex("uniq_art_uuid").on(t.uuid),
    uniq_slug:     uniqueIndex("uniq_art_slug_locale").on(t.slug, t.locale),
    idx_locale:    index("idx_art_locale").on(t.locale),
    idx_category:  index("idx_art_category").on(t.category),
    idx_published: index("idx_art_published").on(t.is_published),
    idx_featured:  index("idx_art_featured").on(t.is_featured),
    idx_pub_at:    index("idx_art_pub_at").on(t.published_at),
    idx_asset:     index("idx_art_cover_asset").on(t.cover_asset_id),
  })
);

export type ArticleRow = typeof articles.$inferSelect;
export type NewArticleRow = typeof articles.$inferInsert;

// ─── Article Comments ─────────────────────────────────────────────────────────

export const articleComments = mysqlTable(
  "article_comments",
  {
    id:          int("id",  { unsigned: true }).autoincrement().notNull().primaryKey(),
    article_id:  int("article_id",  { unsigned: true }).notNull(),
    user_id:     char("user_id",    { length: 36 }).notNull(),
    author_name: varchar("author_name", { length: 255 }).notNull(),
    content:     text("content").notNull(),
    is_approved: tinyint("is_approved", { unsigned: true }).notNull().default(0),
    created_at:  datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at:  datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    idx_article:  index("idx_ac_article").on(t.article_id),
    idx_user:     index("idx_ac_user").on(t.user_id),
    idx_approved: index("idx_ac_approved").on(t.is_approved),
  })
);

export type ArticleCommentRow = typeof articleComments.$inferSelect;

// ─── Article Likes ────────────────────────────────────────────────────────────

export const articleLikes = mysqlTable(
  "article_likes",
  {
    article_id: int("article_id", { unsigned: true }).notNull(),
    user_id:    char("user_id",   { length: 36 }).notNull(),
    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => ({
    pk:          primaryKey({ columns: [t.article_id, t.user_id] }),
    idx_article: index("idx_al_article").on(t.article_id),
    idx_user:    index("idx_al_user").on(t.user_id),
  })
);

export type ArticleLikeRow = typeof articleLikes.$inferSelect;
