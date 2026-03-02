import type { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from './auth';
import { hasAnyRole } from './roles';
import type { AppRole } from './roles';

export type AdminPermissionKey =
  | 'admin.dashboard'
  | 'admin.properties'
  | 'admin.flash_sale'
  | 'admin.contacts'
  | 'admin.reviews';

const ADMIN_ONLY: AppRole[] = ['admin'];
const ADMIN_AND_SELLER: AppRole[] = ['admin', 'seller'];

const ADMIN_PERMISSION_MAP: Record<AdminPermissionKey, AppRole[]> = {
  'admin.dashboard': ADMIN_AND_SELLER,
  'admin.properties': ADMIN_AND_SELLER,
  'admin.flash_sale': ADMIN_AND_SELLER,
  'admin.contacts': ADMIN_AND_SELLER,
  'admin.reviews': ADMIN_AND_SELLER,
};

export function canAccessAdminPermission(
  req: FastifyRequest,
  key: AdminPermissionKey,
): boolean {
  const allowed = ADMIN_PERMISSION_MAP[key] ?? ADMIN_ONLY;
  return hasAnyRole(req, allowed);
}

export async function requireAdminPermission(
  req: FastifyRequest,
  reply: FastifyReply,
  key: AdminPermissionKey,
) {
  if (canAccessAdminPermission(req, key)) return;
  reply.code(403).send({ error: { message: 'forbidden' } });
  return;
}

export function makeAdminPermissionGuard(key: AdminPermissionKey) {
  return async function adminPermissionGuard(req: FastifyRequest, reply: FastifyReply) {
    await requireAuth(req, reply);
    if (reply.sent) return;
    await requireAdminPermission(req, reply, key);
  };
}

