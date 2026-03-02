'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import {
  useListProductsAdminQuery,
  useDeleteProductAdminMutation,
  useUpdateProductAdminMutation,
} from '@/integrations/endpoints/admin/products_admin.endpoints';
import { useListUsersAdminQuery } from '@/integrations/endpoints/admin/users/auth_admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import { useStatusQuery } from '@/integrations/hooks';
import { normalizeMeFromStatus, type AuthStatusResponse } from '@/integrations/shared';
import type { AdminProductDto } from '@/integrations/shared/product_admin.types';

const isTruthy = (v: unknown) => v === 1 || v === true || v === '1' || v === 'true';

export default function ProductsListPanel() {
  const t = useAdminT('admin.products');
  const router = useRouter();
  const statusQ = useStatusQuery();
  const me = normalizeMeFromStatus(statusQ.data as AuthStatusResponse | undefined);
  const isAdmin = me?.isAdmin === true;

  const [search, setSearch] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [subcategoryId, setSubcategoryId] = React.useState('');
  const [showOnlyActive, setShowOnlyActive] = React.useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = React.useState(false);

  const { data: categories = [] } = useListCategoriesAdminQuery(
    { limit: 500, offset: 0, sort: 'display_order', order: 'asc' } as any,
    { refetchOnMountOrArgChange: true },
  );

  const { data: subcategories = [] } = useListSubCategoriesAdminQuery(
    {
      category_id: categoryId || undefined,
      is_active: true,
      limit: 500,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    } as any,
    { skip: !categoryId, refetchOnMountOrArgChange: true },
  );

  const {
    data: productData,
    isFetching,
    refetch,
  } = useListProductsAdminQuery(
    {
      q: search || undefined,
      category_id: categoryId || undefined,
      sub_category_id: subcategoryId || undefined,
      is_active: showOnlyActive ? true : undefined,
      featured: showOnlyFeatured ? true : undefined,
      limit: 100,
      sort: 'updated_at',
      orderDir: 'desc',
    },
    { refetchOnMountOrArgChange: true },
  );

  const items: AdminProductDto[] = productData?.items ?? [];
  const { data: users = [] } = useListUsersAdminQuery(
    isAdmin ? { limit: 2000, offset: 0 } : undefined,
    { skip: !isAdmin, refetchOnMountOrArgChange: true },
  );

  const ownerNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users ?? []) {
      const id = String(u?.id ?? '').trim();
      if (!id) continue;
      map.set(id, String(u?.full_name || u?.email || id));
    }
    return map;
  }, [users]);
  const categoryNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories as any[]) {
      const id = String(c?.id ?? '').trim();
      if (!id) continue;
      m.set(id, String(c?.name || c?.slug || id));
    }
    return m;
  }, [categories]);

  const [updateProduct] = useUpdateProductAdminMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductAdminMutation();

  const isLoading = isFetching || isDeleting;

  const handleToggleActive = async (item: AdminProductDto, value: boolean) => {
    try {
      await updateProduct({ id: item.id, patch: { is_active: value } }).unwrap();
    } catch {
      toast.error(t('messages.toggleActiveError'));
    }
  };

  const handleToggleFeatured = async (item: AdminProductDto, value: boolean) => {
    try {
      await updateProduct({ id: item.id, patch: { featured: value } }).unwrap();
    } catch {
      toast.error(t('messages.toggleFeaturedError'));
    }
  };

  const handleDelete = async (item: AdminProductDto) => {
    if (!window.confirm(t('messages.confirmDelete', { title: item.title || item.slug || '' }))) return;
    try {
      await deleteProduct({ id: item.id }).unwrap();
      toast.success(t('messages.deleted'));
      refetch();
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">{t('header.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('header.description')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => router.push('/admin/ilanlar/new')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.create')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex-1 min-w-[220px]">
              <Input
                placeholder={t('filters.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="w-[220px]">
              <Select
                value={categoryId || 'all'}
                onValueChange={(v) => {
                  setCategoryId(v === 'all' ? '' : v);
                  setSubcategoryId('');
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('list.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.allCategories')}</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name || cat.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[240px]">
              <Select
                value={subcategoryId || 'all'}
                onValueChange={(v) => setSubcategoryId(v === 'all' ? '' : v)}
                disabled={isLoading || !categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('list.allSubcategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.allSubcategories')}</SelectItem>
                  {subcategories.map((sub: any) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>
                      {sub.name || sub.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="active-filter"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                  disabled={isLoading}
                />
                <Label htmlFor="active-filter" className="cursor-pointer text-sm">
                  {t('list.columns.active')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="featured-filter"
                  checked={showOnlyFeatured}
                  onCheckedChange={setShowOnlyFeatured}
                  disabled={isLoading}
                />
                <Label htmlFor="featured-filter" className="cursor-pointer text-sm">
                  {t('list.columns.featured')}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px]">#</TableHead>
                <TableHead>{t('list.columns.title')}</TableHead>
                {isAdmin && <TableHead className="w-[180px]">Ilan Sahibi</TableHead>}
                <TableHead className="w-[140px]">{t('list.columns.category')}</TableHead>
                <TableHead className="w-[100px]">{t('list.columns.status')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('list.columns.price')}</TableHead>
                <TableHead className="w-[90px] text-center">{t('list.columns.active')}</TableHead>
                <TableHead className="w-[90px] text-center">{t('list.columns.featured')}</TableHead>
                <TableHead className="w-[110px] text-right">{t('list.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="py-8 text-center text-muted-foreground text-sm">
                    {t('list.loading')}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="py-8 text-center text-muted-foreground text-sm">
                    {t('list.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: AdminProductDto, idx: number) => {
                  const isActive = isTruthy(item.is_active);
                  const isFeatured = isTruthy(item.featured);
                  const ownerId = typeof item.user_id === 'string' ? item.user_id.trim() : '';
                  const ownerNameFromApi =
                    typeof item.owner_name === 'string' && item.owner_name.trim()
                      ? item.owner_name.trim()
                      : '';
                  const ownerLabel = ownerId
                    ? ownerNameFromApi ||
                      (isAdmin
                      ? ownerNameById.get(ownerId) || ownerId
                      : 'Kendi ilani')
                    : '—';

                  return (
                    <TableRow key={item.id} className={!isActive ? 'opacity-50' : ''}>
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>

                      <TableCell>
                        <div className="font-medium text-sm truncate max-w-[260px]" title={item.title || ''}>
                          {item.title || <span className="text-muted-foreground italic">(adsız)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[260px]">
                          <code>{item.slug || '—'}</code>
                          {item.listing_no && (
                            <span className="ml-2 text-muted-foreground">[{item.listing_no}]</span>
                          )}
                        </div>
                      </TableCell>

                      {isAdmin && (
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">
                          {ownerLabel}
                        </TableCell>
                      )}

                      <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">
                        {item.category_name ||
                          (item.category_id ? categoryNameById.get(String(item.category_id)) : null) ||
                          '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{item.status || '—'}</Badge>
                      </TableCell>

                      <TableCell className="text-right text-sm">
                        {item.price != null ? Number(item.price).toLocaleString('tr-TR') : '—'}
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={isActive}
                          disabled={isLoading}
                          onCheckedChange={(v) => handleToggleActive(item, v)}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={isFeatured}
                          disabled={isLoading}
                          onCheckedChange={(v) => handleToggleFeatured(item, v)}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => router.push(`/admin/ilanlar/${item.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
