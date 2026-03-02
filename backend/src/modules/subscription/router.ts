// =============================================================
// FILE: src/modules/subscription/router.ts  (PUBLIC)
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { listPlans, getMyPlan } from "./controller";

export async function registerSubscription(app: FastifyInstance) {
  // Herkese açık: plan listesi
  app.get("/subscription/plans", { config: { public: true } }, listPlans);

  // Auth gerekli: kullanıcının aktif planı
  app.get(
    "/subscription/my-plan",
    { preHandler: [requireAuth] },
    getMyPlan,
  );
}
