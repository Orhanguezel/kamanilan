-- =============================================================
-- FILE: 83_seller_module_schema.sql
-- Seller Module: seller role + stores + seller campaigns
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- no-drop senaryosunda enum'u seller'ı da içerecek şekilde güncelle
ALTER TABLE `user_roles`
  MODIFY COLUMN `role` ENUM('admin','moderator','seller','user') NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS `seller_stores` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `description` TEXT NULL,
  `logo_url` VARCHAR(500) NULL,
  `banner_url` VARCHAR(500) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_seller_stores_slug` (`slug`),
  KEY `idx_seller_stores_user` (`user_id`),
  KEY `idx_seller_stores_active` (`is_active`),
  CONSTRAINT `fk_seller_stores_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seller_campaigns` (
  `id` CHAR(36) NOT NULL,
  `seller_id` CHAR(36) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `description` TEXT NULL,
  `discount_type` VARCHAR(16) NOT NULL DEFAULT 'percent',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `start_at` DATETIME(3) NOT NULL,
  `end_at` DATETIME(3) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_seller_campaigns_seller_slug` (`seller_id`, `slug`),
  KEY `idx_seller_campaigns_seller` (`seller_id`),
  KEY `idx_seller_campaigns_active` (`is_active`),
  KEY `idx_seller_campaigns_window` (`start_at`, `end_at`),
  CONSTRAINT `fk_seller_campaigns_user`
    FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seller_campaign_scopes` (
  `campaign_id` CHAR(36) NOT NULL,
  `scope_type` ENUM('listing','store','category','subcategory','seller') NOT NULL,
  `target_id` CHAR(36) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`campaign_id`, `scope_type`, `target_id`),
  KEY `idx_seller_campaign_scopes_campaign` (`campaign_id`),
  KEY `idx_seller_campaign_scopes_type_target` (`scope_type`, `target_id`),
  CONSTRAINT `fk_seller_campaign_scopes_campaign`
    FOREIGN KEY (`campaign_id`) REFERENCES `seller_campaigns` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
