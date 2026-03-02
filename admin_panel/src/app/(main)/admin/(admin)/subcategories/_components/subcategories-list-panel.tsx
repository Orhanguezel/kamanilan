// =============================================================
// FILE: src/app/(main)/admin/(admin)/subcategories/_components/subcategories-list-panel.tsx
// Subcategories List Panel — Shadcn/UI + RTK Query
// Ensotek Admin Panel Standartı
// =============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { toast } from 'sonner';
import {
  useListSubCategoriesAdminQuery,
  useDeleteSubCategoryAdminMutation,
  useToggleSubCategoryActiveAdminMutation,
  useToggleSubCategoryFeaturedAdminMutation,
} from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import type { SubCategoryDto } from '@/integrations/shared';

export default function SubcategoriesListPanel() {
  const t = useAdminT('admin.subcategories');
  const router = useRouter();

  // Filters
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [showOnlyActive, setShowOnlyActive] = React.useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = React.useState(false);

  // RTK Query – list
  const {
    data: items = [],
    isFetching,
    refetch,
  } = useListSubCategoriesAdminQuery(
    {
      q: search || undefined,
      category_id: categoryFilter || undefined,
      is_active: showOnlyActive ? true : undefined,
      is_featured: showOnlyFeatured ? true : undefined,
    },
  );

  // Categories for filter dropdown
  const { data: categories = [] } = useListCategoriesAdminQuery({ limit: 500 });

  // Kategori ID → isim haritası
  const categoryNameMap = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const cat of categories as any[]) {
      if (cat.id) map[String(cat.id)] = cat.name || cat.slug || cat.id;
    }
    return map;
  }, [categories]);

  // Mutations
  const [deleteSubCategory, { isLoading: isDeleting }] = useDeleteSubCategoryAdminMutation();
  const [toggleActive] = useToggleSubCategoryActiveAdminMutation();
  const [toggleFeatured] = useToggleSubCategoryFeaturedAdminMutation();

  const isLoading = isFetching || isDeleting;

  const handleToggleActive = async (item: SubCategoryDto, value: boolean) => {
    try {
      await toggleActive({ id: item.id, is_active: value }).unwrap();
      toast.success(value ? t('list.activated') : t('list.deactivated'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const handleToggleFeatured = async (item: SubCategoryDto, value: boolean) => {
    try {
      await toggleFeatured({ id: item.id, is_featured: value }).unwrap();
      toast.success(value ? t('list.featured') : t('list.unfeatured'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const handleDelete = async (item: SubCategoryDto) => {
    if (!confirm(t('messages.confirmDelete').replace('{title}', item.name || item.slug))) return;
    try {
      await deleteSubCategory(item.id).unwrap();
      toast.success(t('messages.deleted'));
      refetch();
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <Button onClick={() => router.push('/admin/subcategories/new')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.create')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            {/* Search */}
            <div className="flex-1 min-w-[180px]">
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div className="w-[200px]">
              <Select
                value={categoryFilter || 'all'}
                onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name || cat.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="active-filter"
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                  disabled={isLoading}
                />
                <Label htmlFor="active-filter" className="cursor-pointer text-sm">
                  {t('filters.onlyActive')}
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
                  {t('filters.onlyFeatured')}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px]">#</TableHead>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead className="w-[160px]">{t('table.category')}</TableHead>
                <TableHead className="w-[70px] text-center">{t('table.order')}</TableHead>
                <TableHead className="w-[80px] text-center">{t('table.active')}</TableHead>
                <TableHead className="w-[90px] text-center">{t('table.featured')}</TableHead>
                <TableHead className="w-[110px] text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    {t('list.loading')}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    {t('list.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                    <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>

                    <TableCell>
                      <div
                        className="font-medium text-sm truncate max-w-[240px]"
                        title={item.name || ''}
                      >
                        {item.name || (
                          <span className="text-muted-foreground italic">(adsız)</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <code>{item.slug || '—'}</code>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground truncate max-w-[160px]">
                      {categoryNameMap[item.category_id] || item.category_id || '—'}
                    </TableCell>

                    <TableCell className="text-center text-sm">
                      {item.display_order ?? 0}
                    </TableCell>

                    <TableCell className="text-center">
                      <Switch
                        checked={item.is_active}
                        disabled={isLoading}
                        onCheckedChange={(v) => handleToggleActive(item, v)}
                      />
                    </TableCell>

                    <TableCell className="text-center">
                      <Switch
                        checked={item.is_featured}
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
                          onClick={() => router.push(`/admin/subcategories/${item.id}`)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
