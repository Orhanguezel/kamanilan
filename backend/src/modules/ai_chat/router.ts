// =============================================================
// FILE: src/modules/ai_chat/router.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { getStatus, sendAiMessage } from "./controller";

export async function registerAiChat(app: FastifyInstance) {
  // Status: public
  app.get("/ai-chat/status", { config: { public: true } }, getStatus);

  // Send: public (guest + authenticated kullanır)
  app.post("/ai-chat/send", { config: { public: true } }, sendAiMessage);
}
