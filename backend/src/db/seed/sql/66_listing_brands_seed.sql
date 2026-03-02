-- =============================================================
-- FILE: 66_listing_brands_seed.sql
-- Kaman Ilan - Ornek Marka Kayitlari
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO `listing_brands`
  (`id`, `name`, `slug`, `description`, `category_id`, `sub_category_id`, `is_active`, `display_order`)
VALUES
  (
    '65000000-0000-4000-8000-000000000001',
    'EmlakPort',
    'emlakport',
    'Emlak kategorisi icin kurumsal ofis markasi',
    (SELECT `id` FROM `categories` WHERE `slug` = 'emlak-kira' LIMIT 1),
    NULL,
    1,
    1
  ),
  (
    '65000000-0000-4000-8000-000000000002',
    'Anadolu Oto',
    'anadolu-oto',
    'Otomobil ilanlari icin ornek galeri markasi',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-motosiklet' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'otomobil' LIMIT 1),
    1,
    2
  ),
  (
    '65000000-0000-4000-8000-000000000003',
    'Massey Ferguson',
    'massey-ferguson',
    'Traktor ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-motosiklet' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'traktor' LIMIT 1),
    1,
    3
  ),
  (
    '65000000-0000-4000-8000-000000000004',
    'Yamaha',
    'yamaha',
    'Motosiklet ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-motosiklet' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'motosiklet' LIMIT 1),
    1,
    4
  ),
  (
    '65000000-0000-4000-8000-000000000005',
    'Vestel',
    'vestel',
    'Elektronik kategori icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'elektronik' LIMIT 1),
    NULL,
    1,
    5
  ),
  (
    '65000000-0000-4000-8000-000000000006',
    'Arcelik',
    'arcelik',
    'Beyaz esya ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'ikinci-el' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'beyaz-esya' LIMIT 1),
    1,
    6
  ),
  (
    '65000000-0000-4000-8000-000000000007',
    'Bellona',
    'bellona',
    'Mobilya ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'ikinci-el' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'mobilya' LIMIT 1),
    1,
    7
  ),
  (
    '65000000-0000-4000-8000-000000000008',
    'Kaman Ceviz Kooperatifi',
    'kaman-ceviz-kooperatifi',
    'Ceviz urunleri icin ornek yerel marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'kaman-cevizi' LIMIT 1),
    NULL,
    1,
    8
  ),
  (
    '65000000-0000-4000-8000-000000000009',
    'Anadolu Ciftlik',
    'anadolu-ciftlik',
    'Hayvan ve tarim ilanlari icin ornek ciftlik markasi',
    (SELECT `id` FROM `categories` WHERE `slug` = 'hayvan-tarim' LIMIT 1),
    NULL,
    1,
    9
  ),
  (
    '65000000-0000-4000-8000-000000000010',
    'Kaman Sutu',
    'kaman-sutu',
    'Sut ve yogurt ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'sut-yogurt' LIMIT 1),
    NULL,
    1,
    10
  ),
  (
    '65000000-0000-4000-8000-000000000011',
    'Kaman Organik',
    'kaman-organik',
    'Meyve sebze ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'meyve-sebze' LIMIT 1),
    NULL,
    1,
    11
  ),
  (
    '65000000-0000-4000-8000-000000000012',
    'Anadolu Tekstil',
    'anadolu-tekstil',
    'Giyim ve tekstil ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'giyim-tekstil' LIMIT 1),
    NULL,
    1,
    12
  ),
  (
    '65000000-0000-4000-8000-000000000013',
    'Kaman Usta Hizmet',
    'kaman-usta-hizmet',
    'Usta hizmet ilanlari icin ornek servis markasi',
    (SELECT `id` FROM `categories` WHERE `slug` = 'usta-hizmet' LIMIT 1),
    NULL,
    1,
    13
  ),
  (
    '65000000-0000-4000-8000-000000000014',
    'Tarim Aletleri AS',
    'tarim-aletleri-as',
    'Arac gerec ilanlari icin ornek marka',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-gerec' LIMIT 1),
    NULL,
    1,
    14
  )
ON DUPLICATE KEY UPDATE
  `name`          = VALUES(`name`),
  `slug`          = VALUES(`slug`),
  `description`   = VALUES(`description`),
  `category_id`   = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `is_active`     = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`),
  `updated_at`    = CURRENT_TIMESTAMP(3);
