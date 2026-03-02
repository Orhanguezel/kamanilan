// =============================================================
// FILE: src/app/(main)/admin/(admin)/library/_components/library-detail-client.tsx
// Library Detail/Edit Form — CLAUDE.md Standartı
// - Form Tab: tüm alanlar + görsel sidebar
// - JSON Tab: tüm formData + görsel sidebar
// - AdminLocaleSelect, AdminJsonEditor, AdminImageUploadField
// Ensotek Admin Panel
// =============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichContentEditor from '@/app/(main)/admin/_components/common/RichContentEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, FileJson } from 'lucide-react';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';
import { AdminLocaleSelect } from '@/app/(main)/admin/_components/common/AdminLocaleSelect';
import { AdminJsonEditor } from '@/app/(main)/admin/_components/common/AdminJsonEditor';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
import { useAdminLocales } from '@/app/(main)/admin/_components/common/useAdminLocales';
import { toast } from 'sonner';
import {
  useGetLibraryAdminQuery,
  useCreateLibraryAdminMutation,
  useUpdateLibraryAdminMutation,
} from '@/integrations/endpoints/admin/library_admin.endpoints';
import { LibraryFilesSection } from './library-files-section';
import { LibraryImagesSection } from './library-images-section';

// ─── Sabitler ────────────────────────────────────────────────

const LIBRARY_TYPES = [
  { value: 'brochure', label: 'Broşür' },
  { value: 'catalog', label: 'Katalog' },
  { value: 'manual', label: 'Kılavuz' },
  { value: 'technical', label: 'Teknik Döküman' },
  { value: 'other', label: 'Diğer' },
];

// ─── Props ───────────────────────────────────────────────────

interface Props {
  id: string;
}

// ─── Bileşen ─────────────────────────────────────────────────

