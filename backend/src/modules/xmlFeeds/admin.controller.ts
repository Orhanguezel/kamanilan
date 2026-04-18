// =============================================================
// FILE: src/modules/xmlFeeds/admin.controller.ts
// CRUD + manuel run + runs history + category-map
// =============================================================
import type { RouteHandler, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { hasFeature } from "@/modules/subscription/service";
import {
  createFeed,
  deleteFeed,
  getFeedForUser,
  listFeedsByUser,
  listRunsByFeed,
  updateFeed,
  listCategoryMap,
  upsertCategoryMap,
  deleteCategoryMapEntry,
  listItemsByFeed,
} from "./repository";
import { runFeed } from "./fetcher";
import type { XmlFeedFormat, XmlFeedItemStatus, XmlFeedRow } from "./schema";

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
type AuthedRequest = FastifyRequest & {
  user?: { id?: string; sub?: string; seller_id?: string } | null;
};

function actorId(req: AuthedRequest): string | null {
  const u = req.user ?? {};
  return (typeof u.id === "string" && u.id) || (typeof u.sub === "string" && u.sub) || null;
}

function actorSellerId(req: AuthedRequest): string | null {
  const u = req.user ?? {};
  return typeof u.seller_id === "string" && u.seller_id ? u.seller_id : null;
}

function bad(reply: FastifyReply, code: number, message: string, extra?: Record<string, unknown>) {
  return reply.code(code).send({ error: { message, ...(extra ?? {}) } });
}

function maskFeed(row: XmlFeedRow): Omit<XmlFeedRow, "auth_header_value"> & { auth_header_value: string | null } {
  return {
    ...row,
    auth_header_value: row.auth_header_value ? "***" : null,
  };
}

// -------------------------------------------------------------
// Validation schemas
// -------------------------------------------------------------
const createBody = z.object({
  name:              z.string().min(1).max(120),
  url:               z.string().url().max(500),
  format:            z.enum(["sahibinden", "generic"]).optional(),
  auth_header_name:  z.string().min(1).max(80).optional().nullable(),
  auth_header_value: z.string().min(1).max(500).optional().nullable(),
  interval_minutes:  z.number().int().min(30).max(10080).optional(),
  is_active:         z.boolean().optional(),
});

const patchBody = z.object({
  name:              z.string().min(1).max(120).optional(),
  url:               z.string().url().max(500).optional(),
  format:            z.enum(["sahibinden", "generic"]).optional(),
  auth_header_name:  z.string().max(80).nullable().optional(),
  auth_header_value: z.string().max(500).nullable().optional(),
  interval_minutes:  z.number().int().min(30).max(10080).optional(),
  is_active:         z.boolean().optional(),
});

const categoryMapUpsertBody = z.object({
  external_category:    z.string().min(1).max(200),
  local_category_id:    z.string().length(36).nullable(),
  local_subcategory_id: z.string().length(36).nullable(),
});

// -------------------------------------------------------------
// GET /admin/xml-feeds
// -------------------------------------------------------------
export const listXmlFeeds: RouteHandler<{
  Querystring: { limit?: string; offset?: string; is_active?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const limit = Math.min(Number(req.query?.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(req.query?.offset ?? 0) || 0, 0);
  const is_active_raw = req.query?.is_active;
  const is_active = is_active_raw === "true" ? true : is_active_raw === "false" ? false : undefined;

  const { items, total } = await listFeedsByUser(user_id, { limit, offset, is_active });
  reply.header("x-total-count", String(total));
  return reply.send(items.map(maskFeed));
};

// -------------------------------------------------------------
// POST /admin/xml-feeds
// -------------------------------------------------------------
export const createXmlFeed: RouteHandler = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  if (!(await hasFeature(user_id, "xml_feed_enabled"))) {
    return bad(reply, 403, "feature_not_available", { feature: "xml_feed_enabled" });
  }

  const parsed = createBody.safeParse(req.body ?? {});
  if (!parsed.success) return bad(reply, 400, "invalid_body", { issues: parsed.error.issues });

  const feed = await createFeed({
    user_id,
    seller_id:         actorSellerId(req as AuthedRequest),
    name:              parsed.data.name,
    url:               parsed.data.url,
    format:            parsed.data.format,
    auth_header_name:  parsed.data.auth_header_name ?? null,
    auth_header_value: parsed.data.auth_header_value ?? null,
    interval_minutes:  parsed.data.interval_minutes,
    is_active:         parsed.data.is_active,
  });

  return reply.code(201).send(maskFeed(feed));
};

// -------------------------------------------------------------
// GET /admin/xml-feeds/:id
// -------------------------------------------------------------
export const getXmlFeed: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");
  return reply.send(maskFeed(feed));
};

// -------------------------------------------------------------
// PATCH /admin/xml-feeds/:id
// -------------------------------------------------------------
export const patchXmlFeed: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  const parsed = patchBody.safeParse(req.body ?? {});
  if (!parsed.success) return bad(reply, 400, "invalid_body", { issues: parsed.error.issues });

  const patch = parsed.data;
  // auth_header_value "***" gelirse degistirme (mask placeholder)
  if (patch.auth_header_value === "***") delete (patch as any).auth_header_value;

  await updateFeed(feed.id, patch);
  const fresh = await getFeedForUser(feed.id, user_id);
  return reply.send(fresh ? maskFeed(fresh) : null);
};

