// =============================================================
// FILE: src/components/admin/subcategories/SubCategoryFormFooter.tsx
// Ensotek – Alt Kategori Form Footer (Butonlar)
// =============================================================

import React from 'react';
import type { SubCategoryFormMode } from './SubCategoryFormHeader';

export type SubCategoryFormFooterProps = {
  mode: SubCategoryFormMode;
  saving: boolean;
  onCancel: () => void;
};

export const SubCategoryFormFooter: React.FC<SubCategoryFormFooterProps> = ({
  mode,
  saving,
  onCancel,
}) => {
  return (
    <div className="card-footer py-2 d-flex justify-content-between">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={onCancel}
        disabled={saving}
      >
        İptal
      </button>

      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? 'Kaydediliyor...' : mode === 'create' ? 'Oluştur' : 'Kaydet'}
      </button>
    </div>
  );
};
