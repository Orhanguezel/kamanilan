import type { FastifyInstance } from "fastify";
import { requireAuth } from "@vps/shared-backend/middleware/auth";
import { requireRoles } from "@vps/shared-backend/middleware/roles";
import type { FastifyRequest, FastifyReply } from "fastify";
const requireSellerOrAdmin = (req: FastifyRequest, reply: FastifyReply) => requireRoles(req, reply, ['admin', 'seller'] as any);
import {
  createMyCampaign,
  createMyStore,
  listMyCampaigns,
  listMyStores,
  removeMyCampaign,
  updateMyCampaign,
  updateMyStore,
} from "./controller";

export async function registerSeller(app: FastifyInstance) {
  const BASE = "/seller";
  const sellerGuard = [requireAuth, requireSellerOrAdmin];

  app.get(`${BASE}/stores`, { preHandler: sellerGuard }, listMyStores);
  app.post(`${BASE}/stores`, { preHandler: sellerGuard }, createMyStore);
  app.patch(`${BASE}/stores/:id`, { preHandler: sellerGuard }, updateMyStore);

  app.get(`${BASE}/campaigns`, { preHandler: sellerGuard }, listMyCampaigns);
  app.post(`${BASE}/campaigns`, { preHandler: sellerGuard }, createMyCampaign);
  app.patch(`${BASE}/campaigns/:id`, { preHandler: sellerGuard }, updateMyCampaign);
  app.delete(`${BASE}/campaigns/:id`, { preHandler: sellerGuard }, removeMyCampaign);
}
