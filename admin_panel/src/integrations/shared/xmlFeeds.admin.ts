// =============================================================
// FILE: src/integrations/shared/xmlFeeds.admin.ts
// Sahibinden-uyumlu XML feed — admin DTO tipleri
// Backend mirror: kamanilan/backend/src/modules/xmlFeeds/schema.ts
// =============================================================

export type XmlFeedFormat = "sahibinden" | "generic";

export type XmlFeedRunStatus =
  | "started"
  | "success"
  | "http_error"
  | "parse_error"
  | "partial"
  | "failed";

export type XmlFeedItemStatus = "active" | "stale" | "deleted" | "unmapped";

// -------------------------------------------------------------
// DTOs
// -------------------------------------------------------------
export interface XmlFeedDto {
  id:                string;
  seller_id:         string | null;
  user_id:           string;
  name:              string;
  url:               string;
  format:            XmlFeedFormat;
  auth_header_name:  string | null;
  /** Backend tarafinda maskelenir (`"***"` doner). */
  auth_header_value: string | null;
  interval_minutes:  number;
  is_active:         number;
  last_status:       XmlFeedRunStatus | null;
  last_fetched_at:   string | null;
  created_at:        string;
  updated_at:        string;
}

export interface XmlFeedRunDto {
  id:            string;
  feed_id:       string;
  started_at:    string;
  finished_at:   string | null;
  status:        XmlFeedRunStatus;
  items_found:   number;
  items_added:   number;
  items_updated: number;
  items_skipped: number;
  items_failed:  number;
  errors_json:   unknown;
}

export interface XmlFeedItemDto {
  id:           string;
  feed_id:      string;
  external_id:  string;
  property_id:  string | null;
  last_hash:    string | null;
  last_seen_at: string;
  status:       XmlFeedItemStatus;
  created_at:   string;
  updated_at:   string;
}

export interface XmlFeedCategoryMapDto {
  id:                   string;
  feed_id:              string;
  external_category:    string;
  local_category_id:    string | null;
  local_subcategory_id: string | null;
  created_at:           string;
  updated_at:           string;
}

// -------------------------------------------------------------
// Payloads
// -------------------------------------------------------------
export interface XmlFeedCreatePayload {
  name:              string;
  url:               string;
  format?:           XmlFeedFormat;
  auth_header_name?: string | null;
  auth_header_value?: string | null;
  interval_minutes?: number;
  is_active?:        boolean;
}

export interface XmlFeedUpdatePayload {
  name?:              string;
  url?:               string;
  format?:            XmlFeedFormat;
  auth_header_name?:  string | null;
  auth_header_value?: string | null;
  interval_minutes?:  number;
  is_active?:         boolean;
}

export interface XmlFeedsListParams {
  limit?:     number;
  offset?:    number;
  is_active?: boolean;
}

export interface XmlFeedItemsListParams {
  status?: XmlFeedItemStatus;
  limit?:  number;
  offset?: number;
}

export interface XmlFeedCategoryMapUpsertPayload {
  entries: Array<{
    external_category:    string;
    local_category_id:    string | null;
    local_subcategory_id: string | null;
  }>;
}

// -------------------------------------------------------------
// Fetch result (runFeed return)
// -------------------------------------------------------------
export interface XmlFeedRunResult {
  run_id:        string;
  status:        XmlFeedRunStatus;
  items_found:   number;
  items_added:   number;
  items_updated: number;
  items_skipped: number;
  items_failed:  number;
  errors:        Array<{ external_id?: string; message: string }>;
}
