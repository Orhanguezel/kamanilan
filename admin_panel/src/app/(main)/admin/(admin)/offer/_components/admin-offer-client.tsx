'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/offer/_components/admin-offer-client.tsx
// Admin Offers — List (responsive)
// =============================================================

import * as React from 'react';
import Link from 'next/link';
import { RefreshCcw, Search, Plus, Trash2, Pencil } from 'lucide-react';
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

import type { OfferView, OfferStatus } from '@/integrations/shared';
import {
  useListOffersAdminQuery,
  useDeleteOfferAdminMutation,
} from '@/integrations/hooks';

/* ------------------------------------------------------------------ */

type Filters = {
  q: string;
  status: 'all' | OfferStatus;
  orderDir: 'asc' | 'desc';
};

function statusVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'sent' || s === 'accepted') return 'default';
  if (s === 'rejected' || s === 'cancelled') return 'destructive';
  if (s === 'quoted' || s === 'in_review') return 'outline';
  return 'secondary';
}

function fmtDate(v: unknown): string {
  if (!v) return '-';
  const s = typeof v === 'string' ? v : String(v);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || '-';
  return d.toLocaleDateString('tr-TR');
}

function fmtMoney(amount: unknown, currency: unknown): string {
  const a = amount === null || amount === undefined ? '' : String(amount);
  if (!a) return '-';
  const c = currency ? String(currency) : 'EUR';
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: c }).format(Number(a));
  } catch {
    return `${a} ${c}`;
  }
}

/* ------------------------------------------------------------------ */

export default function AdminOfferClient() {
  const t = useAdminT('admin.offer');

  const [filters, setFilters] = React.useState<Filters>({
    q: '',
    status: 'all',
    orderDir: 'desc',
  });

  const params = React.useMemo(
    () => ({
      q: filters.q.trim() || undefined,
      status: filters.status === 'all' ? undefined : (filters.status as OfferStatus),
      orderDir: filters.orderDir,
      sort: 'created_at' as const,
      limit: 200,
      offset: 0,
    }),
    [filters],
  );

  const listQ = useListOffersAdminQuery(params, { refetchOnMountOrArgChange: true });
  const [deleteOffer, deleteState] = useDeleteOfferAdminMutation();

  const rows = (listQ.data ?? []) as OfferView[];
  const listBusy = listQ.isLoading || listQ.isFetching;
  const busy = listBusy || deleteState.isLoading;

  async function onDelete(item: OfferView) {
    const msg = t('confirmDelete', {
      name: item.customer_name,
      email: item.email,
      id: item.id,
    });
    if (!window.confirm(msg)) return;

    try {
      await deleteOffer({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || t('messages.deleteError'));
    }
  }

  return (
    <div className="min-w-0 w-full max-w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-lg font-semibold">{t('header.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
        </div>

        <div className="flex flex-shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => listQ.refetch()} disabled={busy}>
            <RefreshCcw className="mr-2 size-4" />
            <span className="hidden sm:inline">{t('actions.refresh')}</span>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/offer/new">
              <Plus className="mr-2 size-4" />
              {t('actions.create')}
            </Link>
          </Button>
        </div>
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
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('filters.searchLabel')}</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
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
                <SelectItem value="in_review">{t('status.in_review')}</SelectItem>
                <SelectItem value="quoted">{t('status.quoted')}</SelectItem>
                <SelectItem value="sent">{t('status.sent')}</SelectItem>
                <SelectItem value="accepted">{t('status.accepted')}</SelectItem>
                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('filters.orderLabel')}</Label>
            <Select
              value={filters.orderDir}
              onValueChange={(v) =>
                setFilters((p) => ({ ...p, orderDir: v as Filters['orderDir'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t('filters.orderDesc')}</SelectItem>
                <SelectItem value="asc">{t('filters.orderAsc')}</SelectItem>
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
            <span className="font-normal text-muted-foreground">({rows.length})</span>
          </CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* ── Mobile card view ── */}
          <div className="flex flex-col gap-3 px-4 pb-4 sm:hidden">
            {rows.length === 0 && listBusy && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('list.loading')}
              </p>
            )}
            {rows.length === 0 && !listBusy && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('list.empty')}
              </p>
            )}

            {rows.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                {/* row 1: offer no + status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{item.offer_no || '-'}</span>
                  <Badge variant={statusVariant(item.status)}>
                    {t(`status.${item.status}` as any) || item.status}
                  </Badge>
                </div>

                {/* row 2: customer */}
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">{item.customer_name}</div>
                  {item.company_name && (
                    <div className="text-xs text-muted-foreground">{item.company_name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">{item.email}</div>
                </div>

                {/* row 3: subject + money + date */}
                {item.subject && (
                  <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {fmtMoney(item.gross_total, item.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">{fmtDate(item.created_at)}</span>
                </div>

                {/* row 4: actions */}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/admin/offer/${encodeURIComponent(item.id)}`}>
                      <Pencil className="mr-2 size-4" />
                      {t('actions.edit')}
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item)}
                    disabled={busy}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table view ── */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t('columns.offerNo')}</TableHead>
                  <TableHead>{t('columns.status')}</TableHead>
                  <TableHead>{t('columns.customer')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('columns.email')}</TableHead>
                  <TableHead className="hidden xl:table-cell">{t('columns.subject')}</TableHead>
                  <TableHead className="whitespace-nowrap text-right">{t('columns.grossTotal')}</TableHead>
                  <TableHead className="hidden md:table-cell whitespace-nowrap">{t('columns.createdAt')}</TableHead>
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
                    <TableCell className="whitespace-nowrap font-medium">
                      {item.offer_no || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {t(`status.${item.status}` as any) || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.customer_name || '-'}</div>
                      {item.company_name ? (
                        <div className="text-xs text-muted-foreground">{item.company_name}</div>
                      ) : null}
                      {/* email visible here on smaller screens where column is hidden */}
                      <div className="text-xs text-muted-foreground lg:hidden">{item.email}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{item.email || '-'}</TableCell>
                    <TableCell
                      className="hidden xl:table-cell max-w-[200px] truncate"
                      title={item.subject ?? ''}
                    >
                      {item.subject || '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {fmtMoney(item.gross_total, item.currency)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">
                      {fmtDate(item.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="icon" className="size-8" asChild>
                          <Link
                            href={`/admin/offer/${encodeURIComponent(item.id)}`}
                            title={t('actions.edit')}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="size-8"
                          onClick={() => onDelete(item)}
                          disabled={busy}
                          title={t('actions.delete')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
