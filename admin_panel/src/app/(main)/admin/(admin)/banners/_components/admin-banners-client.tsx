'use client';

import * as React from 'react';
import { Eye, EyeOff, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
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
import {
  useDeleteBannerAdminMutation,
  useListBannersAdminQuery,
  useSetBannerStatusAdminMutation,
} from '@/integrations/hooks';
import type { BannerAdminView } from '@/integrations/shared/banner_admin.types';

export default function AdminBannersClient() {
  const t = useAdminT('admin.banners');
  const router = useRouter();
  const [q, setQ] = React.useState('');

  const listQ = useListBannersAdminQuery({
    q: q.trim() || undefined,
    limit: 200,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  });

  const [deleteBanner, deleteState] = useDeleteBannerAdminMutation();
  const [setStatus, setStatusState] = useSetBannerStatusAdminMutation();

  const rows = listQ.data ?? [];
  const busy = listQ.isLoading || listQ.isFetching || deleteState.isLoading || setStatusState.isLoading;

  const sortedRows = React.useMemo(
    () => [...rows].sort((a, b) =>
      a.display_order !== b.display_order ? a.display_order - b.display_order : a.id - b.id,
    ),
    [rows],
  );

  const onDelete = async (item: BannerAdminView) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{title}', item.title))) return;
    try {
      await deleteBanner({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.deleteError'));
    }
  };

  const onToggleActive = async (item: BannerAdminView, next: boolean) => {
    try {
      await setStatus({ id: item.id, is_active: next }).unwrap();
      toast.success(next ? t('messages.activated') : t('messages.deactivated'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

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
          <Button onClick={() => router.push('/admin/banners/new')}>
            <Plus className="mr-2 size-4" />
            {t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            Banner ID'sini Tema → Ana Sayfa bölümlerindeki "Banner ID" alanına yazarak bannerı bir alana atayın.
          </CardDescription>
          <Input placeholder={t('list.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>Reklamveren</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>{t('table.active')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-muted-foreground">#{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.advertiser_name ?? '—'}</div>
                    {item.contact_info && (
                      <div className="text-xs text-muted-foreground">{item.contact_info}</div>
                    )}
                  </TableCell>
                  <TableCell>{item.display_order}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="rounded border px-2 py-1 text-xs"
                      onClick={() => onToggleActive(item, !item.is_active)}
                      disabled={busy}
                    >
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? (
                          <span className="flex items-center gap-1"><Eye className="size-3" />{t('status.active')}</span>
                        ) : (
                          <span className="flex items-center gap-1"><EyeOff className="size-3" />{t('status.passive')}</span>
                        )}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => router.push(`/admin/banners/${item.id}`)}
                        disabled={busy}
                        title={t('actions.update')}
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
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
