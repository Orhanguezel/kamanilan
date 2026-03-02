// =============================================================
// FILE: src/modules/banner/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";
import {
  adminListBanners,
  adminGetBanner,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminReorderBanners,
  adminSetBannerStatus,
  adminSetBannerImage,
} from "./admin.controller";

export async function registerBannersAdmin(app: FastifyInstance) {
  const BASE = "/banners";

  app.get<{ Querystring: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminListBanners
  );

  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminGetBanner
  );

  app.post<{ Body: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminCreateBanner
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminUpdateBanner
  );

  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminDeleteBanner
  );

  app.post<{ Body: unknown }>(
    `${BASE}/reorder`,
    { preHandler: [requireAuth, requireAdmin] },
    adminReorderBanners
  );

  app.post<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id/status`,
    { preHandler: [requireAuth, requireAdmin] },
    adminSetBannerStatus
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id/image`,
    { preHandler: [requireAuth, requireAdmin] },
    adminSetBannerImage
  );
}
