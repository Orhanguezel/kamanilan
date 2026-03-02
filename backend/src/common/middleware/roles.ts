import type { FastifyReply, FastifyRequest } from 'fastify';

export type AppRole = 'admin' | 'moderator' | 'seller' | 'user';

function getRoleBag(req: FastifyRequest): { role?: string; roles: string[]; isAdmin: boolean } {
  const user = (req as any)?.user ?? {};
  return {
    role: typeof user?.role === 'string' ? user.role : undefined,
    roles: Array.isArray(user?.roles) ? user.roles : [],
    isAdmin: user?.is_admin === true,
  };
}

export function hasAnyRole(req: FastifyRequest, allowed: AppRole[]): boolean {
  const bag = getRoleBag(req);
  if (bag.isAdmin && allowed.includes('admin')) return true;
  if (bag.role && allowed.includes(bag.role as AppRole)) return true;
  return bag.roles.some((r: string) => allowed.includes(r as AppRole));
}

export async function requireRoles(
  req: FastifyRequest,
  reply: FastifyReply,
  allowed: AppRole[],
) {
  if (hasAnyRole(req, allowed)) return;
  reply.code(403).send({ error: { message: 'forbidden' } });
  return;
}

/** Basit rol kontrolü; JWT payload içindeki `role` alanını bekler. */
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  return requireRoles(req, reply, ['admin']);
}

/** Seller veya admin erişimine izin verir. */
export async function requireSellerOrAdmin(req: FastifyRequest, reply: FastifyReply) {
  return requireRoles(req, reply, ['admin', 'seller']);
}
