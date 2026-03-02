'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCcw, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminUiCopy } from '@/app/(main)/admin/_components/common/useAdminUiCopy';
import type { PopupAdminView } from '@/integrations/shared';
import {
  useListPopupsAdminQuery,
  useDeletePopupAdminMutation,
} from '@/integrations/hooks';

const txt = (v: unknown, fallback: string) => {
  const s = String(v ?? '').trim();
  return s || fallback;
};

export default function AdminPopupsClient() {
  const router = useRouter();
  const { copy } = useAdminUiCopy();
  const page = copy.pages?.popups ?? {};
  const common = copy.common;

  const listQ = useListPopupsAdminQuery({ order: 'created_at.desc' }, { refetchOnMountOrArgChange: true });
  const rows = (listQ.data ?? []) as PopupAdminView[];
  const [deletePopup, deleteState] = useDeletePopupAdminMutation();

  const busy = listQ.isFetching || deleteState.isLoading;

  const onDelete = async (item: PopupAdminView) => {
    if (!window.confirm(txt(page?.delete_confirm, 'Silinsin mi?'))) return;
    try {
      await deletePopup({ id: item.id }).unwrap();
      toast.success(txt(common?.actions?.delete, 'Silindi'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || txt(common?.states?.error, 'Hata oluştu'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{txt(page?.title, 'Popup Yönetimi')}</h1>
          <p className="text-sm text-muted-foreground">{txt(page?.subtitle, 'Popup kayıtlarını yönetin.')}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => listQ.refetch()} disabled={busy}>
            <RefreshCcw className="mr-2 size-4" />
            {txt(common?.actions?.refresh, 'Yenile')}
          </Button>
          <Button size="sm" onClick={() => router.push('/admin/popups/new')} disabled={busy}>
            <Plus className="mr-2 size-4" />
            {txt(common?.actions?.create, 'Ekle')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-base">{txt(page?.list_title, 'Popup Listesi')}</CardTitle>
          <CardDescription>{txt(page?.list_desc, 'Tüm popup kayıtları')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{txt(page?.col_title, 'Başlık')}</TableHead>
                <TableHead>{txt(page?.col_active, 'Aktif')}</TableHead>
                <TableHead>{txt(page?.col_frequency, 'Sıklık')}</TableHead>
                <TableHead>{txt(page?.col_dates, 'Tarih')}</TableHead>
                <TableHead className="text-right">{txt(page?.col_actions, 'İşlemler')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !busy && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    {txt(common?.states?.empty, 'Kayıt bulunamadı')}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'secondary' : 'outline'}>
                      {item.is_active ? txt(page?.active_yes, 'Evet') : txt(page?.active_no, 'Hayır')}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.display_frequency}</TableCell>
                  <TableCell>
                    {item.start_date || '-'} → {item.end_date || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/popups/${item.id}`)}
                        disabled={busy}
                      >
                        <Pencil className="mr-2 size-4" />
                        {txt(common?.actions?.edit, 'Düzenle')}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item)} disabled={busy}>
                        <Trash2 className="mr-2 size-4" />
                        {txt(common?.actions?.delete, 'Sil')}
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

