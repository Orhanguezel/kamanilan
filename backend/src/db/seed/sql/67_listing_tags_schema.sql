-- =============================================================
-- FILE: 67_listing_tags_schema.sql
-- Kaman İlan - Listing Tags (Kategori / Alt kategori bazli)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `listing_tags` (
  `id`              CHAR(36)     NOT NULL,
  `name`            VARCHAR(140) NOT NULL,
  `slug`            VARCHAR(160) NOT NULL,
  `description`     VARCHAR(500) DEFAULT NULL,
  `category_id`     CHAR(36)     NOT NULL,
  `sub_category_id` CHAR(36)     DEFAULT NULL,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `display_order`   INT          NOT NULL DEFAULT 0,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_listing_tags_scope_slug` (`category_id`, `sub_category_id`, `slug`),

  KEY `idx_listing_tags_category` (`category_id`),
  KEY `idx_listing_tags_sub_category` (`sub_category_id`),
  KEY `idx_listing_tags_active` (`is_active`),
  KEY `idx_listing_tags_order` (`display_order`),

  CONSTRAINT `fk_listing_tags_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT `fk_listing_tags_sub_category`
    FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
