// =============================================================
// FILE: src/modules/articles/repository.ts
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { articles, articleComments, articleLikes, type ArticleRow, type ArticleCommentRow } from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import { publicUrlOf } from "@/modules/_shared/repo-helpers";
import { randomUUID } from "crypto";
import type { AdminListQuery, CreateBody, PublicListQuery, UpdateBody, CreateCommentBody } from "./validation";

export type ArticleWithAsset = {
  row:       ArticleRow;
  cover_url: string | null;
};

const ORDER = {
  published_at:  articles.published_at,
  created_at:    articles.created_at,
  display_order: articles.display_order,
} as const;

function orderExpr(sort: keyof typeof ORDER, dir: "asc" | "desc") {
  const col = ORDER[sort] ?? ORDER.published_at;
  return dir === "asc" ? asc(col) : desc(col);
}

function baseSelect() {
  return db
    .select({
      row:          articles,
      asset_bucket: storageAssets.bucket,
      asset_path:   storageAssets.path,
      asset_url0:   storageAssets.url,
    })
    .from(articles)
    .leftJoin(storageAssets, eq(articles.cover_asset_id, storageAssets.id));
}

function toWithAsset(r: {
  row:          ArticleRow;
  asset_bucket: string | null;
  asset_path:   string | null;
  asset_url0:   string | null;
}): ArticleWithAsset {
  return {
    row:       r.row,
    cover_url: publicUrlOf(r.asset_bucket, r.asset_path, r.asset_url0) ?? r.row.cover_image_url ?? null,
  };
}

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

/* ===================== PUBLIC ===================== */

