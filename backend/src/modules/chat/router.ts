// =============================================================
// FILE: src/modules/chat/router.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import {
  listConversations,
  createOrGetConversation,
  listMessages,
  sendMessage,
  markSeen,
} from "./controller";

export async function registerChat(app: FastifyInstance) {
  // Tüm route'lar auth gerektirir
  app.get("/conversations", { preHandler: [requireAuth] }, listConversations);
  app.post("/conversations", { preHandler: [requireAuth] }, createOrGetConversation);

  app.get("/conversations/:id/messages", { preHandler: [requireAuth] }, listMessages);
  app.post("/conversations/:id/messages", { preHandler: [requireAuth] }, sendMessage);
  app.post("/conversations/:id/seen", { preHandler: [requireAuth] }, markSeen);
}
