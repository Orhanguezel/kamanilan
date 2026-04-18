// =============================================================
// FILE: src/modules/imports/schema.ts
// Toplu import (Excel/CSV) — Drizzle schema
// Mirror: src/db/seed/sql/110_imports_schema.sql
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  int,
  datetime,
  json,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ------------------------------------------------------------
// import_jobs — her upload bir job
// ------------------------------------------------------------
export const importJobs = mysqlTable(
  "import_jobs",
  {
    id:        char("id",        { length: 36 }).primaryKey().notNull(),
    user_id:   char("user_id",   { length: 36 }).notNull(),
    seller_id: char("seller_id", { length: 36 }),

    source_type: varchar("source_type", { length: 16 }).notNull(),
    file_name:   varchar("file_name",   { length: 255 }).notNull(),
    file_size:   int("file_size", { unsigned: true }).notNull().default(0),

    status: varchar("status", { length: 24 }).notNull().default("pending"),

    total_rows:     int("total_rows",     { unsigned: true }).notNull().default(0),
    valid_rows:     int("valid_rows",     { unsigned: true }).notNull().default(0),
    invalid_rows:   int("invalid_rows",   { unsigned: true }).notNull().default(0),
    imported_count: int("imported_count", { unsigned: true }).notNull().default(0),

    mapping_json: json("mapping_json"),
    errors_json:  json("errors_json"),

    created_at:  datetime("created_at",  { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    started_at:  datetime("started_at",  { fsp: 3 }),
    finished_at: datetime("finished_at", { fsp: 3 }),
    updated_at:  datetime("updated_at",  { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("idx_import_jobs_user").on(t.user_id),
    index("idx_import_jobs_seller").on(t.seller_id),
    index("idx_import_jobs_status").on(t.status),
    index("idx_import_jobs_created").on(t.created_at),
  ],
);

// ------------------------------------------------------------
// import_job_items — her satir ayri kayit
// ------------------------------------------------------------
export const importJobItems = mysqlTable(
  "import_job_items",
  {
    id:        char("id",     { length: 36 }).primaryKey().notNull(),
    job_id:    char("job_id", { length: 36 }).notNull(),
    row_index: int("row_index", { unsigned: true }).notNull(),

    raw_json:        json("raw_json").notNull(),
    normalized_json: json("normalized_json"),

    property_id: char("property_id", { length: 36 }),

    status: varchar("status", { length: 16 }).notNull().default("valid"),

    errors_json:          json("errors_json"),
    photo_filenames_json: json("photo_filenames_json"),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_import_items_job_row").on(t.job_id, t.row_index),
    index("idx_import_items_job").on(t.job_id),
    index("idx_import_items_status").on(t.status),
    index("idx_import_items_property").on(t.property_id),
    foreignKey({
      columns:        [t.job_id],
      foreignColumns: [importJobs.id],
      name:           "fk_import_items_job",
    }).onDelete("cascade").onUpdate("cascade"),
  ],
);

// ------------------------------------------------------------
// import_column_mappings — emlakcinin kaydettigi mapping sablonlari
// ------------------------------------------------------------
export const importColumnMappings = mysqlTable(
  "import_column_mappings",
  {
    id:          char("id",        { length: 36 }).primaryKey().notNull(),
    seller_id:   char("seller_id", { length: 36 }).notNull(),
    source_type: varchar("source_type", { length: 16 }).notNull(),
    name:        varchar("name",        { length: 80 }).notNull(),
    mapping_json: json("mapping_json").notNull(),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_import_mapping_seller_name").on(t.seller_id, t.name),
    index("idx_import_mapping_seller").on(t.seller_id),
  ],
);

export type ImportJobRow     = typeof importJobs.$inferSelect;
export type NewImportJobRow  = typeof importJobs.$inferInsert;

export type ImportJobItemRow    = typeof importJobItems.$inferSelect;
export type NewImportJobItemRow = typeof importJobItems.$inferInsert;

export type ImportColumnMappingRow    = typeof importColumnMappings.$inferSelect;
export type NewImportColumnMappingRow = typeof importColumnMappings.$inferInsert;

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
