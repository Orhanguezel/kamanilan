// =============================================================
// FILE: src/modules/banner/router.ts  (PUBLIC)
// =============================================================
import type { FastifyInstance } from "fastify";
import { listPublicBanners } from "./controller";

export async function registerBanners(app: FastifyInstance) {
  app.get<{ Querystring: unknown }>(
    "/banners",
    { config: { public: true } },
    listPublicBanners
  );
}
