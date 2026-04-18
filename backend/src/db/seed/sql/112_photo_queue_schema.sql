-- ============================================================
-- FILE: 112_photo_queue_schema.sql
-- Fotograf indirme kuyrugu (XML feed + ZIP upload paylasimli)
-- Bkz. docs/toplu-import-plani.md §3.3
-- ============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `photo_download_queue`;

CREATE TABLE `photo_download_queue` (
  `id`            CHAR(36)       NOT NULL,
  `property_id`   CHAR(36)       NOT NULL,

  -- xml_feed | excel_import
  `source`        VARCHAR(24)    NOT NULL,
  `source_ref_id` CHAR(36)           NULL,              -- feed_id veya job_id

  `source_url`    VARCHAR(1000)  NOT NULL,
  `display_order` INT            NOT NULL DEFAULT 0,
  `is_cover`      TINYINT(1)     NOT NULL DEFAULT 0,
  `alt_text`      VARCHAR(255)       NULL,

  -- pending | downloading | done | failed
  `status`        VARCHAR(16)    NOT NULL DEFAULT 'pending',
  `retry_count`   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `last_error`    VARCHAR(500)       NULL,

  `asset_id`      CHAR(36)           NULL,              -- download sonrasi storage_assets.id

  `created_at`    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `processed_at`  DATETIME(3)        NULL,
  `updated_at`    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `idx_photo_queue_pending`  (`status`, `retry_count`),
  KEY `idx_photo_queue_property` (`property_id`),
  KEY `idx_photo_queue_source`   (`source`, `source_ref_id`),

  CONSTRAINT `fk_photo_queue_property`
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
