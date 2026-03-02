// =============================================================
// FILE: src/modules/subscription/admin.controller.ts  (ADMIN)
// =============================================================
import type { RouteHandler } from "fastify";
import {
  repoListPlans,
  repoGetPlan,
  repoCreatePlan,
  repoUpdatePlan,
  repoDeletePlan,
  repoGetFeatures,
  repoUpsertFeatures,
  repoListUserSubscriptions,
  repoAdminAssignPlan,
  repoGetUserSubscription,
} from "./repository";
import {
  planCreateSchema,
  planUpdateSchema,
  featuresBulkSchema,
  assignPlanSchema,
} from "./validation";

// ------------------------------------------------------------------
// GET /admin/subscription/plans
// ------------------------------------------------------------------
export const adminListPlans: RouteHandler = async (_req, reply) => {
  const plans = await repoListPlans();

  const result = await Promise.all(
    plans.map(async (p) => {
      const features = await repoGetFeatures(p.id);
      return { ...p, features };
    }),
  );

  return reply.send(result);
};

// ------------------------------------------------------------------
// POST /admin/subscription/plans
// ------------------------------------------------------------------
export const adminCreatePlan: RouteHandler<{ Body: unknown }> = async (req, reply) => {
  const parsed = planCreateSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });

  const plan = await repoCreatePlan(parsed.data);
  return reply.code(201).send(plan);
};

// ------------------------------------------------------------------
// GET /admin/subscription/plans/:id
// ------------------------------------------------------------------
export const adminGetPlan: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return reply.code(400).send({ error: { message: "invalid_id" } });

  const plan = await repoGetPlan(id);
  if (!plan) return reply.code(404).send({ error: { message: "not_found" } });

  const features = await repoGetFeatures(id);
  return reply.send({ ...plan, features });
};

// ------------------------------------------------------------------
// PATCH /admin/subscription/plans/:id
// ------------------------------------------------------------------
export const adminUpdatePlan: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return reply.code(400).send({ error: { message: "invalid_id" } });

  const parsed = planUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });

  const updated = await repoUpdatePlan(id, parsed.data);
  if (!updated) return reply.code(404).send({ error: { message: "not_found" } });

  return reply.send(updated);
};

// ------------------------------------------------------------------
// DELETE /admin/subscription/plans/:id
// ------------------------------------------------------------------
export const adminDeletePlan: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return reply.code(400).send({ error: { message: "invalid_id" } });

  const plan = await repoGetPlan(id);
  if (!plan) return reply.code(404).send({ error: { message: "not_found" } });

  await repoDeletePlan(id);
  return reply.send({ ok: true });
};

// ------------------------------------------------------------------
// GET /admin/subscription/plans/:id/features
// ------------------------------------------------------------------
export const adminGetPlanFeatures: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return reply.code(400).send({ error: { message: "invalid_id" } });

  const features = await repoGetFeatures(id);
  return reply.send(features);
};

// ------------------------------------------------------------------
// PUT /admin/subscription/plans/:id/features
// Bulk upsert — tüm özellikler tek seferinde kaydedilir
// ------------------------------------------------------------------
export const adminUpsertPlanFeatures: RouteHandler<{
  Params: { id: string };
  Body: unknown;
}> = async (req, reply) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return reply.code(400).send({ error: { message: "invalid_id" } });

  const plan = await repoGetPlan(id);
  if (!plan) return reply.code(404).send({ error: { message: "not_found" } });

  const parsed = featuresBulkSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });

  await repoUpsertFeatures(
    id,
    parsed.data.features.map((f) => ({
      key:        f.key,
      value:      f.value,
      is_enabled: f.is_enabled !== false,
    })),
  );

  const updated = await repoGetFeatures(id);
  return reply.send(updated);
};

// ------------------------------------------------------------------
// GET /admin/subscription/users
// ------------------------------------------------------------------
export const adminListUserSubscriptions: RouteHandler<{ Querystring: unknown }> = async (req, reply) => {
  const q = (req.query ?? {}) as Record<string, string>;
  const limit  = Math.min(Number(q.limit  ?? 50) || 50, 200);
  const offset = Math.max(Number(q.offset ?? 0)  || 0,  0);

  const { items, total } = await repoListUserSubscriptions({ limit, offset });
  reply.header("x-total-count", String(total));
  return reply.send(items);
};

// ------------------------------------------------------------------
// PUT /admin/subscription/users/:userId
// Kullanıcıya plan ata / planı değiştir
// ------------------------------------------------------------------
export const adminAssignPlan: RouteHandler<{
  Params: { userId: string };
  Body: unknown;
}> = async (req, reply) => {
  const { userId } = req.params;

  const parsed = assignPlanSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });

  await repoAdminAssignPlan(userId, parsed.data);

  const sub = await repoGetUserSubscription(userId);
  return reply.send(sub);
};
