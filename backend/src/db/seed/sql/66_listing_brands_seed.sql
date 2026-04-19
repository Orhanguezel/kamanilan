-- =============================================================
-- FILE: 66_listing_brands_seed.sql
-- Kaman İlan - Ornek Marka Kayitlari
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
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'emlak-kira' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    1
  ),
  (
    '65000000-0000-4000-8000-000000000002',
    'Anadolu Oto',
    'anadolu-oto',
    'Otomobil ilanlari icin ornek galeri markasi',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-motosiklet' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'otomobil' AND si.locale = 'tr' LIMIT 1),
    1,
    2
  ),
  (
    '65000000-0000-4000-8000-000000000003',
    'Massey Ferguson',
    'massey-ferguson',
    'Traktor ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-motosiklet' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'traktor' AND si.locale = 'tr' LIMIT 1),
    1,
    3
  ),
  (
    '65000000-0000-4000-8000-000000000004',
    'Yamaha',
    'yamaha',
    'Motosiklet ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-motosiklet' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'motosiklet' AND si.locale = 'tr' LIMIT 1),
    1,
    4
  ),
  (
    '65000000-0000-4000-8000-000000000005',
    'Vestel',
    'vestel',
    'Elektronik kategori icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'elektronik' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    5
  ),
  (
    '65000000-0000-4000-8000-000000000006',
    'Arcelik',
    'arcelik',
    'Beyaz esya ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'ikinci-el' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'beyaz-esya' AND si.locale = 'tr' LIMIT 1),
    1,
    6
  ),
  (
    '65000000-0000-4000-8000-000000000007',
    'Bellona',
    'bellona',
    'Mobilya ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'ikinci-el' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'mobilya' AND si.locale = 'tr' LIMIT 1),
    1,
    7
  ),
  (
    '65000000-0000-4000-8000-000000000008',
    'Kaman Ceviz Kooperatifi',
    'kaman-ceviz-kooperatifi',
    'Ceviz urunleri icin ornek yerel marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'kaman-cevizi' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    8
  ),
  (
    '65000000-0000-4000-8000-000000000009',
    'Anadolu Ciftlik',
    'anadolu-ciftlik',
    'Hayvan ve tarim ilanlari icin ornek ciftlik markasi',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'hayvan-tarim' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    9
  ),
  (
    '65000000-0000-4000-8000-000000000010',
    'Kaman Sutu',
    'kaman-sutu',
    'Sut ve yogurt ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'sut-yogurt' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    10
  ),
  (
    '65000000-0000-4000-8000-000000000011',
    'Kaman Organik',
    'kaman-organik',
    'Meyve sebze ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'meyve-sebze' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    11
  ),
  (
    '65000000-0000-4000-8000-000000000012',
    'Anadolu Tekstil',
    'anadolu-tekstil',
    'Giyim ve tekstil ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'giyim-tekstil' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    12
  ),
  (
    '65000000-0000-4000-8000-000000000013',
    'Kaman Usta Hizmet',
    'kaman-usta-hizmet',
    'Usta hizmet ilanlari icin ornek servis markasi',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'usta-hizmet' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    13
  ),
  (
    '65000000-0000-4000-8000-000000000014',
    'Tarim Aletleri AS',
    'tarim-aletleri-as',
    'Arac gerec ilanlari icin ornek marka',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-gerec' AND ci.locale = 'tr' LIMIT 1),
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
