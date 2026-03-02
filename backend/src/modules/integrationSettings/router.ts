import type { FastifyInstance } from 'fastify';
import {
  getPublicIntegrationByProvider,
  listPublicIntegrations,
} from './controller';

const BASE = '/integration-settings';

export async function registerIntegrationSettings(app: FastifyInstance) {
  app.get(`${BASE}`, { config: { public: true } }, listPublicIntegrations);
  app.get(`${BASE}/:provider`, { config: { public: true } }, getPublicIntegrationByProvider);
}
