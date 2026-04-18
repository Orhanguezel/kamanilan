// =============================================================
// FILE: src/modules/subscription/admin.routes.ts  (ADMIN)
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@vps/shared-backend/middleware/auth";
import { requireAdmin } from "@vps/shared-backend/middleware/roles";
import {
  adminListPlans,
  adminCreatePlan,
  adminGetPlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminGetPlanFeatures,
  adminUpsertPlanFeatures,
  adminListUserSubscriptions,
  adminAssignPlan,
} from "./admin.controller";

const AUTH = { preHandler: [requireAuth, requireAdmin] };

export async function registerSubscriptionAdmin(app: FastifyInstance) {
  const BASE = "/subscription";

  // Plans CRUD
  app.get<{ Querystring: unknown }>(    `${BASE}/plans`,     AUTH, adminListPlans);
  app.post<{ Body: unknown }>(          `${BASE}/plans`,     AUTH, adminCreatePlan);
  app.get<{ Params: { id: string } }>( `${BASE}/plans/:id`, AUTH, adminGetPlan);
  app.patch<{ Params: { id: string }; Body: unknown }>(`${BASE}/plans/:id`, AUTH, adminUpdatePlan);
  app.delete<{ Params: { id: string } }>(`${BASE}/plans/:id`, AUTH, adminDeletePlan);

  // Features (plan özellik yönetimi)
  app.get<{ Params: { id: string } }>(
    `${BASE}/plans/:id/features`,
    AUTH,
    adminGetPlanFeatures,
  );
  app.put<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/plans/:id/features`,
    AUTH,
    adminUpsertPlanFeatures,
  );

  // User subscriptions
  app.get<{ Querystring: unknown }>(`${BASE}/users`, AUTH, adminListUserSubscriptions);
  app.put<{ Params: { userId: string }; Body: unknown }>(
    `${BASE}/users/:userId`,
    AUTH,
    adminAssignPlan,
  );
}
