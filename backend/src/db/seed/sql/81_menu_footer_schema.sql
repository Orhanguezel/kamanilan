-- =============================================================
-- FILE: 81_menu_footer_schema.sql
-- Kaman Ilan - Menu Items + Footer Sections schema
-- =============================================================

DROP TABLE IF EXISTS `menu_items_i18n`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `footer_sections_i18n`;
DROP TABLE IF EXISTS `footer_sections`;

CREATE TABLE `footer_sections` (
  `id` CHAR(36) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `footer_sections_active_idx` (`is_active`),
  KEY `footer_sections_order_idx` (`display_order`),
  KEY `footer_sections_created_idx` (`created_at`),
  KEY `footer_sections_updated_idx` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `footer_sections_i18n` (
  `id` CHAR(36) NOT NULL,
  `section_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(10) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_footer_sections_i18n_section_locale` (`section_id`, `locale`),
  UNIQUE KEY `ux_footer_sections_i18n_locale_slug` (`locale`, `slug`),
  KEY `footer_sections_i18n_locale_idx` (`locale`),
  KEY `footer_sections_i18n_title_idx` (`title`),
  CONSTRAINT `footer_sections_i18n_section_fk`
    FOREIGN KEY (`section_id`) REFERENCES `footer_sections` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `menu_items` (
  `id` CHAR(36) NOT NULL,
  `parent_id` CHAR(36) NULL,
  `type` VARCHAR(16) NOT NULL DEFAULT 'custom',
  `page_id` CHAR(36) NULL,
  `location` VARCHAR(16) NOT NULL DEFAULT 'header',
  `icon` VARCHAR(64) NULL,
  `section_id` CHAR(36) NULL,
  `order_num` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `menu_items_parent_idx` (`parent_id`),
  KEY `menu_items_active_idx` (`is_active`),
  KEY `menu_items_order_idx` (`order_num`),
  KEY `menu_items_created_idx` (`created_at`),
  KEY `menu_items_updated_idx` (`updated_at`),
  KEY `menu_items_location_idx` (`location`),
  KEY `menu_items_section_idx` (`section_id`),
  CONSTRAINT `menu_items_parent_fk`
    FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `menu_items_i18n` (
  `id` CHAR(36) NOT NULL,
  `menu_item_id` CHAR(36) NOT NULL,
  `locale` VARCHAR(10) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_menu_items_i18n_item_locale` (`menu_item_id`, `locale`),
  KEY `menu_items_i18n_locale_idx` (`locale`),
  KEY `menu_items_i18n_title_idx` (`title`),
  CONSTRAINT `menu_items_i18n_item_fk`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
