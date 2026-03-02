-- =============================================================
-- FILE: 68_listing_tags_seed.sql
-- Kaman Ilan - Ornek Etiket (Tag) Kayitlari
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO `listing_tags`
  (`id`, `name`, `slug`, `description`, `category_id`, `sub_category_id`, `is_active`, `display_order`)
VALUES
  (
    '68000000-0000-4000-8000-000000000001',
    'Pazarlik Var',
    'pazarlik-var',
    'Fiyat gorusmeye acik ilanlar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'genel-satis' LIMIT 1),
    NULL,
    1,
    1
  ),
  (
    '68000000-0000-4000-8000-000000000002',
    'Acil Satilik',
    'acil-satilik',
    'Hizli devir istenen ilanlar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'genel-satis' LIMIT 1),
    NULL,
    1,
    2
  ),
  (
    '68000000-0000-4000-8000-000000000003',
    'Sahibinden',
    'sahibinden',
    'Araci olmadan dogrudan ilani acanlar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'emlak-kira' LIMIT 1),
    NULL,
    1,
    3
  ),
  (
    '68000000-0000-4000-8000-000000000004',
    'Ekspertizli',
    'ekspertizli',
    'Ekspertiz raporu bulunan araclar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-motosiklet' LIMIT 1),
    (SELECT `id` FROM `sub_categories` WHERE `slug` = 'otomobil' LIMIT 1),
    1,
    4
  ),
  (
    '68000000-0000-4000-8000-000000000005',
    'Bakimli',
    'bakimli',
    'Periyodik bakimlari tamamlanmis ilanlar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'arac-motosiklet' LIMIT 1),
    NULL,
    1,
    5
  ),
  (
    '68000000-0000-4000-8000-000000000006',
    'Ureticiden',
    'ureticiden',
    'Dogrudan ureticiden satilan urunler',
    (SELECT `id` FROM `categories` WHERE `slug` = 'kaman-cevizi' LIMIT 1),
    NULL,
    1,
    6
  ),
  (
    '68000000-0000-4000-8000-000000000007',
    'Veteriner Kontrollu',
    'veteriner-kontrollu',
    'Veteriner denetimi yapilmis hayvan ilanlari',
    (SELECT `id` FROM `categories` WHERE `slug` = 'hayvan-tarim' LIMIT 1),
    NULL,
    1,
    7
  ),
  (
    '68000000-0000-4000-8000-000000000008',
    'Organik',
    'organik',
    'Dogal / organik urun ilanlari',
    (SELECT `id` FROM `categories` WHERE `slug` = 'meyve-sebze' LIMIT 1),
    NULL,
    1,
    8
  ),
  (
    '68000000-0000-4000-8000-000000000009',
    'Gunluk Uretim',
    'gunluk-uretim',
    'Gunluk hazirlanan urun ilanlari',
    (SELECT `id` FROM `categories` WHERE `slug` = 'sut-yogurt' LIMIT 1),
    NULL,
    1,
    9
  ),
  (
    '68000000-0000-4000-8000-000000000010',
    'Toplu Alima Uygun',
    'toplu-alima-uygun',
    'Toptan ve adetli satisa uygun ilanlar',
    (SELECT `id` FROM `categories` WHERE `slug` = 'hububat-bakliyat' LIMIT 1),
    NULL,
    1,
    10
  )
ON DUPLICATE KEY UPDATE
  `name`            = VALUES(`name`),
  `slug`            = VALUES(`slug`),
  `description`     = VALUES(`description`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `is_active`       = VALUES(`is_active`),
  `display_order`   = VALUES(`display_order`),
  `updated_at`      = CURRENT_TIMESTAMP(3);
