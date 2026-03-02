import type { RouteHandler } from 'fastify';
import { listListingBrands } from './repository';
import { listingBrandListQuerySchema, type ListingBrandListQuery } from './validation';

export const listListingBrandsPublic: RouteHandler<{ Querystring: ListingBrandListQuery }> = async (req, reply) => {
  const parsed = listingBrandListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }

  const q = parsed.data;
  const { items } = await listListingBrands({
    q: q.q,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    is_active: 1,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });

  return reply.send(items);
};
