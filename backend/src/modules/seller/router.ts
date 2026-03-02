import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireSellerOrAdmin } from "@/common/middleware/roles";
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
