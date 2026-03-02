import type { FastifyInstance } from 'fastify';
import {
  createListingTagAdmin,
  getListingTagAdmin,
  listListingTagsAdmin,
  removeListingTagAdmin,
  updateListingTagAdmin,
} from './admin.controller';

const BASE = '/listing-tags';

export async function registerListingTagsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { auth: true } }, listListingTagsAdmin);
  app.get(`${BASE}/:id`, { config: { auth: true } }, getListingTagAdmin);
  app.post(`${BASE}`, { config: { auth: true } }, createListingTagAdmin);
  app.patch(`${BASE}/:id`, { config: { auth: true } }, updateListingTagAdmin);
  app.delete(`${BASE}/:id`, { config: { auth: true } }, removeListingTagAdmin);
}
