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
import { createSellerApplication, getMySellerApplication } from "./application.controller";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sellerStores } from "./schema";
import { properties } from "@/modules/proporties/schema";

export async function registerSeller(app: FastifyInstance) {
  const BASE = "/seller";
  const sellerGuard = [requireAuth, requireSellerOrAdmin];

  app.get("/stores", async (_req, reply) => {
    const rows = await db.select({
      id: sellerStores.id, name: sellerStores.name, slug: sellerStores.slug,
      description: sellerStores.description, logo_url: sellerStores.logo_url,
      banner_url: sellerStores.banner_url,
      listing_count: sql<number>`COUNT(${properties.id})`,
    }).from(sellerStores)
      .leftJoin(properties, and(eq(properties.user_id, sellerStores.user_id), eq(properties.is_active, 1), eq(properties.status, "approved")))
      .where(eq(sellerStores.is_active, 1)).groupBy(sellerStores.id);
    return reply.send({ items: rows });
  });

  app.get<{ Params: { slug: string } }>("/stores/:slug", async (req, reply) => {
    const [store] = await db.select().from(sellerStores)
      .where(and(eq(sellerStores.slug, req.params.slug), eq(sellerStores.is_active, 1))).limit(1);
    if (!store) return reply.status(404).send({ error: "Mağaza bulunamadı" });
    const listings = await db.select().from(properties)
      .where(and(eq(properties.user_id, store.user_id), eq(properties.is_active, 1), eq(properties.status, "approved")))
      .limit(24);
    return reply.send({ store, listings });
  });

  app.get(`${BASE}/application`, { preHandler: [requireAuth] }, getMySellerApplication);
  app.post(`${BASE}/application`, { preHandler: [requireAuth] }, createSellerApplication);

  app.get(`${BASE}/stores`, { preHandler: sellerGuard }, listMyStores);
  app.post(`${BASE}/stores`, { preHandler: sellerGuard }, createMyStore);
  app.patch(`${BASE}/stores/:id`, { preHandler: sellerGuard }, updateMyStore);

  app.get(`${BASE}/campaigns`, { preHandler: sellerGuard }, listMyCampaigns);
  app.post(`${BASE}/campaigns`, { preHandler: sellerGuard }, createMyCampaign);
  app.patch(`${BASE}/campaigns/:id`, { preHandler: sellerGuard }, updateMyCampaign);
  app.delete(`${BASE}/campaigns/:id`, { preHandler: sellerGuard }, removeMyCampaign);
}
