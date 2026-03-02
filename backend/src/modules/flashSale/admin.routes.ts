import type { FastifyInstance } from 'fastify';
import { makeAdminPermissionGuard } from '@/common/middleware/permissions';
import {
  createFlashSaleAdmin,
  getFlashSaleAdmin,
  getFlashSaleBySlugAdmin,
  listFlashSalesAdmin,
  removeFlashSaleAdmin,
  updateFlashSaleAdmin,
} from './admin.controller';

const BASE = '/flash-sale';

export async function registerFlashSaleAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard('admin.flash_sale') as any;
  app.get(`${BASE}`, { preHandler: guard }, listFlashSalesAdmin);
  app.get(`${BASE}/:id`, { preHandler: guard }, getFlashSaleAdmin);
  app.get(`${BASE}/by-slug/:slug`, { preHandler: guard }, getFlashSaleBySlugAdmin);
  app.post(`${BASE}`, { preHandler: guard }, createFlashSaleAdmin);
  app.patch(`${BASE}/:id`, { preHandler: guard }, updateFlashSaleAdmin);
  app.delete(`${BASE}/:id`, { preHandler: guard }, removeFlashSaleAdmin);
}
