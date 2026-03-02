-- =====================================================
-- FILE: 103_coupons_schema.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS `coupons` (
  `id`               CHAR(36)       NOT NULL,
  `code`             VARCHAR(50)    NOT NULL,
  `title`            VARCHAR(255)   NOT NULL,
  `description`      TEXT           DEFAULT NULL,
  `discount_type`    VARCHAR(16)    NOT NULL DEFAULT 'percent',
  `discount_value`   DECIMAL(10,2)  NOT NULL,
  `min_order_amount` DECIMAL(10,2)  DEFAULT NULL,
  `max_discount`     DECIMAL(10,2)  DEFAULT NULL,
  `max_uses`         INT            DEFAULT NULL,
  `uses_count`       INT            NOT NULL DEFAULT 0,
  `start_at`         DATETIME(3)    DEFAULT NULL,
  `end_at`           DATETIME(3)    DEFAULT NULL,
  `is_active`        TINYINT(1)     NOT NULL DEFAULT 1,
  `image_url`        VARCHAR(500)   DEFAULT NULL,
  `created_at`       DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_coupons_code` (`code`),
  KEY `coupons_is_active_idx` (`is_active`),
  KEY `coupons_end_at_idx` (`end_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek kuponlar
INSERT INTO `coupons` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `max_uses`, `start_at`, `end_at`, `is_active`)
VALUES
(
  UUID(), 'HOSGELDIN10', 'Hoş Geldin İndirimi',
  'İlk ilanınız için %10 indirim. Yeni üyelerimize özel fırsat!',
  'percent', 10.00, NULL, 50.00, 500,
  NOW(3), DATE_ADD(NOW(3), INTERVAL 6 MONTH), 1
),
(
  UUID(), 'YENI25', 'Yeni Üye Kampanyası',
  'İlk alışverişinizde 25 TL indirim kazanın.',
  'amount', 25.00, 100.00, NULL, 300,
  NOW(3), DATE_ADD(NOW(3), INTERVAL 3 MONTH), 1
),
(
  UUID(), 'YILIK15', 'Yıllık Üyelik İndirimi',
  'Yıllık üyelik planlarında %15 indirim.',
  'percent', 15.00, NULL, 100.00, NULL,
  NOW(3), DATE_ADD(NOW(3), INTERVAL 12 MONTH), 1
)
ON DUPLICATE KEY UPDATE
  `title`            = VALUES(`title`),
  `description`      = VALUES(`description`),
  `discount_type`    = VALUES(`discount_type`),
  `discount_value`   = VALUES(`discount_value`),
  `min_order_amount` = VALUES(`min_order_amount`),
  `max_discount`     = VALUES(`max_discount`),
  `max_uses`         = VALUES(`max_uses`),
  `end_at`           = VALUES(`end_at`),
  `is_active`        = VALUES(`is_active`),
  `updated_at`       = NOW(3);
