import type { FastifyInstance } from 'fastify';
import { listVariantsPublic } from './controller';

const BASE = '/variants';

export async function registerVariants(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { public: true } }, listVariantsPublic);
}

