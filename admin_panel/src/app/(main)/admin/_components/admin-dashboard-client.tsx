'use client';

// =============================================================
// FILE: src/app/(main)/admin/_components/admin-dashboard-client.tsx
// Admin Dashboard Client (summary cards)
// - GET /admin/dashboard/summary → { items: [{ key, label, count }] }
// - Labels: nav copy > page copy > API label > key fallback
// - Cards link to their respective admin pages
// =============================================================

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetDashboardSummaryAdminQuery } from '@/integrations/hooks';
import { useStatusQuery } from '@/integrations/hooks';
import type { DashboardSummaryItem } from '@/integrations/shared';
import type { AuthStatusResponse } from '@/integrations/shared';
import { normalizeMeFromStatus } from '@/integrations/shared';

import { useAdminUiCopy } from '@/app/(main)/admin/_components/common/useAdminUiCopy';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { useAdminSettings } from './admin-settings-provider';
import { canAccessAdminPermission } from '@/navigation/permissions';
import type { AdminPermissionKey } from '@/navigation/permissions';
import type { PanelRole } from '@/navigation/permissions';

// dashboard key → admin route
// Keys must match backend GET /admin/dashboard/summary response
const ROUTE_MAP: Record<string, string> = {
  products: '/admin/ilanlar',
  categories: '/admin/categories',
  subcategories: '/admin/subcategories',
  services: '/admin/services',
  faqs: '/admin/faqs',
  contacts: '/admin/contacts',
  newsletter: '/admin/newsletter',
  email_templates: '/admin/email-templates',
  site_settings: '/admin/site-settings',
  theme_management: '/admin/theme',
  custom_pages: '/admin/custompage',
  menu_items: '/admin/menuitem',
  sliders: '/admin/slider',
  footer_sections: '/admin/footer-sections',
  library: '/admin/library',
  reviews: '/admin/reviews',
  support: '/admin/support',
  users: '/admin/users',
  sellers: '/admin/sellers',
  offers: '/admin/offer',
  storage: '/admin/storage',
  references: '/admin/references',
  catalog_requests: '/admin/catalog',
  audit: '/admin/audit',
  db: '/admin/db',
  chat: '/admin/chat',
  telegram: '/admin/telegram',
};

const SUMMARY_PERMISSION_MAP: Partial<Record<string, AdminPermissionKey>> = {
  products: 'admin.properties',
  flash_sale: 'admin.flash_sale',
  contacts: 'admin.contacts',
  reviews: 'admin.reviews',
};

type ModuleScope = 'admin' | 'seller' | 'both';
type DashboardModule = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  scope: ModuleScope;
  permission?: AdminPermissionKey;
};

const DASHBOARD_MODULES: DashboardModule[] = [
  {
    key: 'products',
    title: 'Ilanlar',
    subtitle: 'Ilanlarinizi yonetin',
    href: '/admin/ilanlar',
    scope: 'both',
    permission: 'admin.properties',
  },
  {
    key: 'flash_sale',
    title: 'Kampanyalar',
    subtitle: 'Aktif kampanyalari duzenleyin',
    href: '/admin/flash-sale',
    scope: 'both',
    permission: 'admin.flash_sale',
  },
  {
    key: 'contacts',
    title: 'Iletisim Mesajlari',
    subtitle: 'Gelen mesajlari cevaplayin',
    href: '/admin/contacts',
    scope: 'both',
    permission: 'admin.contacts',
  },
  {
    key: 'reviews',
    title: 'Yorumlar',
    subtitle: 'Yorum onaylama ve duzenleme',
    href: '/admin/reviews',
    scope: 'both',
    permission: 'admin.reviews',
  },
  {
    key: 'seller_store',
    title: 'Magaza Ayarlari',
    subtitle: 'Satici magazanizi guncelleyin',
    href: '/seller/store',
    scope: 'seller',
  },
  {
    key: 'seller_campaigns',
    title: 'Seller Kampanyalari',
    subtitle: 'Kendi kampanyalarinizi yonetin',
    href: '/seller/campaigns',
    scope: 'seller',
  },
  {
    key: 'users',
    title: 'Kullanicilar',
    subtitle: 'Kullanici hesap ve roller',
    href: '/admin/users',
    scope: 'admin',
  },
  {
    key: 'site_settings',
    title: 'Site Ayarlari',
    subtitle: 'Global konfigurasyonlar',
    href: '/admin/site-settings',
    scope: 'admin',
  },
  {
    key: 'db',
    title: 'Veritabani',
    subtitle: 'Yedek ve geri yukleme',
    href: '/admin/db',
    scope: 'admin',
  },
];

