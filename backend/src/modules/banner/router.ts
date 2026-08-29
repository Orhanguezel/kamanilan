// =============================================================
// FILE: src/modules/banner/router.ts  (PUBLIC)
// =============================================================
import type { FastifyInstance } from "fastify";
import { listPublicBanners } from "./controller";

/**
 * Reklam engelleyiciler (uBlock/AdBlock, EasyList) "/banners" iceren istekleri
 * ERR_BLOCKED_BY_CLIENT ile dusuruyor. Bu yuzden public liste ucu notr bir
 * yolla ("/showcase") sunulur; "/banners" geriye donuk uyumluluk icin kalir.
 */
const PUBLIC_LIST_PATHS = ["/showcase", "/banners"] as const;

export async function registerBanners(app: FastifyInstance) {
  for (const path of PUBLIC_LIST_PATHS) {
    app.get<{ Querystring: unknown }>(
      path,
      { config: { public: true } },
      listPublicBanners
    );
  }
}
