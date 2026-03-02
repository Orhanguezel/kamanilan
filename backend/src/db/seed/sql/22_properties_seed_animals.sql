-- =============================================================
-- FILE: 22_properties_seed_animals.sql
-- Kaman Ilan - hayvan ilanları (category_id based)
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

INSERT INTO `properties`
(
  `id`,
  `user_id`,
  `title`, `slug`,
  `category_id`, `sub_category_id`,
  `status`,
  `address`, `district`, `city`, `neighborhood`,
  `description`,
  `price`, `currency`, `min_price_admin`,
  `listing_no`, `badge_text`, `featured`,
  `image_url`, `alt`,
  `display_order`, `is_active`,
  `created_at`, `updated_at`
)
VALUES
(
  '32000000-0000-4000-8000-000000000001',
  @SELLER_ID,
  'Satilik Simental Duve - 20 Aylik', 'satilik-simental-duve-20-aylik',
  '10000000-0000-4000-8000-000000000005', NULL,
  'satilik',
  'Ciftlik Yolu 5. Km', 'Kaman', 'Kirsehir', 'Ciftlikler',
  'Asilari tam, veteriner kontrolunden gecmistir.',
  138000.00, 'TRY', 129000.00,
  'KMN-ANM-1001', 'Saglikli', 1,
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Simental duve',
  101, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '32000000-0000-4000-8000-000000000003',
  @CUSTOMER_ID,
  'Bulundu Kupeli Inek - Sahibi Araniyor', 'bulundu-kupeli-inek-sahibi-araniyor-kaman',
  '10000000-0000-4000-8000-000000000005', NULL,
  'bulundu',
  'Kirsehir Yolu 2. Km', 'Kaman', 'Kirsehir', 'Baglar',
  'Kulak kupesi mevcut, sahibine teslim edilecektir.',
  0.00, 'TRY', NULL,
  'KMN-ANM-1003', 'Bulundu', 0,
  'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Bulunan inek',
  103, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '32000000-0000-4000-8000-000000000004',
  @SELLER_ID,
  'Satilik Gezen Tavuk - 50 Adet', 'satilik-gezen-tavuk-50-adet',
  '10000000-0000-4000-8000-000000000005', NULL,
  'satilik',
  'Kumes Ciftligi Bolgesi', 'Kaman', 'Kirsehir', 'Koy Ici',
  'Asili gezen tavuklar, toplu satis.',
  42500.00, 'TRY', 39000.00,
  'KMN-ANM-1004', 'Toplu', 1,
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Gezen tavuk',
  104, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '32000000-0000-4000-8000-000000000005',
  @SELLER_ID,
  'Satilik Hindi Erkek - 12 Adet', 'satilik-hindi-erkek-12-adet',
  '10000000-0000-4000-8000-000000000005', NULL,
  'satilik',
  'Asagi Ciftlik Mevkii', 'Kaman', 'Kirsehir', 'Asagi Ciftlik',
  'Saglik kontrolleri yapilmis hindiler.',
  21600.00, 'TRY', NULL,
  'KMN-ANM-1005', NULL, 0,
  'https://images.unsplash.com/photo-1600402872705-a25a8d0fdd3f?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Hindi surusu',
  105, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
)

ON DUPLICATE KEY UPDATE
  `user_id`         = VALUES(`user_id`),
  `title`           = VALUES(`title`),
  `slug`            = VALUES(`slug`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `status`          = VALUES(`status`),
  `address`         = VALUES(`address`),
  `district`        = VALUES(`district`),
  `city`            = VALUES(`city`),
  `neighborhood`    = VALUES(`neighborhood`),
  `description`     = VALUES(`description`),
  `price`           = VALUES(`price`),
  `currency`        = VALUES(`currency`),
  `min_price_admin` = VALUES(`min_price_admin`),
  `listing_no`      = VALUES(`listing_no`),
  `badge_text`      = VALUES(`badge_text`),
  `featured`        = VALUES(`featured`),
  `image_url`       = VALUES(`image_url`),
  `alt`             = VALUES(`alt`),
  `display_order`   = VALUES(`display_order`),
  `is_active`       = VALUES(`is_active`),
  `updated_at`      = CURRENT_TIMESTAMP(3);

-- Variant values are inserted in 72_property_variant_values_seed.sql

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
