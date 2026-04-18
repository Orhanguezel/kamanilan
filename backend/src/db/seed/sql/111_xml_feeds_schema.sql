-- ============================================================
-- FILE: 111_xml_feeds_schema.sql
-- Sahibinden-uyumlu XML feed altyapisi
-- Bkz. docs/toplu-import-plani.md §3.2
-- ============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `xml_feed_items`;
DROP TABLE IF EXISTS `xml_feed_runs`;
DROP TABLE IF EXISTS `xml_feed_category_map`;
DROP TABLE IF EXISTS `xml_feeds`;

-- ------------------------------------------------------------
-- xml_feeds — emlakcinin feed konfigurasyonu
-- ------------------------------------------------------------
CREATE TABLE `xml_feeds` (
  `id`                CHAR(36)     NOT NULL,
  `seller_id`         CHAR(36)         NULL,
  `user_id`           CHAR(36)     NOT NULL,

  `name`              VARCHAR(120) NOT NULL,
  `url`               VARCHAR(500) NOT NULL,

  -- sahibinden | generic (ileride baska adaptorler eklenebilir)
  `format`            VARCHAR(32)  NOT NULL DEFAULT 'sahibinden',

  -- Opsiyonel auth header (ornek: X-API-Key: ...)
  `auth_header_name`  VARCHAR(80)      NULL,
  `auth_header_value` VARCHAR(500)     NULL,                -- secret — service layer mask eder

  `interval_minutes`  INT UNSIGNED NOT NULL DEFAULT 240,    -- 4 saat
  `is_active`         TINYINT(1)   NOT NULL DEFAULT 1,

  -- success | http_error | parse_error | partial | (null = hic cekilmedi)
  `last_status`       VARCHAR(24)      NULL,
  `last_fetched_at`   DATETIME(3)      NULL,

  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `idx_xml_feeds_user`   (`user_id`),
  KEY `idx_xml_feeds_seller` (`seller_id`),
  KEY `idx_xml_feeds_active` (`is_active`),
  KEY `idx_xml_feeds_due`    (`is_active`, `last_fetched_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- xml_feed_runs — her cekim denemesi
-- ------------------------------------------------------------
CREATE TABLE `xml_feed_runs` (
  `id`            CHAR(36)     NOT NULL,
  `feed_id`       CHAR(36)     NOT NULL,

  `started_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `finished_at`   DATETIME(3)      NULL,

  -- started | success | http_error | parse_error | partial | failed
  `status`        VARCHAR(24)  NOT NULL DEFAULT 'started',

  `items_found`   INT UNSIGNED NOT NULL DEFAULT 0,
  `items_added`   INT UNSIGNED NOT NULL DEFAULT 0,
  `items_updated` INT UNSIGNED NOT NULL DEFAULT 0,
  `items_skipped` INT UNSIGNED NOT NULL DEFAULT 0,
  `items_failed`  INT UNSIGNED NOT NULL DEFAULT 0,

  `errors_json`   JSON             NULL,

  PRIMARY KEY (`id`),
  KEY `idx_xml_feed_runs_feed`    (`feed_id`),
  KEY `idx_xml_feed_runs_started` (`started_at`),

  CONSTRAINT `fk_xml_feed_runs_feed`
    FOREIGN KEY (`feed_id`) REFERENCES `xml_feeds` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- xml_feed_items — item seviyesi diff / idempotency
-- ------------------------------------------------------------
CREATE TABLE `xml_feed_items` (
  `id`           CHAR(36)     NOT NULL,
  `feed_id`      CHAR(36)     NOT NULL,

  `external_id`  VARCHAR(120) NOT NULL,           -- sahibinden ilan kodu
  `property_id`  CHAR(36)         NULL,           -- bizim DB'deki kayit
  `last_hash`    CHAR(64)         NULL,           -- SHA-256 — icerik degisti mi?
  `last_seen_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  -- active | stale | deleted | unmapped
  `status`       VARCHAR(16)  NOT NULL DEFAULT 'active',

  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_xml_feed_items_feed_external` (`feed_id`, `external_id`),
  KEY `idx_xml_feed_items_feed`     (`feed_id`),
  KEY `idx_xml_feed_items_property` (`property_id`),

  CONSTRAINT `fk_xml_feed_items_feed`
    FOREIGN KEY (`feed_id`) REFERENCES `xml_feeds` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- xml_feed_category_map — XML kategori string'ini local kategoriye esle
-- ------------------------------------------------------------
CREATE TABLE `xml_feed_category_map` (
  `id`                   CHAR(36)     NOT NULL,
  `feed_id`              CHAR(36)     NOT NULL,

  `external_category`    VARCHAR(200) NOT NULL,           -- "Daire > 2+1 Satilik" gibi
  `local_category_id`    CHAR(36)         NULL,
  `local_subcategory_id` CHAR(36)         NULL,

  `created_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_xml_feed_cat_map_feed_external` (`feed_id`, `external_category`),
  KEY `idx_xml_feed_cat_map_feed` (`feed_id`),

  CONSTRAINT `fk_xml_feed_cat_map_feed`
    FOREIGN KEY (`feed_id`) REFERENCES `xml_feeds` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
