// =============================================================
// FILE: src/modules/contact/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { makeAdminController } from "./admin.controller";
import { makeAdminPermissionGuard } from '@/common/middleware/permissions';

export async function registerContactsAdmin(app: FastifyInstance) {
  const BASE = "/contacts";
  const c = makeAdminController(app);
  const adminGuard = makeAdminPermissionGuard('admin.contacts');

  // GET /contacts
  app.get<{ Querystring: Record<string, any> }>(
    `${BASE}`,
    { preHandler: adminGuard },
    c.list
  );

  // GET /contacts/:id
  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    c.get
  );

  // PATCH /admin/contacts/:id
  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    c.update
  );

  // DELETE /admin/contacts/:id
  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: adminGuard },
    c.remove
  );
}
