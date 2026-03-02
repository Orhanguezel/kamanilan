'use client';

import * as React from 'react';
import { Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useCreateUnitAdminMutation,
  useDeleteUnitAdminMutation,
  useListUnitsAdminQuery,
  useUpdateUnitAdminMutation,
} from '@/integrations/endpoints/admin/units_admin.endpoints';
import type { UnitCreatePayload, UnitView } from '@/integrations/shared/units_admin.types';

type FormState = {
  id?: string;
  name: string;
  slug: string;
  symbol: string;
  type: string;
  precision: string;
  display_order: string;
  is_active: boolean;
};

const initialForm: FormState = {
  name: '',
  slug: '',
  symbol: '',
  type: 'custom',
  precision: '0',
  display_order: '0',
  is_active: true,
};

const toBool = (v: unknown) => v === true || v === 1 || v === '1';

export default function AdminUnitsClient() {
  const t = useAdminT('admin.units');

  const [q, setQ] = React.useState('');
  const [form, setForm] = React.useState<FormState>(initialForm);

  const listQ = useListUnitsAdminQuery({
    q: q.trim() || undefined,
    limit: 200,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  });

  const [createUnit, createState] = useCreateUnitAdminMutation();
  const [updateUnit, updateState] = useUpdateUnitAdminMutation();
  const [deleteUnit, deleteState] = useDeleteUnitAdminMutation();

  const rows = listQ.data ?? [];
  const busy = listQ.isLoading || listQ.isFetching || createState.isLoading || updateState.isLoading || deleteState.isLoading;

  const resetForm = () => setForm(initialForm);

  const onEdit = (item: UnitView) => {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      symbol: item.symbol,
      type: item.type,
      precision: String(item.precision ?? 0),
      display_order: String(item.display_order ?? 0),
      is_active: toBool(item.is_active),
    });
  };

  const onDelete = async (item: UnitView) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{title}', item.name))) return;
    try {
      await deleteUnit({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.deleteError'));
    }
  };

  const onSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.symbol.trim()) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const payload: UnitCreatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      symbol: form.symbol.trim(),
      type: form.type.trim() || 'custom',
      precision: Number(form.precision || 0),
      display_order: Number(form.display_order || 0),
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        await updateUnit({ id: form.id, patch: payload }).unwrap();
        toast.success(t('messages.updated'));
      } else {
        await createUnit(payload).unwrap();
        toast.success(t('messages.created'));
      }
      resetForm();
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
        <Button variant="outline" onClick={() => listQ.refetch()} disabled={busy}>
          <RefreshCcw className="mr-2 size-4" />
          {t('actions.refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{form.id ? t('form.titleEdit') : t('form.titleCreate')}</CardTitle>
          <CardDescription>{t('header.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('form.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.slug')}</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.symbol')}</Label>
            <Input value={form.symbol} onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.type')}</Label>
            <Input value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.precision')}</Label>
            <Input type="number" value={form.precision} onChange={(e) => setForm((p) => ({ ...p, precision: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.displayOrder')}</Label>
            <Input type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="size-4" />
            {t('form.isActive')}
          </label>
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={onSubmit} disabled={busy}>{form.id ? t('actions.update') : t('actions.create')}</Button>
            <Button variant="outline" onClick={resetForm} disabled={busy}>{t('actions.clear')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
          <Input placeholder={t('list.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.slug')}</TableHead>
                <TableHead>{t('table.symbol')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.precision')}</TableHead>
                <TableHead>{t('table.active')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell><code>{item.slug}</code></TableCell>
                  <TableCell>{item.symbol}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.precision}</TableCell>
                  <TableCell>
                    <Badge variant={toBool(item.is_active) ? 'default' : 'secondary'}>
                      {toBool(item.is_active) ? t('status.active') : t('status.passive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => onEdit(item)} disabled={busy}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="destructive" onClick={() => onDelete(item)} disabled={busy}><Trash2 className="size-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('list.empty')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
