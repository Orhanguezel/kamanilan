// =============================================================
// FILE: src/modules/review/admin.routes.ts (ADMIN)
// =============================================================
import type { FastifyInstance } from "fastify";
import {
  listReviewsAdmin,
  getReviewAdmin,
  createReviewAdmin,
  updateReviewAdmin,
  removeReviewAdmin,
} from "./admin.controller";
import { makeAdminPermissionGuard } from '@/common/middleware/permissions';

const BASE = "/reviews";

export async function registerReviewsAdmin(app: FastifyInstance) {
  const adminGuard = makeAdminPermissionGuard('admin.reviews');

  // LIST
  app.get<{ Querystring: Record<string, any> }>(
    `${BASE}`,
    { preHandler: adminGuard },
    listReviewsAdmin
  );

  // GET by id
  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    getReviewAdmin
  );

  // CREATE
  app.post<{ Body: unknown }>(
    `${BASE}`,
    { preHandler: adminGuard },
    createReviewAdmin
  );

  // UPDATE
  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    updateReviewAdmin
  );

  // DELETE
  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    removeReviewAdmin
  );
}
