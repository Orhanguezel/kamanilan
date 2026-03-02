'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useAdminUiCopy } from '@/app/(main)/admin/_components/common/useAdminUiCopy';
import type {
  PopupAdminCreateBody,
  PopupDisplayFrequency,
} from '@/integrations/shared';
import {
  useCreatePopupAdminMutation,
  useGetPopupAdminQuery,
  useUpdatePopupAdminMutation,
} from '@/integrations/hooks';
import AdminPopupsDetailHeader from './admin-popups-detail-header';
import AdminPopupsFormCard from './admin-popups-form-card';
import { emptyPopupForm, txt, type PopupFormState } from './popup-shared';

type Props = { mode: 'create' } | { mode: 'edit'; id: string };

export default function AdminPopupsDetailClient(props: Props) {
  const router = useRouter();
  const { copy } = useAdminUiCopy();
  const page = copy.pages?.popups ?? {};
  const common = copy.common;
  const isEdit = props.mode === 'edit';

  const [form, setForm] = React.useState<PopupFormState>(emptyPopupForm);
  const { data, isFetching, isLoading } = useGetPopupAdminQuery(
    { id: isEdit ? props.id : '' },
    { skip: !isEdit },
  );

  React.useEffect(() => {
    if (!isEdit || !data) return;
    setForm({
      title: data.title ?? '',
      content: data.content ?? '',
      image_url: data.image_url ?? '',
      image_asset_id: data.image_asset_id ?? '',
      image_alt: data.image_alt ?? '',
      button_text: data.button_text ?? '',
      button_link: data.button_link ?? '',
      is_active: data.is_active,
      display_frequency: data.display_frequency ?? 'always',
      delay_seconds: data.delay_seconds ?? 0,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      services_id: data.services_id ?? null,
      display_pages: data.display_pages ?? 'all',
      priority: data.priority ?? null,
      duration_seconds: data.duration_seconds ?? null,
    });
  }, [data, isEdit]);

  const [createPopup, createState] = useCreatePopupAdminMutation();
  const [updatePopup, updateState] = useUpdatePopupAdminMutation();
  const busy = isFetching || isLoading || createState.isLoading || updateState.isLoading;

  const onSave = async () => {
    if (!form.title.trim()) {
      toast.error(txt(page?.title_required, 'Başlık zorunludur'));
      return;
    }

    const body: PopupAdminCreateBody = {
      title: form.title.trim(),
      content: form.content ?? '',
      image_url: typeof form.image_url === 'string' ? form.image_url.trim() || null : null,
      image_asset_id: typeof form.image_asset_id === 'string' ? form.image_asset_id.trim() || null : null,
      image_alt: typeof form.image_alt === 'string' ? form.image_alt.trim() || null : null,
      button_text: typeof form.button_text === 'string' ? form.button_text.trim() || null : null,
      button_link: typeof form.button_link === 'string' ? form.button_link.trim() || null : null,
      is_active: !!form.is_active,
      display_frequency: form.display_frequency as PopupDisplayFrequency,
      delay_seconds: Number(form.delay_seconds ?? 0),
      start_date: form.start_date ?? null,
      end_date: form.end_date ?? null,
      services_id: form.services_id?.toString()?.trim() || null,
      display_pages: form.display_pages?.toString()?.trim() || 'all',
      priority: form.priority != null ? Number(form.priority) : null,
      duration_seconds: form.duration_seconds != null ? Number(form.duration_seconds) : null,
    };

    try {
      if (isEdit) {
        await updatePopup({ id: props.id, body }).unwrap();
      } else {
        await createPopup(body).unwrap();
      }
      toast.success(txt(common?.actions?.save, 'Kaydedildi'));
      router.push('/admin/popups');
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || txt(common?.states?.error, 'Hata oluştu'));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPopupsDetailHeader
        isEdit={isEdit}
        busy={busy}
        page={page}
        common={common}
        onBack={() => router.push('/admin/popups')}
        onSave={onSave}
      />
      <AdminPopupsFormCard isEdit={isEdit} page={page} form={form} setForm={setForm} />
    </div>
  );
}
