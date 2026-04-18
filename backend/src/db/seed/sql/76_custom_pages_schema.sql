/* 76_custom_pages_schema.sql — Kaman Ilan (i18n: parent + custom_pages_i18n) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================
-- DROP (child first — FK constraint order)
-- =============================================================
DROP TABLE IF EXISTS `custom_pages_i18n`;
DROP TABLE IF EXISTS `custom_pages`;

-- =============================================================
-- PARENT: custom_pages
-- =============================================================
CREATE TABLE `custom_pages` (
  `id`                CHAR(36)      NOT NULL,
  `module_key`        VARCHAR(100)  NOT NULL DEFAULT 'kurumsal',
  `is_published`      TINYINT(1)    NOT NULL DEFAULT 0,
  `display_order`     INT           NOT NULL DEFAULT 0,
  `featured_image`    VARCHAR(500)  DEFAULT NULL,
  `storage_asset_id`  CHAR(36)      DEFAULT NULL,
  `images`            JSON          NOT NULL DEFAULT (JSON_ARRAY()),
  `storage_image_ids` JSON          NOT NULL DEFAULT (JSON_ARRAY()),
  `created_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `custom_pages_module_key_idx`   (`module_key`),
  KEY `custom_pages_is_published_idx` (`is_published`),
  KEY `custom_pages_order_idx`        (`display_order`),
  KEY `custom_pages_asset_idx`        (`storage_asset_id`),
  KEY `custom_pages_created_idx`      (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CHILD: custom_pages_i18n
-- =============================================================
CREATE TABLE `custom_pages_i18n` (
  `id`               CHAR(36)      NOT NULL,
  `page_id`          CHAR(36)      NOT NULL,
  `locale`           VARCHAR(10)   NOT NULL DEFAULT 'tr',
  `title`            VARCHAR(500)  NOT NULL,
  `slug`             VARCHAR(500)  NOT NULL,
  `content`          LONGTEXT      DEFAULT NULL,
  `summary`          LONGTEXT      DEFAULT NULL,
  `meta_title`       VARCHAR(255)  DEFAULT NULL,
  `meta_description` VARCHAR(500)  DEFAULT NULL,
  `created_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_custom_pages_i18n_parent_locale` (`page_id`, `locale`),
  UNIQUE KEY `ux_custom_pages_i18n_locale_slug`   (`locale`, `slug`(191)),
  KEY `custom_pages_i18n_locale_idx` (`locale`),
  KEY `custom_pages_i18n_slug_idx`   (`slug`(191)),
  CONSTRAINT `fk_custom_pages_i18n_page` FOREIGN KEY (`page_id`) REFERENCES `custom_pages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
