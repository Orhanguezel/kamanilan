'use client';

import * as React from 'react';
import { Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FlashSaleView } from '@/integrations/shared';
import {
  useDeleteFlashSaleAdminMutation,
  useListFlashSalesAdminQuery,
} from '@/integrations/hooks';

export default function AdminFlashSaleClient() {
  const t = useAdminT('admin.flashSale');
  const router = useRouter();
  const adminLocale = usePreferencesStore((s) => s.adminLocale) || 'tr';

  const [q, setQ] = React.useState('');
  const [onlyActiveNow, setOnlyActiveNow] = React.useState(false);

  const listQ = useListFlashSalesAdminQuery(
    {
      q: q.trim() || undefined,
      locale: adminLocale,
      active_now: onlyActiveNow ? true : undefined,
      limit: 200,
      offset: 0,
      sort: 'display_order',
      orderDir: 'asc',
    },
    { refetchOnMountOrArgChange: true },
  );

  const [deleteFlashSale, deleteState] = useDeleteFlashSaleAdminMutation();
  const rows = listQ.data ?? [];
  const busy = listQ.isLoading || listQ.isFetching || deleteState.isLoading;

  const onDelete = React.useCallback(
    async (item: FlashSaleView) => {
      const msg = t('messages.confirmDelete').replace('{title}', item.title);
      if (!window.confirm(msg)) return;
      try {
        await deleteFlashSale({ id: item.id }).unwrap();
        toast.success(t('messages.deleted'));
      } catch (e: any) {
        toast.error(e?.data?.error?.message || e?.message || t('messages.deleteError'));
      }
    },
    [deleteFlashSale, t],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t('header.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('header.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => listQ.refetch()} disabled={busy}>
            <RefreshCcw className="mr-2 size-4" />
            {t('actions.refresh')}
          </Button>
          <Button onClick={() => router.push('/admin/flash-sale/new')}>
            <Plus className="mr-2 size-4" />
            {t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <Input
              placeholder={t('filters.searchPlaceholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyActiveNow}
                onChange={(e) => setOnlyActiveNow(e.target.checked)}
                className="size-4"
              />
              {t('filters.onlyActiveNow')}
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>{t('table.discount')}</TableHead>
                <TableHead>{t('table.window')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.slug}</div>
                  </TableCell>
                  <TableCell>
                    {item.discount_type === 'percent'
                      ? t('discount.percentValue').replace('{value}', String(item.discount_value))
                      : t('discount.amountValue').replace('{value}', String(item.discount_value))}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{new Date(item.start_at).toLocaleString(adminLocale)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.end_at).toLocaleString(adminLocale)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? t('status.active') : t('status.passive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => router.push(`/admin/flash-sale/${item.id}`)}
                        disabled={busy}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => onDelete(item)} disabled={busy}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t('list.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

