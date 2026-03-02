'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus, Pencil, Trash2, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useDeleteCategoryAdminMutation,
  useListCategoriesAdminQuery,
  useToggleCategoryActiveAdminMutation,
  useToggleCategoryFeaturedAdminMutation,
  useToggleCategoryUnlimitedAdminMutation,
} from '@/integrations/endpoints/admin/categories_admin.endpoints';
import type { CategoryDto } from '@/integrations/shared';

export default function CategoriesListPanel() {
  const t = useAdminT('admin.categories');
  const router = useRouter();

  const [search, setSearch] = React.useState('');
  const [onlyActive, setOnlyActive] = React.useState(false);
  const [onlyFeatured, setOnlyFeatured] = React.useState(false);

  const query = React.useMemo(
    () => ({
      q: search.trim() || undefined,
      is_active: onlyActive ? true : undefined,
      is_featured: onlyFeatured ? true : undefined,
      limit: 500,
      offset: 0,
      sort: 'display_order' as const,
      order: 'asc' as const,
    }),
    [onlyActive, onlyFeatured, search],
  );

  const { data: categories = [], isFetching, refetch } = useListCategoriesAdminQuery(query, {
    refetchOnMountOrArgChange: true,
  });

  const [toggleActive] = useToggleCategoryActiveAdminMutation();
  const [toggleFeatured] = useToggleCategoryFeaturedAdminMutation();
  const [toggleUnlimited] = useToggleCategoryUnlimitedAdminMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryAdminMutation();

  const busy = isFetching || isDeleting;

  const onDelete = async (item: CategoryDto) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{title}', item.name || item.slug))) return;
    try {
      await deleteCategory(item.id).unwrap();
      toast.success(t('messages.deleted'));
      refetch();
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  const onToggleActive = async (item: CategoryDto, value: boolean) => {
    try {
      await toggleActive({ id: item.id, is_active: value }).unwrap();
      toast.success(value ? t('list.activated') : t('list.deactivated'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const onToggleFeatured = async (item: CategoryDto, value: boolean) => {
    try {
      await toggleFeatured({ id: item.id, is_featured: value }).unwrap();
      toast.success(value ? t('list.featured') : t('list.unfeatured'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const onToggleUnlimited = async (item: CategoryDto, value: boolean) => {
    try {
      await toggleUnlimited({ id: item.id, is_unlimited: value }).unwrap();
      toast.success(value ? 'Sınırsız ilan açıldı' : 'Sınırsız ilan kapatıldı');
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="cat-active-filter" checked={onlyActive} onCheckedChange={setOnlyActive} disabled={busy} />
                  <Label htmlFor="cat-active-filter" className="text-sm cursor-pointer">
                    {t('filters.onlyActive')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="cat-featured-filter"
                    checked={onlyFeatured}
                    onCheckedChange={setOnlyFeatured}
                    disabled={busy}
                  />
                  <Label htmlFor="cat-featured-filter" className="text-sm cursor-pointer">
                    {t('filters.onlyFeatured')}
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={busy}>
                  <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                </Button>
                <Button size="sm" onClick={() => router.push('/admin/categories/new')} disabled={busy}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('actions.create')}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('list.title')}</span>
            <Badge variant="secondary">
              {t('list.total')}: {categories.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {busy && categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.loading')}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.noData')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.slug')}</TableHead>
                    <TableHead className="w-20 text-center">{t('table.active')}</TableHead>
                    <TableHead className="w-24 text-center">{t('table.featured')}</TableHead>
                    <TableHead className="w-24 text-center">Sınırsız</TableHead>
                    <TableHead className="w-36 text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          {item.description ? (
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                          ) : null}
                          <div className="flex gap-2 flex-wrap">
                            {item.whatsapp_number && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                <MessageCircle className="h-3 w-3" />
                                {item.whatsapp_number}
                              </span>
                            )}
                            {item.phone_number && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
                                <Phone className="h-3 w-3" />
                                {item.phone_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{item.slug}</code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={!!item.is_active}
                          onCheckedChange={(value) => onToggleActive(item, value)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={!!item.is_featured}
                          onCheckedChange={(value) => onToggleFeatured(item, value)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={!!item.is_unlimited}
                          onCheckedChange={(value) => onToggleUnlimited(item, value)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" disabled={busy} onClick={() => router.push(`/admin/categories/${item.id}`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={busy} onClick={() => onDelete(item)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
