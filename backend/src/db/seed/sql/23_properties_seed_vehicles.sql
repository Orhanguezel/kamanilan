-- =============================================================
-- FILE: 23_properties_seed_vehicles.sql
-- Kaman Ilan - vehicle listings
-- CLEAN: type/sub_type/specs_json removed; category_id used
-- category_id: 10000000-0000-4000-8000-000000000002 (Araç & Motosiklet)
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
  '33000000-0000-4000-8000-000000000001',
  @SELLER_ID,
  '2021 Fiat Egea 1.6 Multijet - Tramer Kayitsiz', '2021-fiat-egea-1-6-multijet-tramer-kayitsiz',
  'satilik', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000011',
  'Sanayi Sitesi B Blok', 'Kaman', 'Kirsehir', 'Sanayi',
  'Yetkili servis bakimli, masrafsiz aile araci.',
  915000.00, 'TRY', 875000.00,
  'KMN-VHC-2001', 'Temiz', 1,
  'https://images.unsplash.com/photo-1549399542-7e82138f9f6f?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Fiat Egea',
  201, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 5 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '33000000-0000-4000-8000-000000000002',
  @SELLER_ID,
  'Massey Ferguson 285 S Traktor - Bakimli', 'massey-ferguson-285s-traktor-bakimli',
  'satilik', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000013',
  'Koy Garaji', 'Kaman', 'Kirsehir', 'Yukaribey',
  'Tarla islerinde aktif kullanilmis, motoru sorunsuz.',
  1290000.00, 'TRY', NULL,
  'KMN-VHC-2002', NULL, 0,
  'https://images.unsplash.com/photo-1592982537447-6f2a6a0b8f95?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Tarla traktoru',
  202, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 8 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '33000000-0000-4000-8000-000000000003',
  @CUSTOMER_ID,
  'Kiralik Renault Clio - Gunluk Haftalik', 'kiralik-renault-clio-gunluk-haftalik-kaman',
  'kiralik', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000011',
  'Otogar Karsisi', 'Kaman', 'Kirsehir', 'Merkez',
  'Bireysel kiralama, temiz teslim.',
  1850.00, 'TRY', NULL,
  'KMN-VHC-2003', 'Kiralik', 0,
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kiralik otomobil',
  203, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '33000000-0000-4000-8000-000000000004',
  @CUSTOMER_ID,
  'Satilik Honda PCX 125 - Duzgun Kullanildi', 'satilik-honda-pcx-125-duzgun-kullanildi',
  'satilik', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000012',
  'Carsi Girisi', 'Kaman', 'Kirsehir', 'Carsi',
  'Sehir ici kullanim icin ekonomik motosiklet.',
  142000.00, 'TRY', 135000.00,
  'KMN-VHC-2004', NULL, 0,
  'https://images.unsplash.com/photo-1558981403-c5f9891c8a2f?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Honda motosiklet',
  204, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '33000000-0000-4000-8000-000000000005',
  @SELLER_ID,
  'Is Makinesi Mini Ekskavator - 2023 Model', 'is-makinesi-mini-ekskavator-2023-model',
  'satilik', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000014',
  'Organize Sanayi Alani', 'Kaman', 'Kirsehir', 'OSB',
  'Saha islerinde kullanima hazir mini ekskavator.',
  1860000.00, 'TRY', NULL,
  'KMN-VHC-2005', 'Dusuk Saat', 1,
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Mini ekskavator',
  205, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 12 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY)
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
