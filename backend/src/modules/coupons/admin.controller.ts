import type { RouteHandler } from "fastify";
import {
  couponListQuerySchema,
  createCouponSchema,
  updateCouponSchema,
  type CouponListQuery,
  type CreateCouponBody,
  type UpdateCouponBody,
} from "./validation";
import {
  listCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./repository";

export const adminListCoupons: RouteHandler<{ Querystring: CouponListQuery }> = async (req, reply) => {
  const parsed = couponListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.issues } });

  const { items, total } = await listCoupons(parsed.data);
  reply.header("x-total-count", String(total));
  return reply.send(items);
};

export const adminGetCoupon: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getCouponById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const adminCreateCoupon: RouteHandler<{ Body: CreateCouponBody }> = async (req, reply) => {
  const parsed = createCouponSchema.safeParse(req.body ?? {});
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });

  const row = await createCoupon(parsed.data as any);
  return reply.code(201).send(row);
};

export const adminUpdateCoupon: RouteHandler<{ Params: { id: string }; Body: UpdateCouponBody }> = async (req, reply) => {
  const existing = await getCouponById(req.params.id);
  if (!existing) return reply.code(404).send({ error: { message: "not_found" } });

  const parsed = updateCouponSchema.safeParse(req.body ?? {});
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });

  const row = await updateCoupon(req.params.id, parsed.data as any);
  return reply.send(row);
};

export const adminDeleteCoupon: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const affected = await deleteCoupon(req.params.id);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

export const adminToggleCoupon: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const existing = await getCouponById(req.params.id);
  if (!existing) return reply.code(404).send({ error: { message: "not_found" } });
  const row = await updateCoupon(req.params.id, { is_active: existing.is_active ? 0 : 1 });
  return reply.send(row);
};
