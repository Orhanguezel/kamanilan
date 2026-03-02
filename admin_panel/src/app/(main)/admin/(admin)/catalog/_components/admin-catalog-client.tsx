'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/catalog/_components/admin-catalog-client.tsx
// Admin Catalog Requests — List
// =============================================================

import * as React from 'react';
import Link from 'next/link';
import { RefreshCcw, Search, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { AVAILABLE_LOCALE_CODES } from '@/i18n/localeCatalog';

import type { CatalogRequestDto, CatalogRequestStatus } from '@/integrations/shared';
import {
  useListCatalogRequestsAdminQuery,
  useRemoveCatalogRequestAdminMutation,
} from '@/integrations/hooks';

/* ------------------------------------------------------------------ */

type Filters = {
  search: string;
  status: 'all' | CatalogRequestStatus;
  locale: string;
};

function statusVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'sent') return 'default';
  if (s === 'failed') return 'destructive';
  if (s === 'archived') return 'outline';
  return 'secondary';
}

function fmtDate(v: unknown): string {
  if (!v) return '-';
  const s = typeof v === 'string' ? v : String(v);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || '-';
  return d.toLocaleString('tr-TR');
}

/* ------------------------------------------------------------------ */

export default function AdminCatalogClient() {
  const t = useAdminT('admin.catalog');

  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    status: 'all',
    locale: 'all',
  });

  const params = React.useMemo(
    () => ({
      q: filters.search.trim() || undefined,
      status: filters.status === 'all' ? undefined : (filters.status as CatalogRequestStatus),
      locale: filters.locale === 'all' ? undefined : filters.locale,
      order: 'created_at.desc',
      limit: 200,
      offset: 0,
    }),
    [filters],
  );

  const listQ = useListCatalogRequestsAdminQuery(params, { refetchOnMountOrArgChange: true });
  const [removeReq, removeState] = useRemoveCatalogRequestAdminMutation();

  const rows = (listQ.data ?? []) as CatalogRequestDto[];
  const listBusy = listQ.isLoading || listQ.isFetching;
  const busy = listBusy || removeState.isLoading;

  async function onDelete(item: CatalogRequestDto) {
    const msg = t('confirmDelete', {
      name: item.customer_name,
      email: item.email,
      id: item.id,
    });
    if (!window.confirm(msg)) return;

    try {
      await removeReq({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || t('messages.deleteError'));
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{t('header.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
        </div>

        <Button variant="outline" size="sm" onClick={() => listQ.refetch()} disabled={busy}>
          <RefreshCcw className="mr-2 size-4" />
          {t('actions.refresh')}
        </Button>
      </div>

      {/* ERROR */}
      {listQ.error ? (
        <div className="rounded-lg border bg-card p-3 text-sm text-destructive">
          {t('messages.loadError')}
        </div>
      ) : null}

      {/* FILTERS */}
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-base">{t('filters.title')}</CardTitle>
          <CardDescription>{t('filters.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('filters.searchLabel')}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder={t('filters.searchPlaceholder')}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('filters.statusLabel')}</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((p) => ({ ...p, status: v as Filters['status'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.statusAll')}</SelectItem>
                <SelectItem value="new">{t('status.new')}</SelectItem>
                <SelectItem value="sent">{t('status.sent')}</SelectItem>
                <SelectItem value="failed">{t('status.failed')}</SelectItem>
                <SelectItem value="archived">{t('status.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('filters.localeLabel')}</Label>
            <Select
              value={filters.locale}
              onValueChange={(v) => setFilters((p) => ({ ...p, locale: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.localeAll')}</SelectItem>
                {AVAILABLE_LOCALE_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LIST */}
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-base">
            {t('list.title')}{' '}
            <span className="text-muted-foreground font-normal">({rows.length})</span>
          </CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.customer')}</TableHead>
                <TableHead>{t('columns.email')}</TableHead>
                <TableHead>{t('columns.company')}</TableHead>
                <TableHead>{t('columns.locale')}</TableHead>
                <TableHead>{t('columns.emailSent')}</TableHead>
                <TableHead>{t('columns.createdAt')}</TableHead>
                <TableHead className="text-right">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && listBusy && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    {t('list.loading')}
                  </TableCell>
                </TableRow>
              )}

              {rows.length === 0 && !listBusy && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    {t('list.empty')}
                  </TableCell>
                </TableRow>
              )}

              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.customer_name || '-'}</TableCell>
                  <TableCell>{item.email || '-'}</TableCell>
                  <TableCell>{item.company_name || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs">{item.locale || '-'}</code>
                  </TableCell>
                  <TableCell className="text-sm">{fmtDate(item.email_sent_at)}</TableCell>
                  <TableCell className="text-sm">{fmtDate(item.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/catalog/${encodeURIComponent(item.id)}`}>
                          <Eye className="mr-2 size-4" />
                          {t('actions.view')}
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item)}
                        disabled={busy}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t('actions.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
