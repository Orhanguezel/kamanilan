// =============================================================
// FILE: src/app/(main)/admin/(admin)/library/_components/library-list-panel.tsx
// Library List Panel — Shadcn/UI + RTK Query
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
import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import {
  AdminLocaleSelect,
  type AdminLocaleOption,
} from '@/app/(main)/admin/_components/common/AdminLocaleSelect';
import { toast } from 'sonner';
import {
  useListLibraryAdminQuery,
  useUpdateLibraryAdminMutation,
  useRemoveLibraryAdminMutation,
} from '@/integrations/endpoints/admin/library_admin.endpoints';
import type { LibraryDto } from '@/integrations/shared';

const LIBRARY_TYPES = [
  { value: 'brochure', label: 'Broşür' },
  { value: 'catalog', label: 'Katalog' },
  { value: 'manual', label: 'Kılavuz' },
  { value: 'technical', label: 'Teknik Döküman' },
  { value: 'other', label: 'Diğer' },
];

const isTruthy = (v: unknown) => v === 1 || v === true || v === '1' || v === 'true';

export default function LibraryListPanel() {
  const t = useAdminT('admin.library');
  const router = useRouter();

  const { localeOptions, defaultLocaleFromDb } = useAdminLocales();

  // Filters
  const [search, setSearch] = React.useState('');
  const [locale, setLocale] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [showOnlyActive, setShowOnlyActive] = React.useState(false);
  const [showOnlyPublished, setShowOnlyPublished] = React.useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = React.useState(false);

  // Set default locale once options load
  React.useEffect(() => {
    if (!localeOptions?.length) return;
    setLocale((prev) => {
      if (prev) return prev;
      const def = (defaultLocaleFromDb as string) || localeOptions[0]?.value || 'tr';
      return String(def);
    });
  }, [localeOptions, defaultLocaleFromDb]);

  // RTK Query
  const {
    data: items = [],
    isFetching,
    refetch,
  } = useListLibraryAdminQuery(
    {
      locale: locale || undefined,
      q: search || undefined,
      type: typeFilter || undefined,
      is_active: showOnlyActive ? true : undefined,
      is_published: showOnlyPublished ? true : undefined,
      featured: showOnlyFeatured ? true : undefined,
      limit: 100,
    },
    { skip: !locale },
  );

  const [updateLibrary] = useUpdateLibraryAdminMutation();
  const [removeLibrary, { isLoading: isDeleting }] = useRemoveLibraryAdminMutation();

  const localesForSelect = React.useMemo<AdminLocaleOption[]>(() => {
    return (localeOptions || []).map((l: any) => ({
      value: String(l.value || ''),
      label: String(l.label || l.value || ''),
    }));
  }, [localeOptions]);

  const handleToggleActive = async (item: LibraryDto, value: boolean) => {
    try {
      await updateLibrary({ id: item.id, patch: { is_active: value } }).unwrap();
    } catch {
      toast.error('Aktiflik değiştirilemedi');
    }
  };

  const handleTogglePublished = async (item: LibraryDto, value: boolean) => {
    try {
      await updateLibrary({ id: item.id, patch: { is_published: value } }).unwrap();
    } catch {
      toast.error('Yayın durumu değiştirilemedi');
    }
  };

  const handleToggleFeatured = async (item: LibraryDto, value: boolean) => {
    try {
      await updateLibrary({ id: item.id, patch: { featured: value } }).unwrap();
    } catch {
      toast.error('Öne çıkarma değiştirilemedi');
    }
  };

  const handleDelete = async (item: LibraryDto) => {
    if (!confirm(`"${item.name || item.slug}" silinsin mi?`)) return;
    try {
      await removeLibrary(item.id).unwrap();
      toast.success('Silindi');
      refetch();
    } catch {
      toast.error('Silinemedi');
    }
  };

  const isLoading = isFetching || isDeleting;

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
              <Button onClick={() => router.push('/admin/library/new')}>
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
                placeholder={t('filters.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Locale */}
            <div className="w-[140px]">
              <AdminLocaleSelect
                options={localesForSelect}
                value={locale}
                onChange={setLocale}
                disabled={isLoading}
              />
            </div>

            {/* Type */}
            <div className="w-[160px]">
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Tipler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  {LIBRARY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
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
                  Aktif
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="published-filter"
                  checked={showOnlyPublished}
                  onCheckedChange={setShowOnlyPublished}
                  disabled={isLoading}
                />
                <Label htmlFor="published-filter" className="cursor-pointer text-sm">
                  Yayın
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
                  Öne Çıkan
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
                <TableHead>Ad / Slug</TableHead>
                <TableHead className="w-[110px]">Tip</TableHead>
                <TableHead className="w-[80px] text-center">Aktif</TableHead>
                <TableHead className="w-[80px] text-center">Yayın</TableHead>
                <TableHead className="w-[90px] text-center">Öne Çıkan</TableHead>
                <TableHead className="w-[70px] text-center">Görünt.</TableHead>
                <TableHead className="w-[70px] text-center">İndirme</TableHead>
                <TableHead className="w-[60px] text-center">Sıra</TableHead>
                <TableHead className="w-[110px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-muted-foreground text-sm">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-muted-foreground text-sm">
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => {
                  const isActive = isTruthy(item.is_active);
                  const isPublished = isTruthy(item.is_published);
                  const isFeatured = isTruthy(item.featured);
                  const typeMeta = LIBRARY_TYPES.find((t) => t.value === item.type);

                  return (
                    <TableRow key={item.id} className={!isActive ? 'opacity-50' : ''}>
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>

                      <TableCell>
                        <div
                          className="font-medium text-sm truncate max-w-[280px]"
                          title={item.name || ''}
                        >
                          {item.name || <span className="text-muted-foreground italic">(adsız)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                          <code>{item.slug || '—'}</code>
                        </div>
                      </TableCell>

                      <TableCell>
                        {typeMeta ? (
                          <Badge variant="secondary" className="text-xs">
                            {typeMeta.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.type || '—'}</span>
                        )}
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
                          checked={isPublished}
                          disabled={isLoading}
                          onCheckedChange={(v) => handleTogglePublished(item, v)}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={isFeatured}
                          disabled={isLoading}
                          onCheckedChange={(v) => handleToggleFeatured(item, v)}
                        />
                      </TableCell>

                      <TableCell className="text-center text-sm">{item.views ?? 0}</TableCell>
                      <TableCell className="text-center text-sm">{item.download_count ?? 0}</TableCell>
                      <TableCell className="text-center text-sm">{item.display_order ?? 0}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => router.push(`/admin/library/${item.id}`)}
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
