-- =============================================================
-- FILE: 102_article_comments_likes_schema.sql
-- Article Comments & Likes
-- =============================================================

CREATE TABLE IF NOT EXISTS `article_comments` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `article_id`  INT UNSIGNED     NOT NULL,
  `user_id`     CHAR(36)         NOT NULL COMMENT 'UUID of the logged-in user',
  `author_name` VARCHAR(255)     NOT NULL,
  `content`     TEXT             NOT NULL,
  `is_approved` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_ac_article`  (`article_id`),
  INDEX `idx_ac_user`     (`user_id`),
  INDEX `idx_ac_approved` (`is_approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `article_likes` (
  `article_id` INT UNSIGNED NOT NULL,
  `user_id`    CHAR(36)     NOT NULL COMMENT 'UUID of the logged-in user',
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`article_id`, `user_id`),
  INDEX `idx_al_article` (`article_id`),
  INDEX `idx_al_user`    (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
