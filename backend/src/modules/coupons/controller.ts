import type { RouteHandler } from "fastify";
import { couponListQuerySchema, type CouponListQuery } from "./validation";
import { listCoupons, getCouponById } from "./repository";

/** Public: list active coupons */
export const listCouponsPublic: RouteHandler<{ Querystring: CouponListQuery }> = async (req, reply) => {
  const parsed = couponListQuerySchema.safeParse({ ...req.query, is_active: true });
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_query" } });

  const { items, total } = await listCoupons({
    ...parsed.data,
    is_active:  true,
    active_now: true,
  });

  reply.header("x-total-count", String(total));
  return reply.send(items);
};

/** Public: get single coupon by id */
export const getCouponPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getCouponById(req.params.id);
  if (!row || !row.is_active) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};
