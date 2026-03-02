import type { FastifyInstance } from 'fastify';
import { makeAdminPermissionGuard } from '@/common/middleware/permissions';
import { adminDashboardSummary } from './admin.controller';

export async function registerDashboardAdmin(app: FastifyInstance) {
  const guard = makeAdminPermissionGuard('admin.dashboard');
  app.get('/dashboard/summary', { preHandler: guard }, adminDashboardSummary);
}
