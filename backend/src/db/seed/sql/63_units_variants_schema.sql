-- =============================================================
-- FILE: 63_units_variants_schema.sql
-- Kaman Ilan - Units + Listing Variants + Property Variant Values
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `units` (
  `id`            CHAR(36)     NOT NULL,
  `name`          VARCHAR(120) NOT NULL,
  `slug`          VARCHAR(140) NOT NULL,
  `symbol`        VARCHAR(20)  NOT NULL,
  `type`          VARCHAR(24)  NOT NULL DEFAULT 'custom',
  `precision`     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `display_order` INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_units_slug` (`slug`),
  KEY `idx_units_active` (`is_active`),
  KEY `idx_units_type` (`type`),
  KEY `idx_units_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `listing_variants` (
  `id`              CHAR(36)     NOT NULL,
  `name`            VARCHAR(140) NOT NULL,
  `slug`            VARCHAR(160) NOT NULL,
  `description`     VARCHAR(500) DEFAULT NULL,
  `value_type`      VARCHAR(24)  NOT NULL DEFAULT 'text',
  `category_id`     CHAR(36)     NOT NULL,
  `sub_category_id` CHAR(36)     DEFAULT NULL,
  `unit_id`         CHAR(36)     DEFAULT NULL,
  `options_json`    JSON         DEFAULT NULL,
  `is_required`     TINYINT(1)   NOT NULL DEFAULT 0,
  `is_filterable`   TINYINT(1)   NOT NULL DEFAULT 1,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `display_order`   INT          NOT NULL DEFAULT 0,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_listing_variants_scope_slug` (`category_id`, `sub_category_id`, `slug`),
  KEY `idx_listing_variants_cat` (`category_id`),
  KEY `idx_listing_variants_subcat` (`sub_category_id`),
  KEY `idx_listing_variants_unit` (`unit_id`),
  KEY `idx_listing_variants_active` (`is_active`),
  KEY `idx_listing_variants_order` (`display_order`),
  CONSTRAINT `fk_listing_variants_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_listing_variants_sub_category`
    FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_listing_variants_unit`
    FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `property_variant_values` (
  `id`           CHAR(36)     NOT NULL,
  `property_id`  CHAR(36)     NOT NULL,
  `variant_id`   CHAR(36)     NOT NULL,
  `value_text`   VARCHAR(500) DEFAULT NULL,
  `value_number` DECIMAL(14,4) DEFAULT NULL,
  `value_bool`   TINYINT UNSIGNED DEFAULT NULL,
  `value_json`   JSON         DEFAULT NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_property_variant_values_pair` (`property_id`, `variant_id`),
  KEY `idx_property_variant_values_property` (`property_id`),
  KEY `idx_property_variant_values_variant` (`variant_id`),
  CONSTRAINT `fk_property_variant_values_property`
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_property_variant_values_variant`
    FOREIGN KEY (`variant_id`) REFERENCES `listing_variants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
