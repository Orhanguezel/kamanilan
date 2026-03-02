// =========================================================
// FILE: src/modules/news/router.ts
// =========================================================
import type { FastifyInstance } from "fastify";
import { listNewsFeed } from "./controller";

export async function registerNews(app: FastifyInstance) {
  const pub = { config: { public: true } };
  app.get("/news/feed", pub, listNewsFeed);
}
