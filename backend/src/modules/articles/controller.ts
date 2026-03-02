// =============================================================
// FILE: src/modules/articles/controller.ts – Public
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListPublic, repoCountPublic, repoGetBySlugPublic, repoRssFeed,
  repoListComments, repoCreateComment,
  repoGetLikeCount, repoGetUserLiked, repoToggleLike,
} from "./repository";
import { publicListQuerySchema, slugParamSchema, createCommentSchema } from "./validation";
import type { ArticleRow } from "./schema";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { profiles } from "@/modules/profiles/schema";
import type { JwtUser } from "@/common/middleware/auth";

function toPublicView(row: ArticleRow, coverUrl: string | null) {
  return {
    id:               row.id,
    uuid:             row.uuid,
    locale:           row.locale,
    title:            row.title,
    slug:             row.slug,
    excerpt:          row.excerpt          ?? null,
    content:          row.content          ?? null,
    category:         row.category,
    cover_url:        coverUrl,
    cover_image_url:  row.cover_image_url  ?? null,
    alt:              row.alt              ?? null,
    video_url:        row.video_url        ?? null,
    author:           row.author           ?? null,
    source:           row.source           ?? null,
    source_url:       row.source_url       ?? null,
    tags:             row.tags             ?? null,
    reading_time:     row.reading_time     ?? 0,
    is_featured:      row.is_featured      === 1,
    display_order:    row.display_order,
    published_at:     row.published_at     ?? null,
    created_at:       row.created_at,
    updated_at:       row.updated_at,
  };
}

/** GET /articles */
export async function listArticles(req: FastifyRequest, reply: FastifyReply) {
  const q = publicListQuerySchema.parse(req.query);
  const [rows, total] = await Promise.all([
    repoListPublic(q),
    repoCountPublic(q),
  ]);
  reply.header("x-total-count", String(total));
  return reply.send(rows.map((r) => toPublicView(r.row, r.cover_url)));
}

/** GET /articles/:slug */
export async function getArticle(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any)?.locale ?? "tr";
  const r = await repoGetBySlugPublic(slug, locale);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toPublicView(r.row, r.cover_url));
}

/** GET /articles/:slug/comments – approved comments (public) */
export async function listArticleComments(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any)?.locale ?? "tr";
  const art = await repoGetBySlugPublic(slug, locale);
  if (!art) return reply.code(404).send({ error: "not_found" });

  const rows = await repoListComments(art.row.id, true);
  return reply.send(rows.map((r) => ({
    id:          r.id,
    author_name: r.author_name,
    content:     r.content,
    created_at:  r.created_at,
  })));
}

/** POST /articles/:slug/comments – create comment (auth required) */
export async function createArticleComment(req: FastifyRequest, reply: FastifyReply) {
  const user = (req as unknown as { user?: JwtUser }).user;
  if (!user?.sub) return reply.code(401).send({ error: "unauthorized" });

  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any)?.locale ?? "tr";
  const art = await repoGetBySlugPublic(slug, locale);
  if (!art) return reply.code(404).send({ error: "not_found" });

  const body = createCommentSchema.parse(req.body);

  // resolve author_name from profiles table, fallback to email
  const profileRows = await db
    .select({ full_name: profiles.full_name })
    .from(profiles)
    .where(eq(profiles.id, user.sub))
    .limit(1);
  const authorName =
    (profileRows[0]?.full_name ?? "").trim() || (user.email ?? user.sub);

  const comment = await repoCreateComment(art.row.id, user.sub, authorName, body);
  return reply.code(201).send({
    id:          comment.id,
    author_name: comment.author_name,
    content:     comment.content,
    is_approved: comment.is_approved === 1,
    created_at:  comment.created_at,
  });
}

/** GET /articles/:slug/likes – like count + user liked state */
export async function getArticleLikes(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any)?.locale ?? "tr";
  const art = await repoGetBySlugPublic(slug, locale);
  if (!art) return reply.code(404).send({ error: "not_found" });

  const count = await repoGetLikeCount(art.row.id);

  // optionally report whether this user liked it
  const user = (req as unknown as { user?: JwtUser }).user;
  const userLiked = user?.sub ? await repoGetUserLiked(art.row.id, user.sub) : null;

  return reply.send({ count, user_liked: userLiked });
}

/** POST /articles/:slug/like – toggle like (auth required) */
export async function toggleArticleLike(req: FastifyRequest, reply: FastifyReply) {
  const user = (req as unknown as { user?: JwtUser }).user;
  if (!user?.sub) return reply.code(401).send({ error: "unauthorized" });

  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any)?.locale ?? "tr";
  const art = await repoGetBySlugPublic(slug, locale);
  if (!art) return reply.code(404).send({ error: "not_found" });

  const result = await repoToggleLike(art.row.id, user.sub);
  return reply.send(result);
}

/** GET /articles/rss – RSS 2.0 feed */
export async function articlesRss(req: FastifyRequest, reply: FastifyReply) {
  const locale = (req.query as any)?.locale ?? "tr";
  const limit  = Math.min(Number((req.query as any)?.limit ?? 20), 50);
  const items  = await repoRssFeed(locale, limit);

  const siteUrl = process.env.SITE_URL ?? "https://example.com";
  const feedUrl = `${siteUrl}/articles/rss`;

  const escapeXml = (s: string | null | undefined) =>
    (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const itemsXml = items.map((a) => {
    const row = a.row;
    const pubDate = row.published_at ? new Date(row.published_at).toUTCString() : new Date(row.created_at).toUTCString();
    return `
  <item>
    <title>${escapeXml(row.title)}</title>
    <link>${siteUrl}/articles/${escapeXml(row.slug)}</link>
    <guid isPermaLink="true">${siteUrl}/articles/${escapeXml(row.slug)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(row.excerpt ?? "")}</description>
    ${row.category ? `<category>${escapeXml(row.category)}</category>` : ""}
    ${row.author   ? `<author>${escapeXml(row.author)}</author>` : ""}
    ${a.cover_url  ? `<enclosure url="${escapeXml(a.cover_url)}" type="image/jpeg"/>` : ""}
  </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Haberler</title>
    <link>${siteUrl}/articles</link>
    <description>Son haberler</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  reply.header("Content-Type", "application/rss+xml; charset=utf-8");
  return reply.send(xml);
}
