// =============================================================
// FILE: src/modules/properties/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { makeAdminPermissionGuard } from '@/common/middleware/permissions';
import {
  listPropertiesAdmin,
  getPropertyAdmin,
  getPropertyBySlugAdmin,
  createPropertyAdmin,
  updatePropertyAdmin,
  removePropertyAdmin,
} from "./admin.controller";

const BASE = "/properties";

export async function registerPropertiesAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard('admin.properties') as any;

  app.get(`${BASE}`, { preHandler: guard }, listPropertiesAdmin);
  app.get(`${BASE}/:id`, { preHandler: guard }, getPropertyAdmin);
  app.get(`${BASE}/by-slug/:slug`, { preHandler: guard }, getPropertyBySlugAdmin);

  app.post(`${BASE}`, { preHandler: guard }, createPropertyAdmin);
  app.patch(`${BASE}/:id`, { preHandler: guard }, updatePropertyAdmin);
  app.delete(`${BASE}/:id`, { preHandler: guard }, removePropertyAdmin);
}
