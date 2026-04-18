// =============================================================
// FILE: src/integrations/shared/imports.admin.ts
// Toplu import (Excel/CSV) — admin DTO tipleri
// Backend mirror: kamanilan/backend/src/modules/imports/schema.ts
// =============================================================

export type ImportJobStatus =
  | "pending"
  | "parsed"
  | "review"
  | "importing"
  | "completed"
  | "failed";

export type ImportJobItemStatus =
  | "valid"
  | "invalid"
  | "imported"
  | "skipped"
  | "failed";

export type ImportSourceType = "excel" | "csv";

// -------------------------------------------------------------
// Mapping (upload sonrasi kullanicinin tanimladigi kolon eslesmesi)
// -------------------------------------------------------------
export type ImportMapping = {
  // Zorunlu
  title:             string;
  city:              string;
  district:          string;
  // Opsiyonel
  slug?:             string;
  address?:          string;
  neighborhood?:     string;
  description?:      string;
  excerpt?:          string;
  price?:            string;
  currency?:         string;
  status?:           string;
  category_slug?:    string;
  sub_category_slug?: string;
  brand_slug?:       string;
  external_id?:      string;
  photos?:           string;
};

// -------------------------------------------------------------
// DTO — ImportJob
// -------------------------------------------------------------
export interface ImportJobDto {
  id:             string;
  user_id:        string;
  seller_id:      string | null;
  source_type:    ImportSourceType;
  file_name:      string;
  file_size:      number;
  status:         ImportJobStatus;
  total_rows:     number;
  valid_rows:     number;
  invalid_rows:   number;
  imported_count: number;
  mapping_json:   ImportMapping | null;
  errors_json:    unknown;
  created_at:     string;
  started_at:     string | null;
  finished_at:    string | null;
  updated_at:     string;
}

// -------------------------------------------------------------
// DTO — ImportJobItem
// -------------------------------------------------------------
export interface ImportJobItemDto {
  id:                    string;
  job_id:                string;
  row_index:             number;
  raw_json:              Record<string, string>;
  normalized_json:       unknown;
  property_id:           string | null;
  status:                ImportJobItemStatus;
  errors_json:           string[] | unknown;
  photo_filenames_json:  string[] | null;
  created_at:            string;
  updated_at:            string;
}

// -------------------------------------------------------------
// Response shapes
// -------------------------------------------------------------
export interface ImportUploadResponse {
  job_id:           string;
  status:           ImportJobStatus;
  source_type:      ImportSourceType;
  file_name:        string;
  file_size:        number;
  total_rows:       number;
  detected_columns: string[];
  preview_rows:     Array<Record<string, string>>;
}

export interface ImportMappingResponse {
  job_id:       string;
  status:       ImportJobStatus;
  total_rows:   number;
  valid_rows:   number;
  invalid_rows: number;
  preview: {
    valid_sample: Array<{ row_index: number; normalized: unknown }>;
    invalid_sample: Array<{ row_index: number; errors: unknown; raw: Record<string, string> }>;
  };
}

export interface ImportCommitResponse {
  job_id:         string;
  status:         ImportJobStatus;
  imported_count: number;
  failed_count:   number;
  error_sample:   Array<{ row_index: number; message: string }>;
}

// -------------------------------------------------------------
// Request shapes
// -------------------------------------------------------------
export interface ImportMappingPayload {
  mapping: ImportMapping;
  save_as?: string;
}

export interface ImportCommitPayload {
  skip_invalid?: boolean;
  default_status?: string;
}

export interface ImportJobsListParams {
  status?: ImportJobStatus;
  limit?:  number;
  offset?: number;
}

export interface ImportJobItemsListParams {
  status?: ImportJobItemStatus;
  limit?:  number;
  offset?: number;
}

// -------------------------------------------------------------
// Error responses (limit exceeded vb.)
// -------------------------------------------------------------
export interface ImportLimitErrorDetail {
  message: "listing_limit_exceeded";
  current: number;
  limit:   number | null;
  overage: number;
}
