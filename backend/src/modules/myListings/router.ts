// =============================================================
// FILE: src/modules/myListings/router.ts  (AUTH REQUIRED)
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@vps/shared-backend/middleware/auth";
import {
  listMyListings,
  createMyListing,
  getMyListing,
  updateMyListing,
  deleteMyListing,
  toggleMyListing,
} from "./controller";

export async function registerMyListings(app: FastifyInstance) {
  const BASE = "/my/listings";

  app.get<{ Querystring: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth] },
    listMyListings
  );

  app.post<{ Body: unknown }>(
    `${BASE}`,
    { preHandler: [requireAuth] },
    createMyListing
  );

  app.get<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth] },
    getMyListing
  );

  app.patch<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth] },
    updateMyListing
  );

  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth] },
    deleteMyListing
  );

  app.post<{ Params: { id: string }; Body: unknown }>(
    `${BASE}/:id/toggle`,
    { preHandler: [requireAuth] },
    toggleMyListing
  );
}
