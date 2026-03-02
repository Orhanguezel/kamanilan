import type { FastifyInstance } from "fastify";
import { listCouponsPublic, getCouponPublic } from "./controller";

const BASE = "/coupons";

export async function registerCoupons(app: FastifyInstance) {
  app.get(BASE,       { config: { public: true } }, listCouponsPublic);
  app.get(`${BASE}/:id`, { config: { public: true } }, getCouponPublic);
}
