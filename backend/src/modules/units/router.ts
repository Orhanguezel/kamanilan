import type { FastifyInstance } from 'fastify';
import { listUnitsPublic } from './controller';

const BASE = '/units';

export async function registerUnits(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { public: true } }, listUnitsPublic);
}

