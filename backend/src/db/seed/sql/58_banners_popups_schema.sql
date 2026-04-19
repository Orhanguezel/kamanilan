SET NAMES utf8mb4;

-- =============================================================
-- BANNERS SCHEMA
-- =============================================================
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id`                 INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `uuid`               CHAR(36)       NOT NULL,
  `title`              VARCHAR(255)   NOT NULL,
  `slug`               VARCHAR(255)   NOT NULL,
  `subtitle`           VARCHAR(255)   DEFAULT NULL,
  `description`        TEXT           DEFAULT NULL,
  `image_url`          TEXT           DEFAULT NULL,
  `image_asset_id`     CHAR(36)       DEFAULT NULL,
  `alt`                VARCHAR(255)   DEFAULT NULL,
  `thumbnail_url`      TEXT           DEFAULT NULL,
  `thumbnail_asset_id` CHAR(36)       DEFAULT NULL,
  `background_color`   VARCHAR(30)    DEFAULT NULL,
  `title_color`        VARCHAR(30)    DEFAULT NULL,
  `description_color`  VARCHAR(30)    DEFAULT NULL,
  `button_text`        VARCHAR(100)   DEFAULT NULL,
  `button_color`       VARCHAR(30)    DEFAULT NULL,
  `button_hover_color` VARCHAR(30)    DEFAULT NULL,
  `button_text_color`  VARCHAR(30)    DEFAULT NULL,
  `link_url`           VARCHAR(500)   DEFAULT NULL,
  `link_target`        VARCHAR(20)    NOT NULL DEFAULT '_self',
  `is_active`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `display_order`      INT UNSIGNED   NOT NULL DEFAULT 0,
  `desktop_row`        INT UNSIGNED   NOT NULL DEFAULT 0,
  `desktop_columns`    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `start_at`           DATETIME(3)    DEFAULT NULL,
  `end_at`             DATETIME(3)    DEFAULT NULL,
  `advertiser_name`    VARCHAR(255)   DEFAULT NULL,
  `contact_info`       VARCHAR(500)   DEFAULT NULL,
  `created_at`         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_banner_uuid` (`uuid`),
  UNIQUE KEY `uniq_banner_slug` (`slug`),
  KEY `idx_banner_active`        (`is_active`),
  KEY `idx_banner_order`         (`display_order`),
  KEY `idx_banner_desktop_row`   (`desktop_row`),
  KEY `idx_banner_image_asset`   (`image_asset_id`),
  KEY `idx_banner_thumb_asset`   (`thumbnail_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- POPUPS SCHEMA
-- =============================================================
DROP TABLE IF EXISTS `popups`;
CREATE TABLE `popups` (
  `id`                 INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `uuid`               CHAR(36)       NOT NULL,
  `type`               ENUM('topbar', 'sidebar_top', 'sidebar_center', 'sidebar_bottom', 'modal') NOT NULL,
  `title`              VARCHAR(255)   NOT NULL,
  `content`            TEXT           NOT NULL,
  `background_color`   VARCHAR(30)    DEFAULT NULL,
  `text_color`         VARCHAR(30)    DEFAULT NULL,
  `button_text`        VARCHAR(100)   DEFAULT NULL,
  `button_color`       VARCHAR(30)    DEFAULT NULL,
  `button_hover_color` VARCHAR(30)    DEFAULT NULL,
  `button_text_color`  VARCHAR(30)    DEFAULT NULL,
  `link_url`           VARCHAR(500)   DEFAULT NULL,
  `link_target`        VARCHAR(20)    NOT NULL DEFAULT '_self',
  `image_url`          TEXT           DEFAULT NULL,
  `image_asset_id`     CHAR(36)       DEFAULT NULL,
  `alt`                VARCHAR(255)   DEFAULT NULL,
  `text_behavior`      ENUM('static', 'marquee') NOT NULL DEFAULT 'static',
  `scroll_speed`       INT UNSIGNED   NOT NULL DEFAULT 60,
  `closeable`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `delay_seconds`      INT UNSIGNED   NOT NULL DEFAULT 0,
  `display_frequency`  ENUM('always', 'once', 'daily', 'weekly') NOT NULL DEFAULT 'always',
  `is_active`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `display_order`      INT UNSIGNED   NOT NULL DEFAULT 0,
  `start_at`           DATETIME(3)    DEFAULT NULL,
  `end_at`             DATETIME(3)    DEFAULT NULL,
  `created_at`         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_popup_uuid` (`uuid`),
  KEY `idx_popup_type`         (`type`),
  KEY `idx_popup_active`       (`is_active`),
  KEY `idx_popup_order`        (`display_order`),
  KEY `idx_popup_image_asset`  (`image_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
