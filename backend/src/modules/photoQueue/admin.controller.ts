// =============================================================
// FILE: src/modules/photoQueue/admin.controller.ts
// Opsiyonel admin gorunumu: failed list + manual retry + status counts
// =============================================================
import type { RouteHandler, FastifyRequest, FastifyReply } from "fastify";
import {
  countByStatus,
  listFailed,
  listByProperty,
  resetForRetry,
} from "./repository";

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
type AuthedRequest = FastifyRequest & {
  user?: { id?: string; sub?: string } | null;
};

function actorId(req: AuthedRequest): string | null {
  const u = req.user ?? {};
  return (typeof u.id === "string" && u.id) || (typeof u.sub === "string" && u.sub) || null;
}

function bad(reply: FastifyReply, code: number, message: string, extra?: Record<string, unknown>) {
  return reply.code(code).send({ error: { message, ...(extra ?? {}) } });
}

// -------------------------------------------------------------
// GET /admin/photo-queue/stats
// -------------------------------------------------------------
export const getStats: RouteHandler = async (req, reply) => {
  if (!actorId(req as AuthedRequest)) return bad(reply, 401, "unauthorized");

  const [pending, downloading, done, failed] = await Promise.all([
    countByStatus("pending"),
    countByStatus("downloading"),
    countByStatus("done"),
    countByStatus("failed"),
  ]);

  return reply.send({ pending, downloading, done, failed });
};

// -------------------------------------------------------------
// GET /admin/photo-queue/failed
// -------------------------------------------------------------
export const listFailedItems: RouteHandler<{
  Querystring: { limit?: string; offset?: string };
}> = async (req, reply) => {
  if (!actorId(req as AuthedRequest)) return bad(reply, 401, "unauthorized");

  const limit = Math.min(Number(req.query?.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(req.query?.offset ?? 0) || 0, 0);

  const { items, total } = await listFailed(limit, offset);
  reply.header("x-total-count", String(total));
  return reply.send(items);
};

// -------------------------------------------------------------
// POST /admin/photo-queue/:id/retry — retry_count sifirla, status=pending
// -------------------------------------------------------------
export const retryItem: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  if (!actorId(req as AuthedRequest)) return bad(reply, 401, "unauthorized");

  await resetForRetry(req.params.id);
  return reply.send({ ok: true });
};

// -------------------------------------------------------------
// GET /admin/photo-queue/property/:propertyId — bir ilanin kuyruk durumu
// -------------------------------------------------------------
export const listPropertyQueue: RouteHandler<{ Params: { propertyId: string } }> = async (req, reply) => {
  if (!actorId(req as AuthedRequest)) return bad(reply, 401, "unauthorized");

  const rows = await listByProperty(req.params.propertyId);
  return reply.send(rows);
};
