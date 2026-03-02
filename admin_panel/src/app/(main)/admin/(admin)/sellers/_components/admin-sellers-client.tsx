'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Pencil, RefreshCcw } from 'lucide-react';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUserView } from '@/integrations/shared';
import { useListUsersAdminQuery } from '@/integrations/hooks';

type SellerPlan = 'basic' | 'standard' | 'pro';

const PLAN_LABEL: Record<SellerPlan, string> = {
  basic: 'Temel Paket',
  standard: 'Standart Paket',
  pro: 'Pro Paket',
};

const getRoleBadge = (u: AdminUserView) => {
  if (u.roles.includes('admin')) return 'admin';
  if (u.roles.includes('moderator')) return 'moderator';
  if (u.roles.includes('seller')) return 'seller';
  return 'user';
};

function readPlan(userId: string): SellerPlan {
  try {
    const v = localStorage.getItem(`seller_subscription:${userId}`) || '';
    if (v === 'standard' || v === 'pro' || v === 'basic') return v;
  } catch {}
  return 'basic';
}

export default function AdminSellersClient() {
  const t = useAdminT('admin.sellers');
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [onlyActive, setOnlyActive] = React.useState(false);
  const [planMap, setPlanMap] = React.useState<Record<string, SellerPlan>>({});

  const sellersQ = useListUsersAdminQuery(
    {
      role: 'seller',
      q: q.trim() || undefined,
      is_active: onlyActive ? true : undefined,
      limit: 200,
      offset: 0,
      sort: 'created_at',
      order: 'desc',
    },
    { refetchOnMountOrArgChange: true },
  );

  const sellers = sellersQ.data ?? [];
  const busy = sellersQ.isLoading || sellersQ.isFetching;

  React.useEffect(() => {
    if (!sellers.length) return;
    const next: Record<string, SellerPlan> = {};
    for (const s of sellers) {
      next[s.id] = readPlan(s.id);
    }
    setPlanMap(next);
  }, [sellers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t('header.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('header.description')}</p>
        </div>
        <Button variant="outline" onClick={() => sellersQ.refetch()} disabled={busy}>
          <RefreshCcw className="mr-2 size-4" />
          {t('actions.refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
          <CardDescription>{t('filters.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('filters.searchLabel')}</Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('filters.searchPlaceholder')}
            />
          </div>
          <div className="flex items-end gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Label>{t('filters.onlyActive')}</Label>
            <Switch checked={onlyActive} onCheckedChange={setOnlyActive} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('list.table.name')}</TableHead>
                <TableHead>{t('list.table.email')}</TableHead>
                <TableHead>{t('list.table.status')}</TableHead>
                <TableHead>{t('list.table.role')}</TableHead>
                <TableHead>{t('list.table.plan')}</TableHead>
                <TableHead>{t('list.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.full_name || t('list.table.unknown')}</TableCell>
                  <TableCell>{s.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? 'default' : 'secondary'}>
                      {s.is_active ? t('status.active') : t('status.passive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleBadge(s)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{PLAN_LABEL[planMap[s.id] || 'basic']}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => router.push(`/admin/sellers/${s.id}`)}
                      disabled={busy}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sellers.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {t('list.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
          <CardDescription>{t('subscription.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border p-3">
            <div className="font-medium">{t('subscription.plans.basic.title')}</div>
            <div className="text-xs text-muted-foreground">{t('subscription.plans.basic.description')}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium">{t('subscription.plans.standard.title')}</div>
            <div className="text-xs text-muted-foreground">{t('subscription.plans.standard.description')}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium">{t('subscription.plans.pro.title')}</div>
            <div className="text-xs text-muted-foreground">{t('subscription.plans.pro.description')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
