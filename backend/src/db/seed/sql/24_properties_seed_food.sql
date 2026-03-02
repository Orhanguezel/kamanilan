-- =============================================================
-- FILE: 24_properties_seed_food.sql
-- Kaman Ilan - food / agricultural product listings
-- CLEAN: type/sub_type/specs_json removed; category_id used
-- category_id: 10000000-0000-4000-8000-000000000004 (Kaman Cevizi & Gıda)
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

INSERT INTO `properties`
(
  `id`,
  `user_id`,
  `title`, `slug`,
  `status`, `category_id`, `sub_category_id`,
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
  '34000000-0000-4000-8000-000000000001',
  @SELLER_ID,
  'Ic Ceviz - Vakumlu 5 KG', 'ic-ceviz-vakumlu-5kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000041',
  'Uretici Kooperatifi Deposu', 'Kaman', 'Kirsehir', 'Sofular',
  'Yeni sezon Kaman cevizi, secilmis ic ceviz.',
  2650.00, 'TRY', 2450.00,
  'KMN-FOD-3001', 'Yeni Sezon', 1,
  'https://images.unsplash.com/photo-1508747703725-719777637510?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Ic ceviz',
  301, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 9 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '34000000-0000-4000-8000-000000000002',
  @SELLER_ID,
  'Koy Yogurdu - 3 KG', 'koy-yogurdu-3kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000044',
  'Sut Toplama Merkezi', 'Kaman', 'Kirsehir', 'Merkez',
  'Dogal maya ile gunluk uretim koy yogurdu.',
  390.00, 'TRY', 350.00,
  'KMN-FOD-3002', 'Gunluk Uretim', 1,
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Koy yogurdu',
  302, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY), CURRENT_TIMESTAMP(3)
),
(
  '34000000-0000-4000-8000-000000000003',
  @SELLER_ID,
  'Taze Kasar Peyniri - 2 KG', 'taze-kasar-peyniri-2kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000044',
  'Mandira Caddesi', 'Kaman', 'Kirsehir', 'Mandira',
  'Koy sutunden uretim taze kasar.',
  620.00, 'TRY', NULL,
  'KMN-FOD-3003', NULL, 0,
  'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kasar peyniri',
  303, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '34000000-0000-4000-8000-000000000004',
  @SELLER_ID,
  'Elma Kasasi - 18 KG', 'elma-kasasi-18kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000046',
  'Meyve Hali 3. Koridor', 'Kaman', 'Kirsehir', 'Pazar',
  'Bahce cikisi taze elma.',
  740.00, 'TRY', NULL,
  'KMN-FOD-3004', NULL, 0,
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Elma kasasi',
  304, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '34000000-0000-4000-8000-000000000005',
  @SELLER_ID,
  'Kurutulmus Biber - 1 KG', 'kurutulmus-biber-1kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000046',
  'Pazar Alani', 'Kaman', 'Kirsehir', 'Pazar',
  'Dogal yontemlerle kurutulmus biber.',
  310.00, 'TRY', NULL,
  'KMN-FOD-3005', 'Koy Uretimi', 0,
  'https://images.unsplash.com/photo-1583663848850-46af132dc08e?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kurutulmus biber',
  305, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '34000000-0000-4000-8000-000000000006',
  @SELLER_ID,
  'Nohut - 25 KG Cuval', 'nohut-25kg-cuval',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000047',
  'Tahil Pazari Girisi', 'Kaman', 'Kirsehir', 'Sanayi',
  'Kaman ovasi mahsulu nohut.',
  1625.00, 'TRY', 1500.00,
  'KMN-FOD-3006', NULL, 0,
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Nohut cuvali',
  306, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 5 DAY), CURRENT_TIMESTAMP(3)
),
(
  '34000000-0000-4000-8000-000000000007',
  @SELLER_ID,
  'Tam Bugday Unu - 10 KG', 'tam-bugday-unu-10kg',
  'satilik', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000047',
  'Degirmen Sokak', 'Kaman', 'Kirsehir', 'Degirmen',
  'Tas degirmende cekilmis tam bugday unu.',
  420.00, 'TRY', NULL,
  'KMN-FOD-3007', 'Yeni Cekim', 0,
  'https://images.unsplash.com/photo-1603048719535-9ecb4f73d55b?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Tam bugday unu',
  307, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), CURRENT_TIMESTAMP(3)
),
(
  '34000000-0000-4000-8000-000000000008',
  @SELLER_ID,
  'Koy Tereyagi - 1 KG (Tukendi)', 'koy-tereyagi-1kg-tukendi',
  'tukendi', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000044',
  'Mandira Caddesi', 'Kaman', 'Kirsehir', 'Mandira',
  'Son parti satilmistir, yeni uretim yakinda.',
  0.00, 'TRY', NULL,
  'KMN-FOD-3008', 'Tukendi', 0,
  'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Koy tereyagi',
  308, 0,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 14 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
)
ON DUPLICATE KEY UPDATE
  `user_id`         = VALUES(`user_id`),
  `title`           = VALUES(`title`),
  `slug`            = VALUES(`slug`),
  `status`          = VALUES(`status`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
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
