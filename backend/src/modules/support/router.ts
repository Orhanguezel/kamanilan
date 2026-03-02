// =============================================================
// FILE: src/modules/support/router.ts
// =============================================================

import type { FastifyInstance } from "fastify";
import { SupportController } from "./controller";
import { requireAuth } from "@/common/middleware/auth";

const BASE = "/support_tickets";
const REPLIES_BASE = "/ticket_replies";

export async function registerSupport(app: FastifyInstance) {
  const auth = { preHandler: [requireAuth] };

  app.route({ method: "GET",   url: BASE,                                  ...auth, handler: SupportController.listTickets });
  app.route({ method: "GET",   url: `${BASE}/:id`,                         ...auth, handler: SupportController.getTicket });
  app.route({ method: "POST",  url: BASE,                                  ...auth, handler: SupportController.createTicket });
  app.route({ method: "PATCH", url: `${BASE}/:id`,                         ...auth, handler: SupportController.updateTicket });
  app.route({ method: "GET",   url: `${REPLIES_BASE}/by-ticket/:ticketId`, ...auth, handler: SupportController.listRepliesByTicket });
  app.route({ method: "POST",  url: REPLIES_BASE,                          ...auth, handler: SupportController.createReply });
}
