// =============================================================
// FILE: src/modules/properties/controller.ts (PUBLIC)
// CLEAN: category_id/sub_category_id; kind-specific removed
// =============================================================
import type { RouteHandler } from "fastify";
import {
  listPropertiesPublic as listPropertiesPublicRepo,
  getPropertyByIdPublic as getPropertyByIdPublicRepo,
  getPropertyBySlugPublic as getPropertyBySlugPublicRepo,
  listDistricts as listDistrictsRepo,
  listCities as listCitiesRepo,
  listNeighborhoods as listNeighborhoodsRepo,
  listStatuses as listStatusesRepo,
} from "./repository";
import { propertyListQuerySchema, type PropertyListQuery } from "./validation";

/** LIST (public) */
export const listPropertiesPublic: RouteHandler<{ Querystring: PropertyListQuery }> = async (req, reply) => {
  const parsed = propertyListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }

  const q = parsed.data;

  try {
    const { items, total } = await listPropertiesPublicRepo({
      orderParam: typeof q.order === "string" ? q.order : undefined,
      sort:       q.sort,
      order:      q.orderDir,
      limit:      q.limit,
      offset:     q.offset,

      is_active: q.is_active,
      featured:  q.featured,

      q:               q.q,
      slug:            q.slug,
      district:        q.district,
      city:            q.city,
      neighborhood:    q.neighborhood,
      status:          q.status,
      brand_id:        q.brand_id,
      category_id:     q.category_id,
      sub_category_id: q.sub_category_id,
      tag_ids:         q.tag_ids,

      price_min: q.price_min,
      price_max: q.price_max,

      created_from: q.created_from,
      created_to:   q.created_to,
    });

    reply.header("x-total-count", String(total ?? 0));
    return reply.send({ items, total });
  } catch (err) {
    req.log.error({ err }, "properties_public_list_failed");
    return reply.code(500).send({ error: { message: "properties_public_list_failed" } });
  }
};

/** GET BY ID (public) */
export const getPropertyPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const row = await getPropertyByIdPublicRepo(req.params.id);
    if (!row) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err) {
    req.log.error({ err }, "properties_public_get_failed");
    return reply.code(500).send({ error: { message: "properties_public_get_failed" } });
  }
};

/** GET BY SLUG (public) */
export const getPropertyBySlugPublic: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  try {
    const row = await getPropertyBySlugPublicRepo(req.params.slug);
    if (!row) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err) {
    req.log.error({ err }, "properties_public_get_by_slug_failed");
    return reply.code(500).send({ error: { message: "properties_public_get_by_slug_failed" } });
  }
};

/** GET /properties/rss — Son ilanlar RSS 2.0 feed */
export const listPropertiesRss: RouteHandler = async (req, reply) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";

  const escXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  try {
    const { items } = await listPropertiesPublicRepo({
      is_active: true,
      limit:     30,
      offset:    0,
      sort:      "created_at",
      order:     "desc",
    });

    const rssItems = (items as any[]).map((item) => {
      const link    = `${siteUrl}/ilan/${escXml(item.slug ?? String(item.id))}`;
      const pubDate = new Date(item.created_at).toUTCString();
      const desc    = escXml(item.excerpt ?? item.description ?? item.title ?? "");
      const img     = item.image_url ?? null;
      return `
  <item>
    <title>${escXml(item.title ?? "")}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${desc}</description>
    <pubDate>${pubDate}</pubDate>
    ${img ? `<enclosure url="${escXml(img)}" type="image/jpeg" length="0"/>` : ""}
  </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kaman İlan — Son İlanlar</title>
    <link>${siteUrl}/ilanlar</link>
    <description>Kaman İlan platformundaki en son ilanlar</description>
    <language>tr</language>
    <atom:link href="${siteUrl}/api/properties/rss" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

    reply.header("Content-Type", "application/rss+xml; charset=utf-8");
    return reply.send(xml);
  } catch (err) {
    req.log.error({ err }, "properties_rss_failed");
    return reply.code(500).send({ error: { message: "properties_rss_failed" } });
  }
};

/** META: districts */
export const listDistrictsPublic: RouteHandler = async (req, reply) => {
  try {
    return reply.send(await listDistrictsRepo());
  } catch (err) {
    req.log.error({ err }, "properties_public_districts_failed");
    return reply.code(500).send({ error: { message: "properties_public_districts_failed" } });
  }
};

/** META: cities */
export const listCitiesPublic: RouteHandler = async (req, reply) => {
  try {
    return reply.send(await listCitiesRepo());
  } catch (err) {
    req.log.error({ err }, "properties_public_cities_failed");
    return reply.code(500).send({ error: { message: "properties_public_cities_failed" } });
  }
};

/** META: neighborhoods */
export const listNeighborhoodsPublic: RouteHandler = async (req, reply) => {
  try {
    return reply.send(await listNeighborhoodsRepo());
  } catch (err) {
    req.log.error({ err }, "properties_public_neighborhoods_failed");
    return reply.code(500).send({ error: { message: "properties_public_neighborhoods_failed" } });
  }
};

/** META: statuses */
export const listStatusesPublic: RouteHandler = async (req, reply) => {
  try {
    return reply.send(await listStatusesRepo());
  } catch (err) {
    req.log.error({ err }, "properties_public_statuses_failed");
    return reply.code(500).send({ error: { message: "properties_public_statuses_failed" } });
  }
};
