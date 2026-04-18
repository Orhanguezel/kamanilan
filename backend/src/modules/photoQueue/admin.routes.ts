// =============================================================
// FILE: src/modules/photoQueue/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { makeAdminPermissionGuard } from "@vps/shared-backend/middleware/permissions";
import {
  getStats,
  listFailedItems,
  retryItem,
  listPropertyQueue,
} from "./admin.controller";

const BASE = "/photo-queue";

export async function registerPhotoQueueAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard("admin.imports") as any;

  app.get(`${BASE}/stats`,                       { preHandler: guard }, getStats);
  app.get(`${BASE}/failed`,                      { preHandler: guard }, listFailedItems);
  app.post(`${BASE}/:id/retry`,                  { preHandler: guard }, retryItem);
  app.get(`${BASE}/property/:propertyId`,        { preHandler: guard }, listPropertyQueue);
}
