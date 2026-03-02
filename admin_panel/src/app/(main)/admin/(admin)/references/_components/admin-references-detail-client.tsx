'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, RefreshCcw } from 'lucide-react';

import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { FALLBACK_LOCALE } from '@/i18n/config';
import { resolveAdminApiLocale } from '@/i18n/adminLocale';
import { localeShortClient, localeShortClientOr } from '@/i18n/localeShortClient';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AdminJsonEditor } from '@/app/(main)/admin/_components/common/AdminJsonEditor';
import RichContentEditor from '@/app/(main)/admin/_components/common/RichContentEditor';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';

import type {
  ReferenceDto,
  ReferenceUpsertPayload,
} from '@/integrations/shared';
import {
  useGetReferenceAdminQuery,
  useCreateReferenceAdminMutation,
  useUpdateReferenceAdminMutation,
} from '@/integrations/hooks';

function isUuidLike(v?: string) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

const normalizeLocale = (v: unknown): string =>
  String(v ?? '')
    .trim()
    .toLowerCase();

const norm = (v: unknown) => String(v ?? '').trim();
const toNull = (v: unknown) => {
  const s = norm(v);
  return s || null;
};

const isTruthyBoolLike = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[äÄ]/g, 'ae')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function getErrMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  return (
    anyErr?.data?.error?.message ||
    anyErr?.data?.message ||
    anyErr?.error ||
    fallback
  );
}

type FormValues = {
  id?: string;
  locale: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: string;
  featured_image: string;
  featured_image_asset_id: string;
  website_url: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_alt: string;
  meta_title: string;
  meta_description: string;
  replicate_all_locales: boolean;
  apply_all_locales: boolean;
};

const emptyForm = (locale: string): FormValues => ({
  locale,
  is_published: true,
  is_featured: false,
  display_order: '0',
  featured_image: '',
  featured_image_asset_id: '',
  website_url: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  featured_image_alt: '',
  meta_title: '',
  meta_description: '',
  replicate_all_locales: false,
  apply_all_locales: false,
});

const dtoToForm = (dto: ReferenceDto): FormValues => ({
  id: String((dto as any).id ?? ''),
  locale: normalizeLocale((dto as any).locale_resolved ?? (dto as any).locale ?? FALLBACK_LOCALE),
  is_published: isTruthyBoolLike((dto as any).is_published),
  is_featured: isTruthyBoolLike((dto as any).is_featured),
  display_order: String((dto as any).display_order ?? 0),
  featured_image: norm((dto as any).featured_image),
  featured_image_asset_id: norm((dto as any).featured_image_asset_id),
  website_url: norm((dto as any).website_url),
  title: norm((dto as any).title),
  slug: norm((dto as any).slug),
  summary: norm((dto as any).summary),
  content: norm((dto as any).content),
  featured_image_alt: norm((dto as any).featured_image_alt),
  meta_title: norm((dto as any).meta_title),
  meta_description: norm((dto as any).meta_description),
  replicate_all_locales: false,
  apply_all_locales: false,
});

