'use client';

import type * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
import type { PopupDisplayFrequency } from '@/integrations/shared';
import type { PopupFormState } from './popup-shared';
import { txt } from './popup-shared';

type Props = {
  isEdit: boolean;
  page: Record<string, unknown>;
  form: PopupFormState;
  setForm: React.Dispatch<React.SetStateAction<PopupFormState>>;
};

export default function AdminPopupsFormCard({ isEdit, page, form, setForm }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? txt(page?.edit_title, 'Popup Duzenle') : txt(page?.create_title, 'Popup Ekle')}</CardTitle>
        <CardDescription>{txt(page?.list_desc, 'Popup alanlarini doldurun')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.title_label, 'Baslik')}</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={txt(page?.title_ph, 'Baslik girin')}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.content_label, 'Icerik')}</Label>
          <Textarea
            value={form.content ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={5}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <AdminImageUploadField
            label={txt(page?.image_url_label, 'Gorsel')}
            value={(form.image_url as string) ?? ''}
            onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
            bucket="default"
            folder="popups"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.image_alt_label, 'Gorsel Alt Metni')}</Label>
          <Input
            value={form.image_alt ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, image_alt: e.target.value }))}
            placeholder={txt(page?.image_alt_ph, 'Alt metin')}
          />
        </div>

        <div className="space-y-2">
          <Label>{txt(page?.frequency_label, 'Siklik')}</Label>
          <Select
            value={form.display_frequency || 'always'}
            onValueChange={(v) => setForm((p) => ({ ...p, display_frequency: v as PopupDisplayFrequency }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">{txt(page?.frequency_always, 'Her zaman')}</SelectItem>
              <SelectItem value="once">{txt(page?.frequency_once, 'Bir kez')}</SelectItem>
              <SelectItem value="daily">{txt(page?.frequency_daily, 'Gunluk')}</SelectItem>
              <SelectItem value="weekly">{txt(page?.frequency_weekly, 'Haftalik')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
          <Label>{txt(page?.active_label, 'Aktif')}</Label>
        </div>

        <div className="space-y-2">
          <Label>{txt(page?.start_date_label, 'Baslangic Tarihi')}</Label>
          <Input
            type="date"
            value={typeof form.start_date === 'string' ? form.start_date : ''}
            onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value || null }))}
          />
        </div>
        <div className="space-y-2">
          <Label>{txt(page?.end_date_label, 'Bitis Tarihi')}</Label>
          <Input
            type="date"
            value={typeof form.end_date === 'string' ? form.end_date : ''}
            onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value || null }))}
          />
        </div>

        <div className="space-y-2">
          <Label>{txt(page?.delay_label, 'Gecikme (sn)')}</Label>
          <Input
            type="number"
            value={form.delay_seconds ?? 0}
            onChange={(e) => setForm((p) => ({ ...p, delay_seconds: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>{txt(page?.duration_label, 'Sure (sn)')}</Label>
          <Input
            type="number"
            value={form.duration_seconds ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, duration_seconds: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.display_pages_label, 'Gosterim Sayfalari')}</Label>
          <Input
            value={form.display_pages ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, display_pages: e.target.value }))}
            placeholder={txt(page?.display_pages_ph, 'all')}
          />
        </div>

        <div className="space-y-2">
          <Label>{txt(page?.priority_label, 'Oncelik')}</Label>
          <Input
            type="number"
            value={form.priority ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>

        <div className="space-y-2">
          <Label>{txt(page?.services_id_label, 'Servis ID')}</Label>
          <Input
            value={form.services_id ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, services_id: e.target.value }))}
            placeholder={txt(page?.services_id_ph, '')}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.button_text_label, 'Buton Metni')}</Label>
          <Input
            value={form.button_text ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, button_text: e.target.value }))}
            placeholder={txt(page?.button_text_ph, '')}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>{txt(page?.button_link_label, 'Buton Linki')}</Label>
          <Input
            value={form.button_link ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, button_link: e.target.value }))}
            placeholder={txt(page?.button_link_ph, '')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
