// =============================================================
// FILE: src/components/admin/subcategories/SubCategoryFormImageColumn.tsx
// Ensotek – Alt Kategori Görsel/Icon Kolonu
// - FIX: Upload sonrası anlık preview render (local state sync + key remount)
// =============================================================

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';

export type SubCategoryImageMetadata = {
  category_id?: string;
  locale?: string;
  sub_category_slug?: string;
};

export type SubCategoryFormImageColumnProps = {
  metadata?: SubCategoryImageMetadata;
  iconValue: string;
  disabled?: boolean;
  onIconChange: (url: string) => void;
};

const safeStr = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

export const SubCategoryFormImageColumn: React.FC<SubCategoryFormImageColumnProps> = ({
  metadata,
  iconValue,
  disabled,
  onIconChange,
}) => {
  // ✅ Controlled local state (AdminImageUploadField internal-state sync problemi için)
  const [localValue, setLocalValue] = useState<string>(safeStr(iconValue));

  // prop değişince (initialData load / locale switch) local’i sync et
  useEffect(() => {
    setLocalValue(safeStr(iconValue));
  }, [iconValue]);

  // ✅ Remount key: value veya metadata değişince alan kesin refresh
  const remountKey = useMemo(() => {
    const m = metadata
      ? `${safeStr(metadata.category_id)}|${safeStr(metadata.locale)}|${safeStr(
          metadata.sub_category_slug,
        )}`
      : 'no-meta';
    return `${m}|${safeStr(localValue) || 'empty'}`;
  }, [metadata, localValue]);

  return (
    <AdminImageUploadField
      key={remountKey}
      label="Alt Kategori Görseli"
      helperText={
        <>
          Storage modülü üzerinden alt kategori için bir görsel yükleyebilirsin. Yüklenen görselin
          URL&apos;i anında burada önizleme olarak görünür ve formdaki{' '}
          <strong>Icon / Görsel URL</strong> alanına da yansır.
        </>
      }
      bucket="public"
      folder="subcategories"
      metadata={metadata}
      value={localValue}
      onChange={(url) => {
        const nextUrl = safeStr(url);
        // ✅ önce UI’ı güncelle (anlık preview)
        setLocalValue(nextUrl);
        // ✅ sonra üst state’i güncelle
        onIconChange(nextUrl);
      }}
      disabled={!!disabled}
    />
  );
};
