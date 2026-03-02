'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

import {
  useDeleteVariantAdminMutation,
  useListVariantsAdminQuery,
} from '@/integrations/endpoints/admin/variants_admin.endpoints';
import { useListUnitsAdminQuery } from '@/integrations/endpoints/admin/units_admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import type { VariantView } from '@/integrations/shared/variants_admin.types';

const toBool = (v: unknown) => v === true || v === 1 || v === '1';

export default function AdminVariantsClient() {
  const t = useAdminT('admin.variants');
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');

  // Listede ID yerine isim gösterebilmek için tüm referans kayıtlarını çekiyoruz.
  const categoriesQ = useListCategoriesAdminQuery({ limit: 2000, offset: 0, sort: 'display_order', order: 'asc' } as any);
  const unitsQ = useListUnitsAdminQuery({ limit: 2000, offset: 0, sort: 'display_order', order: 'asc' });
  const subcategoriesQ = useListSubCategoriesAdminQuery(
    { limit: 2000, offset: 0, sort: 'display_order', order: 'asc' } as any,
    { refetchOnMountOrArgChange: true },
  );

  const listQ = useListVariantsAdminQuery({
    q: q.trim() || undefined,
    category_id: categoryFilter || undefined,
    limit: 200,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  });

  const [deleteVariant, deleteState] = useDeleteVariantAdminMutation();

  const rows = listQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const subcategories = subcategoriesQ.data ?? [];
  const units = unitsQ.data ?? [];

  const catMap = React.useMemo(() => new Map(categories.map((x: any) => [x.id, x.name || x.slug])), [categories]);
  const subMap = React.useMemo(() => new Map(subcategories.map((x: any) => [x.id, x.name || x.slug])), [subcategories]);
  const unitMap = React.useMemo(() => new Map(units.map((x: any) => [x.id, `${x.name} (${x.symbol})`])), [units]);

  const busy =
    listQ.isLoading || listQ.isFetching || categoriesQ.isLoading || unitsQ.isLoading || deleteState.isLoading;

  const onDelete = async (item: VariantView) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{title}', item.name))) return;
    try {
      await deleteVariant({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.deleteError'));
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
          <Button onClick={() => router.push('/admin/variants/new')} disabled={busy}>
            <Plus className="mr-2 size-4" />
            {t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder={t('list.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder={t('form.allCategories')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('form.allCategories')}</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name || cat.slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.slug')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.category')}</TableHead>
                <TableHead>{t('table.subcategory')}</TableHead>
                <TableHead>{t('table.unit')}</TableHead>
                <TableHead>{t('table.active')}</TableHead>
                <TableHead>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell><code>{item.slug}</code></TableCell>
                  <TableCell>{t(`types.${item.value_type}` as any)}</TableCell>
                  <TableCell>{catMap.get(item.category_id) || item.category_id}</TableCell>
                  <TableCell>{item.sub_category_id ? (subMap.get(item.sub_category_id) || item.sub_category_id) : '—'}</TableCell>
                  <TableCell>{item.unit_id ? (unitMap.get(item.unit_id) || item.unit_id) : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={toBool(item.is_active) ? 'default' : 'secondary'}>
                      {toBool(item.is_active) ? t('status.active') : t('status.passive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => router.push(`/admin/variants/${item.id}`)}
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t('list.empty')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
