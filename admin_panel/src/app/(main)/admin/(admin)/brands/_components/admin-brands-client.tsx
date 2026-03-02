'use client';

import * as React from 'react';
import { Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  useListBrandsAdminQuery,
  useRemoveBrandAdminMutation,
} from '@/integrations/endpoints/admin/brands.admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import type { ListingBrandView } from '@/integrations/shared';

const toBool = (v: unknown) => v === true || v === 1 || v === '1';

export default function AdminBrandsClient() {
  const t = useAdminT('admin.brands');
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');

  const categoriesQ = useListCategoriesAdminQuery({
    is_active: true,
    limit: 500,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  } as any);

  const listSubByFilterQ = useListSubCategoriesAdminQuery(
    {
      category_id: categoryFilter || undefined,
      is_active: true,
      limit: 500,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    } as any,
    { skip: !categoryFilter },
  );

  const listQ = useListBrandsAdminQuery({
    q: q.trim() || undefined,
    category_id: categoryFilter || undefined,
    limit: 300,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  });

  const [removeBrand, removeState] = useRemoveBrandAdminMutation();

  const rows = listQ.data ?? [];
  const categories = categoriesQ.data ?? [];
  const subcategoriesByFilter = listSubByFilterQ.data ?? [];

  const catMap = React.useMemo(
    () => new Map(categories.map((x: any) => [x.id, x.name || x.slug])),
    [categories],
  );
  const subMap = React.useMemo(
    () => new Map(subcategoriesByFilter.map((x: any) => [x.id, x.name || x.slug])),
    [subcategoriesByFilter],
  );

  const busy = listQ.isLoading || listQ.isFetching || categoriesQ.isLoading || removeState.isLoading;

  const onDelete = async (item: ListingBrandView) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{title}', item.name))) return;
    try {
      await removeBrand({ id: item.id }).unwrap();
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
          <Button onClick={() => router.push('/admin/brands/new')} disabled={busy}>
            <Plus className="mr-2 size-4" />
            {t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder={t('list.searchPlaceholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.slug')}</TableHead>
                <TableHead>{t('table.category')}</TableHead>
                <TableHead>{t('table.subcategory')}</TableHead>
                <TableHead>{t('table.active')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !busy && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">{t('list.empty')}</TableCell>
                </TableRow>
              )}
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>{catMap.get(item.category_id) || '-'}</TableCell>
                  <TableCell>{item.sub_category_id ? subMap.get(item.sub_category_id) || '-' : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={toBool(item.is_active) ? 'default' : 'secondary'}>
                      {toBool(item.is_active) ? t('status.active') : t('status.passive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/admin/brands/${item.id}`)}
                        disabled={busy}
                        title={t('actions.update')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(item)}
                        disabled={busy}
                        title={t('admin.common.delete')}
                      >
                        <Trash2 className="size-4" />
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