export default function LibraryDetailClient({ id }: Props) {
  const t = useAdminT('admin.library');
  const router = useRouter();
  const adminLocale = usePreferencesStore((s) => s.adminLocale);
  const isNew = id === 'new';

  const { localeOptions } = useAdminLocales();
  const [activeLocale, setActiveLocale] = React.useState<string>(adminLocale || 'tr');
  const [activeTab, setActiveTab] = React.useState<'form' | 'json'>('form');

  // ── RTK Query ──
  const { data: item, isFetching, refetch } = useGetLibraryAdminQuery(
    { id, locale: activeLocale },
    { skip: isNew },
  );
  const [createLibrary, { isLoading: isCreating }] = useCreateLibraryAdminMutation();
  const [updateLibrary, { isLoading: isUpdating }] = useUpdateLibraryAdminMutation();

  // ── Form state ──
  const [formData, setFormData] = React.useState({
    locale: activeLocale,
    type: 'other' as string,
    name: '',
    slug: '',
    description: '',
    image_alt: '',
    tags: '',
    image_url: '',
    image_asset_id: '',
    featured_image: '',
    category_id: '',
    sub_category_id: '',
    display_order: 0,
    is_active: true,
    is_published: true,
    featured: false,
    published_at: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  // ── Veri yüklenince formData'yı doldur ──
  React.useEffect(() => {
    if (item && !isNew) {
      setFormData({
        locale: item.locale || activeLocale,
        type: item.type || 'other',
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        image_alt: item.image_alt || '',
        tags: item.tags || '',
        image_url: item.image_url || '',
        image_asset_id: item.image_asset_id || '',
        featured_image: item.featured_image || '',
        category_id: item.category_id || '',
        sub_category_id: item.sub_category_id || '',
        display_order: item.display_order ?? 0,
        is_active: item.is_active === 1,
        is_published: item.is_published === 1,
        featured: item.featured === 1,
        published_at: item.published_at || '',
        meta_title: item.meta_title || '',
        meta_description: item.meta_description || '',
        meta_keywords: item.meta_keywords || '',
      });
    }
  }, [item, isNew, activeLocale]);

  // ── Locale değişince yeniden çek ──
  React.useEffect(() => {
    if (!isNew && id) refetch();
  }, [activeLocale, id, isNew, refetch]);

  // ── Handler'lar ──
  const handleBack = () => router.push('/admin/library');

  const handleLocaleChange = (next: string) => {
    setActiveLocale(next);
    setFormData((prev) => ({ ...prev, locale: next }));
  };

  const handleChange = (field: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // JSON tab: tüm formData'yı günceller (CLAUDE.md standartı)
  const handleJsonChange = (json: Record<string, any>) =>
    setFormData((prev) => ({ ...prev, ...json }));

  // Görsel upload (hem form hem JSON tab sidebar)
  const handleImageChange = (url: string) =>
    setFormData((prev) => ({ ...prev, image_url: url }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Ad (name) zorunludur');
      return;
    }
    if (!formData.slug.trim() && !isNew) {
      toast.error('Slug zorunludur');
      return;
    }

    const payload = {
      locale: activeLocale,
      type: formData.type || 'other',
      name: formData.name.trim() || undefined,
      slug: formData.slug.trim() || undefined,
      description: formData.description || undefined,
      image_alt: formData.image_alt || undefined,
      tags: formData.tags || undefined,
      image_url: formData.image_url || null,
      image_asset_id: formData.image_asset_id || null,
      featured_image: formData.featured_image || null,
      category_id: formData.category_id || null,
      sub_category_id: formData.sub_category_id || null,
      display_order: formData.display_order ?? 0,
      is_active: formData.is_active,
      is_published: formData.is_published,
      featured: formData.featured,
      published_at: formData.published_at || null,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      meta_keywords: formData.meta_keywords || undefined,
    };

    try {
      if (isNew) {
        await createLibrary(payload).unwrap();
        toast.success('Library kaydı oluşturuldu');
      } else {
        await updateLibrary({ id, patch: payload }).unwrap();
        toast.success('Library kaydı güncellendi');
      }
      router.push('/admin/library');
    } catch (error: any) {
      const msg = error?.data?.error?.message || error?.message || 'Hata oluştu';
      toast.error(`Hata: ${msg}`);
    }
  };

  const isLoading = isFetching || isCreating || isUpdating;

  const localesForSelect = React.useMemo(() => {
    return (localeOptions || []).map((l: any) => ({
      value: String(l.value || ''),
      label: String(l.label || l.value || ''),
    }));
  }, [localeOptions]);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">
                  {isNew ? t('actions.create') : t('actions.edit')}
                </CardTitle>
                <CardDescription>
                  {isNew ? 'Yeni library kaydı oluştur' : `${item?.name || ''} düzenle`}
                </CardDescription>
              </div>
            </div>
            <AdminLocaleSelect
              options={localesForSelect}
              value={activeLocale}
              onChange={handleLocaleChange}
              disabled={isLoading}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
        <TabsList>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="json">
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </TabsTrigger>
        </TabsList>

        {/* ── Form Tab ─────────────────────────────────────────── */}
        <TabsContent value="form">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sol: form alanları */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Ad */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={isLoading}
                        placeholder="Library başlığı"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug {!isNew && '*'}</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        disabled={isLoading}
                        placeholder="library-slug"
                      />
                    </div>

                    {/* Tip + Sıralama */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tip</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => handleChange('type', v)}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LIBRARY_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="display_order">Sıralama</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => handleChange('display_order', Number(e.target.value))}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <RichContentEditor
                        value={formData.description}
                        onChange={(v) => handleChange('description', v)}
                        disabled={isLoading}
                        height="300px"
                      />
                    </div>

                    {/* Alt + Etiketler */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_alt">Görsel Alt Text</Label>
                        <Input
                          id="image_alt"
                          value={formData.image_alt}
                          onChange={(e) => handleChange('image_alt', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Etiketler</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => handleChange('tags', e.target.value)}
                          disabled={isLoading}
                          placeholder="virgülle ayır"
                        />
                      </div>
                    </div>

                    {/* Yayın tarihi */}
                    <div className="space-y-2">
                      <Label htmlFor="published_at">Yayın Tarihi</Label>
                      <Input
                        id="published_at"
                        type="datetime-local"
                        value={formData.published_at}
                        onChange={(e) => handleChange('published_at', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    {/* SEO */}
                    <div className="space-y-4 rounded-md border p-4">
                      <p className="text-sm font-medium text-muted-foreground">SEO</p>
                      <div className="space-y-2">
                        <Label htmlFor="meta_title">Meta Başlık</Label>
                        <Input
                          id="meta_title"
                          value={formData.meta_title}
                          onChange={(e) => handleChange('meta_title', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Açıklama</Label>
                        <Textarea
                          id="meta_description"
                          value={formData.meta_description}
                          onChange={(e) => handleChange('meta_description', e.target.value)}
                          disabled={isLoading}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler</Label>
                        <Input
                          id="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={(e) => handleChange('meta_keywords', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(v) => handleChange('is_active', v)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_published"
                          checked={formData.is_published}
                          onCheckedChange={(v) => handleChange('is_published', v)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="is_published" className="cursor-pointer">Yayında</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(v) => handleChange('featured', v)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="featured" className="cursor-pointer">Öne Çıkan</Label>
                      </div>
                    </div>
                  </div>

                  {/* Sağ: görsel sidebar */}
                  <div className="space-y-4">
                    <AdminImageUploadField
                      label="Kapak Görseli"
                      value={formData.image_url}
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />

                    {!isNew && (
                      <>
                        <LibraryFilesSection libraryId={id} locale={activeLocale} />
                        <LibraryImagesSection
                          libraryId={id}
                          locale={activeLocale}
                          coverUrl={formData.image_url}
                          onSelectAsCover={handleImageChange}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Kaydet */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                    {t('actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {t('actions.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* ── JSON Tab ─────────────────────────────────────────── */}
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Library Verisi (JSON)</CardTitle>
              <CardDescription>
                Tüm alanları JSON olarak düzenleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol: tüm formData JSON editörde */}
                <div className="lg:col-span-2">
                  <AdminJsonEditor
                    value={formData}
                    onChange={handleJsonChange}
                    disabled={isLoading}
                    height={500}
                  />
                </div>

                {/* Sağ: görsel önizleme/yükleme */}
                <div className="space-y-4">
                  <AdminImageUploadField
                    label="Kapak Görseli"
                    value={formData.image_url}
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                  {t('actions.cancel')}
                </Button>
                <Button onClick={() => handleSubmit()} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('actions.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
