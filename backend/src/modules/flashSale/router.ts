import type { FastifyInstance } from 'fastify';
import {
  getFlashSaleBySlugPublic,
  getFlashSalePublic,
  getActiveFlashSaleWithListingsPublic,
  listFlashSalesPublic,
} from './controller';

const BASE = '/flash-sale';

export async function registerFlashSale(app: FastifyInstance) {
  app.get(`${BASE}`,                        { config: { public: true } }, listFlashSalesPublic);
  app.get(`${BASE}/active-with-listings`,   { config: { public: true } }, getActiveFlashSaleWithListingsPublic);
  app.get(`${BASE}/by-slug/:slug`,          { config: { public: true } }, getFlashSaleBySlugPublic);
  app.get(`${BASE}/:id`,                    { config: { public: true } }, getFlashSalePublic);
}
