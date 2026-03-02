-- ============================================================================
-- 30_chat_schema.sql
-- Kullanıcılar arası direkt mesajlaşma tabloları
-- ============================================================================
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';

-- Konuşmalar (her ikili için tek oturum, opsiyonel ilan bağlantısı)
CREATE TABLE IF NOT EXISTS `conversations` (
  `id`              CHAR(36)       NOT NULL,
  `user_a`          CHAR(36)       NOT NULL COMMENT 'Küçük UUID (sıralı)',
  `user_b`          CHAR(36)       NOT NULL COMMENT 'Büyük UUID (sıralı)',
  `property_id`     CHAR(36)       DEFAULT NULL COMMENT 'İlana bağlı konuşma (opsiyonel)',
  `last_message_at` DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at`      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `conv_pair_property_uq` (`user_a`, `user_b`, `property_id`),
  KEY `conv_user_a_idx` (`user_a`),
  KEY `conv_user_b_idx` (`user_b`),
  KEY `conv_last_msg_idx` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mesajlar
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id`              CHAR(36)       NOT NULL,
  `conversation_id` CHAR(36)       NOT NULL,
  `sender_id`       CHAR(36)       NOT NULL,
  `body`            TEXT           NOT NULL,
  `is_read`         TINYINT(1)     UNSIGNED NOT NULL DEFAULT 0,
  `created_at`      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `chat_msg_conv_idx` (`conversation_id`),
  KEY `chat_msg_sender_idx` (`sender_id`),
  KEY `chat_msg_created_idx` (`conversation_id`, `created_at`),
  CONSTRAINT `fk_chat_messages_conversation`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
