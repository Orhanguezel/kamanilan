/* 79_site_settings_seo_seed.sql — Site media + SEO defaults (Kaman Ilan) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

/* =============================================================
   SITE MEDIA (used by Site Settings > Logo & Favicon tab)
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'site_logo',             '{"url":"/uploads/site-media/ChatGPT_Image_1_Mar_2026_13_10_41.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_logo_dark',        '{"url":"/uploads/media/logo/logo-horizontal-dark.svg"}', NOW(3), NOW(3)),
  (UUID(), 'site_logo_light',       '{"url":"/uploads/site-media/ChatGPT_Image_1_Mar_2026_13_10_41.png"}',      NOW(3), NOW(3)),
  (UUID(), 'site_favicon',          '{"url":"/uploads/media/favicon/favicon.svg"}',           NOW(3), NOW(3)),
  (UUID(), 'site_apple_touch_icon', '{"url":"/uploads/media/apple/apple-touch-icon.png"}',   NOW(3), NOW(3)),
  (UUID(), 'site_app_icon_512',     '{"url":"/uploads/media/logo/logo-icon-512.png"}',       NOW(3), NOW(3)),
  (UUID(), 'site_og_default_image', '{"url":"/uploads/media/logo/og-image.png"}',            NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

/* =============================================================
   SEO CORE
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'public_base_url', '"http://localhost:3000"', NOW(3), NOW(3)),
  (UUID(), 'site_title',      '"Kaman Ilan"', NOW(3), NOW(3)),
  (UUID(), 'company_brand',   '{"name":"Kaman Ilan","shortName":"Kaman Ilan"}', NOW(3), NOW(3)),
  (UUID(), 'socials',         '{"instagram":"https://www.instagram.com/kamanilan","facebook":"https://www.facebook.com/kamanilan"}', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'seo_defaults',
   '{"canonicalBase":"https://kamanilan.com","siteName":"Kaman Ilan","description":"Kaman ve cevresinde satilik, kiralik ve takas ilanlari.","ogLocale":"tr_TR","author":"Kaman Ilan","themeColor":"#2D6A4F","twitterCard":"summary_large_image","robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1","googlebot":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}',
   NOW(3), NOW(3)),
  (UUID(), 'seo_app_icons',
   '{"appleTouchIcon":"/uploads/media/apple/apple-touch-icon.png","favicon16":"/uploads/media/favicon/favicon.svg","favicon32":"/uploads/media/favicon/favicon.svg"}',
   NOW(3), NOW(3)),
  (UUID(), 'seo_social_same_as',
   '["https://www.instagram.com/kamanilan","https://www.facebook.com/kamanilan"]',
   NOW(3), NOW(3)),
  (UUID(), 'seo_amp_google_client_id_api', '"googleanalytics"', NOW(3), NOW(3)),
  (UUID(), 'site_meta_default',
   '{"title":"Kaman Ilan","description":"Kaman ve cevresinde ilan platformu","image":"/uploads/media/logo/og-image.png"}',
   NOW(3), NOW(3)),
  (UUID(), 'site_seo',
   '{"title_default":"Kaman Ilan","title_template":"{{title}} | Kaman Ilan","description":"Kaman ve cevresinde ilan platformu","robots":"index, follow"}',
   NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);

/* =============================================================
   Admin branding defaults for SSR metadata (fallback-safe)
   ============================================================= */
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'ui_admin_config',
   '{
     "default_locale":"tr",
     "theme":{"mode":"light","preset":"soft-pop","font":"inter"},
     "layout":{"sidebar_variant":"inset","sidebar_collapsible":"icon","navbar_style":"sticky","content_layout":"full-width"},
     "branding":{
       "app_name":"Kaman Ilan Admin Panel",
       "app_copyright":"Kaman Ilan",
       "html_lang":"tr",
       "theme_color":"#2D6A4F",
       "favicon_16":"/favicon/favicon.svg",
       "favicon_32":"/favicon/favicon.svg",
       "apple_touch_icon":"/apple/apple-touch-icon.png",
       "meta":{
         "title":"Kaman Ilan Admin Panel",
         "description":"Kaman Ilan yonetim paneli",
         "og_url":"https://kamanilan.com/admin",
         "og_title":"Kaman Ilan Admin Panel",
         "og_description":"Kaman Ilan yonetim paneli",
         "og_image":"/logo/og-image.png",
         "twitter_card":"summary_large_image"
       }
     }
   }',
   NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);
