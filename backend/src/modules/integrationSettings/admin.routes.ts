import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@vps/shared-backend/middleware/auth';
import {
  adminDeleteIntegrationSettingsByProvider,
  adminGetIntegrationSettingsByProvider,
  adminListIntegrationSettings,
  adminUpsertIntegrationSettings,
} from './admin.controller';

const BASE = '/integration-settings';

export async function registerIntegrationSettingsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`, { preHandler: [requireAuth] }, adminListIntegrationSettings);
  app.get(`${BASE}/:provider`, { preHandler: [requireAuth] }, adminGetIntegrationSettingsByProvider);
  app.put(`${BASE}/:provider`, { preHandler: [requireAuth] }, adminUpsertIntegrationSettings);
  app.delete(`${BASE}/:provider`, { preHandler: [requireAuth] }, adminDeleteIntegrationSettingsByProvider);
}
