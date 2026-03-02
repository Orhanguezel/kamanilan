import type { FastifyInstance } from 'fastify';
import { listListingTagsPublic } from './controller';

const BASE = '/listing-tags';

export async function registerListingTags(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { public: true } }, listListingTagsPublic);
}
