// =============================================================
// FILE: src/modules/imports/admin.routes.ts
// Tum endpoint'ler admin olmayan kullaniciya kapali.
// =============================================================
import type { FastifyInstance } from "fastify";
import { makeAdminPermissionGuard } from "@vps/shared-backend/middleware/permissions";
import {
  uploadImport,
  putMapping,
  getJob,
  listItems,
  commitImport,
  listJobs,
  uploadPhotosZip,
  deleteJob,
} from "./admin.controller";

const BASE = "/imports";

export async function registerImportsAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard("admin.imports") as any;

  app.post(`${BASE}/upload`,          { preHandler: guard }, uploadImport);
  app.put(`${BASE}/:id/mapping`,      { preHandler: guard }, putMapping);
  app.post(`${BASE}/:id/commit`,      { preHandler: guard }, commitImport);
  app.post(`${BASE}/:id/photos-zip`,  { preHandler: guard }, uploadPhotosZip);

  app.get(`${BASE}`,                  { preHandler: guard }, listJobs);
  app.get(`${BASE}/:id`,              { preHandler: guard }, getJob);
  app.get(`${BASE}/:id/items`,        { preHandler: guard }, listItems);
  app.delete(`${BASE}/:id`,           { preHandler: guard }, deleteJob);
}
