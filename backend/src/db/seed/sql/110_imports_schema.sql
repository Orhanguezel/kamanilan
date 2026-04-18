-- ============================================================
-- FILE: 110_imports_schema.sql
-- Toplu import (Excel/CSV) — job + item + saved mapping tablolari
-- Bkz. docs/toplu-import-plani.md §3.1
-- ============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `import_job_items`;
DROP TABLE IF EXISTS `import_jobs`;
DROP TABLE IF EXISTS `import_column_mappings`;

-- ------------------------------------------------------------
-- import_jobs — her upload bir job
-- ------------------------------------------------------------
CREATE TABLE `import_jobs` (
  `id`             CHAR(36)     NOT NULL,
  `user_id`        CHAR(36)     NOT NULL,
  `seller_id`      CHAR(36)         NULL,

  `source_type`    VARCHAR(16)  NOT NULL,                  -- excel | csv
  `file_name`      VARCHAR(255) NOT NULL,
  `file_size`      INT UNSIGNED NOT NULL DEFAULT 0,

  -- pending | parsed | review | importing | completed | failed
  `status`         VARCHAR(24)  NOT NULL DEFAULT 'pending',

  `total_rows`     INT UNSIGNED NOT NULL DEFAULT 0,
  `valid_rows`     INT UNSIGNED NOT NULL DEFAULT 0,
  `invalid_rows`   INT UNSIGNED NOT NULL DEFAULT 0,
  `imported_count` INT UNSIGNED NOT NULL DEFAULT 0,

  `mapping_json`   JSON             NULL,                  -- kolon eslestirmesi
  `errors_json`    JSON             NULL,                  -- genel hata / warning ozeti

  `created_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `started_at`     DATETIME(3)      NULL,
  `finished_at`    DATETIME(3)      NULL,
  `updated_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `idx_import_jobs_user`    (`user_id`),
  KEY `idx_import_jobs_seller`  (`seller_id`),
  KEY `idx_import_jobs_status`  (`status`),
  KEY `idx_import_jobs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- import_job_items — her satir ayri kayit
-- ------------------------------------------------------------
CREATE TABLE `import_job_items` (
  `id`                   CHAR(36)     NOT NULL,
  `job_id`               CHAR(36)     NOT NULL,
  `row_index`            INT UNSIGNED NOT NULL,

  `raw_json`             JSON         NOT NULL,            -- ham parse edilmis satir
  `normalized_json`      JSON             NULL,            -- validation sonrasi normalize

  `property_id`          CHAR(36)         NULL,            -- commit sonrasi olusan property

  -- valid | invalid | imported | skipped | failed
  `status`               VARCHAR(16)  NOT NULL DEFAULT 'valid',

  `errors_json`          JSON             NULL,
  `photo_filenames_json` JSON             NULL,            -- ZIP eslestirme icin

  `created_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_import_items_job_row` (`job_id`, `row_index`),
  KEY `idx_import_items_job`      (`job_id`),
  KEY `idx_import_items_status`   (`status`),
  KEY `idx_import_items_property` (`property_id`),

  CONSTRAINT `fk_import_items_job`
    FOREIGN KEY (`job_id`) REFERENCES `import_jobs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- import_column_mappings — emlakcinin kaydettigi mapping sablonlari
-- ------------------------------------------------------------
CREATE TABLE `import_column_mappings` (
  `id`           CHAR(36)     NOT NULL,
  `seller_id`    CHAR(36)     NOT NULL,
  `source_type`  VARCHAR(16)  NOT NULL,                    -- excel | csv
  `name`         VARCHAR(80)  NOT NULL,                    -- "Sahibinden Export" gibi
  `mapping_json` JSON         NOT NULL,

  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_import_mapping_seller_name` (`seller_id`, `name`),
  KEY `idx_import_mapping_seller` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
