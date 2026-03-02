import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@/common/middleware/auth';
import { adminGetTheme, adminUpdateTheme, adminResetTheme } from './admin.controller';
import type { ThemeUpdateInput } from './validation';

export async function registerThemeAdmin(app: FastifyInstance) {
  const BASE = '/theme';

  // GET /api/admin/theme — mevcut tema
  app.get(BASE, { preHandler: [requireAuth] }, adminGetTheme);

  // PUT /api/admin/theme — partial update (deep merge)
  app.put<{ Body: ThemeUpdateInput }>(
    BASE,
    { preHandler: [requireAuth] },
    adminUpdateTheme,
  );

  // POST /api/admin/theme/reset — varsayılana sıfırla
  app.post(`${BASE}/reset`, { preHandler: [requireAuth] }, adminResetTheme);
}
