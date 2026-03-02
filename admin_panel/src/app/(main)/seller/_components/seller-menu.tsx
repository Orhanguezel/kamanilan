'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Store, Megaphone, UserCircle2, Users } from 'lucide-react';

import { useStatusQuery } from '@/integrations/hooks';
import type { AuthStatusResponse } from '@/integrations/shared';
import { normalizeMeFromStatus } from '@/integrations/shared';
import { cn } from '@/lib/utils';
import { getSellerMenuRoles } from '@/navigation/permissions';
import type { SellerMenuKey } from '@/navigation/permissions';
import type { PanelRole } from '@/navigation/permissions';

type SellerMenuItem = {
  key: SellerMenuKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MENU_ITEMS: SellerMenuItem[] = [
  { key: 'dashboard', label: 'Panel', href: '/seller', icon: Store },
  { key: 'store', label: 'Magaza Ayarlari', href: '/seller/store', icon: Store },
  { key: 'campaigns', label: 'Kampanyalar', href: '/seller/campaigns', icon: Megaphone },
  { key: 'profile', label: 'Profil', href: '/seller/profile', icon: UserCircle2 },
  { key: 'admin_sellers', label: 'Satici Listesi (Admin)', href: '/admin/sellers', icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === '/seller') return pathname === '/seller';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SellerMenu() {
  const pathname = usePathname();
  const statusQ = useStatusQuery();
  const me = normalizeMeFromStatus(statusQ.data as AuthStatusResponse | undefined);
  const role: PanelRole = me?.isAdmin ? 'admin' : 'seller';

  const items = MENU_ITEMS.filter((it) => {
    const allowed = getSellerMenuRoles(it.key);
    if (!allowed?.length) return role === 'admin';
    return allowed.includes(role);
  });

  return (
    <aside className="rounded-xl border bg-card p-3">
      <div className="px-2 pb-2 font-semibold text-sm">Satici Menu</div>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              prefetch={false}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
