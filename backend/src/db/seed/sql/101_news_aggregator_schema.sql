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
  `created_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uniq_nsugg_url` (`source_url`(500)),
  KEY `idx_nsugg_status`    (`status`),
  KEY `idx_nsugg_source`    (`source_id`),
  KEY `idx_nsugg_article`   (`article_id`),
  KEY `idx_nsugg_created`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Varsayılan haber kaynakları
INSERT IGNORE INTO `news_sources` (`name`, `url`, `source_type`, `is_enabled`, `fetch_interval_min`, `display_order`) VALUES
  ('Google News - Kaman',            'https://news.google.com/rss/search?q=Kaman+Kırşehir&hl=tr&gl=TR&ceid=TR:tr',   'rss', 1, 60,  1),
  ('Google News - Kırşehir',         'https://news.google.com/rss/search?q=Kırşehir&hl=tr&gl=TR&ceid=TR:tr',         'rss', 1, 60,  2),
  ('Sabah Gündem',                   'https://www.sabah.com.tr/rss/gundem.xml',                                        'rss', 1, 30,  3),
  ('Hürriyet Gündem',                'https://www.hurriyet.com.tr/rss/gundem',                                         'rss', 1, 30,  4),
  ('AA - Son Dakika',                'https://www.aa.com.tr/tr/rss/default?cat=guncel',                                'rss', 1, 30,  5),
  ('Kırşehir Haber Türk',            'https://www.kirsehirhaberturk.com/rss.xml',                                      'rss', 1, 30,  6),
  ('Kırşehir Haber Türk - Gündem',   'https://www.kirsehirhaberturk.com/rss/gundem.xml',                               'rss', 1, 30,  7),
  ('Kırşehir Haber Türk - Asayiş',   'https://www.kirsehirhaberturk.com/rss/asayis.xml',                               'rss', 1, 30,  8),
  ('Son Dakika - Kaman',             'https://www.sondakika.com/kaman/rss/',                                           'rss', 1, 30,  9),
  ('Kırşehir Haber 40',              'https://kirsehirhaber40.com/rss',                                                'rss', 1, 30, 10);
