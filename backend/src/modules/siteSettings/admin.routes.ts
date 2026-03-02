// src/modules/site_settings/admin.routes.ts
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@/common/middleware/auth';
import {
  adminListSiteSettings,
  adminGetSiteSettingByKey,
  adminGetAppLocales,
  adminGetDefaultLocale,
  adminCreateSiteSetting,
  adminUpdateSiteSetting,
  adminBulkUpsertSiteSettings,
  adminDeleteManySiteSettings,
  adminDeleteSiteSetting,
} from './admin.controller';

const BASE = '/site_settings';

export async function registerSiteSettingsAdmin(app: FastifyInstance) {
  app.get(`${BASE}`,                 { preHandler: [requireAuth] }, adminListSiteSettings);
  app.get(`${BASE}/list`,            { preHandler: [requireAuth] }, adminListSiteSettings);
  app.get(`${BASE}/app-locales`,     { preHandler: [requireAuth] }, adminGetAppLocales);
  app.get(`${BASE}/default-locale`,  { preHandler: [requireAuth] }, adminGetDefaultLocale);
  app.get(`${BASE}/:key`,            { preHandler: [requireAuth] }, adminGetSiteSettingByKey);

  app.post(`${BASE}`,          { preHandler: [requireAuth] }, adminCreateSiteSetting);
  app.put(`${BASE}/:key`,      { preHandler: [requireAuth] }, adminUpdateSiteSetting);

  // 🔥 BULK UPSERT tam burada:
  app.post(`${BASE}/bulk-upsert`, { preHandler: [requireAuth] }, adminBulkUpsertSiteSettings);

  app.delete(`${BASE}`,        { preHandler: [requireAuth] }, adminDeleteManySiteSettings);
  app.delete(`${BASE}/:key`,   { preHandler: [requireAuth] }, adminDeleteSiteSetting);
}
