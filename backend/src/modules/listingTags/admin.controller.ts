import { randomUUID } from 'node:crypto';
import type { RouteHandler } from 'fastify';
import {
  createListingTag,
  deleteListingTag,
  getListingTagById,
  listListingTags,
  updateListingTag,
} from './repository';
import {
  listingTagCreateSchema,
  listingTagListQuerySchema,
  listingTagPatchSchema,
  type ListingTagCreateBody,
  type ListingTagListQuery,
  type ListingTagPatchBody,
} from './validation';

const toBool = (v: unknown): boolean => v === true || v === 1 || v === '1';

export const listListingTagsAdmin: RouteHandler<{ Querystring: ListingTagListQuery }> = async (req, reply) => {
  const parsed = listingTagListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }

  const q = parsed.data;
  const { items, total } = await listListingTags({
    q: q.q,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    is_active: q.is_active as any,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });

  reply.header('x-total-count', String(total));
  return reply.send(items);
};

export const getListingTagAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getListingTagById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const createListingTagAdmin: RouteHandler<{ Body: ListingTagCreateBody }> = async (req, reply) => {
  const parsed = listingTagCreateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }

  const b = parsed.data;
  try {
    const row = await createListingTag({
      id: randomUUID(),
      name: b.name.trim(),
      slug: b.slug.trim(),
      description: b.description ?? null,
      category_id: b.category_id,
      sub_category_id: b.sub_category_id ?? null,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order: b.display_order,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return reply.code(400).send({ error: { message: 'invalid_relation_id' } });
    req.log.error({ err }, 'listing_tags_create_failed');
    return reply.code(500).send({ error: { message: 'listing_tags_create_failed' } });
  }
};

export const updateListingTagAdmin: RouteHandler<{ Params: { id: string }; Body: ListingTagPatchBody }> = async (req, reply) => {
  const parsed = listingTagPatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }

  const b = parsed.data;
  try {
    const row = await updateListingTag(req.params.id, {
      ...(typeof b.name !== 'undefined' ? { name: b.name.trim() } : {}),
      ...(typeof b.slug !== 'undefined' ? { slug: b.slug.trim() } : {}),
      ...(typeof b.description !== 'undefined' ? { description: b.description ?? null } : {}),
      ...(typeof b.category_id !== 'undefined' ? { category_id: b.category_id } : {}),
      ...(typeof b.sub_category_id !== 'undefined' ? { sub_category_id: b.sub_category_id ?? null } : {}),
      ...(typeof b.is_active !== 'undefined' ? { is_active: toBool(b.is_active) ? 1 : 0 } : {}),
      ...(typeof b.display_order !== 'undefined' ? { display_order: b.display_order } : {}),
    });

    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return reply.code(400).send({ error: { message: 'invalid_relation_id' } });
    req.log.error({ err }, 'listing_tags_update_failed');
    return reply.code(500).send({ error: { message: 'listing_tags_update_failed' } });
  }
};

export const removeListingTagAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const affected = await deleteListingTag(req.params.id);
    if (!affected) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.code(204).send();
  } catch (err: any) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') return reply.code(409).send({ error: { message: 'tag_in_use' } });
    req.log.error({ err }, 'listing_tags_delete_failed');
    return reply.code(500).send({ error: { message: 'listing_tags_delete_failed' } });
  }
};
