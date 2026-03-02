'use client';

import * as React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { usePreferencesStore } from '@/stores/preferences/preferences-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FlashSaleCreatePayload, FlashSaleScopeType, FlashSaleUpdatePayload } from '@/integrations/shared';
import {
  useCreateFlashSaleAdminMutation,
  useGetFlashSaleAdminQuery,
  useUpdateFlashSaleAdminMutation,
} from '@/integrations/hooks';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';

type Props = { mode: 'create' } | { mode: 'edit'; id: string };

type FormState = {
  title: string;
  slug: string;
  description: string;
  discount_type: 'percent' | 'amount';
  discount_value: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  scope_type: FlashSaleScopeType;
  scope_ids: string[];
  properties_text: string; // textarea for property IDs
  cover_image_url: string;
  background_color: string;
  title_color: string;
  description_color: string;
  button_text: string;
  button_url: string;
  button_bg_color: string;
  button_text_color: string;
  timer_bg_color: string;
  timer_text_color: string;
  display_order: string;
};

const initialForm: FormState = {
  title: '',
  slug: '',
  description: '',
  discount_type: 'percent',
  discount_value: '10',
  start_at: '',
  end_at: '',
  is_active: true,
  scope_type: 'all',
  scope_ids: [],
  properties_text: '',
  cover_image_url: '',
  background_color: '',
  title_color: '',
  description_color: '',
  button_text: '',
  button_url: '',
  button_bg_color: '',
  button_text_color: '',
  timer_bg_color: '',
  timer_text_color: '',
  display_order: '0',
};

