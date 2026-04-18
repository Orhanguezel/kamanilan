// =============================================================
// FILE: src/integrations/shared/photoQueue.admin.ts
// Foto indirme kuyrugu — admin DTO tipleri
// Backend mirror: kamanilan/backend/src/modules/photoQueue/schema.ts
// =============================================================

export type PhotoQueueSource = "xml_feed" | "excel_import";
export type PhotoQueueStatus = "pending" | "downloading" | "done" | "failed";

export interface PhotoQueueDto {
  id:            string;
  property_id:   string;
  source:        PhotoQueueSource;
  source_ref_id: string | null;
  source_url:    string;
  display_order: number;
  is_cover:      number;
  alt_text:      string | null;
  status:        PhotoQueueStatus;
  retry_count:   number;
  last_error:    string | null;
  asset_id:      string | null;
  created_at:    string;
  processed_at:  string | null;
  updated_at:    string;
}

export interface PhotoQueueStats {
  pending:     number;
  downloading: number;
  done:        number;
  failed:      number;
}

export interface PhotoQueueListParams {
  limit?:  number;
  offset?: number;
}
