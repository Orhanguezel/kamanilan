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
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'genel-satis' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    1
  ),
  (
    '68000000-0000-4000-8000-000000000002',
    'Acil Satilik',
    'acil-satilik',
    'Hizli devir istenen ilanlar',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'genel-satis' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    2
  ),
  (
    '68000000-0000-4000-8000-000000000003',
    'Sahibinden',
    'sahibinden',
    'Araci olmadan dogrudan ilani acanlar',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'emlak-kira' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    3
  ),
  (
    '68000000-0000-4000-8000-000000000004',
    'Ekspertizli',
    'ekspertizli',
    'Ekspertiz raporu bulunan araclar',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-motosiklet' AND ci.locale = 'tr' LIMIT 1),
    (SELECT si.sub_category_id FROM sub_category_i18n si WHERE si.slug = 'otomobil' AND si.locale = 'tr' LIMIT 1),
    1,
    4
  ),
  (
    '68000000-0000-4000-8000-000000000005',
    'Bakimli',
    'bakimli',
    'Periyodik bakimlari tamamlanmis ilanlar',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'arac-motosiklet' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    5
  ),
  (
    '68000000-0000-4000-8000-000000000006',
    'Ureticiden',
    'ureticiden',
    'Dogrudan ureticiden satilan urunler',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'kaman-cevizi' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    6
  ),
  (
    '68000000-0000-4000-8000-000000000007',
    'Veteriner Kontrollu',
    'veteriner-kontrollu',
    'Veteriner denetimi yapilmis hayvan ilanlari',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'hayvan-tarim' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    7
  ),
  (
    '68000000-0000-4000-8000-000000000008',
    'Organik',
    'organik',
    'Dogal / organik urun ilanlari',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'meyve-sebze' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    8
  ),
  (
    '68000000-0000-4000-8000-000000000009',
    'Gunluk Uretim',
    'gunluk-uretim',
    'Gunluk hazirlanan urun ilanlari',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'sut-yogurt' AND ci.locale = 'tr' LIMIT 1),
    NULL,
    1,
    9
  ),
  (
    '68000000-0000-4000-8000-000000000010',
    'Toplu Alima Uygun',
    'toplu-alima-uygun',
    'Toptan ve adetli satisa uygun ilanlar',
    (SELECT ci.category_id FROM category_i18n ci WHERE ci.slug = 'hububat-bakliyat' AND ci.locale = 'tr' LIMIT 1),
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
