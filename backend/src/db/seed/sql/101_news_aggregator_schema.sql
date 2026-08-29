-- =============================================================
-- 101_news_aggregator_schema.sql
-- Haber Toplayıcı: news_sources + news_suggestions
-- =============================================================

CREATE TABLE IF NOT EXISTS `news_sources` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name`                VARCHAR(255) NOT NULL,
  `url`                 VARCHAR(1000) NOT NULL,
  `source_type`         ENUM('rss','og','scrape') NOT NULL DEFAULT 'rss',
  `is_enabled`          TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `fetch_interval_min`  INT UNSIGNED NOT NULL DEFAULT 30,
  `last_fetched_at`     DATETIME(3) NULL,
  `error_count`         INT UNSIGNED NOT NULL DEFAULT 0,
  `last_error`          VARCHAR(500) NULL,
  `notes`               VARCHAR(1000) NULL,
  `display_order`       INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uniq_ns_url` (`url`(500))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `news_suggestions` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `source_id`    INT UNSIGNED NULL,
  `source_url`   VARCHAR(1000) NOT NULL,
  `title`        VARCHAR(500) NULL,
  `excerpt`      VARCHAR(2000) NULL,
  `content`      LONGTEXT NULL,
  `image_url`    VARCHAR(1000) NULL,
  `source_name`  VARCHAR(255) NULL,
  `author`       VARCHAR(255) NULL,
  `category`     VARCHAR(100) NULL DEFAULT 'genel',
  `tags`         VARCHAR(500) NULL,
  `original_pub_at` DATETIME(3) NULL,
  `status`       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `article_id`   INT UNSIGNED NULL COMMENT 'Onaylanınca oluşturulan articles.id',
  `reject_reason` VARCHAR(500) NULL,
  `ai_status` ENUM('none','queued','done','failed') NOT NULL DEFAULT 'none',
  `ai_title` VARCHAR(500) NULL,
  `ai_excerpt` VARCHAR(2000) NULL,
  `ai_content` LONGTEXT NULL,
  `ai_meta_title` VARCHAR(255) NULL,
  `ai_meta_description` VARCHAR(500) NULL,
  `ai_tags` VARCHAR(500) NULL,
  `image_brief` TEXT NULL,
  `image_status` ENUM('none','waiting','received','attached') NOT NULL DEFAULT 'none',
  `internal_links` TEXT NULL,
  `created_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uniq_nsugg_url` (`source_url`(500)),
  KEY `idx_nsugg_status`    (`status`),
  KEY `idx_nsugg_ai_status` (`ai_status`),
  KEY `idx_nsugg_image_status` (`image_status`),
  KEY `idx_nsugg_source`    (`source_id`),
  KEY `idx_nsugg_article`   (`article_id`),
  KEY `idx_nsugg_created`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Yerel yayın politikası dışında kalan veya bozuk kaynakları nodrop seed'de de tamamen kaldır.
-- Kullanıcı kararı: ulusal gündem kaynağı, AKP propagandası ve reklam/tanıtım akışı yok.
DELETE FROM `news_sources`
WHERE `name` IN (
  'Sabah Gündem',
  'Hürriyet Gündem',
  'AA - Son Dakika',
  'Kırşehir Haber Türk - Gündem',
  'Kırşehir Haber Türk - Asayiş',
  'Son Dakika - Kaman'
);

-- Varsayılan allowlist: yalnız Kaman/Kırşehir odaklı, canlı doğrulanmış akışlar.
INSERT IGNORE INTO `news_sources` (`name`, `url`, `source_type`, `is_enabled`, `fetch_interval_min`, `display_order`) VALUES
  ('Google News - Kaman',            'https://news.google.com/rss/search?q=Kaman+Kırşehir&hl=tr&gl=TR&ceid=TR:tr',   'rss', 1, 60,  1),
  ('Google News - Kırşehir',         'https://news.google.com/rss/search?q=Kırşehir&hl=tr&gl=TR&ceid=TR:tr',         'rss', 1, 60,  2),
  ('Kırşehir Haber Türk',            'https://www.kirsehirhaberturk.com/rss.xml',                                      'rss', 1, 30,  3),
  ('Kırşehir Haber 40',              'https://kirsehirhaber40.com/rss',                                                'rss', 1, 30,  4);

INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`)
VALUES (UUID(), 'news_auto_publish', '*', 'false', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `key`=VALUES(`key`);
