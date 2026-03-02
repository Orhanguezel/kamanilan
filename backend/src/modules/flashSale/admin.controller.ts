import { randomUUID } from 'node:crypto';
import type { RouteHandler } from 'fastify';
import {
  flashSaleListQuerySchema,
  flashSalePatchSchema,
  flashSaleUpsertSchema,
  type FlashSaleListQuery,
  type FlashSalePatchBody,
  type FlashSaleUpsertBody,
} from './validation';
import {
  createFlashSale,
  deleteFlashSale,
  getFlashSaleById,
  getFlashSaleBySlug,
  listFlashSales,
  replaceFlashSaleScope,
  updateFlashSale,
} from './repository';
import type { FlashSaleScopeType } from './schema';

const toBool = (v: unknown): boolean => v === true || v === 1 || v === '1' || v === 'true';

const toNullStr = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : null;

export const listFlashSalesAdmin: RouteHandler<{ Querystring: FlashSaleListQuery }> = async (req, reply) => {
  const parsed = flashSaleListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }
  const q = parsed.data;

  const { items, total } = await listFlashSales({
    orderParam: typeof q.order === 'string' ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_active: q.is_active,
    active_now: q.active_now,
    q: q.q,
    slug: q.slug,
    locale: q.locale,
  });

  reply.header('x-total-count', String(total ?? 0));
  return reply.send(items);
};

export const getFlashSaleAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getFlashSaleById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const getFlashSaleBySlugAdmin: RouteHandler<{ Params: { slug: string }; Querystring: { locale?: string } }> = async (
  req,
  reply,
) => {
  const locale = req.query?.locale?.trim() || 'tr';
  const row = await getFlashSaleBySlug(req.params.slug, locale);
  if (!row) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const createFlashSaleAdmin: RouteHandler<{ Body: FlashSaleUpsertBody }> = async (req, reply) => {
  const parsed = flashSaleUpsertSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;

  try {
    const id = randomUUID();
    const row = await createFlashSale({
      id,
      title: b.title.trim(),
      slug: b.slug.trim(),
      locale: (b.locale ?? 'tr').trim(),
      description: typeof b.description === 'string' ? b.description : null,
      discount_type: b.discount_type,
      discount_value: b.discount_value.toFixed(2),
      start_at: b.start_at,
      end_at: b.end_at,
      is_active: toBool(b.is_active) ? 1 : 0,
      scope_type: b.scope_type ?? 'all',
      cover_image_url: toNullStr(b.cover_image_url),
      cover_asset_id: toNullStr(b.cover_asset_id),
      background_color: toNullStr(b.background_color),
      title_color: toNullStr(b.title_color),
      description_color: toNullStr(b.description_color),
      button_text: toNullStr(b.button_text),
      button_url: toNullStr(b.button_url),
      button_bg_color: toNullStr(b.button_bg_color),
      button_text_color: toNullStr(b.button_text_color),
      timer_bg_color: toNullStr(b.timer_bg_color),
      timer_text_color: toNullStr(b.timer_text_color),
      display_order: typeof b.display_order === 'number' ? b.display_order : 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Scope kaydet
    await replaceFlashSaleScope(id, (b.scope_type ?? 'all') as FlashSaleScopeType, b.scope_ids ?? []);

    return reply.code(201).send(row);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    req.log.error({ err }, 'flash_sale_create_failed');
    return reply.code(500).send({ error: { message: 'flash_sale_create_failed' } });
  }
};

export const updateFlashSaleAdmin: RouteHandler<{ Params: { id: string }; Body: FlashSalePatchBody }> = async (req, reply) => {
  const parsed = flashSalePatchSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_body', issues: parsed.error.issues } });
  }
  const b = parsed.data;

  try {
    const patch: Record<string, unknown> = {};
    if (typeof b.title === 'string') patch.title = b.title.trim();
    if (typeof b.slug === 'string') patch.slug = b.slug.trim();
    if (typeof b.locale === 'string') patch.locale = b.locale.trim();
    if (typeof b.description !== 'undefined') patch.description = b.description ?? null;
    if (b.discount_type) patch.discount_type = b.discount_type;
    if (typeof b.discount_value === 'number') patch.discount_value = b.discount_value.toFixed(2);
    if (b.start_at) patch.start_at = b.start_at;
    if (b.end_at) patch.end_at = b.end_at;
    if (typeof b.is_active !== 'undefined') patch.is_active = toBool(b.is_active) ? 1 : 0;
    if (b.scope_type) patch.scope_type = b.scope_type;
    if (typeof b.display_order === 'number') patch.display_order = b.display_order;

    // Görsel alanlar
    if (typeof b.cover_image_url !== 'undefined') patch.cover_image_url = toNullStr(b.cover_image_url);
    if (typeof b.cover_asset_id !== 'undefined') patch.cover_asset_id = toNullStr(b.cover_asset_id);
    if (typeof b.background_color !== 'undefined') patch.background_color = toNullStr(b.background_color);
    if (typeof b.title_color !== 'undefined') patch.title_color = toNullStr(b.title_color);
    if (typeof b.description_color !== 'undefined') patch.description_color = toNullStr(b.description_color);
    if (typeof b.button_text !== 'undefined') patch.button_text = toNullStr(b.button_text);
    if (typeof b.button_url !== 'undefined') patch.button_url = toNullStr(b.button_url);
    if (typeof b.button_bg_color !== 'undefined') patch.button_bg_color = toNullStr(b.button_bg_color);
    if (typeof b.button_text_color !== 'undefined') patch.button_text_color = toNullStr(b.button_text_color);
    if (typeof b.timer_bg_color !== 'undefined') patch.timer_bg_color = toNullStr(b.timer_bg_color);
    if (typeof b.timer_text_color !== 'undefined') patch.timer_text_color = toNullStr(b.timer_text_color);

    const row = await updateFlashSale(req.params.id, patch as any);
    if (!row) return reply.code(404).send({ error: { message: 'not_found' } });

    // Scope güncelle
    if (b.scope_type || typeof b.scope_ids !== 'undefined') {
      const currentScope = b.scope_type ?? (row.scope_type as FlashSaleScopeType);
      await replaceFlashSaleScope(req.params.id, currentScope as FlashSaleScopeType, b.scope_ids ?? []);
    }

    return reply.send(row);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === 'ER_DUP_ENTRY') return reply.code(409).send({ error: { message: 'slug_already_exists' } });
    req.log.error({ err }, 'flash_sale_update_failed');
    return reply.code(500).send({ error: { message: 'flash_sale_update_failed' } });
  }
};

export const removeFlashSaleAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const affected = await deleteFlashSale(req.params.id);
  if (!affected) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.code(204).send();
};