function canSeeScope(role: PanelRole, scope: ModuleScope): boolean {
  if (scope === 'both') return true;
  if (scope === 'admin') return role === 'admin';
  return role === 'seller';
}

function getErrMessage(err: unknown): string {
  const anyErr = err as any;
  const m1 = anyErr?.data?.error?.message;
  if (typeof m1 === 'string' && m1.trim()) return m1;
  const m2 = anyErr?.data?.message;
  if (typeof m2 === 'string' && m2.trim()) return m2;
  const m3 = anyErr?.error;
  if (typeof m3 === 'string' && m3.trim()) return m3;
  return '';
}

export default function AdminDashboardClient() {
  const { copy } = useAdminUiCopy();
  const t = useAdminT();
  const page = copy.pages?.dashboard ?? {};

  const { pageMeta } = useAdminSettings();
  const dashboardMeta = pageMeta?.dashboard;

  const q = useGetDashboardSummaryAdminQuery();
  const statusQ = useStatusQuery();
  const me = normalizeMeFromStatus(statusQ.data as AuthStatusResponse | undefined);
  const role: PanelRole = me?.isAdmin ? 'admin' : 'seller';

  React.useEffect(() => {
    if (!q.isError) return;
    toast.error(getErrMessage(q.error) || copy.common?.states?.error || t('admin.common.error'));
  }, [q.isError, q.error, copy.common?.states?.error, t]);

  const items = React.useMemo(() => {
    let data = [...(q.data?.items ?? [])] as DashboardSummaryItem[];
    if (dashboardMeta?.metrics && Array.isArray(dashboardMeta.metrics) && dashboardMeta.metrics.length > 0) {
      const metricsSet = new Set(dashboardMeta.metrics);
      data.sort((a, b) => {
        const aIn = metricsSet.has(a.key) ? 0 : 1;
        const bIn = metricsSet.has(b.key) ? 0 : 1;
        return aIn - bIn;
      });
    }

    const nav = copy.nav?.items ?? ({} as Record<string, string>);

    return data
      .filter((item) => {
        const permission = SUMMARY_PERMISSION_MAP[item.key];
        if (!permission) return role === 'admin';
        return canAccessAdminPermission(role, permission);
      })
      .map((item) => ({
        ...item,
        label:
          (nav as Record<string, string>)[item.key] ||
          page[`label_${item.key}`] ||
          page[item.key] ||
          t(`admin.dashboard.items.${item.key}` as any) ||
          item.label ||
          item.key.replace(/_/g, ' '),
        href: ROUTE_MAP[item.key] ?? null,
      }));
  }, [q.data, copy.nav?.items, page, t, dashboardMeta, role]);

  const modules = React.useMemo(
    () =>
      DASHBOARD_MODULES.filter((m) => {
        if (!canSeeScope(role, m.scope)) return false;
        if (!m.permission) return true;
        return canAccessAdminPermission(role, m.permission);
      }),
    [role],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">
            {dashboardMeta?.title || page?.title || t('admin.dashboard.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {page?.subtitle || t('admin.dashboard.subtitle')}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => q.refetch()}
          disabled={q.isFetching}
        >
          <RefreshCcw className={`mr-2 size-4${q.isFetching ? ' animate-spin' : ''}`} />
          {copy.common?.actions?.refresh || t('admin.common.refresh')}
        </Button>
      </div>

      {/* Loading skeleton */}
      {q.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-2 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary cards */}
      {!q.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const card = (
              <Card className={item.href ? 'transition-colors hover:border-primary/50' : ''}>
                <CardHeader className="gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tabular-nums">{item.count}</div>
                </CardContent>
              </Card>
            );

            return item.href ? (
              <Link key={item.key} href={item.href} prefetch={false}>
                {card}
              </Link>
            ) : (
              <div key={item.key}>{card}</div>
            );
          })}

          {items.length === 0 && !q.isFetching && (
            <Card className="sm:col-span-2 xl:col-span-4">
              <CardContent className="py-6 text-sm text-muted-foreground">
                {copy.common?.states?.empty || t('admin.common.noData')}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Role-based modules (same dashboard, different visibility matrix) */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Moduller</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.key} href={m.href} prefetch={false}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{m.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
