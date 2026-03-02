import type { FastifyInstance } from 'fastify';
import {
  createVariantAdmin,
  getVariantAdmin,
  listVariantsAdmin,
  removeVariantAdmin,
  updateVariantAdmin,
} from './admin.controller';

const BASE = '/variants';

export async function registerVariantsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { auth: true } }, listVariantsAdmin);
  app.get(`${BASE}/:id`, { config: { auth: true } }, getVariantAdmin);
  app.post(`${BASE}`, { config: { auth: true } }, createVariantAdmin);
  app.patch(`${BASE}/:id`, { config: { auth: true } }, updateVariantAdmin);
  app.delete(`${BASE}/:id`, { config: { auth: true } }, removeVariantAdmin);
}

