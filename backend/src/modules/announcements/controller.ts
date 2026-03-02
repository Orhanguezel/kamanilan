// =============================================================
// FILE: src/modules/announcements/controller.ts  — Public
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListPublic,
  repoCountPublic,
  repoGetBySlugPublic,
  repoRssFeed,
} from "./repository";
import {
  publicListQuerySchema,
  slugParamSchema,
} from "./validation";
import type { AnnouncementRow } from "./schema";

function rowToPublic(row: AnnouncementRow, coverUrl: string | null) {
  return {
    id:               row.id,
    locale:           row.locale,
    title:            row.title,
    slug:             row.slug,
    excerpt:          row.excerpt          ?? null,
    content:          row.content          ?? null,
    category:         row.category,
    cover_image_url:  coverUrl,
    alt:              row.alt              ?? null,
    author:           row.author           ?? null,
    meta_title:       row.meta_title       ?? null,
    meta_description: row.meta_description ?? null,
    is_featured:      row.is_featured      === 1,
    published_at:     row.published_at     ?? null,
    created_at:       row.created_at,
  };
}

/** GET /announcements */
export async function listAnnouncements(req: FastifyRequest, reply: FastifyReply) {
  const q = publicListQuerySchema.parse(req.query);
  const [rows, total] = await Promise.all([
    repoListPublic(q),
    repoCountPublic(q),
  ]);
  reply.header("x-total-count", String(total));
  return reply.send({
    items: rows.map((r) => rowToPublic(r.row, r.cover_url)),
    total,
    page:  q.page  ?? 1,
    limit: q.limit ?? 12,
  });
}

/** GET /announcements/:slug */
export async function getAnnouncement(req: FastifyRequest, reply: FastifyReply) {
  const { slug } = slugParamSchema.parse(req.params);
  const locale = (req.query as any).locale ?? "tr";
  const r = await repoGetBySlugPublic(slug, locale);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(rowToPublic(r.row, r.cover_url));
}

/** GET /announcements/rss  → RSS 2.0 XML */
export async function announcementsRss(req: FastifyRequest, reply: FastifyReply) {
  const locale = (req.query as any).locale ?? "tr";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
  const rows = await repoRssFeed(locale, 30);

  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const items = rows.map(({ row, cover_url }) => {
    const pubDate = (row.published_at ?? row.created_at) as Date | string;
    return `
  <item>
    <title>${escXml(row.title)}</title>
    <link>${siteUrl}/duyurular/${escXml(row.slug)}</link>
    <guid isPermaLink="true">${siteUrl}/duyurular/${escXml(row.slug)}</guid>
    <description>${escXml(row.excerpt ?? row.title)}</description>
    <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
    <category>${escXml(row.category)}</category>
    ${cover_url ? `<enclosure url="${escXml(cover_url)}" type="image/jpeg" length="0"/>` : ""}
  </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kaman İlan — Duyurular</title>
    <link>${siteUrl}/duyurular</link>
    <description>Kaman İlan güncel duyurular ve haberler</description>
    <language>${locale}</language>
    <atom:link href="${siteUrl}/api/announcements/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  reply.header("Content-Type", "application/rss+xml; charset=utf-8");
  return reply.send(xml);
}
