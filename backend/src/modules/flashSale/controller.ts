import type { RouteHandler } from 'fastify';
import { flashSaleListQuerySchema, type FlashSaleListQuery } from './validation';
import { getFlashSaleById, getFlashSaleBySlug, getActiveFlashSaleWithListings, listFlashSales } from './repository';

export const listFlashSalesPublic: RouteHandler<{ Querystring: FlashSaleListQuery }> = async (req, reply) => {
  const parsed = flashSaleListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: 'invalid_query', issues: parsed.error.issues } });
  }

  const q = parsed.data;
  const parsedIds = q.ids
    ? q.ids.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0)
    : undefined;
  const { items, total } = await listFlashSales({
    orderParam: typeof q.order === 'string' ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    q: q.q,
    slug: q.slug,
    locale: q.locale ?? 'tr',
    is_active: true,
    active_now: typeof q.active_now === 'undefined' ? true : q.active_now,
    ids: parsedIds?.length ? parsedIds : undefined,
  });

  reply.header('x-total-count', String(total ?? 0));
  return reply.send(items);
};

export const getFlashSalePublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getFlashSaleById(req.params.id);
  if (!row || !row.is_active) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

export const getFlashSaleBySlugPublic: RouteHandler<{ Params: { slug: string }; Querystring: { locale?: string } }> = async (
  req,
  reply,
) => {
  const locale = req.query?.locale?.trim() || 'tr';
  const row = await getFlashSaleBySlug(req.params.slug, locale);
  if (!row || !row.is_active) return reply.code(404).send({ error: { message: 'not_found' } });
  return reply.send(row);
};

/** GET /flash-sale/active-with-listings?limit=5
 *  Ana sayfa flash sale section için: aktif kampanya + kapsama giren ilanlar */
export const getActiveFlashSaleWithListingsPublic: RouteHandler<{ Querystring: { limit?: string } }> = async (
  req,
  reply,
) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query?.limit ?? '5', 10) || 5));
    const result = await getActiveFlashSaleWithListings(limit);
    if (!result) return reply.send(null);
    return reply.send(result);
  } catch (err) {
    req.log.error({ err }, 'flash_sale_active_with_listings_failed');
    return reply.code(500).send({ error: { message: 'flash_sale_active_with_listings_failed' } });
  }
};
