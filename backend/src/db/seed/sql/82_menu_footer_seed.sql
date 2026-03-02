-- =============================================================
-- FILE: 82_menu_footer_seed.sql
-- Kaman Ilan - Menu Items + Footer links seed
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Footer section IDs
SET @FS_CORPORATE := '6d4d6f6a-6f2d-4f8d-9f09-5c16d9b90111';
SET @FS_QUICK     := '7d4d6f6a-6f2d-4f8d-9f09-5c16d9b90222';
SET @FS_SUPPORT   := '8d4d6f6a-6f2d-4f8d-9f09-5c16d9b90333';

INSERT INTO `footer_sections`
(`id`, `is_active`, `display_order`, `created_at`, `updated_at`)
VALUES
(@FS_CORPORATE, 1, 10, NOW(3), NOW(3)),
(@FS_QUICK,     1, 20, NOW(3), NOW(3)),
(@FS_SUPPORT,   1, 30, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `is_active` = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `footer_sections_i18n`
(`id`, `section_id`, `locale`, `title`, `slug`, `description`, `created_at`, `updated_at`)
VALUES
('6d4d6f6a-6f2d-4f8d-9f09-5c16d9b91111', @FS_CORPORATE, 'tr', 'Kurumsal', 'kurumsal', 'Kaman Ilan kurumsal sayfalari', NOW(3), NOW(3)),
('7d4d6f6a-6f2d-4f8d-9f09-5c16d9b92222', @FS_QUICK,     'tr', 'Hizli Erisim', 'hizli-erisim', 'Sik kullanilan hizli linkler', NOW(3), NOW(3)),
('8d4d6f6a-6f2d-4f8d-9f09-5c16d9b93333', @FS_SUPPORT,   'tr', 'Destek', 'destek', 'Destek ve yasal baglantilar', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `slug` = VALUES(`slug`),
  `description` = VALUES(`description`),
  `updated_at` = VALUES(`updated_at`);

-- Header menu IDs
SET @MI_HOME         := '11111111-aaaa-4bcd-8aaa-111111111111';
SET @MI_LISTINGS     := '22222222-bbbb-4bcd-8bbb-222222222222';
SET @MI_CATEGORIES   := '33333333-cccc-4bcd-8ccc-333333333333';
SET @MI_STORES       := '33333333-dddd-4bcd-8ddd-333333333333';
SET @MI_PAGES        := '44444444-ffff-4bcd-8fff-444444444444';
SET @MI_NEWS         := '55555555-eeee-4bcd-8eee-555555555555';

-- Sub-items for @MI_PAGES
SET @MI_SUB_ABOUT      := '66666666-ffff-4bcd-8fff-666666666666';
SET @MI_SUB_CONTACT    := '77777777-abcd-4bcd-8abc-777777777777';
SET @MI_SUB_COUPONS    := 'aaaaaaa1-1111-4bcd-8111-aaaaaaaaaaa1';
SET @MI_SUB_TERMS      := 'eeeeeee5-1234-4bcd-8123-eeeeeeeeeee5';
SET @MI_SUB_PRIVACY    := 'fffffff6-2345-4bcd-8234-fffffffffff6';
SET @MI_SUB_CAMPAIGNS  := 'bbbbbbb2-2222-4bcd-8222-bbbbbbbbbbb2';
SET @MI_SUB_ADVERTISE  := 'cccccc3a-3333-4bcd-8333-cccccccccc3a';

SET @MI_HABERLER     := '66666666-eeee-4bcd-8eee-666666666666';

-- Other menu IDs
SET @MI_POST_LISTING := '44444444-dddd-4bcd-8ddd-444444444444';

-- Footer specific IDs
SET @MI_F_ABOUT      := '88888888-bcde-4bcd-8bcd-888888888888';
SET @MI_F_MISSION    := '99999999-cdef-4bcd-8cde-999999999999';
SET @MI_F_QUALITY    := 'aaaaaaa1-def0-4bcd-8def-aaaaaaaaaaa1';
SET @MI_F_ALL        := 'bbbbbbb2-ef01-4bcd-8ef0-bbbbbbbbbbb2';
SET @MI_F_CATEGORIES := 'ccccccc3-f012-4bcd-8f01-ccccccccccc3';
SET @MI_F_POST       := 'ddddddd4-0123-4bcd-8012-ddddddddddd4';
SET @MI_F_ADVERTISE  := '13131313-4567-4bcd-8456-131313131313';
SET @MI_F_HABERLER   := '14141414-5678-4bcd-8567-141414141414';
SET @MI_F_TERMS      := 'eeeeeee5-1234-4bcd-8123-eeeeeeeeeee5';
SET @MI_F_PRIVACY    := 'fffffff6-2345-4bcd-8234-fffffffffff6';
SET @MI_F_CONTACT    := '12121212-3456-4bcd-8345-121212121212';

INSERT INTO `menu_items`
(`id`, `parent_id`, `type`, `page_id`, `location`, `icon`, `section_id`, `order_num`, `is_active`, `created_at`, `updated_at`)
VALUES
(@MI_HOME,         NULL, 'custom', NULL, 'header', NULL, NULL, 10, 1, NOW(3), NOW(3)),
(@MI_LISTINGS,     NULL, 'custom', NULL, 'header', NULL, NULL, 20, 1, NOW(3), NOW(3)),
(@MI_CATEGORIES,   NULL, 'custom', NULL, 'header', NULL, NULL, 30, 1, NOW(3), NOW(3)),
(@MI_STORES,       NULL, 'custom', NULL, 'header', NULL, NULL, 40, 1, NOW(3), NOW(3)),
(@MI_PAGES,        NULL, 'custom', NULL, 'header', NULL, NULL, 50, 1, NOW(3), NOW(3)),
(@MI_NEWS,         NULL, 'custom', NULL, 'header', NULL, NULL, 60, 1, NOW(3), NOW(3)),
(@MI_HABERLER,     NULL, 'custom', NULL, 'header', NULL, NULL, 70, 1, NOW(3), NOW(3)),

-- Dropdown items for 'Sayfalar'
(@MI_SUB_ABOUT,    @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 10, 1, NOW(3), NOW(3)),
(@MI_SUB_CONTACT,  @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 20, 1, NOW(3), NOW(3)),
(@MI_SUB_COUPONS,  @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 30, 1, NOW(3), NOW(3)),
(@MI_SUB_TERMS,    @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 40, 1, NOW(3), NOW(3)),
(@MI_SUB_PRIVACY,  @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 50, 1, NOW(3), NOW(3)),
(@MI_SUB_CAMPAIGNS, @MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 60, 1, NOW(3), NOW(3)),
(@MI_SUB_ADVERTISE,@MI_PAGES, 'custom', NULL, 'header', NULL, NULL, 70, 1, NOW(3), NOW(3)),

-- Ilan Ver (moved to footer only in menu_items)
(@MI_POST_LISTING, NULL, 'custom', NULL, 'footer', NULL, NULL, 40, 1, NOW(3), NOW(3)),

(@MI_F_ABOUT,      NULL, 'custom', NULL, 'footer', NULL, @FS_CORPORATE, 10, 1, NOW(3), NOW(3)),
(@MI_F_MISSION,    NULL, 'custom', NULL, 'footer', NULL, @FS_CORPORATE, 20, 1, NOW(3), NOW(3)),
(@MI_F_QUALITY,    NULL, 'custom', NULL, 'footer', NULL, @FS_CORPORATE, 30, 1, NOW(3), NOW(3)),

(@MI_F_ALL,        NULL, 'custom', NULL, 'footer', NULL, @FS_QUICK, 10, 1, NOW(3), NOW(3)),
(@MI_F_CATEGORIES, NULL, 'custom', NULL, 'footer', NULL, @FS_QUICK, 20, 1, NOW(3), NOW(3)),
(@MI_F_POST,       NULL, 'custom', NULL, 'footer', NULL, @FS_QUICK, 30, 1, NOW(3), NOW(3)),
(@MI_F_ADVERTISE,  NULL, 'custom', NULL, 'footer', NULL, @FS_QUICK, 40, 1, NOW(3), NOW(3)),
(@MI_F_HABERLER,   NULL, 'custom', NULL, 'footer', NULL, @FS_QUICK, 50, 1, NOW(3), NOW(3)),

(@MI_F_TERMS,      NULL, 'custom', NULL, 'footer', NULL, @FS_SUPPORT, 10, 1, NOW(3), NOW(3)),
(@MI_F_PRIVACY,    NULL, 'custom', NULL, 'footer', NULL, @FS_SUPPORT, 20, 1, NOW(3), NOW(3)),
(@MI_F_CONTACT,    NULL, 'custom', NULL, 'footer', NULL, @FS_SUPPORT, 30, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `parent_id` = VALUES(`parent_id`),
  `type` = VALUES(`type`),
  `page_id` = VALUES(`page_id`),
  `location` = VALUES(`location`),
  `icon` = VALUES(`icon`),
  `section_id` = VALUES(`section_id`),
  `order_num` = VALUES(`order_num`),
  `is_active` = VALUES(`is_active`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `menu_items_i18n`
(`id`, `menu_item_id`, `locale`, `title`, `url`, `created_at`, `updated_at`)
VALUES
('11111111-aaaa-4bcd-8aaa-aaaa11111111', @MI_HOME,         'tr', 'Ana Sayfa', '/', NOW(3), NOW(3)),
('22222222-bbbb-4bcd-8bbb-bbbb22222222', @MI_LISTINGS,     'tr', 'İlanlar', '/ilanlar', NOW(3), NOW(3)),
('33333333-cccc-4bcd-8ccc-cccc33333333', @MI_CATEGORIES,   'tr', 'Kategoriler', '/kategoriler', NOW(3), NOW(3)),
('33333333-dddd-4bcd-8ddd-dddd33333333', @MI_STORES,       'tr', 'Mağazalar', '/magazalar', NOW(3), NOW(3)),
('44444444-ffff-4bcd-8fff-ffff44444444', @MI_PAGES,        'tr', 'Sayfalar', '#', NOW(3), NOW(3)),
('55555555-eeee-4bcd-8eee-eeee55555555', @MI_NEWS,         'tr', 'Duyurular', '/duyurular', NOW(3), NOW(3)),
('66666666-eeee-4bcd-8eee-eeee66666666', @MI_HABERLER,     'tr', 'Haberler',  '/haberler',  NOW(3), NOW(3)),

('66666666-ffff-4bcd-8fff-ffff66666666', @MI_SUB_ABOUT,    'tr', 'Hakkımızda', '/hakkimizda', NOW(3), NOW(3)),
('77777777-abcd-4bcd-8abc-abcd77777777', @MI_SUB_CONTACT,  'tr', 'İletişim', '/iletisim', NOW(3), NOW(3)),
('aaaaaaa1-1111-4bcd-8111-1111aaaaaaa1', @MI_SUB_COUPONS,  'tr', 'Kuponlar', '/kuponlar', NOW(3), NOW(3)),
('eeeeeee5-1234-4bcd-8123-1234eeeeeee5', @MI_SUB_TERMS,    'tr', 'Kullanım Koşulları', '/kullanim-kosullari', NOW(3), NOW(3)),
('fffffff6-2345-4bcd-8234-2345fffffff6', @MI_SUB_PRIVACY,  'tr', 'Gizlilik Politikası', '/gizlilik-politikasi', NOW(3), NOW(3)),
('bbbbbbb2-2222-4bcd-8222-2222bbbbbbb2', @MI_SUB_CAMPAIGNS,  'tr', 'Kampanyalar',  '/kampanyalar', NOW(3), NOW(3)),
('cccccc3a-3333-4bcd-8333-3333cccccc3a', @MI_SUB_ADVERTISE, 'tr', 'Reklam Ver',    '/reklam-ver',  NOW(3), NOW(3)),

('44444444-dddd-4bcd-8ddd-dddd44444444', @MI_POST_LISTING, 'tr', 'Ilan Ver', '/ilan-ver', NOW(3), NOW(3)),

('88888888-bcde-4bcd-8bcd-bcde88888888', @MI_F_ABOUT,      'tr', 'Hakkimizda', '/hakkimizda', NOW(3), NOW(3)),
('99999999-cdef-4bcd-8cde-cdef99999999', @MI_F_MISSION,    'tr', 'Misyon ve Vizyon', '/misyon-vizyon', NOW(3), NOW(3)),
('aaaaaaa1-def0-4bcd-8def-def0aaaaaaa1', @MI_F_QUALITY,    'tr', 'Kalite Politikamiz', '/kalite-politikamiz', NOW(3), NOW(3)),

('bbbbbbb2-ef01-4bcd-8ef0-ef01bbbbbbb2', @MI_F_ALL,        'tr', 'Tum Ilanlar', '/ilanlar', NOW(3), NOW(3)),
('ccccccc3-f012-4bcd-8f01-f012ccccccc3', @MI_F_CATEGORIES, 'tr', 'Kategoriler', '/kategoriler', NOW(3), NOW(3)),
('ddddddd4-0123-4bcd-8012-0123ddddddd4', @MI_F_POST,       'tr', 'Ilan Ver',    '/ilan-ver',    NOW(3), NOW(3)),
('13131313-4567-4bcd-8456-456713131313', @MI_F_ADVERTISE,  'tr', 'Reklam Ver',  '/reklam-ver',  NOW(3), NOW(3)),
('14141414-5678-4bcd-8567-567814141414', @MI_F_HABERLER,   'tr', 'Haberler',    '/haberler',    NOW(3), NOW(3)),

('eeeeeee5-1234-4bcd-8123-1234eeeee777', @MI_F_TERMS,    'tr', 'Kullanim Kosullari', '/kullanim-kosullari', NOW(3), NOW(3)),
('fffffff6-2345-4bcd-8234-2345fffff888', @MI_F_PRIVACY,    'tr', 'Gizlilik Politikasi', '/gizlilik-politikasi', NOW(3), NOW(3)),
('12121212-3456-4bcd-8345-345612121212', @MI_F_CONTACT,    'tr', 'Iletisim', '/iletisim', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `url` = VALUES(`url`),
  `updated_at` = VALUES(`updated_at`);
