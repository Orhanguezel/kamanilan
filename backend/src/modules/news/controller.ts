// =========================================================
// FILE: src/modules/news/controller.ts
// =========================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { getNewsFeed } from "./rss.service";

const querySchema = z.object({
  limit:  z.coerce.number().int().min(1).max(30).optional().default(9),
  kaman:  z.enum(["0", "1", "true", "false"]).optional().default("0"),
});

/** GET /news/feed */
export async function listNewsFeed(req: FastifyRequest, reply: FastifyReply) {
  const q           = querySchema.parse(req.query);
  const filterKaman = q.kaman === "1" || q.kaman === "true";
  const items       = await getNewsFeed(q.limit, filterKaman);
  return reply.send({ items });
}
