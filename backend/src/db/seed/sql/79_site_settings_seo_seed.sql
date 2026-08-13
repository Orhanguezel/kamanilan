/* 79_site_settings_seo_seed.sql — Site media + SEO defaults (Kaman İlan, i18n uyumlu) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

/* =============================================================
   SITE MEDIA (used by Site Settings > Logo & Favicon tab)
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'site_logo',             '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_logo_dark',        '*', '{"url":"/uploads/media/logo/logo_dark.png"}',       NOW(3), NOW(3)),
  (UUID(), 'site_logo_light',       '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_favicon',          '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_apple_touch_icon', '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_app_icon_512',     '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_og_default_image', '*', '{"url":"/uploads/media/logo/og-image.png"}',        NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

/* =============================================================
   SEO CORE
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'public_base_url', '*', '"http://localhost:3000"', NOW(3), NOW(3)),
  (UUID(), 'site_title',      '*', '"Kaman İlan"', NOW(3), NOW(3)),
  (UUID(), 'company_brand',   '*', '{"name":"Kaman İlan","shortName":"Kaman İlan"}', NOW(3), NOW(3)),
  (UUID(), 'socials',         '*', '{"instagram":"https://www.instagram.com/kamanilan","facebook":"https://www.facebook.com/profile.php?id=61586451088043"}', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'seo_defaults', '*',
   '{"canonicalBase":"https://kamanilan.com","siteName":"Kaman İlan","description":"Kaman ve çevresinde satılık, kiralık ve takas ilanlari.","ogLocale":"tr_TR","author":"Kaman İlan","themeColor":"#2D6A4F","twitterCard":"summary_large_image","robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1","googlebot":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}',
   NOW(3), NOW(3)),
  (UUID(), 'seo_app_icons', '*',
   '{"appleTouchIcon":"/uploads/media/logo/logo_light.png","favicon":"/uploads/media/logo/logo_light.png","logoIcon192":"/uploads/media/logo/logo_light.png","logoIcon512":"/uploads/media/logo/logo_light.png"}',
   NOW(3), NOW(3)),
  (UUID(), 'seo_social_same_as', '*',
   '["https://www.instagram.com/kamanilan","https://www.facebook.com/profile.php?id=61586451088043"]',
   NOW(3), NOW(3)),
  (UUID(), 'seo_amp_google_client_id_api', '*', '"googleanalytics"', NOW(3), NOW(3)),
  (UUID(), 'site_meta_default', '*',
   '{"title":"Kaman İlan","description":"Kaman ve çevresinde ilan platformu","image":"/uploads/media/logo/og-image.png"}',
   NOW(3), NOW(3)),
  (UUID(), 'site_seo', '*',
   '{"title_default":"Kaman İlan","title_template":"{{title}} | Kaman İlan","description":"Kaman ve çevresinde ilan platformu","robots":"index, follow"}',
   NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

/* =============================================================
   Admin branding defaults for SSR metadata (fallback-safe)
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'ui_admin_config', '*',
   '{
     "default_locale":"tr",
     "theme":{"mode":"light","preset":"soft-pop","font":"inter"},
     "layout":{"sidebar_variant":"inset","sidebar_collapsible":"icon","navbar_style":"sticky","content_layout":"full-width"},
     "branding":{
       "app_name":"Kaman İlan Admin Panel",
       "app_copyright":"Kaman İlan",
       "html_lang":"tr",
       "theme_color":"#2D6A4F",
       "favicon":"/uploads/media/logo/logo_light.png",
       "apple_touch_icon":"/uploads/media/logo/logo_light.png",
       "logo":"/uploads/media/logo/logo_light.png",
       "logo_dark":"/uploads/media/logo/logo_dark.png",
       "meta":{
         "title":"Kaman İlan Admin Panel",
         "description":"Kaman İlan yönetim paneli",
         "og_url":"https://kamanilan.com/admin",
         "og_title":"Kaman İlan Admin Panel",
         "og_description":"Kaman İlan yönetim paneli",
         "og_image":"/uploads/media/logo/og-image.png",
         "twitter_card":"summary_large_image"
       }
     }
   }',
   NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

/* =============================================================
   EDITORIAL STATS (used by Advertise Page)
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'stats_monthly_visit', '*', '"45.000+"',   NOW(3), NOW(3)),
  (UUID(), 'stats_satisfaction',  '*', '"%98"',  NOW(3), NOW(3)),
  (UUID(), 'stats_support_hours', '*', '"7/24"', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);