// -------------------------------------------------------------
// DELETE /admin/xml-feeds/:id
// -------------------------------------------------------------
export const deleteXmlFeed: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  await deleteFeed(feed.id);
  return reply.code(204).send();
};

// -------------------------------------------------------------
// POST /admin/xml-feeds/:id/run — manuel tetikleme
// -------------------------------------------------------------
export const triggerRun: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");
  if (!feed.is_active) return bad(reply, 400, "feed_inactive");

  // Background'a atmiyoruz — 202 yerine inline calistir, kucuk feed'lerde sorun yok;
  // buyuk feed'lerde timeout'u duserse istemci tekrar polling yapar (GET /runs)
  const result = await runFeed(feed);
  return reply.code(202).send(result);
};

// -------------------------------------------------------------
// GET /admin/xml-feeds/:id/runs
// -------------------------------------------------------------
export const listRuns: RouteHandler<{
  Params: { id: string };
  Querystring: { limit?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  const limit = Math.min(Number(req.query?.limit ?? 50) || 50, 200);
  const runs = await listRunsByFeed(feed.id, limit);
  return reply.send(runs);
};

// -------------------------------------------------------------
// GET /admin/xml-feeds/:id/items
// -------------------------------------------------------------
const ALLOWED_ITEM_STATUSES: ReadonlyArray<XmlFeedItemStatus> = ["active", "stale", "deleted", "unmapped"];

export const listItems: RouteHandler<{
  Params: { id: string };
  Querystring: { status?: string; limit?: string; offset?: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  const statusQ = req.query?.status;
  const status = ALLOWED_ITEM_STATUSES.includes(statusQ as XmlFeedItemStatus)
    ? (statusQ as XmlFeedItemStatus)
    : undefined;
  const limit = Math.min(Number(req.query?.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(req.query?.offset ?? 0) || 0, 0);

  const { items, total } = await listItemsByFeed(feed.id, { status, limit, offset });
  reply.header("x-total-count", String(total));
  return reply.send(items);
};

// -------------------------------------------------------------
// GET /admin/xml-feeds/:id/category-map
// -------------------------------------------------------------
export const getCategoryMap: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  const rows = await listCategoryMap(feed.id);
  return reply.send(rows);
};

// -------------------------------------------------------------
// PUT /admin/xml-feeds/:id/category-map
// Body: { entries: [{ external_category, local_category_id, local_subcategory_id }, ...] }
// -------------------------------------------------------------
export const putCategoryMap: RouteHandler<{
  Params: { id: string };
  Body: { entries?: unknown };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  const entriesRaw = (req.body as any)?.entries;
  if (!Array.isArray(entriesRaw)) return bad(reply, 400, "entries_required");

  const validated: Array<z.infer<typeof categoryMapUpsertBody>> = [];
  for (const raw of entriesRaw) {
    const parsed = categoryMapUpsertBody.safeParse(raw);
    if (!parsed.success) return bad(reply, 400, "invalid_entry", { issues: parsed.error.issues });
    validated.push(parsed.data);
  }

  for (const entry of validated) {
    await upsertCategoryMap({
      feed_id:              feed.id,
      external_category:    entry.external_category.toLowerCase().slice(0, 200),
      local_category_id:    entry.local_category_id,
      local_subcategory_id: entry.local_subcategory_id,
    });
  }

  const fresh = await listCategoryMap(feed.id);
  return reply.send(fresh);
};

// -------------------------------------------------------------
// DELETE /admin/xml-feeds/:id/category-map/:entryId
// -------------------------------------------------------------
export const deleteCategoryMapRow: RouteHandler<{
  Params: { id: string; entryId: string };
}> = async (req, reply) => {
  const user_id = actorId(req as AuthedRequest);
  if (!user_id) return bad(reply, 401, "unauthorized");

  const feed = await getFeedForUser(req.params.id, user_id);
  if (!feed) return bad(reply, 404, "feed_not_found");

  await deleteCategoryMapEntry(req.params.entryId, feed.id);
  return reply.code(204).send();
};
