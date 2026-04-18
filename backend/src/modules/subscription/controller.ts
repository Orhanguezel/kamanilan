// =============================================================
// FILE: src/modules/subscription/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import type { JwtUser } from "@vps/shared-backend/middleware/auth";
import { repoListPlans, repoGetFeatures } from "./repository";
import { getUserPlan } from "./service";

// ------------------------------------------------------------------
// GET /subscription/plans  (herkese açık)
// ------------------------------------------------------------------
export const listPlans: RouteHandler = async (_req, reply) => {
  const plans = await repoListPlans();

  // Her planın özelliklerini ekle
  const result = await Promise.all(
    plans
      .filter((p) => p.is_active)
      .map(async (p) => {
        const features = await repoGetFeatures(p.id);
        const featureMap: Record<string, string> = {};
        for (const f of features) {
          if (f.is_enabled) featureMap[f.feature_key] = f.feature_value;
        }
        return { ...p, features: featureMap };
      }),
  );

  return reply.send(result);
};

// ------------------------------------------------------------------
// GET /subscription/my-plan  (requireAuth)
// ------------------------------------------------------------------
export const getMyPlan: RouteHandler = async (req, reply) => {
  const user = (req as any).user as JwtUser | undefined;
  const userId = (user?.sub as string) ?? null;
  if (!userId) return reply.code(401).send({ error: { message: "unauthorized" } });

  const data = await getUserPlan(userId);
  if (!data) return reply.code(404).send({ error: { message: "no_plan_found" } });

  return reply.send(data);
};
