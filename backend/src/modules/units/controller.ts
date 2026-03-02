import type { RouteHandler } from 'fastify';
import { listUnits } from './repository';
import { unitListQuerySchema, type UnitListQuery } from './validation';

export const listUnitsPublic: RouteHandler<{ Querystring: UnitListQuery }> = async (req, reply) => {
  const parsed = unitListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }
  const q = parsed.data;
  const { items } = await listUnits({
    q: q.q,
    type: q.type,
    is_active: 1,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });
  return reply.send(items);
};

