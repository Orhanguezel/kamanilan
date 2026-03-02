/* -------- Types -------- */
export type DbImportResponse = {
  ok: boolean;
  dryRun?: boolean;
  message?: string;
  error?: string;
};

export type SqlImportCommon = {
  /** Varolan verileri temizleyip içe aktar */
  truncateBefore?: boolean;
  /** İşlemi prova olarak çalıştır (yalnızca /import-sql ve /import-url destekler) */
  dryRun?: boolean;
};

export type SqlImportTextParams = SqlImportCommon & {
  /** Tam SQL script (utf8) */
  sql: string;
};

export type SqlImportUrlParams = SqlImportCommon & {
  /** .sql veya .sql.gz URL */
  url: string;
};

export type SqlImportFileParams = {
  /** .sql veya .gz dosya */
  file: File;
  /** Varolan verileri temizleyip içe aktar */
  truncateBefore?: boolean;
};

/* (ESKİ) Geriye dönük: bazı yerlerde bu tip adı geçiyorsa bozulmasın. */
export type SqlImportParams = {
  tenant?: string; // tenantsızda yok sayılır
  truncate_before_import?: boolean; // eski alan adı
};

/* -------- Snapshot Types -------- */
export type DbSnapshot = {
  id: string;
  filename?: string | null;
  label?: string | null;
  note?: string | null;
  created_at: string;
  size_bytes?: number | null;
};

export type CreateDbSnapshotBody = {
  label?: string;
  note?: string;
};

export type DeleteSnapshotResponse = {
  ok: boolean;
  message?: string;
};

/* -------- Module Export/Import Types -------- */

export type ModuleExportParams = {
  module: string;
  upsert?: boolean;
};

export type ModuleImportParams = {
  module: string;
  sql: string;
  dryRun?: boolean;
  truncateBefore?: boolean;
};

/* -------- Module Validate Types -------- */

export type ModuleValidateResult = {
  module: string;
  ok: boolean;
  tables: { expected: string[]; present: string[]; missing: string[] };
  suggestions: Record<string, string[]>;
};

export type ModuleValidateResponse = {
  ok: boolean;
  okAll: boolean;
  results: ModuleValidateResult[];
  dbTables?: string[];
  unknownRequested?: string[];
};

export type ModuleValidateParams = {
  module: string[];
  includeDbTables?: boolean;
};

/* -------- Site Settings UI Types -------- */

export type SiteSettingsUiExportParams = {
  fromLocale?: string;
  prefix?: string[];
};

export type SiteSettingsUiExportResponse = {
  ok: boolean;
  fromLocale: string;
  prefixes: string[];
  count: number;
  items: Record<string, any>;
};

export type SiteSettingsUiBootstrapParams = {
  sourceLocale: string;
  targetLocale: string;
  prefixes?: string[];
  overwrite?: boolean;
};

export type SiteSettingsUiBootstrapResponse = {
  ok: boolean;
  sourceLocale: string;
  targetLocale: string;
  insertedOrUpdated: number;
  message?: string;
  error?: string;
};