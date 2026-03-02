import type { FastifyInstance } from 'fastify';
import {
  createListingBrandAdmin,
  getListingBrandAdmin,
  listListingBrandsAdmin,
  removeListingBrandAdmin,
  updateListingBrandAdmin,
} from './admin.controller';

const BASE = '/listing-brands';

export async function registerListingBrandsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { auth: true } }, listListingBrandsAdmin);
  app.get(`${BASE}/:id`, { config: { auth: true } }, getListingBrandAdmin);
  app.post(`${BASE}`, { config: { auth: true } }, createListingBrandAdmin);
  app.patch(`${BASE}/:id`, { config: { auth: true } }, updateListingBrandAdmin);
  app.delete(`${BASE}/:id`, { config: { auth: true } }, removeListingBrandAdmin);
}
