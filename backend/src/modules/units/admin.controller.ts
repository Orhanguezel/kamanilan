import { randomUUID } from 'node:crypto';
import type { RouteHandler } from 'fastify';
import { createUnit, deleteUnit, getUnitById, listUnits, updateUnit } from './repository';
import {
  unitCreateSchema,
  unitListQuerySchema,
  unitPatchSchema,
  type UnitCreateBody,
  type UnitListQuery,
  type UnitPatchBody,
} from './validation';

const toBool = (v: unknown): boolean => v === true || v === 1 || v === '1';

export const listUnitsAdmin: RouteHandler<{ Querystring: UnitListQuery }> = async (req, reply) => {
  const parsed = unitListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }
  const q = parsed.data;
  const { items, total } = await listUnits({
    q: q.q,
    type: q.type,
    is_active: q.is_active as any,
    sort: q.sort,
    order: q.order,
    limit: q.limit,
    offset: q.offset,
  });
  reply.header('x-total-count', String(total));
  return reply.send(items);
};

export const getUnitAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getUnitById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const createUnitAdmin: RouteHandler<{ Body: UnitCreateBody }> = async (req, reply) => {
  const parsed = unitCreateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;
  try {
    const row = await createUnit({
      id: randomUUID(),
      name: b.name.trim(),
      slug: b.slug.trim(),
      symbol: b.symbol.trim(),
      type: b.type.trim(),
      precision: b.precision,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order: b.display_order,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    req.log.error({ err }, 'units_create_failed');
    return reply.code(500).send({ error: { message: 'units_create_failed' } });
  }
};

export const updateUnitAdmin: RouteHandler<{ Params: { id: string }; Body: UnitPatchBody }> = async (req, reply) => {
  const parsed = unitPatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;
  try {
    const row = await updateUnit(req.params.id, {
      ...(typeof b.name !== 'undefined' ? { name: b.name.trim() } : {}),
      ...(typeof b.slug !== 'undefined' ? { slug: b.slug.trim() } : {}),
      ...(typeof b.symbol !== 'undefined' ? { symbol: b.symbol.trim() } : {}),
      ...(typeof b.type !== 'undefined' ? { type: b.type.trim() } : {}),
      ...(typeof b.precision !== 'undefined' ? { precision: b.precision } : {}),
      ...(typeof b.is_active !== 'undefined' ? { is_active: toBool(b.is_active) ? 1 : 0 } : {}),
      ...(typeof b.display_order !== 'undefined' ? { display_order: b.display_order } : {}),
    });
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    req.log.error({ err }, 'units_update_failed');
    return reply.code(500).send({ error: { message: 'units_update_failed' } });
  }
};

export const removeUnitAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const affected = await deleteUnit(req.params.id);
    if (!affected) return reply.code(404).send({ error: { message: 'not_found' } });
    return reply.code(204).send();
  } catch (err: any) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') return reply.code(409).send({ error: { message: 'unit_in_use' } });
    req.log.error({ err }, 'units_delete_failed');
    return reply.code(500).send({ error: { message: 'units_delete_failed' } });
  }
};

