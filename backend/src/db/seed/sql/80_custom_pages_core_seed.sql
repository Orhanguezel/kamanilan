-- =============================================================
-- FILE: 80_custom_pages_core_seed.sql
-- Kaman Ilan - Core static pages (TR, dynamic module_key)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO `custom_pages`
(
  `id`,
  `title`,
  `slug`,
  `locale`,
  `module_key`,
  `content`,
  `image_url`,
  `storage_asset_id`,
  `alt`,
  `meta_title`,
  `meta_description`,
  `is_published`,
  `created_at`,
  `updated_at`
)
VALUES
(
  UUID(),
  'Hakkımızda',
  'hakkimizda',
  'tr',
  'about',
  JSON_OBJECT('html',
    '<section><h1>Hakkımızda</h1><p>Kaman İlan, güvenli ve şeffaf ilan yönetimi için kurulmuş yerel bir platformdur.</p><p>Amacımız alıcı ve satıcıyı doğru bilgiyle hızlı şekilde buluşturmaktır.</p></section>'
  ),
  NULL,
  NULL,
  'Hakkımızda',
  'Hakkımızda - Kaman İlan',
  'Kaman İlan hakkında kurumsal bilgiler.',
  1,
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'Gizlilik Politikası',
  'gizlilik-politikasi',
  'tr',
  'kvkk',
  JSON_OBJECT('html',
    '<section><h1>Gizlilik Politikası</h1><p>Kaman İlan, kişisel verilerin korunmasını öncelik kabul eder.</p><p>Toplanan veriler yalnızca hizmet sunumu, güvenlik ve yasal yükümlülükler kapsamında işlenir.</p></section>'
  ),
  NULL,
  NULL,
  'Gizlilik Politikası',
  'Gizlilik Politikası - Kaman İlan',
  'Kaman İlan gizlilik politikası ve veri işleme esasları.',
  1,
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'Kullanım Koşulları',
  'kullanim-kosullari',
  'tr',
  'contract',
  JSON_OBJECT('html',
    '<section><h1>Kullanım Koşulları</h1><p>Platformu kullanan tüm kullanıcılar ilan yayın kurallarını ve yürürlükteki mevzuatı kabul eder.</p><p>Yanıltıcı içerik, yasaklı ürün/hizmet ilanı ve hak ihlali içeren paylaşımlar kaldırılır.</p></section>'
  ),
  NULL,
  NULL,
  'Kullanım Koşulları',
  'Kullanım Koşulları - Kaman İlan',
  'Kaman İlan kullanım koşulları ve ilan yayın kuralları.',
  1,
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'Kalite Politikamız',
  'kalite-politikamiz',
  'tr',
  'quality',
  JSON_OBJECT('html',
    '<section><h1>Kalite Politikamız</h1><p>Tüm ilan süreçlerinde doğruluk, şeffaflık ve izlenebilirlik temel prensibimizdir.</p><p>Hizmet kalitesi düzenli olarak ölçülür, kullanıcı geri bildirimleriyle sürekli iyileştirme yapılır.</p></section>'
  ),
  NULL,
  NULL,
  'Kalite Politikası',
  'Kalite Politikamız - Kaman İlan',
  'Kaman İlan kalite yönetimi yaklaşımı.',
  1,
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'Misyonumuz ve Vizyonumuz',
  'misyon-vizyon',
  'tr',
  'about',
  JSON_OBJECT('html',
    '<section><h1>Misyonumuz ve Vizyonumuz</h1><p>Misyonumuz, ilan süreçlerini güvenli ve verimli hale getirmektir.</p><p>Vizyonumuz, Kaman ve çevresinde en güvenilir yerel ilan platformu olmaktır.</p></section>'
  ),
  NULL,
  NULL,
  'Misyon ve Vizyon',
  'Misyonumuz ve Vizyonumuz - Kaman İlan',
  'Kaman İlan misyon ve vizyon metni.',
  1,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `module_key` = VALUES(`module_key`),
  `content` = VALUES(`content`),
  `image_url` = VALUES(`image_url`),
  `storage_asset_id` = VALUES(`storage_asset_id`),
  `alt` = VALUES(`alt`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`),
  `is_published` = VALUES(`is_published`),
  `updated_at` = VALUES(`updated_at`);
