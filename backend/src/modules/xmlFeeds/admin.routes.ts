// =============================================================
// FILE: src/modules/xmlFeeds/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { makeAdminPermissionGuard } from "@vps/shared-backend/middleware/permissions";
import {
  listXmlFeeds,
  createXmlFeed,
  getXmlFeed,
  patchXmlFeed,
  deleteXmlFeed,
  triggerRun,
  listRuns,
  listItems,
  getCategoryMap,
  putCategoryMap,
  deleteCategoryMapRow,
} from "./admin.controller";

const BASE = "/xml-feeds";

export async function registerXmlFeedsAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard("admin.imports") as any;

  app.get(`${BASE}`,                           { preHandler: guard }, listXmlFeeds);
  app.post(`${BASE}`,                          { preHandler: guard }, createXmlFeed);

  app.get(`${BASE}/:id`,                       { preHandler: guard }, getXmlFeed);
  app.patch(`${BASE}/:id`,                     { preHandler: guard }, patchXmlFeed);
  app.delete(`${BASE}/:id`,                    { preHandler: guard }, deleteXmlFeed);

  app.post(`${BASE}/:id/run`,                  { preHandler: guard }, triggerRun);
  app.get(`${BASE}/:id/runs`,                  { preHandler: guard }, listRuns);
  app.get(`${BASE}/:id/items`,                 { preHandler: guard }, listItems);

  app.get(`${BASE}/:id/category-map`,          { preHandler: guard }, getCategoryMap);
  app.put(`${BASE}/:id/category-map`,          { preHandler: guard }, putCategoryMap);
  app.delete(`${BASE}/:id/category-map/:entryId`, { preHandler: guard }, deleteCategoryMapRow);
}
