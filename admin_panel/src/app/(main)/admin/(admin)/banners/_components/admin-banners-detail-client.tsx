'use client';

import * as React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
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
import { useCreateBannerAdminMutation, useGetBannerAdminQuery, useUpdateBannerAdminMutation } from '@/integrations/hooks';
import type { BannerCreatePayload } from '@/integrations/shared/banner_admin.types';

type Props = { mode: 'create' } | { mode: 'edit'; id: number };

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  image_asset_id: string;
  thumbnail_url: string;
  thumbnail_asset_id: string;
  alt: string;
  background_color: string;
  title_color: string;
  description_color: string;
  button_text: string;
  button_color: string;
  button_hover_color: string;
  button_text_color: string;
  link_url: string;
  link_target: '_self' | '_blank';
  display_order: string;
  desktop_row: string;
  desktop_columns: string;
  is_active: boolean;
  advertiser_name: string;
  contact_info: string;
  start_at: string;
  end_at: string;
};

const initialForm: FormState = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  image_url: '',
  image_asset_id: '',
  thumbnail_url: '',
  thumbnail_asset_id: '',
  alt: '',
  background_color: '#EEF7EF',
  title_color: '#1A3C25',
  description_color: '#3D6B50',
  button_text: '',
  button_color: '#D4873C',
  button_hover_color: '#BF7230',
  button_text_color: '#FFFFFF',
  link_url: '',
  link_target: '_self',
  display_order: '0',
  desktop_row: '0',
  desktop_columns: '1',
  is_active: true,
  advertiser_name: '',
  contact_info: '',
  start_at: '',
  end_at: '',
};

