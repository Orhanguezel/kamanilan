'use client';

import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { txt } from './popup-shared';

type Props = {
  isEdit: boolean;
  busy: boolean;
  page: Record<string, unknown>;
  common: {
    actions?: {
      back?: string;
      save?: string;
    };
  };
  onBack: () => void;
  onSave: () => void;
};

export default function AdminPopupsDetailHeader({
  isEdit,
  busy,
  page,
  common,
  onBack,
  onSave,
}: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">
          {isEdit ? txt(page?.edit_title, 'Popup Duzenle') : txt(page?.create_title, 'Popup Ekle')}
        </h1>
        <p className="text-sm text-muted-foreground">{txt(page?.subtitle, 'Popup kayitlarini yonetin.')}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={busy}>
          <ArrowLeft className="mr-2 size-4" />
          {txt(common?.actions?.back, 'Geri')}
        </Button>
        <Button onClick={onSave} disabled={busy}>
          <Save className="mr-2 size-4" />
          {txt(common?.actions?.save, 'Kaydet')}
        </Button>
      </div>
    </div>
  );
}