function toDateTimeLocal(v: string): string {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

function toIso(v: string): string {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toISOString();
}

const SCOPE_LABELS: Record<FlashSaleScopeType, string> = {
  all: 'Tümünde (Tüm İlanlar)',
  categories: 'Belirli Kategorilerde',
  subcategories: 'Belirli Alt Kategorilerde',
  properties: 'Belirli İlanlarda',
  sellers: 'Belirli Satıcılarda',
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border p-0.5"
        />
        <Input
          value={value}
          placeholder="#ffffff"
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange('')} className="px-2 text-muted-foreground">
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminFlashSaleDetailClient(props: Props) {
  const t = useAdminT('admin.flashSale');
  const router = useRouter();
  const adminLocale = usePreferencesStore((s) => s.adminLocale) || 'tr';

  const [form, setForm] = React.useState<FormState>(initialForm);
  const isEdit = props.mode === 'edit';

  const { data, isLoading, isFetching } = useGetFlashSaleAdminQuery(
    { id: isEdit ? props.id : '' },
    { skip: !isEdit },
  );

  const { data: categories = [] } = useListCategoriesAdminQuery({ is_active: true, limit: 200 } as any);
  const { data: subcategories = [] } = useListSubCategoriesAdminQuery(
    form.scope_type === 'subcategories' ? ({ is_active: true, limit: 500 } as any) : undefined,
    { skip: form.scope_type !== 'subcategories' },
  );

  React.useEffect(() => {
    if (!isEdit || !data) return;
    setForm({
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      discount_type: data.discount_type,
      discount_value: String(data.discount_value),
      start_at: toDateTimeLocal(data.start_at),
      end_at: toDateTimeLocal(data.end_at),
      is_active: data.is_active,
      scope_type: data.scope_type,
      scope_ids: data.scope_ids ?? [],
      properties_text: (data.scope_ids ?? []).join('\n'),
      cover_image_url: data.cover_image_url || '',
      background_color: data.background_color || '',
      title_color: data.title_color || '',
      description_color: data.description_color || '',
      button_text: data.button_text || '',
      button_url: data.button_url || '',
      button_bg_color: data.button_bg_color || '',
      button_text_color: data.button_text_color || '',
      timer_bg_color: data.timer_bg_color || '',
      timer_text_color: data.timer_text_color || '',
      display_order: String(data.display_order),
    });
  }, [data, isEdit]);

  const [createFlashSale, createState] = useCreateFlashSaleAdminMutation();
  const [updateFlashSale, updateState] = useUpdateFlashSaleAdminMutation();
  const busy = isLoading || isFetching || createState.isLoading || updateState.isLoading;

  const getScopeIds = (): string[] => {
    if (form.scope_type === 'all' || form.scope_type === 'sellers') return [];
    if (form.scope_type === 'properties') {
      return form.properties_text
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter((s) => s.length === 36);
    }
    return form.scope_ids;
  };

  const toggleScopeId = (id: string) => {
    setForm((p) => {
      const ids = p.scope_ids.includes(id) ? p.scope_ids.filter((x) => x !== id) : [...p.scope_ids, id];
      return { ...p, scope_ids: ids };
    });
  };

  const onSubmit = async () => {
    const scopeIds = getScopeIds();
    const payloadBase = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      locale: adminLocale,
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      start_at: toIso(form.start_at),
      end_at: toIso(form.end_at),
      is_active: form.is_active,
      scope_type: form.scope_type,
      scope_ids: scopeIds,
      cover_image_url: form.cover_image_url.trim() || null,
      background_color: form.background_color.trim() || null,
      title_color: form.title_color.trim() || null,
      description_color: form.description_color.trim() || null,
      button_text: form.button_text.trim() || null,
      button_url: form.button_url.trim() || null,
      button_bg_color: form.button_bg_color.trim() || null,
      button_text_color: form.button_text_color.trim() || null,
      timer_bg_color: form.timer_bg_color.trim() || null,
      timer_text_color: form.timer_text_color.trim() || null,
      display_order: Number(form.display_order || 0),
    };

    if (!payloadBase.title || !payloadBase.slug || !payloadBase.start_at || !payloadBase.end_at) {
      toast.error(t('messages.requiredError'));
      return;
    }

    try {
      if (isEdit) {
        const patch: FlashSaleUpdatePayload = payloadBase;
        await updateFlashSale({ id: props.id, patch }).unwrap();
        toast.success(t('messages.updated'));
      } else {
        const body: FlashSaleCreatePayload = payloadBase;
        await createFlashSale(body).unwrap();
        toast.success(t('messages.created'));
      }
      router.push('/admin/flash-sale');
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{isEdit ? t('form.editTitle') : t('form.createTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('form.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/flash-sale')} disabled={busy}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.back')}
          </Button>
          <Button onClick={onSubmit} disabled={busy}>
            <Save className="mr-2 size-4" />
            {isEdit ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </div>

      {/* ── Temel Bilgiler ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t('form.editTitle') : t('form.createTitle')}</CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('form.title')}</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.slug')}</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t('form.descriptionField')}</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.discountType')}</Label>
            <Select
              value={form.discount_type}
              onValueChange={(v) => setForm((p) => ({ ...p, discount_type: v as 'percent' | 'amount' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">{t('discount.percent')}</SelectItem>
                <SelectItem value="amount">{t('discount.amount')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('form.discountValue')}</Label>
            <Input
              type="number"
              value={form.discount_value}
              onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('form.startAt')}</Label>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => setForm((p) => ({ ...p, start_at: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('form.endAt')}</Label>
            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => setForm((p) => ({ ...p, end_at: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('form.displayOrder')}</Label>
            <Input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
            />
          </div>
          <div className="flex items-end gap-2">
            <input
              id="flash-sale-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              className="size-4"
            />
            <Label htmlFor="flash-sale-active">{t('form.isActive')}</Label>
          </div>
        </CardContent>
      </Card>

      {/* ── Kampanya Kapsamı ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Kampanya Kapsamı</CardTitle>
          <CardDescription>Bu kampanya hangi ilanlara uygulanacak?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(['all', 'categories', 'subcategories', 'properties', 'sellers'] as FlashSaleScopeType[]).map((scope) => (
              <button
                key={scope}
                type="button"
                disabled={scope === 'sellers'}
                onClick={() => setForm((p) => ({ ...p, scope_type: scope, scope_ids: [] }))}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                  form.scope_type === scope
                    ? 'border-primary bg-primary/10 text-primary'
                    : scope === 'sellers'
                      ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50'
                      : 'border-border hover:border-primary/50'
                }`}
              >
                {SCOPE_LABELS[scope]}
                {scope === 'sellers' && <span className="ml-1 text-xs">(Yakında)</span>}
              </button>
            ))}
          </div>

          {/* Kategori seçici */}
          {form.scope_type === 'categories' && (
            <div className="space-y-2">
              <Label>Kategoriler seç</Label>
              <div className="grid max-h-64 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {(categories as any[]).map((cat: any) => (
                  <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={form.scope_ids.includes(cat.id)}
                      onChange={() => toggleScopeId(cat.id)}
                      className="size-4"
                    />
                    <span className="text-sm">
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </span>
                  </label>
                ))}
                {!(categories as any[]).length && (
                  <p className="text-sm text-muted-foreground">Kategori yükleniyor…</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{form.scope_ids.length} kategori seçildi</p>
            </div>
          )}

          {/* Alt kategori seçici */}
          {form.scope_type === 'subcategories' && (
            <div className="space-y-2">
              <Label>Alt Kategoriler seç</Label>
              <div className="grid max-h-64 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {(subcategories as any[]).map((sub: any) => (
                  <label key={sub.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={form.scope_ids.includes(sub.id)}
                      onChange={() => toggleScopeId(sub.id)}
                      className="size-4"
                    />
                    <span className="text-sm">
                      {sub.icon && <span className="mr-1">{sub.icon}</span>}
                      {sub.name}
                    </span>
                  </label>
                ))}
                {!(subcategories as any[]).length && (
                  <p className="text-sm text-muted-foreground">Alt kategori yükleniyor…</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{form.scope_ids.length} alt kategori seçildi</p>
            </div>
          )}

          {/* İlan ID textarea */}
          {form.scope_type === 'properties' && (
            <div className="space-y-2">
              <Label>İlan ID'leri (her satıra bir UUID)</Label>
              <Textarea
                rows={6}
                placeholder="uuid-1&#10;uuid-2&#10;uuid-3"
                value={form.properties_text}
                onChange={(e) => setForm((p) => ({ ...p, properties_text: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                {form.properties_text
                  .split(/[\n,]/)
                  .map((s) => s.trim())
                  .filter((s) => s.length === 36).length}{' '}
                geçerli ilan ID'si
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Görsel Tasarım ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Görsel Tasarım</CardTitle>
          <CardDescription>Kampanya kartının görünümünü özelleştir (opsiyonel)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kapak Görseli */}
          <div className="space-y-2">
            <Label>Kapak Görseli URL</Label>
            <Input
              value={form.cover_image_url}
              placeholder="https://..."
              onChange={(e) => setForm((p) => ({ ...p, cover_image_url: e.target.value }))}
            />
          </div>

          {/* Arka Plan ve Yazı Renkleri */}
          <div className="grid gap-4 md:grid-cols-3">
            <ColorField
              label="Arka Plan Rengi"
              value={form.background_color}
              onChange={(v) => setForm((p) => ({ ...p, background_color: v }))}
            />
            <ColorField
              label="Başlık Rengi"
              value={form.title_color}
              onChange={(v) => setForm((p) => ({ ...p, title_color: v }))}
            />
            <ColorField
              label="Açıklama Rengi"
              value={form.description_color}
              onChange={(v) => setForm((p) => ({ ...p, description_color: v }))}
            />
          </div>

          {/* Buton */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Buton Metni</Label>
              <Input
                value={form.button_text}
                placeholder="Kampanyayı Gör"
                onChange={(e) => setForm((p) => ({ ...p, button_text: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Buton URL</Label>
              <Input
                value={form.button_url}
                placeholder="/ilanlar?kategori=..."
                onChange={(e) => setForm((p) => ({ ...p, button_url: e.target.value }))}
              />
            </div>
            <ColorField
              label="Buton Arka Plan"
              value={form.button_bg_color}
              onChange={(v) => setForm((p) => ({ ...p, button_bg_color: v }))}
            />
            <ColorField
              label="Buton Yazı Rengi"
              value={form.button_text_color}
              onChange={(v) => setForm((p) => ({ ...p, button_text_color: v }))}
            />
          </div>

          {/* Geri Sayım Renkleri */}
          <div className="grid gap-4 md:grid-cols-2">
            <ColorField
              label="Geri Sayım Arka Planı"
              value={form.timer_bg_color}
              onChange={(v) => setForm((p) => ({ ...p, timer_bg_color: v }))}
            />
            <ColorField
              label="Geri Sayım Yazı Rengi"
              value={form.timer_text_color}
              onChange={(v) => setForm((p) => ({ ...p, timer_text_color: v }))}
            />
          </div>

          {/* Önizleme */}
          {(form.background_color || form.title || form.cover_image_url) && (
            <div className="rounded-lg border p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Önizleme</p>
              <div
                className="relative overflow-hidden rounded-xl p-5"
                style={{
                  backgroundColor: form.background_color || '#F6F9FE',
                  backgroundImage: form.cover_image_url ? `url(${form.cover_image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  className="relative z-10"
                  style={{ backdropFilter: form.cover_image_url ? 'brightness(0.7)' : undefined }}
                >
                  <h3
                    className="text-xl font-bold"
                    style={{ color: form.title_color || '#111827' }}
                  >
                    {form.title || 'Kampanya Başlığı'}
                  </h3>
                  {form.description && (
                    <p className="mt-1 text-sm" style={{ color: form.description_color || '#4B5563' }}>
                      {form.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="rounded px-3 py-1 text-sm font-semibold"
                      style={{
                        backgroundColor: form.timer_bg_color || '#FEF3C7',
                        color: form.timer_text_color || '#92400E',
                      }}
                    >
                      00:00:00
                    </span>
                    {form.button_text && (
                      <span
                        className="rounded-full px-4 py-1.5 text-sm font-semibold"
                        style={{
                          backgroundColor: form.button_bg_color || '#1A73E8',
                          color: form.button_text_color || '#FFFFFF',
                        }}
                      >
                        {form.button_text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