const toDateTimeLocal = (v: string | null | undefined): string => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIso = (v: string): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export default function AdminBannersDetailClient(props: Props) {
  const t = useAdminT('admin.banners');
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(initialForm);

  const isEdit = props.mode === 'edit';
  const { data, isLoading, isFetching } = useGetBannerAdminQuery(
    { id: isEdit ? props.id : 0 },
    { skip: !isEdit },
  );

  React.useEffect(() => {
    if (!data || !isEdit) return;
    setForm({
      title: data.title || '',
      slug: data.slug || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      image_url: data.image_effective_url || data.image_url || '',
      image_asset_id: data.image_asset_id || '',
      thumbnail_url: data.thumbnail_url || '',
      thumbnail_asset_id: data.thumbnail_asset_id || '',
      alt: data.alt || '',
      background_color: data.background_color || '',
      title_color: data.title_color || '',
      description_color: data.description_color || '',
      button_text: data.button_text || '',
      button_color: data.button_color || '',
      button_hover_color: data.button_hover_color || '',
      button_text_color: data.button_text_color || '',
      link_url: data.link_url || '',
      link_target: data.link_target || '_self',
      display_order: String(data.display_order ?? 0),
      desktop_row: String(data.desktop_row ?? 0),
      desktop_columns: String(data.desktop_columns ?? 1),
      is_active: !!data.is_active,
      advertiser_name: data.advertiser_name || '',
      contact_info: data.contact_info || '',
      start_at: toDateTimeLocal(data.start_at),
      end_at: toDateTimeLocal(data.end_at),
    });
  }, [data, isEdit]);

  const [createBanner, createState] = useCreateBannerAdminMutation();
  const [updateBanner, updateState] = useUpdateBannerAdminMutation();
  const busy = isLoading || isFetching || createState.isLoading || updateState.isLoading;

  const onSubmit = async () => {
    if (!form.title.trim()) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const payload: BannerCreatePayload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      image_asset_id: form.image_asset_id.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      thumbnail_asset_id: form.thumbnail_asset_id.trim() || null,
      alt: form.alt.trim() || null,
      background_color: form.background_color.trim() || null,
      title_color: form.title_color.trim() || null,
      description_color: form.description_color.trim() || null,
      button_text: form.button_text.trim() || null,
      button_color: form.button_color.trim() || null,
      button_hover_color: form.button_hover_color.trim() || null,
      button_text_color: form.button_text_color.trim() || null,
      link_url: form.link_url.trim() || null,
      link_target: form.link_target,
      display_order: Number(form.display_order || 0),
      desktop_row: Number(form.desktop_row || 0),
      desktop_columns: Number(form.desktop_columns || 1),
      is_active: form.is_active,
      advertiser_name: form.advertiser_name.trim() || null,
      contact_info: form.contact_info.trim() || null,
      start_at: toIso(form.start_at),
      end_at: toIso(form.end_at),
    };

    try {
      if (isEdit) {
        await updateBanner({ id: props.id, patch: payload }).unwrap();
        toast.success(t('messages.updated'));
      } else {
        await createBanner(payload).unwrap();
        toast.success(t('messages.created'));
      }
      router.push('/admin/banners');
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{isEdit ? t('form.titleEdit') : t('form.titleCreate')}</h1>
          <p className="text-sm text-muted-foreground">{t('form.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/banners')} disabled={busy}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.clear')}
          </Button>
          <Button onClick={onSubmit} disabled={busy}>
            <Save className="mr-2 size-4" />
            {isEdit ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t('form.titleEdit') : t('form.titleCreate')}</CardTitle>
          <CardDescription>
            Banner oluşturduktan sonra ID numarasını Tema → Ana Sayfa → Banner bölümlerine yazın.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">

          {/* Temel bilgiler */}
          <div className="space-y-2">
            <Label>{t('form.title')}</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.slug')}</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.displayOrder')}</Label>
            <Input type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))} />
            <p className="text-xs text-muted-foreground">
              Aynı satırdaki bannerlar küçük sırayla önce görünür.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Satır Numarası</Label>
            <Input
              type="number"
              min={0}
              max={99}
              value={form.desktop_row}
              onChange={(e) => setForm((p) => ({ ...p, desktop_row: e.target.value }))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Bu alan satır bazlı eski düzen içindir. Yeni düzende ana sayfa bannerı, tema panelindeki Banner `instance` değerine yazılan Banner ID ile çağrılır.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sütun Sayısı</Label>
            <Select value={form.desktop_columns} onValueChange={(v) => setForm((p) => ({ ...p, desktop_columns: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Tam genişlik (12/12)</SelectItem>
                <SelectItem value="2">2 — Yarım genişlik (6/12 × 2)</SelectItem>
                <SelectItem value="3">3 — Üçte bir (4/12 × 3)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O satırda kaç eşit sütun olacağını belirler. Aynı satırdaki tüm bannerlar ilk bannerin değerini kullanır.
            </p>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>{t('form.subtitle')}</Label>
            <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>{t('form.descriptionField')}</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Görseller */}
          <div className="space-y-2 md:col-span-2">
            <AdminImageUploadField
              label={t('form.image')}
              value={form.image_url}
              onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
              onSelectAsset={({ assetId, url }) =>
                setForm((p) => ({
                  ...p,
                  image_url: url,
                  image_asset_id: assetId ?? '',
                }))
              }
              bucket="default"
              folder="banners/images"
            />
          </div>
          <div className="space-y-2">
            <AdminImageUploadField
              label={t('form.thumbnail')}
              value={form.thumbnail_url}
              onChange={(url) => setForm((p) => ({ ...p, thumbnail_url: url }))}
              onSelectAsset={({ assetId, url }) =>
                setForm((p) => ({
                  ...p,
                  thumbnail_url: url,
                  thumbnail_asset_id: assetId ?? '',
                }))
              }
              bucket="default"
              folder="banners/thumbs"
              previewAspect="1x1"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('form.alt')}</Label>
            <Input value={form.alt} onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))} />
          </div>

          {/* Bağlantı */}
          <div className="space-y-2">
            <Label>{t('form.linkUrl')}</Label>
            <Input value={form.link_url} onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.linkTarget')}</Label>
            <Select value={form.link_target} onValueChange={(v) => setForm((p) => ({ ...p, link_target: v as '_self' | '_blank' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">_self (aynı sekme)</SelectItem>
                <SelectItem value="_blank">_blank (yeni sekme)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buton */}
          <div className="space-y-2">
            <Label>{t('form.buttonText')}</Label>
            <Input value={form.button_text} onChange={(e) => setForm((p) => ({ ...p, button_text: e.target.value }))} />
          </div>

          {/* Renkler */}
          <div className="space-y-2">
            <Label>{t('form.backgroundColor')}</Label>
            <Input value={form.background_color} onChange={(e) => setForm((p) => ({ ...p, background_color: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.titleColor')}</Label>
            <Input value={form.title_color} onChange={(e) => setForm((p) => ({ ...p, title_color: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.descriptionColor')}</Label>
            <Input value={form.description_color} onChange={(e) => setForm((p) => ({ ...p, description_color: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.buttonColor')}</Label>
            <Input value={form.button_color} onChange={(e) => setForm((p) => ({ ...p, button_color: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.buttonHoverColor')}</Label>
            <Input value={form.button_hover_color} onChange={(e) => setForm((p) => ({ ...p, button_hover_color: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.buttonTextColor')}</Label>
            <Input value={form.button_text_color} onChange={(e) => setForm((p) => ({ ...p, button_text_color: e.target.value }))} />
          </div>

          {/* Tarih */}
          <div className="space-y-2">
            <Label>{t('form.startAt')}</Label>
            <Input type="datetime-local" value={form.start_at} onChange={(e) => setForm((p) => ({ ...p, start_at: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.endAt')}</Label>
            <Input type="datetime-local" value={form.end_at} onChange={(e) => setForm((p) => ({ ...p, end_at: e.target.value }))} />
          </div>

          {/* Reklamveren bilgisi */}
          <div className="space-y-2">
            <Label>Reklamveren Adı</Label>
            <Input value={form.advertiser_name} onChange={(e) => setForm((p) => ({ ...p, advertiser_name: e.target.value }))} placeholder="Kaman Gübre A.Ş." />
          </div>
          <div className="space-y-2">
            <Label>İletişim Bilgisi</Label>
            <Input value={form.contact_info} onChange={(e) => setForm((p) => ({ ...p, contact_info: e.target.value }))} placeholder="+90 555 000 0000" />
          </div>

          {/* Aktif */}
          <div className="md:col-span-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="size-4" />
              {t('form.isActive')}
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
