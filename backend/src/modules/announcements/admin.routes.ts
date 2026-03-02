// =============================================================
// FILE: src/modules/announcements/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";
import {
  adminListAnnouncements,
  adminGetAnnouncement,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement,
  adminSetPublished,
} from "./admin.controller";

export async function registerAnnouncementsAdmin(app: FastifyInstance) {
  const BASE = "/announcements";

  app.get<{ Querystring: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminListAnnouncements
  );

  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminGetAnnouncement
  );

  app.post<{ Body: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminCreateAnnouncement
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminUpdateAnnouncement
  );

  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminDeleteAnnouncement
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id/publish`,
    { preHandler: [requireAuth, requireAdmin] },
    adminSetPublished
  );
}
