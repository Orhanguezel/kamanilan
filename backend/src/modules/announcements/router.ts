// =============================================================
// FILE: src/modules/announcements/router.ts  — Public
// =============================================================
import type { FastifyInstance } from "fastify";
import { listAnnouncements, getAnnouncement, announcementsRss } from "./controller";

export async function registerAnnouncements(app: FastifyInstance) {
  const pub = { config: { public: true } };
  app.get("/announcements",       pub, listAnnouncements);
  app.get("/announcements/rss",   pub, announcementsRss);
  app.get("/announcements/:slug", pub, getAnnouncement);
}
