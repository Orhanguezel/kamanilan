import type { RouteHandler } from 'fastify';
import { listListingTags } from './repository';
import { listingTagListQuerySchema, type ListingTagListQuery } from './validation';

export const listListingTagsPublic: RouteHandler<{ Querystring: ListingTagListQuery }> = async (req, reply) => {
  const parsed = listingTagListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }

  const q = parsed.data;
  const { items } = await listListingTags({
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
