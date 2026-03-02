import { randomUUID } from 'node:crypto';
import type { RouteHandler } from 'fastify';
import { createVariant, deleteVariant, getVariantById, listVariants, updateVariant } from './repository';
import {
  variantCreateSchema,
  variantListQuerySchema,
  variantPatchSchema,
  type VariantCreateBody,
  type VariantListQuery,
  type VariantPatchBody,
} from './validation';

const toBool = (v: unknown): boolean => v === true || v === 1 || v === '1';

export const listVariantsAdmin: RouteHandler<{ Querystring: VariantListQuery }> = async (req, reply) => {
  const parsed = variantListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }
  const q = parsed.data;
  const { items, total } = await listVariants({
    q: q.q,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    unit_id: q.unit_id,
    value_type: q.value_type,
    is_active: q.is_active as any,
    is_filterable: q.is_filterable as any,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });
  reply.header('x-total-count', String(total));
  return reply.send(items);
};

export const getVariantAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getVariantById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const createVariantAdmin: RouteHandler<{ Body: VariantCreateBody }> = async (req, reply) => {
  const parsed = variantCreateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;
  try {
    const row = await createVariant({
      id: randomUUID(),
      name: b.name.trim(),
      slug: b.slug.trim(),
      description: b.description ?? null,
      value_type: b.value_type,
      category_id: b.category_id,
      sub_category_id: b.sub_category_id ?? null,
      unit_id: b.unit_id ?? null,
      options_json: b.options_json ?? null,
      is_required: toBool(b.is_required) ? 1 : 0,
      is_filterable: toBool(b.is_filterable) ? 1 : 0,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order: b.display_order,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return reply.code(400).send({ error: { message: 'invalid_relation_id' } });
    req.log.error({ err }, 'variants_create_failed');
    return reply.code(500).send({ error: { message: 'variants_create_failed' } });
  }
};

export const updateVariantAdmin: RouteHandler<{ Params: { id: string }; Body: VariantPatchBody }> = async (req, reply) => {
  const parsed = variantPatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;
  try {
    const row = await updateVariant(req.params.id, {
      ...(typeof b.name !== 'undefined' ? { name: b.name.trim() } : {}),
      ...(typeof b.slug !== 'undefined' ? { slug: b.slug.trim() } : {}),
      ...(typeof b.description !== 'undefined' ? { description: b.description ?? null } : {}),
      ...(typeof b.value_type !== 'undefined' ? { value_type: b.value_type } : {}),
      ...(typeof b.category_id !== 'undefined' ? { category_id: b.category_id } : {}),
      ...(typeof b.sub_category_id !== 'undefined' ? { sub_category_id: b.sub_category_id ?? null } : {}),
      ...(typeof b.unit_id !== 'undefined' ? { unit_id: b.unit_id ?? null } : {}),
      ...(typeof b.options_json !== 'undefined' ? { options_json: b.options_json ?? null } : {}),
      ...(typeof b.is_required !== 'undefined' ? { is_required: toBool(b.is_required) ? 1 : 0 } : {}),
      ...(typeof b.is_filterable !== 'undefined' ? { is_filterable: toBool(b.is_filterable) ? 1 : 0 } : {}),
      ...(typeof b.is_active !== 'undefined' ? { is_active: toBool(b.is_active) ? 1 : 0 } : {}),
      ...(typeof b.display_order !== 'undefined' ? { display_order: b.display_order } : {}),
    });
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return reply.code(400).send({ error: { message: 'invalid_relation_id' } });
    req.log.error({ err }, 'variants_update_failed');
    return reply.code(500).send({ error: { message: 'variants_update_failed' } });
  }
};

export const removeVariantAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const affected = await deleteVariant(req.params.id);
    if (!affected) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.code(204).send();
  } catch (err: any) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') return reply.code(409).send({ error: { message: 'variant_in_use' } });
    req.log.error({ err }, 'variants_delete_failed');
    return reply.code(500).send({ error: { message: 'variants_delete_failed' } });
  }
};

