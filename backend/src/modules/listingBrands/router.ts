import type { FastifyInstance } from 'fastify';
import { listListingBrandsPublic } from './controller';

const BASE = '/listing-brands';

export async function registerListingBrands(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { public: true } }, listListingBrandsPublic);
}
