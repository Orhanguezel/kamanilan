import type { FastifyInstance } from "fastify";

import {
  listSellerApplicationsAdmin,
  reviewSellerApplicationAdmin,
} from "./application.controller";

export async function registerSellerApplicationsAdmin(app: FastifyInstance) {
  app.get("/seller-applications", listSellerApplicationsAdmin);
  app.patch("/seller-applications/:id", reviewSellerApplicationAdmin);
}
