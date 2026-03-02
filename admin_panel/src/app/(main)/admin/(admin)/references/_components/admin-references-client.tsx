'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, RefreshCcw, Search, Trash2, Pencil } from 'lucide-react';
import Image from 'next/image';

import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { FALLBACK_LOCALE } from '@/i18n/config';
import { resolveAdminApiLocale } from '@/i18n/adminLocale';
import { localeShortClient, localeShortClientOr } from '@/i18n/localeShortClient';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

import type { ReferenceDto, ReferenceListQueryParams } from '@/integrations/shared';
import {
  useListReferencesAdminQuery,
  useUpdateReferenceAdminMutation,
  useDeleteReferenceAdminMutation,
} from '@/integrations/hooks';

type PublishedFilter = 'all' | 'published' | 'draft';

type Filters = {
  search: string;
  publishedFilter: PublishedFilter;
  locale: string;
  featuredOnly: boolean;
};

const isTruthyBoolLike = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

function isUuidLike(v?: string) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export default function AdminReferencesClient() {
  const t = useAdminT();
  const router = useRouter();
  const sp = useSearchParams();

  const {
    localeOptions,
    defaultLocaleFromDb,
    loading: localesLoading,
    fetching: localesFetching,
  } = useAdminLocales();

  const apiLocale = React.useMemo(() => {
    return resolveAdminApiLocale(localeOptions as any, defaultLocaleFromDb);
  }, [localeOptions, defaultLocaleFromDb]);

  const urlLocale = React.useMemo(() => {
    const q = sp?.get('locale');
    return localeShortClient(q) || '';
  }, [sp]);

  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    publishedFilter: 'all',
    locale: '',
    featuredOnly: false,
  });

  React.useEffect(() => {
    if (!localeOptions || localeOptions.length === 0) return;

    setFilters((prev) => {
      const prevLoc = localeShortClient(prev.locale);
      const urlLoc = localeShortClient(urlLocale);
      const defLoc = localeShortClientOr(apiLocale);

      const canUse = (l: string) =>
        !!l && (localeOptions ?? []).some((x: any) => localeShortClient(x.value) === l);

      if (prevLoc && canUse(prevLoc)) return prev;
      if (urlLoc && canUse(urlLoc)) return { ...prev, locale: urlLoc };
      if (defLoc && canUse(defLoc)) return { ...prev, locale: defLoc };

      return { ...prev, locale: localeShortClient((localeOptions as any)?.[0]?.value) || FALLBACK_LOCALE };
    });
  }, [localeOptions, urlLocale, apiLocale]);

  const effectiveLocale = React.useMemo(() => {
    const l = localeShortClient(filters.locale);
    return l || apiLocale;
  }, [filters.locale, apiLocale]);

  React.useEffect(() => {
    const l = localeShortClient(filters.locale);
    if (!l) return;
    if (l === urlLocale) return;

    const params = new URLSearchParams(sp?.toString() || '');
    params.set('locale', l);
    router.replace(`/admin/references?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.locale]);

  const is_published = React.useMemo(() => {
    if (filters.publishedFilter === 'all') return undefined;
    return filters.publishedFilter === 'published' ? 1 : 0;
  }, [filters.publishedFilter]);

  const queryParams = React.useMemo(() => {
    const qp: ReferenceListQueryParams = {
      q: filters.search.trim() || undefined,
      locale: effectiveLocale || undefined,
      is_published,
      is_featured: filters.featuredOnly ? 1 : undefined,
      limit: 200,
      offset: 0,
    } as any;
    return qp;
  }, [filters.search, effectiveLocale, is_published, filters.featuredOnly]);

  const listQ = useListReferencesAdminQuery(queryParams as any, {
    refetchOnMountOrArgChange: true,
  } as any);

  const items: ReferenceDto[] = React.useMemo(() => {
    return ((listQ.data as any)?.items ?? []) as ReferenceDto[];
  }, [listQ.data]);

  const total: number = React.useMemo(() => {
    const t = (listQ.data as any)?.total;
    return typeof t === 'number' ? t : items.length;
  }, [listQ.data, items.length]);

  const [updateReference, updateState] = useUpdateReferenceAdminMutation();
  const [deleteReference, deleteState] = useDeleteReferenceAdminMutation();

  const busy =
    listQ.isLoading ||
    listQ.isFetching ||
    localesLoading ||
    localesFetching ||
    updateState.isLoading ||
    deleteState.isLoading;

  function onCreate() {
    const l = localeShortClientOr(effectiveLocale);
    router.push(`/admin/references/new?locale=${encodeURIComponent(l)}`);
  }

  function onEdit(id: string) {
    const l = localeShortClientOr(effectiveLocale);
    router.push(`/admin/references/${encodeURIComponent(id)}?locale=${encodeURIComponent(l)}`);
  }

  async function onTogglePublished(item: ReferenceDto, next: boolean) {
    const id = String(item?.id ?? '');
    if (!isUuidLike(id)) return;

    try {
      await updateReference({ id, patch: { is_published: next ? 1 : 0 } } as any).unwrap();
      toast.success(t('admin.references.list.statusUpdated'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || t('admin.references.list.statusUpdateError'),
      );
    }
  }

  async function onToggleFeatured(item: ReferenceDto, next: boolean) {
    const id = String(item?.id ?? '');
    if (!isUuidLike(id)) return;

    try {
      await updateReference({ id, patch: { is_featured: next ? 1 : 0 } } as any).unwrap();
      toast.success(t('admin.references.list.featuredUpdated'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || t('admin.references.list.statusUpdateError'),
      );
    }
  }

  async function onDelete(item: ReferenceDto) {
    const id = String(item?.id ?? '');
    if (!isUuidLike(id)) return;

    const ok = window.confirm(
      t('admin.references.list.deleteConfirm', { name: String(item?.title ?? 'Referans') }),
    );
    if (!ok) return;

    try {
      await deleteReference(id as any).unwrap();
      toast.success(t('admin.references.list.deleted'));
      listQ.refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message || err?.message || t('admin.references.list.deleteError'),
      );
    }
  }

  function resetFilters() {
    setFilters((p) => ({
      ...p,
      search: '',
      publishedFilter: 'all',
      featuredOnly: false,
    }));
  }

  const showEmpty = !busy && items.length === 0;

  const resolveImg = (item: ReferenceDto) =>
    (item as any).featured_image_url_resolved || item.featured_image || '';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{t('admin.references.header.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.references.header.description')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{t('admin.references.header.filterLabel')}</CardTitle>
              <CardDescription>
                {t('admin.references.header.totalLabel')}{' '}
                <span className="font-medium">{total}</span> •{' '}
                {t('admin.references.header.activeLocale')}{' '}
                <Badge variant="secondary">{effectiveLocale || '—'}</Badge>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onCreate} disabled={busy}>
                <Plus className="mr-2 size-4" />
                {t('admin.references.header.createButton')}
              </Button>
              <Button variant="outline" onClick={() => listQ.refetch()} disabled={busy}>
                <RefreshCcw className="mr-2 size-4" />
                {t('admin.references.header.refreshButton')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="q">{t('admin.references.header.searchLabel')}</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  placeholder={t('admin.references.header.searchPlaceholder')}
                  className="pl-9"
                  disabled={busy}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.references.header.statusLabel')}</Label>
              <Select
                value={filters.publishedFilter}
                onValueChange={(v) => setFilters((p) => ({ ...p, publishedFilter: v as any }))}
                disabled={busy}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.references.header.statusAll')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.references.header.statusAll')}</SelectItem>
                  <SelectItem value="published">
                    {t('admin.references.header.statusActive')}
                  </SelectItem>
                  <SelectItem value="draft">
                    {t('admin.references.header.statusInactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.references.header.localeLabel')}</Label>
              <Select
                value={filters.locale || ''}
                onValueChange={(v) => setFilters((p) => ({ ...p, locale: v }))}
                disabled={busy || (localeOptions?.length ?? 0) === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.references.header.localePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {(localeOptions ?? []).map((l: any) => (
                    <SelectItem key={l.value} value={String(l.value)}>
                      {String(l.label ?? l.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('admin.references.header.localeUrlSync')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 md:pt-7">
              <Switch
                checked={!!filters.featuredOnly}
                onCheckedChange={(v) => setFilters((p) => ({ ...p, featuredOnly: !!v }))}
                disabled={busy}
              />
              <span className="text-sm text-muted-foreground">
                {t('admin.references.header.featuredOnly')}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-6 md:pt-7">
              <Button variant="outline" onClick={resetFilters} disabled={busy}>
                {t('admin.references.header.resetButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-base">{t('admin.references.list.title')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {listQ.isError ? (
            <div className="rounded-md border p-4 text-sm">
              {t('admin.references.list.deleteError')}{' '}
              <Button variant="link" className="px-1" onClick={() => listQ.refetch()}>
                {t('admin.references.header.refreshButton')}
              </Button>
            </div>
          ) : null}

          {/* Desktop table */}
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>{t('admin.references.list.titleColumn')}</TableHead>
                  <TableHead>{t('admin.references.list.websiteColumn')}</TableHead>
                  <TableHead>{t('admin.references.list.featuredColumn')}</TableHead>
                  <TableHead>{t('admin.references.list.statusColumn')}</TableHead>
                  <TableHead className="text-right">
                    {t('admin.references.list.actionsColumn')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => {
                  const id = String(item?.id ?? '');
                  const title = String(item?.title ?? '').trim() || '—';
                  const slug = String(item?.slug ?? '').trim() || '—';
                  const website = String(item?.website_url ?? '').trim();
                  const isPublished = isTruthyBoolLike((item as any)?.is_published);
                  const isFeatured = isTruthyBoolLike((item as any)?.is_featured);
                  const img = resolveImg(item);

                  return (
                    <TableRow key={id}>
                      <TableCell>
                        {img ? (
                          <div className="size-10 overflow-hidden rounded border bg-muted">
                            <Image
                              src={img}
                              alt={String(item?.featured_image_alt ?? title)}
                              width={40}
                              height={40}
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {t('admin.references.list.noImage')}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-muted-foreground">
                          <code>{slug}</code>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-48 truncate text-sm">
                        {website ? (
                          <a
                            href={website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {website}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isFeatured}
                            onCheckedChange={(v) => onToggleFeatured(item, !!v)}
                            disabled={busy || !isUuidLike(id)}
                          />
                          <Badge variant="secondary">
                            {isFeatured
                              ? t('admin.references.list.featuredYes')
                              : t('admin.references.list.featuredNo')}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isPublished}
                            onCheckedChange={(v) => onTogglePublished(item, !!v)}
                            disabled={busy || !isUuidLike(id)}
                          />
                          {isPublished ? (
                            <Badge variant="secondary">
                              {t('admin.references.list.activeStatus')}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {t('admin.references.list.inactiveStatus')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(id)}
                            disabled={busy || !isUuidLike(id)}
                          >
                            <Pencil className="mr-2 size-4" />
                            {t('admin.references.list.editButton')}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:text-destructive"
                            onClick={() => onDelete(item)}
                            disabled={busy || !isUuidLike(id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            {t('admin.references.list.deleteButton')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {showEmpty ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      {t('admin.references.list.noRecords')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {/* Mobile list */}
          <div className="rounded-md border md:hidden">
            <div className="divide-y">
              {items.map((item) => {
                const id = String(item?.id ?? '');
                const title = String(item?.title ?? '').trim() || '—';
                const slug = String(item?.slug ?? '').trim() || '—';
                const isPublished = isTruthyBoolLike((item as any)?.is_published);
                const isFeatured = isTruthyBoolLike((item as any)?.is_featured);

                return (
                  <div key={id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{title}</div>
                      {isPublished ? (
                        <Badge variant="secondary">
                          {t('admin.references.list.activeStatus')}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {t('admin.references.list.inactiveStatus')}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <code>{slug}</code>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(id)}
                        disabled={busy || !isUuidLike(id)}
                      >
                        <Pencil className="mr-2 size-4" />
                        {t('admin.references.list.editButton')}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:text-destructive"
                        onClick={() => onDelete(item)}
                        disabled={busy || !isUuidLike(id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t('admin.references.list.deleteButton')}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {showEmpty ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {t('admin.references.list.noRecords')}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
