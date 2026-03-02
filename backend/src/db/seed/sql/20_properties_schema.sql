-- =============================================================
-- FILE: 20_properties_schema.sql
-- Properties + Property Assets + Variant Values
-- CLEAN: category_id/sub_category_id FK, variant_values table
-- brand_id in main table; kind/specs_json/kind-specific cols removed
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- TABLE: properties
-- =============================================================
CREATE TABLE IF NOT EXISTS `properties` (
  `id`              CHAR(36)       NOT NULL,

  `user_id`         CHAR(36)       DEFAULT NULL,

  -- Identity
  `title`           VARCHAR(255)   NOT NULL,
  `slug`            VARCHAR(255)   NOT NULL,
  `excerpt`         TEXT           DEFAULT NULL,

  -- Category & Brand (primary taxonomy)
  `category_id`     CHAR(36)       DEFAULT NULL,
  `sub_category_id` CHAR(36)       DEFAULT NULL,
  `brand_id`        CHAR(36)       DEFAULT NULL,

  -- Status (satilik | kiralik | acik | hizmet | duyuru | ...)
  `status`          VARCHAR(64)    NOT NULL,

  -- Location
  `address`         VARCHAR(500)   NOT NULL,
  `district`        VARCHAR(255)   NOT NULL,
  `city`            VARCHAR(255)   NOT NULL,
  `neighborhood`    VARCHAR(255)   DEFAULT NULL,

  -- Coordinates (optional)
  `lat`             DECIMAL(10,6)  DEFAULT NULL,
  `lng`             DECIMAL(10,6)  DEFAULT NULL,

  -- Content
  `description`     TEXT           DEFAULT NULL,

  -- Price
  `price`           DECIMAL(12,2)  DEFAULT NULL,
  `currency`        VARCHAR(8)     NOT NULL DEFAULT 'TRY',
  `is_negotiable`   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `min_price_admin` DECIMAL(12,2)  DEFAULT NULL,

  -- Admin metadata
  `admin_note`      VARCHAR(2000)  DEFAULT NULL,
  `note_admin`      VARCHAR(2000)  DEFAULT NULL,
  `internal_note`   VARCHAR(2000)  DEFAULT NULL,
  `listing_no`      VARCHAR(32)    DEFAULT NULL,
  `badge_text`      VARCHAR(40)    DEFAULT NULL,

  -- SEO
  `meta_title`        VARCHAR(255)   DEFAULT NULL,
  `meta_description`  VARCHAR(500)   DEFAULT NULL,

  -- Flags
  `featured`         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `has_map`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `has_video`        TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `has_clip`         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `has_virtual_tour` TINYINT UNSIGNED NOT NULL DEFAULT 0,

  -- Cover image (legacy + storage asset)
  `image_url`       TEXT           DEFAULT NULL,
  `image_asset_id`  CHAR(36)       DEFAULT NULL,
  `alt`             VARCHAR(255)   DEFAULT NULL,

  -- Publish / ordering
  `is_active`       TINYINT        NOT NULL DEFAULT 1,
  `display_order`   INT            NOT NULL DEFAULT 0,
  `view_count`      INT UNSIGNED   NOT NULL DEFAULT 0,

  `created_at`      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `ux_properties_slug` (`slug`),

  KEY `properties_created_idx`         (`created_at`),
  KEY `properties_updated_idx`         (`updated_at`),
  KEY `properties_is_active_idx`       (`is_active`),
  KEY `properties_featured_idx`        (`featured`),
  KEY `properties_display_order_idx`   (`display_order`),

  KEY `properties_category_id_idx`     (`category_id`),
  KEY `properties_sub_category_id_idx` (`sub_category_id`),
  KEY `properties_brand_id_idx`        (`brand_id`),

  KEY `properties_status_idx`          (`status`),
  KEY `properties_district_idx`        (`district`),
  KEY `properties_city_idx`            (`city`),
  KEY `properties_price_idx`           (`price`),

  KEY `properties_user_id_idx`         (`user_id`),
  KEY `properties_image_asset_idx`     (`image_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: property_assets (ilan galerisi)
-- =============================================================
CREATE TABLE IF NOT EXISTS `property_assets` (
  `id`            CHAR(36)       NOT NULL,
  `property_id`   CHAR(36)       NOT NULL,

  `asset_id`      CHAR(36)       DEFAULT NULL,
  `url`           TEXT           DEFAULT NULL,
  `alt`           VARCHAR(255)   DEFAULT NULL,

  `kind`          VARCHAR(24)    NOT NULL DEFAULT 'image',
  `mime`          VARCHAR(100)   DEFAULT NULL,

  `is_cover`      TINYINT UNSIGNED DEFAULT NULL,
  `display_order` INT            NOT NULL DEFAULT 0,

  `created_at`    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `property_assets_property_idx` (`property_id`),
  KEY `property_assets_asset_idx`    (`asset_id`),
  KEY `property_assets_cover_idx`    (`property_id`, `is_cover`),
  KEY `property_assets_order_idx`    (`property_id`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: property_variant_values
-- İlan başına her varyant için değer kaydı
-- (Her satır: bir ilan + bir varyant + bir değer)
-- =============================================================
CREATE TABLE IF NOT EXISTS `property_variant_values` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id` CHAR(36)     NOT NULL,
  `variant_id`  CHAR(36)     NOT NULL,
  `value`       VARCHAR(500) NOT NULL DEFAULT '',
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `idx_pvv_property` (`property_id`),
  KEY `idx_pvv_variant`  (`variant_id`),
  KEY `idx_pvv_value`    (`value`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
