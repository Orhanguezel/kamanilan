import type { FastifyReply, FastifyRequest } from 'fastify';

export async function adminDashboardSummary(_req: FastifyRequest, reply: FastifyReply) {
  // Compatibility response for admin panel summary cards.
  // Can be extended with real counters later.
  return reply.send({ items: [] });
}
