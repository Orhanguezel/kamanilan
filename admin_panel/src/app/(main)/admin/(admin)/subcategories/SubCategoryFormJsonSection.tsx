// =============================================================
// FILE: src/components/admin/subcategories/SubCategoryFormJsonSection.tsx
// Ensotek – Alt Kategori JSON Editör Bölümü
// =============================================================

import React, { useEffect, useState } from "react";

export type SubCategoryFormJsonSectionProps = {
  jsonModel: any;
  disabled?: boolean;
  onChangeJson: (json: any) => void;
  onErrorChange: (error: string | null) => void;
};

export const SubCategoryFormJsonSection: React.FC<
  SubCategoryFormJsonSectionProps
> = ({ jsonModel, disabled, onChangeJson, onErrorChange }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      setText(JSON.stringify(jsonModel, null, 2));
    } catch {
      setText("");
    }
  }, [jsonModel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    setText(value);

    if (!value.trim()) {
      onErrorChange("JSON içerik boş olamaz.");
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onErrorChange(null);
      onChangeJson(parsed);
    } catch (err: any) {
      onErrorChange(err?.message || "Geçersiz JSON.");
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label small">Alt Kategori JSON</label>
      <textarea
        className="form-control form-control-sm font-monospace"
        style={{ minHeight: 260 }}
        value={text}
        disabled={disabled}
        onChange={handleChange}
      />
      <div className="form-text small">
        Bu alan, formun backend’e giden JSON payload’ını doğrudan
        düzenlemeni sağlar.
      </div>
    </div>
  );
};
