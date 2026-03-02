-- ============================================================================
-- 40_ai_chat_schema.sql
-- AI sohbet oturumları ve mesaj geçmişi
-- ============================================================================
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';

-- AI oturumları (kayıtlı kullanıcı veya anonim)
CREATE TABLE IF NOT EXISTS `ai_sessions` (
  `id`             CHAR(36)    NOT NULL,
  `user_id`        CHAR(36)    DEFAULT NULL COMMENT 'NULL = misafir',
  `created_at`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_active_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ai_sess_user_idx` (`user_id`),
  KEY `ai_sess_active_idx` (`last_active_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI mesajları
CREATE TABLE IF NOT EXISTS `ai_messages` (
  `id`         CHAR(36)     NOT NULL,
  `session_id` CHAR(36)     NOT NULL,
  `role`       VARCHAR(16)  NOT NULL DEFAULT 'user' COMMENT 'user | assistant',
  `content`    TEXT         NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ai_msg_session_idx` (`session_id`),
  KEY `ai_msg_created_idx` (`session_id`, `created_at`),
  CONSTRAINT `fk_ai_messages_session`
    FOREIGN KEY (`session_id`) REFERENCES `ai_sessions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
