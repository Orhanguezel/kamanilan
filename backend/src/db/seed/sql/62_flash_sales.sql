/* ============================================================
   62_flash_sales.sql
   Kaman İlan — Flash Sale / Kampanya Modülü
   ============================================================ */

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

/* ── Junction tablolar (önce kaldır) ─────────────────────── */
DROP TABLE IF EXISTS `flash_sale_sellers`;
DROP TABLE IF EXISTS `flash_sale_properties`;
DROP TABLE IF EXISTS `flash_sale_subcategories`;
DROP TABLE IF EXISTS `flash_sale_categories`;
DROP TABLE IF EXISTS `flash_sales`;

/* ── flash_sales ─────────────────────────────────────────── */
CREATE TABLE `flash_sales` (
  `id`               CHAR(36)      NOT NULL,
  `title`            VARCHAR(160)  NOT NULL,
  `slug`             VARCHAR(190)  NOT NULL,
  `locale`           VARCHAR(10)   NOT NULL DEFAULT 'tr',
  `description`      LONGTEXT      NULL,
  `discount_type`    VARCHAR(16)   NOT NULL DEFAULT 'percent',
  `discount_value`   DECIMAL(10,2) NOT NULL,
  `start_at`         DATETIME(3)   NOT NULL,
  `end_at`           DATETIME(3)   NOT NULL,
  `is_active`        TINYINT(1)    NOT NULL DEFAULT 1,
  `scope_type`       VARCHAR(20)   NOT NULL DEFAULT 'all',
  `cover_image_url`  LONGTEXT      NULL,
  `cover_asset_id`   CHAR(36)      NULL,
  `background_color` VARCHAR(20)   NULL,
  `title_color`      VARCHAR(20)   NULL,
  `description_color`VARCHAR(20)   NULL,
  `button_text`      VARCHAR(100)  NULL,
  `button_url`       VARCHAR(500)  NULL,
  `button_bg_color`  VARCHAR(20)   NULL,
  `button_text_color`VARCHAR(20)   NULL,
  `timer_bg_color`   VARCHAR(20)   NULL,
  `timer_text_color` VARCHAR(20)   NULL,
  `display_order`    INT           NOT NULL DEFAULT 0,
  `created_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_flash_sales_slug_locale` (`slug`,`locale`),
  KEY `idx_flash_sales_locale` (`locale`),
  KEY `idx_flash_sales_active` (`is_active`),
  KEY `idx_flash_sales_window` (`start_at`,`end_at`),
  KEY `idx_flash_sales_order` (`display_order`),
  KEY `idx_flash_sales_scope` (`scope_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── flash_sale_categories ───────────────────────────────── */
CREATE TABLE `flash_sale_categories` (
  `flash_sale_id` CHAR(36) NOT NULL,
  `category_id`   CHAR(36) NOT NULL,
  PRIMARY KEY (`flash_sale_id`, `category_id`),
  KEY `idx_fsc_category` (`category_id`),
  CONSTRAINT `fk_fsc_flash_sale`
    FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── flash_sale_subcategories ────────────────────────────── */
CREATE TABLE `flash_sale_subcategories` (
  `flash_sale_id`   CHAR(36) NOT NULL,
  `sub_category_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`flash_sale_id`, `sub_category_id`),
  KEY `idx_fss_subcategory` (`sub_category_id`),
  CONSTRAINT `fk_fss_flash_sale`
    FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── flash_sale_properties ───────────────────────────────── */
CREATE TABLE `flash_sale_properties` (
  `flash_sale_id` CHAR(36) NOT NULL,
  `property_id`   CHAR(36) NOT NULL,
  PRIMARY KEY (`flash_sale_id`, `property_id`),
  KEY `idx_fsp_property` (`property_id`),
  CONSTRAINT `fk_fsp_flash_sale`
    FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── flash_sale_sellers (ileride satıcı modülü için) ──────── */
CREATE TABLE `flash_sale_sellers` (
  `flash_sale_id` CHAR(36) NOT NULL,
  `seller_id`     CHAR(36) NOT NULL,
  PRIMARY KEY (`flash_sale_id`, `seller_id`),
  KEY `idx_fsls_seller` (`seller_id`),
  CONSTRAINT `fk_fsls_flash_sale`
    FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── Seed verisi ─────────────────────────────────────────── */
INSERT INTO `flash_sales`
(`id`,`title`,`slug`,`locale`,`description`,`discount_type`,`discount_value`,
 `start_at`,`end_at`,`is_active`,`scope_type`,
 `background_color`,`title_color`,`description_color`,
 `button_text`,`button_url`,`button_bg_color`,`button_text_color`,
 `timer_bg_color`,`timer_text_color`,
 `display_order`,`created_at`,`updated_at`)
VALUES
/* ─── Amber / Turuncu ─────────────────────────────────── */
(
  'f1000000-0000-4000-8000-000000000001',
  'Yem ve Mama Kategorisinde Haftalık İndirim',
  'yem-mama-haftalik-indirim',
  'tr',
  'Seçili yem ve mama ilanlarında sınırlı süreli kampanya. Hızlı davranın!',
  'percent', 15.00,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY),
  DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY),
  1, 'categories',
  '#FFF7ED','#78350F','#92400E',
  'İlanları Gör','/ilanlar','#D97706','#FFFFFF',
  'rgba(120,53,15,0.12)','#92400E',
  1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
),
/* ─── Yeşil / Sage ────────────────────────────────────── */
(
  'f1000000-0000-4000-8000-000000000002',
  'Hayvancılık Ekipmanlarında Sabit Tutar İndirim',
  'hayvancilik-ekipman-sabit-indirim',
  'tr',
  'Belirli ekipman ilanları için sabit tutar indirimi. Sezon başlamadan fırsatı kaçırmayın.',
  'amount', 250.00,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 HOUR),
  DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 10 DAY),
  1, 'all',
  '#F0FDF4','#14532D','#166534',
  'Kampanyaya Git','/ilanlar','#16A34A','#FFFFFF',
  'rgba(20,83,45,0.12)','#166534',
  2, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
),
/* ─── İndigo / Mavi ──────────────────────────────────── */
(
  'f1000000-0000-4000-8000-000000000004',
  'Tarım Makineleri Kiralama Fırsatı',
  'tarim-makineleri-kiralama',
  'tr',
  'Traktör, biçerdöver ve sulama sistemlerinde özel sezon indirimi. Hasat zamanı hazır olun.',
  'percent', 20.00,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 HOUR),
  DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 14 DAY),
  1, 'categories',
  '#EFF6FF','#1E3A8A','#1D4ED8',
  'Makine Bul','/ilanlar','#3B82F6','#FFFFFF',
  'rgba(30,58,138,0.12)','#1E3A8A',
  3, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
),
/* ─── Arşiv ───────────────────────────────────────────── */
(
  'f1000000-0000-4000-8000-000000000003',
  'Arşiv Kampanya Örneği',
  'arsiv-kampanya-ornegi',
  'tr',
  'Süresi dolmuş kampanya örnek kaydı.',
  'percent', 10.00,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 15 DAY),
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY),
  0, 'all',
  NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,
  99, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE
  `title`             = VALUES(`title`),
  `description`       = VALUES(`description`),
  `discount_type`     = VALUES(`discount_type`),
  `discount_value`    = VALUES(`discount_value`),
  `start_at`          = VALUES(`start_at`),
  `end_at`            = VALUES(`end_at`),
  `is_active`         = VALUES(`is_active`),
  `scope_type`        = VALUES(`scope_type`),
  `background_color`  = VALUES(`background_color`),
  `title_color`       = VALUES(`title_color`),
  `description_color` = VALUES(`description_color`),
  `button_text`       = VALUES(`button_text`),
  `button_url`        = VALUES(`button_url`),
  `button_bg_color`   = VALUES(`button_bg_color`),
  `button_text_color` = VALUES(`button_text_color`),
  `timer_bg_color`    = VALUES(`timer_bg_color`),
  `timer_text_color`  = VALUES(`timer_text_color`),
  `display_order`     = VALUES(`display_order`),
  `updated_at`        = CURRENT_TIMESTAMP(3);

/* ── Kampanya 1: Hayvan & Tarım kategorisine bağla ───────── */
INSERT INTO `flash_sale_categories` (`flash_sale_id`, `category_id`)
VALUES ('f1000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005')
ON DUPLICATE KEY UPDATE `category_id` = VALUES(`category_id`);

SET FOREIGN_KEY_CHECKS = 1;