export default function AdminReferenceDetailClient({ id }: { id: string }) {
  const t = useAdminT();
  const router = useRouter();
  const sp = useSearchParams();

  const isCreateMode = String(id) === 'new';

  const {
    localeOptions,
    defaultLocaleFromDb,
    loading: localesLoading,
    fetching: localesFetching,
  } = useAdminLocales();

  const apiLocaleFromDb = React.useMemo(() => {
    return resolveAdminApiLocale(localeOptions as any, defaultLocaleFromDb);
  }, [localeOptions, defaultLocaleFromDb]);

  const localeSet = React.useMemo(() => {
    return new Set(
      (localeOptions ?? []).map((x: any) => localeShortClient(x.value)).filter(Boolean),
    );
  }, [localeOptions]);

  const urlLocale = React.useMemo(() => {
    const q = sp?.get('locale');
    return localeShortClient(q) || '';
  }, [sp]);

  const [activeLocale, setActiveLocale] = React.useState<string>('');

  React.useEffect(() => {
    if (!localeOptions || localeOptions.length === 0) return;

    setActiveLocale((prev) => {
      const p = localeShortClient(prev);
      const u = localeShortClient(urlLocale);
      const def = localeShortClientOr(apiLocaleFromDb);

      const canUse = (l: string) => !!l && (localeSet.size === 0 || localeSet.has(l));

      if (p && canUse(p)) return p;
      if (u && canUse(u)) return u;
      if (def && canUse(def)) return def;

      const first = localeShortClient((localeOptions as any)?.[0]?.value);
      return first || FALLBACK_LOCALE;
    });
  }, [localeOptions, localeSet, urlLocale, apiLocaleFromDb]);

  const queryLocale = React.useMemo(() => {
    const l = localeShortClient(activeLocale);
    if (l && (localeSet.size === 0 || localeSet.has(l))) return l;
    return localeShortClientOr(apiLocaleFromDb);
  }, [activeLocale, localeSet, apiLocaleFromDb]);

  React.useEffect(() => {
    const l = localeShortClient(activeLocale);
    if (!l) return;
    if (l === urlLocale) return;

    const params = new URLSearchParams(sp?.toString() || '');
    params.set('locale', l);

    if (isCreateMode) {
      router.replace(`/admin/references/new?${params.toString()}`);
    } else {
      router.replace(`/admin/references/${encodeURIComponent(String(id))}?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocale]);

  const localesReady = !localesLoading && !localesFetching;
  const hasLocales = (localeOptions?.length ?? 0) > 0;

  const shouldSkipDetail = isCreateMode || !isUuidLike(String(id || '')) || !queryLocale;

  const {
    data: reference,
    isLoading: isLoadingRef,
    isFetching: isFetchingRef,
    error: refError,
    refetch,
  } = useGetReferenceAdminQuery(
    { id: String(id), locale: queryLocale } as any,
    { skip: shouldSkipDetail } as any,
  );

  const [createReference, createState] = useCreateReferenceAdminMutation();
  const [updateReference, updateState] = useUpdateReferenceAdminMutation();

  const loading = localesLoading || localesFetching || isLoadingRef || isFetchingRef;
  const saving = createState.isLoading || updateState.isLoading;
  const busy = loading || saving;

  const [values, setValues] = React.useState<FormValues>(() =>
    emptyForm(queryLocale || FALLBACK_LOCALE),
  );
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (isCreateMode) {
      setValues(emptyForm(queryLocale || FALLBACK_LOCALE));
      return;
    }
    if (reference) {
      setValues(dtoToForm(reference));
      setSlugTouched(false);
    }
  }, [reference, isCreateMode, queryLocale]);

  const disabled = loading || saving;

  const localeDisabled = disabled || localesLoading || (localeOptions ?? []).length === 0;

  const handleLocaleChange = (nextLocaleRaw: string) => {
    const next = normalizeLocale(nextLocaleRaw);
    const list = (localeOptions ?? []).map((x: any) => localeShortClient(x.value));
    const resolved = next && list.includes(next) ? next : localeShortClientOr(queryLocale);

    if (!resolved) {
      toast.error(t('admin.references.form.localeRequired'));
      return;
    }

    setValues((prev) => ({ ...prev, locale: resolved }));
    setActiveLocale(resolved);
  };

  function onCancel() {
    router.push(`/admin/references?locale=${encodeURIComponent(queryLocale || FALLBACK_LOCALE)}`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;

    const loc = normalizeLocale(values.locale || queryLocale || apiLocaleFromDb);
    if (!loc || (localeSet.size > 0 && !localeSet.has(localeShortClient(loc)))) {
      toast.error(t('admin.references.formHeader.localeError'));
      return;
    }

    if (!values.title.trim() || !values.slug.trim()) {
      toast.error(t('admin.references.formHeader.titleSlugRequired'));
      return;
    }

    const common: ReferenceUpsertPayload = {
      locale: loc,
      is_published: values.is_published ? 1 : 0,
      is_featured: values.is_featured ? 1 : 0,
      display_order: Number(values.display_order) || 0,
      featured_image: toNull(values.featured_image),
      featured_image_asset_id: toNull(values.featured_image_asset_id),
      website_url: toNull(values.website_url),
      title: values.title.trim(),
      slug: values.slug.trim(),
      summary: toNull(values.summary),
      content: values.content || undefined,
      featured_image_alt: toNull(values.featured_image_alt),
      meta_title: toNull(values.meta_title),
      meta_description: toNull(values.meta_description),
    };

    try {
      if (isCreateMode) {
        const payload = { ...common, replicate_all_locales: values.replicate_all_locales };
        const created = await createReference(payload as any).unwrap();
        const nextId = String((created as any)?.id ?? '').trim();

        if (!isUuidLike(nextId)) {
          toast.error(t('admin.references.formHeader.createdNoId'));
          return;
        }

        toast.success(t('admin.references.formHeader.created'));
        router.replace(
          `/admin/references/${encodeURIComponent(nextId)}?locale=${encodeURIComponent(loc)}`,
        );
        router.refresh();
        return;
      }

      const currentId = String((reference as any)?.id ?? id);
      if (!isUuidLike(currentId)) {
        toast.error(t('admin.references.formHeader.idNotFound'));
        return;
      }

      const patch = { ...common, apply_all_locales: values.apply_all_locales };
      await updateReference({ id: currentId, patch } as any).unwrap();
      toast.success(t('admin.references.formHeader.updated'));

      const short = localeShortClient(loc);
      if (short && short !== queryLocale) setActiveLocale(short);
    } catch (err) {
      toast.error(getErrMessage(err, t('admin.references.formHeader.defaultError')));
    }
  }

  const imageMetadata = React.useMemo(
    () => ({
      module_key: 'references',
      locale: queryLocale,
      reference_slug: values.slug || values.title || '',
      ...(values.id ? { reference_id: values.id } : {}),
    }),
    [queryLocale, values.slug, values.title, values.id],
  );

  // Guards
  if (localesReady && !hasLocales) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{t('admin.references.formHeader.noLocalesTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.references.formHeader.noLocalesDescription')}
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <Button variant="outline" onClick={() => router.push('/admin/site-settings')}>
              {t('admin.references.formHeader.goToSettings')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCreateMode && !isUuidLike(String(id || ''))) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{t('admin.references.formHeader.invalidIdTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.references.formHeader.invalidIdDescription')}{' '}
            <code>{String(id || '-')}</code>
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 size-4" />
              {t('admin.references.formHeader.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCreateMode && !loading && !reference && refError) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{t('admin.references.formHeader.notFoundTitle')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.references.formHeader.notFoundDescription')}{' '}
            <code>{String(id)}</code>
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="mr-2 size-4" />
              {t('admin.references.formHeader.backToList')}
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 size-4" />
              {t('admin.references.formHeader.retryButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pageTitle = isCreateMode
    ? t('admin.references.formHeader.createTitle')
    : (reference as any)?.title || t('admin.references.formHeader.editTitle');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.back()} disabled={busy}>
              <ArrowLeft className="mr-2 size-4" />
              {t('admin.references.formHeader.backButton')}
            </Button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('admin.references.formHeader.description')}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{t('admin.references.formHeader.activeLocale')}</span>
            <Badge variant="secondary">{queryLocale || '-'}</Badge>
            {isCreateMode ? <Badge>CREATE</Badge> : <Badge variant="secondary">EDIT</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {t('admin.references.formHeader.cancelButton')}
          </Button>
          <Button form="reference-form" type="submit" disabled={busy}>
            <Save className="mr-2 size-4" />
            {t('admin.references.formHeader.saveButton')}
          </Button>
        </div>
      </div>

      <form id="reference-form" onSubmit={onSubmit} className="space-y-4">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="text-base">
              {isCreateMode
                ? t('admin.references.form.createTitle')
                : t('admin.references.form.editTitle')}
            </CardTitle>
            <CardDescription>{t('admin.references.form.description')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs defaultValue="form">
              <TabsList>
                <TabsTrigger value="form">{t('admin.references.form.formTab')}</TabsTrigger>
                <TabsTrigger value="json">{t('admin.references.form.jsonTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="mt-4">
                <AdminJsonEditor
                  value={values}
                  disabled={disabled}
                  onChange={(next) => setValues(next as FormValues)}
                  label={t('admin.references.form.jsonLabel')}
                  helperText={t('admin.references.form.jsonHelperText')}
                />
              </TabsContent>

              <TabsContent value="form" className="mt-4">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* LEFT */}
                  <div className="space-y-4 lg:col-span-8">
                    {/* Locale + flags */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>{t('admin.references.form.localeLabel')}</Label>
                        <Select
                          value={normalizeLocale(values.locale) || ''}
                          onValueChange={handleLocaleChange}
                          disabled={localeDisabled}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('admin.references.form.localePlaceholder')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(localeOptions ?? []).map((opt: any) => (
                              <SelectItem
                                key={`${opt.value}:${opt.label}`}
                                value={String(opt.value)}
                              >
                                {String(opt.label ?? opt.value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-4 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="ref_is_published"
                            checked={!!values.is_published}
                            onCheckedChange={(v) =>
                              setValues((prev) => ({ ...prev, is_published: v === true }))
                            }
                            disabled={disabled}
                          />
                          <Label htmlFor="ref_is_published">
                            {t('admin.references.form.publishedLabel')}
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="ref_is_featured"
                            checked={!!values.is_featured}
                            onCheckedChange={(v) =>
                              setValues((prev) => ({ ...prev, is_featured: v === true }))
                            }
                            disabled={disabled}
                          />
                          <Label htmlFor="ref_is_featured">
                            {t('admin.references.form.featuredLabel')}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* title + slug */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('admin.references.form.titleLabel')}</Label>
                        <Input
                          value={values.title}
                          onChange={(e) => {
                            const titleVal = e.target.value;
                            setValues((prev) => {
                              const next = { ...prev, title: titleVal };
                              if (!slugTouched) next.slug = slugify(titleVal);
                              return next;
                            });
                          }}
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('admin.references.form.slugLabel')}</Label>
                        <Input
                          value={values.slug}
                          onFocus={() => setSlugTouched(true)}
                          onChange={(e) => {
                            setSlugTouched(true);
                            setValues((prev) => ({ ...prev, slug: e.target.value }));
                          }}
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    {/* website_url */}
                    <div className="space-y-2">
                      <Label>{t('admin.references.form.websiteUrlLabel')}</Label>
                      <Input
                        value={values.website_url}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, website_url: e.target.value }))
                        }
                        disabled={disabled}
                        placeholder="https://..."
                      />
                    </div>

                    {/* summary */}
                    <div className="space-y-2">
                      <Label>{t('admin.references.form.summaryLabel')}</Label>
                      <Textarea
                        rows={2}
                        value={values.summary}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, summary: e.target.value }))
                        }
                        disabled={disabled}
                      />
                    </div>

                    {/* content (rich) */}
                    <div className="space-y-2">
                      <Label>{t('admin.references.form.contentLabel')}</Label>
                      <RichContentEditor
                        label=""
                        value={values.content || ''}
                        onChange={(next) =>
                          setValues((prev) => ({ ...prev, content: next }))
                        }
                        disabled={disabled}
                        height="280px"
                      />
                    </div>

                    {/* SEO */}
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('admin.references.form.metaTitleLabel')}</Label>
                        <Input
                          value={values.meta_title}
                          onChange={(e) =>
                            setValues((p) => ({ ...p, meta_title: e.target.value }))
                          }
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.references.form.imageAltLabel')}</Label>
                        <Input
                          value={values.featured_image_alt}
                          onChange={(e) =>
                            setValues((p) => ({ ...p, featured_image_alt: e.target.value }))
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.references.form.metaDescriptionLabel')}</Label>
                      <Textarea
                        rows={2}
                        value={values.meta_description}
                        onChange={(e) =>
                          setValues((p) => ({ ...p, meta_description: e.target.value }))
                        }
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-4 lg:col-span-4">
                    <div className="space-y-2">
                      <Label>{t('admin.references.form.displayOrderLabel')}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={values.display_order}
                        onChange={(e) =>
                          setValues((p) => ({ ...p, display_order: e.target.value }))
                        }
                        disabled={disabled}
                      />
                    </div>

                    <AdminImageUploadField
                      label={t('admin.references.formImage.coverLabel')}
                      helperText={t('admin.references.formImage.coverHelperText')}
                      bucket="public"
                      folder="references"
                      metadata={imageMetadata}
                      value={norm(values.featured_image)}
                      onChange={(url) =>
                        setValues((prev) => ({ ...prev, featured_image: norm(url) }))
                      }
                      disabled={disabled}
                      openLibraryHref="/admin/storage"
                      onOpenLibraryClick={() => router.push('/admin/storage')}
                    />

                    <Separator />

                    <div className="space-y-3">
                      <div className="text-sm font-medium">
                        {t('admin.references.form.multiLocaleTitle')}
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="ref_replicate_all"
                          checked={!!values.replicate_all_locales}
                          onCheckedChange={(v) =>
                            setValues((p) => ({ ...p, replicate_all_locales: v === true }))
                          }
                          disabled={disabled}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="ref_replicate_all" className="leading-none">
                            {t('admin.references.form.replicateAllLocales')}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            <code>replicate_all_locales</code>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="ref_apply_all"
                          checked={!!values.apply_all_locales}
                          onCheckedChange={(v) =>
                            setValues((p) => ({ ...p, apply_all_locales: v === true }))
                          }
                          disabled={disabled}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="ref_apply_all" className="leading-none">
                            {t('admin.references.form.applyAllLocales')}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            <code>apply_all_locales</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