export async function repoListPublic(q: PublicListQuery): Promise<ArticleWithAsset[]> {
  const conds: any[] = [
    eq(articles.is_published, 1 as const),
    eq(articles.locale, q.locale),
  ];
  if (q.category) conds.push(eq(articles.category, q.category));
  if (typeof q.featured === "boolean" && q.featured) conds.push(eq(articles.is_featured, 1 as const));
  if (q.q)        conds.push(like(articles.title, `%${q.q.trim()}%`));
  if (q.tags)     conds.push(like(articles.tags,  `%${q.tags.trim()}%`));

  const rows = await baseSelect()
    .where(and(...conds))
    .orderBy(orderExpr(q.sort, q.order), desc(articles.published_at), asc(articles.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoCountPublic(q: PublicListQuery): Promise<number> {
  const conds: any[] = [
    eq(articles.is_published, 1 as const),
    eq(articles.locale, q.locale),
  ];
  if (q.category) conds.push(eq(articles.category, q.category));
  if (typeof q.featured === "boolean" && q.featured) conds.push(eq(articles.is_featured, 1 as const));
  if (q.q)        conds.push(like(articles.title, `%${q.q.trim()}%`));
  if (q.tags)     conds.push(like(articles.tags,  `%${q.tags.trim()}%`));

  const [{ cnt }] = await db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(articles)
    .where(and(...conds));
  return Number(cnt);
}

export async function repoGetBySlugPublic(slug: string, locale: string): Promise<ArticleWithAsset | null> {
  const rows = await baseSelect()
    .where(and(
      eq(articles.slug, slug),
      eq(articles.locale, locale),
      eq(articles.is_published, 1 as const)
    ))
    .limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

/* ===================== ADMIN ===================== */

export async function repoListAdmin(q: AdminListQuery): Promise<ArticleWithAsset[]> {
  const conds: any[] = [];
  if (q.locale)                              conds.push(eq(articles.locale, q.locale));
  if (typeof q.is_published === "boolean")   conds.push(eq(articles.is_published, q.is_published ? 1 : 0));
  if (typeof q.is_featured  === "boolean")   conds.push(eq(articles.is_featured,  q.is_featured  ? 1 : 0));
  if (q.category)                            conds.push(eq(articles.category, q.category));
  if (q.q)                                   conds.push(like(articles.title,  `%${q.q.trim()}%`));
  if (q.tags)                                conds.push(like(articles.tags,   `%${q.tags.trim()}%`));

  const rows = await baseSelect()
    .where(conds.length ? and(...conds) : undefined as any)
    .orderBy(orderExpr(q.sort, q.order), desc(articles.published_at), asc(articles.id))
    .limit(q.limit)
    .offset(q.offset);

  return (rows as any[]).map(toWithAsset);
}

export async function repoGetById(id: number): Promise<ArticleWithAsset | null> {
  const rows = await baseSelect().where(eq(articles.id, id)).limit(1);
  if (!rows.length) return null;
  return toWithAsset(rows[0] as any);
}

export async function repoCreate(b: CreateBody): Promise<ArticleWithAsset> {
  const maxOrder = await db
    .select({ v: sql<number>`COALESCE(MAX(${articles.display_order}), 0)` })
    .from(articles);

  const slug = (b.slug || buildSlug(b.title)).slice(0, 255);

  await db.insert(articles).values({
    uuid:             randomUUID(),
    locale:           b.locale ?? "tr",
    title:            b.title,
    slug,
    excerpt:          b.excerpt          ?? null,
    content:          b.content          ?? null,
    category:         b.category         ?? "genel",
    cover_image_url:  b.cover_image_url  ?? null,
    cover_asset_id:   b.cover_asset_id   ?? null,
    alt:              b.alt              ?? null,
    video_url:        b.video_url        ?? null,
    author:           b.author           ?? null,
    source:           b.source           ?? null,
    source_url:       b.source_url       ?? null,
    tags:             b.tags             ?? null,
    reading_time:     b.reading_time     ?? 0,
    meta_title:       b.meta_title       ?? null,
    meta_description: b.meta_description ?? null,
    is_published:     b.is_published ? 1 : 0,
    is_featured:      b.is_featured  ? 1 : 0,
    display_order:    b.display_order ?? (maxOrder[0]?.v ?? 0) + 1,
    published_at:     b.published_at ?? (b.is_published ? new Date() : null),
  } as any);

  const created = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.locale, b.locale ?? "tr")))
    .limit(1);

  if (!created.length) throw new Error("create_failed");
  const result = await repoGetById(created[0].id);
  if (!result) throw new Error("create_failed");
  return result;
}

export async function repoUpdate(id: number, b: UpdateBody): Promise<ArticleWithAsset | null> {
  const set: Record<string, unknown> = { updated_at: sql`CURRENT_TIMESTAMP(3)` };
  if (b.locale           !== undefined) set.locale           = b.locale;
  if (b.title            !== undefined) set.title            = b.title;
  if (b.slug             !== undefined) set.slug             = b.slug;
  if (b.excerpt          !== undefined) set.excerpt          = b.excerpt          ?? null;
  if (b.content          !== undefined) set.content          = b.content          ?? null;
  if (b.category         !== undefined) set.category         = b.category;
  if (b.cover_image_url  !== undefined) set.cover_image_url  = b.cover_image_url  ?? null;
  if (b.cover_asset_id   !== undefined) set.cover_asset_id   = b.cover_asset_id   ?? null;
  if (b.alt              !== undefined) set.alt              = b.alt              ?? null;
  if (b.video_url        !== undefined) set.video_url        = b.video_url        ?? null;
  if (b.author           !== undefined) set.author           = b.author           ?? null;
  if (b.source           !== undefined) set.source           = b.source           ?? null;
  if (b.source_url       !== undefined) set.source_url       = b.source_url       ?? null;
  if (b.tags             !== undefined) set.tags             = b.tags             ?? null;
  if (b.reading_time     !== undefined) set.reading_time     = b.reading_time     ?? 0;
  if (b.meta_title       !== undefined) set.meta_title       = b.meta_title       ?? null;
  if (b.meta_description !== undefined) set.meta_description = b.meta_description ?? null;
  if (b.is_published     !== undefined) {
    set.is_published = b.is_published ? 1 : 0;
    if (b.is_published && !b.published_at) set.published_at = new Date();
  }
  if (b.is_featured      !== undefined) set.is_featured      = b.is_featured ? 1 : 0;
  if (b.display_order    !== undefined) set.display_order    = b.display_order;
  if (b.published_at     !== undefined) set.published_at     = b.published_at ?? null;

  await db.update(articles).set(set as any).where(eq(articles.id, id));
  return repoGetById(id);
}

export async function repoDelete(id: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

export async function repoSetPublished(id: number, isPublished: boolean): Promise<ArticleWithAsset | null> {
  const set: any = {
    is_published: isPublished ? 1 : 0,
    updated_at:   sql`CURRENT_TIMESTAMP(3)`,
  };
  if (isPublished) set.published_at = new Date();

  await db.update(articles).set(set).where(eq(articles.id, id));
  return repoGetById(id);
}

/* ===================== COMMENTS ===================== */

export async function repoListComments(
  articleId: number,
  approvedOnly = true,
): Promise<ArticleCommentRow[]> {
  const conds = approvedOnly
    ? and(eq(articleComments.article_id, articleId), eq(articleComments.is_approved, 1))
    : eq(articleComments.article_id, articleId);
  return db
    .select()
    .from(articleComments)
    .where(conds)
    .orderBy(asc(articleComments.created_at));
}

export async function repoCreateComment(
  articleId: number,
  userId: string,
  authorName: string,
  body: CreateCommentBody,
): Promise<ArticleCommentRow> {
  await db.insert(articleComments).values({
    article_id:  articleId,
    user_id:     userId,
    author_name: authorName,
    content:     body.content,
    is_approved: 0,
  } as any);

  const rows = await db
    .select()
    .from(articleComments)
    .where(and(eq(articleComments.article_id, articleId), eq(articleComments.user_id, userId)))
    .orderBy(desc(articleComments.created_at))
    .limit(1);

  if (!rows.length) throw new Error("comment_create_failed");
  return rows[0] as ArticleCommentRow;
}

export async function repoApproveComment(
  commentId: number,
  isApproved: boolean,
): Promise<ArticleCommentRow | null> {
  await db
    .update(articleComments)
    .set({ is_approved: isApproved ? 1 : 0 } as any)
    .where(eq(articleComments.id, commentId));

  const rows = await db
    .select()
    .from(articleComments)
    .where(eq(articleComments.id, commentId))
    .limit(1);

  return (rows[0] as ArticleCommentRow) ?? null;
}

export async function repoDeleteComment(commentId: number): Promise<void> {
  await db.delete(articleComments).where(eq(articleComments.id, commentId));
}

/* ===================== LIKES ===================== */

export async function repoGetLikeCount(articleId: number): Promise<number> {
  const [{ cnt }] = await db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(articleLikes)
    .where(eq(articleLikes.article_id, articleId));
  return Number(cnt);
}

export async function repoGetUserLiked(articleId: number, userId: string): Promise<boolean> {
  const rows = await db
    .select({ article_id: articleLikes.article_id })
    .from(articleLikes)
    .where(and(eq(articleLikes.article_id, articleId), eq(articleLikes.user_id, userId)))
    .limit(1);
  return rows.length > 0;
}

/** Toggle: returns new liked state and updated count */
export async function repoToggleLike(
  articleId: number,
  userId: string,
): Promise<{ liked: boolean; count: number }> {
  const already = await repoGetUserLiked(articleId, userId);
  if (already) {
    await db
      .delete(articleLikes)
      .where(and(eq(articleLikes.article_id, articleId), eq(articleLikes.user_id, userId)));
  } else {
    await db.insert(articleLikes).values({ article_id: articleId, user_id: userId } as any);
  }
  const count = await repoGetLikeCount(articleId);
  return { liked: !already, count };
}

/** RSS feed için son N yayınlanmış haber */
export async function repoRssFeed(locale: string, limit = 20): Promise<ArticleWithAsset[]> {
  const rows = await baseSelect()
    .where(and(
      eq(articles.is_published, 1 as const),
      eq(articles.locale, locale)
    ))
    .orderBy(desc(articles.published_at), asc(articles.id))
    .limit(limit);
  return (rows as any[]).map(toWithAsset);
}
