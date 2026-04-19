/* 85_reviews.sql — Kaman İlan (i18n: parent + review_i18n) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================
-- DROP (child first — FK constraint order)
-- =============================================================
DROP TABLE IF EXISTS `review_i18n`;
DROP TABLE IF EXISTS `reviews`;

-- =============================================================
-- PARENT: reviews
-- =============================================================
CREATE TABLE `reviews` (
  `id`               CHAR(36)     NOT NULL,
  `target_type`      VARCHAR(50)  NOT NULL DEFAULT 'site',
  `target_id`        CHAR(36)     DEFAULT NULL,
  `name`             VARCHAR(255) NOT NULL,
  `email`            VARCHAR(255) NOT NULL,
  `rating`           TINYINT      NOT NULL DEFAULT 5,
  `role`             VARCHAR(255) DEFAULT NULL,
  `company`          VARCHAR(255) DEFAULT NULL,
  `avatar_url`       TEXT         DEFAULT NULL,
  `logo_url`         TEXT         DEFAULT NULL,
  `profile_href`     VARCHAR(500) DEFAULT NULL,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_approved`      TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order`    INT          NOT NULL DEFAULT 0,
  `likes_count`      INT          NOT NULL DEFAULT 0,
  `dislikes_count`   INT          NOT NULL DEFAULT 0,
  `helpful_count`    INT          NOT NULL DEFAULT 0,
  `submitted_locale` VARCHAR(8)   NOT NULL DEFAULT 'tr',
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reviews_active_idx`   (`is_active`),
  KEY `reviews_approved_idx` (`is_approved`),
  KEY `reviews_order_idx`    (`display_order`),
  KEY `reviews_rating_idx`   (`rating`),
  KEY `reviews_target_idx`   (`target_type`, `target_id`),
  KEY `reviews_created_idx`  (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CHILD: review_i18n
-- =============================================================
CREATE TABLE `review_i18n` (
  `id`           CHAR(36)     NOT NULL,
  `review_id`    CHAR(36)     NOT NULL,
  `locale`       VARCHAR(8)   NOT NULL DEFAULT 'tr',
  `title`        VARCHAR(255) DEFAULT NULL,
  `comment`      TEXT         NOT NULL,
  `admin_reply`  TEXT         DEFAULT NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_review_i18n_parent_locale` (`review_id`, `locale`),
  KEY `review_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_review_i18n_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED DATA
-- =============================================================

SET @rev1 = UUID(); SET @rev2 = UUID(); SET @rev3 = UUID();

-- Parent rows
INSERT INTO `reviews`
  (`id`, `name`, `email`, `rating`, `is_active`, `is_approved`, `display_order`, `created_at`, `updated_at`)
VALUES
  (@rev1, 'Ayşe K.',   'ayse@example.com',   5, 1, 1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
  (@rev2, 'Mehmet D.', 'mehmet@example.com',  4, 1, 1, 2, '2024-01-02 00:00:00.000', '2024-01-02 00:00:00.000'),
  (@rev3, 'Zeynep B.', 'zeynep@example.com',  5, 1, 1, 3, '2024-01-03 00:00:00.000', '2024-01-03 00:00:00.000');

-- i18n rows (locale='tr')
INSERT INTO `review_i18n` (`id`, `review_id`, `locale`, `title`, `comment`) VALUES
  (UUID(), @rev1, 'tr', NULL,
   'Evimizin satış sürecinde çok profesyonel ilerlediler. Fiyatlandırma ve pazarlama stratejisi sayesinde kısa sürede doğru alıcıyla buluştuk. Teşekkürler.'),
  (UUID(), @rev2, 'tr', NULL,
   'Kiralama sürecinde tüm adımlar şeffaftı. İlan, randevu ve sözleşme aşamalarında düzenli bilgilendirme yaptılar. Genel olarak memnun kaldım.'),
  (UUID(), @rev3, 'tr', NULL,
   'İletişimleri çok hızlı ve çözüm odaklıydı. Bölgeye hâkimiyetleri sayesinde beklentimize uygun evi kısa sürede bulduk. Güvenle tavsiye ederim.');
