// =============================================================
// FILE: src/modules/myListings/controller.ts
// Kullanıcıya ait ilanlar (ilan verme) — endpoint handler'ları
// =============================================================
import type { RouteHandler } from "fastify";
import type { JwtUser } from "@vps/shared-backend/middleware/auth";
import {
  listQuerySchema,
  idParamSchema,
  createListingSchema,
  updateListingSchema,
  toggleSchema,
  type ListQuery,
  type CreateListing,
  type UpdateListing,
} from "./validation";
import {
  repoMyList,
  repoMyGetById,
  repoMyCreate,
  repoMyUpdate,
  repoMyDelete,
  repoMyToggle,
  type ListingWithAsset,
} from "./repository";
import { rowToPublicView } from "@/modules/proporties/schema";
import { checkListingLimit } from "@/modules/subscription/service";

function getUserId(req: any): string | null {
  const user = (req as any).user as JwtUser | undefined;
  return (user?.sub as string) ?? null;
}

function toListing(r: ListingWithAsset) {
  const view = rowToPublicView(r.row);
  return {
    ...view,
    image_effective_url: r.asset_url ?? r.row.image_url ?? null,
  };
}

/** GET /my/listings */
export const listMyListings: RouteHandler<{ Querystring: unknown }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.flatten() } });

  const { items, total } = await repoMyList(userId, parsed.data as ListQuery);
  reply.header("x-total-count", String(total));
  return items.map(toListing);
};

/** POST /my/listings */
export const createMyListing: RouteHandler<{ Body: unknown }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const b = createListingSchema.safeParse(req.body);
  if (!b.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });

  // ✅ Abonelik limit kontrolü
  const limitCheck = await checkListingLimit(userId, (b.data as CreateListing).category_id ?? null);
  if (!limitCheck.allowed)
    return reply.code(403).send({ error: { message: limitCheck.reason ?? "listing_limit_exceeded" } });

  const created = await repoMyCreate(userId, b.data as CreateListing);
  return reply.code(201).send(toListing(created));
};

/** GET /my/listings/:id */
export const getMyListing: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });

  const row = await repoMyGetById(userId, p.data.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return toListing(row);
};

/** PATCH /my/listings/:id */
export const updateMyListing: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });

  const b = updateListingSchema.safeParse(req.body);
  if (!b.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });

  const updated = await repoMyUpdate(userId, p.data.id, b.data as UpdateListing);
  if (!updated) return reply.code(404).send({ error: { message: "not_found" } });
  return toListing(updated);
};

/** DELETE /my/listings/:id */
export const deleteMyListing: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });

  await repoMyDelete(userId, p.data.id);
  return { ok: true };
};

/** POST /my/listings/:id/toggle */
export const toggleMyListing: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const userId = getUserId(req);
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });

  const b = toggleSchema.safeParse(req.body);
  if (!b.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });

  const updated = await repoMyToggle(userId, p.data.id, b.data.is_active);
  if (!updated) return reply.code(404).send({ error: { message: "not_found" } });
  return toListing(updated);
};
