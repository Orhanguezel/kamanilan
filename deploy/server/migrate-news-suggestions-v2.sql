CREATE TABLE IF NOT EXISTS `news_suggestions_v2` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `source_id` INT UNSIGNED NULL,
  `source_url` VARCHAR(1000) NOT NULL,
  `title` VARCHAR(500) NULL,
  `excerpt` VARCHAR(2000) NULL,
  `content` LONGTEXT NULL,
  `image_url` VARCHAR(1000) NULL,
  `source_name` VARCHAR(255) NULL,
  `author` VARCHAR(255) NULL,
  `category` VARCHAR(100) NULL DEFAULT 'genel',
  `tags` VARCHAR(500) NULL,
  `original_pub_at` DATETIME(3) NULL,
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `article_id` INT UNSIGNED NULL,
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
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uniq_nsugg_v2_url` (`source_url`(500)),
  KEY `idx_nsugg_v2_status` (`status`),
  KEY `idx_nsugg_v2_ai_status` (`ai_status`),
  KEY `idx_nsugg_v2_image_status` (`image_status`),
  KEY `idx_nsugg_v2_source` (`source_id`),
  KEY `idx_nsugg_v2_article` (`article_id`),
  KEY `idx_nsugg_v2_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `news_suggestions_v2`
  (`id`,`source_id`,`source_url`,`title`,`excerpt`,`content`,`image_url`,`source_name`,
   `author`,`category`,`tags`,`original_pub_at`,`status`,`article_id`,`reject_reason`,
   `created_at`,`updated_at`)
SELECT
  `id`,`source_id`,`source_url`,`title`,`excerpt`,`content`,`image_url`,`source_name`,
  `author`,`category`,`tags`,`original_pub_at`,`status`,`article_id`,`reject_reason`,
  `created_at`,`updated_at`
FROM `news_suggestions`;

RENAME TABLE
  `news_suggestions` TO `news_suggestions_pre_ai_20260813`,
  `news_suggestions_v2` TO `news_suggestions`;
