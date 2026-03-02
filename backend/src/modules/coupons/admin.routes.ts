import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/auth";
import {
  adminListCoupons,
  adminGetCoupon,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminToggleCoupon,
} from "./admin.controller";

const BASE = "/coupons";

export async function registerCouponsAdmin(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireAdmin] };

  app.route({ method: "GET",    url: BASE,                  ...guard, handler: adminListCoupons });
  app.route({ method: "GET",    url: `${BASE}/:id`,         ...guard, handler: adminGetCoupon });
  app.route({ method: "POST",   url: BASE,                  ...guard, handler: adminCreateCoupon });
  app.route({ method: "PATCH",  url: `${BASE}/:id`,         ...guard, handler: adminUpdateCoupon });
  app.route({ method: "DELETE", url: `${BASE}/:id`,         ...guard, handler: adminDeleteCoupon });
  app.route({ method: "PATCH",  url: `${BASE}/:id/toggle`,  ...guard, handler: adminToggleCoupon });
}
