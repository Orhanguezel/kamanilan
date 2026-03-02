import type { FastifyInstance } from 'fastify';
import {
  createUnitAdmin,
  getUnitAdmin,
  listUnitsAdmin,
  removeUnitAdmin,
  updateUnitAdmin,
} from './admin.controller';

const BASE = '/units';

export async function registerUnitsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { auth: true } }, listUnitsAdmin);
  app.get(`${BASE}/:id`, { config: { auth: true } }, getUnitAdmin);
  app.post(`${BASE}`, { config: { auth: true } }, createUnitAdmin);
  app.patch(`${BASE}/:id`, { config: { auth: true } }, updateUnitAdmin);
  app.delete(`${BASE}/:id`, { config: { auth: true } }, removeUnitAdmin);
}

