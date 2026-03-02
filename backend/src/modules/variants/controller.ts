import type { RouteHandler } from 'fastify';
import { listVariants } from './repository';
import { variantListQuerySchema, type VariantListQuery } from './validation';

export const listVariantsPublic: RouteHandler<{ Querystring: VariantListQuery }> = async (req, reply) => {
  const parsed = variantListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }
  const q = parsed.data;
  const { items } = await listVariants({
    q: q.q,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    unit_id: q.unit_id,
    value_type: q.value_type,
    is_active: 1,
    is_filterable: q.is_filterable as any,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });
  return reply.send(items);
};

