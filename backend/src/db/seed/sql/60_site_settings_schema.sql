/* 60_site_settings_schema.sql — Kaman İlan (i18n uyumlu: locale kolonu) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `site_settings`;

CREATE TABLE `site_settings` (
  `id` CHAR(36) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `locale` VARCHAR(8) NOT NULL DEFAULT '*',
  `value` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_locale_uq` (`key`, `locale`),
  KEY `site_settings_key_idx` (`key`),
  KEY `site_settings_locale_idx` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `site_settings`;

-- =============================================================
-- BRAND / UI (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'brand_name',         '*', '"Kaman İlan"',                    NOW(3), NOW(3)),
(UUID(), 'brand_display_name', '*', '"KamanİLAN"',                     NOW(3), NOW(3)),
(UUID(), 'brand_logo_text',    '*', '"Kaman İlan"',                    NOW(3), NOW(3)),
(UUID(), 'brand_subtitle',     '*', '"Kırşehir · Kaman"',              NOW(3), NOW(3)),
(UUID(), 'brand_tagline',      '*', '"Kaman\'da her şey burada"',      NOW(3), NOW(3)),
(UUID(), 'topbar_location',    '*', '"Kırşehir – Kaman İlçesi"',       NOW(3), NOW(3)),
(UUID(), 'topbar_slogan',      '*', '"Türkiye\'nin Ceviz Başkenti"',   NOW(3), NOW(3)),
(UUID(), 'ui_theme',           '*', '{"primaryHex":"#1B4332","darkMode":"light","radius":"0.375rem"}', NOW(3), NOW(3)),
(UUID(), 'site_version',       '*', '"1.0.0"',                         NOW(3), NOW(3)),
(UUID(), 'admin_path',         '*', '"/admin"',                        NOW(3), NOW(3));

-- =============================================================
-- BRAND MEDIA (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'brand_logo',              '*', '"/uploads/media/logo/logo_light.png"',        NOW(3), NOW(3)),
(UUID(), 'brand_logo_dark',         '*', '"/uploads/media/logo/logo_dark.png"',         NOW(3), NOW(3)),
(UUID(), 'brand_logo_icon',         '*', '"/uploads/media/logo/logo-icon.svg"',         NOW(3), NOW(3)),
(UUID(), 'brand_logo_icon_transparent', '*', '"/uploads/media/logo/logo-icon-transparent.png"', NOW(3), NOW(3)),
(UUID(), 'brand_logo_icon_192',     '*', '"/uploads/media/logo/logo-icon-192.png"',     NOW(3), NOW(3)),
(UUID(), 'brand_logo_icon_512',     '*', '"/uploads/media/logo/logo-icon-512.png"',     NOW(3), NOW(3)),
(UUID(), 'brand_og_image',          '*', '"/uploads/media/logo/og-image.png"',          NOW(3), NOW(3));

-- =============================================================
-- SITE MEDIA (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'site_logo',             '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
(UUID(), 'site_logo_dark',        '*', '{"url":"/uploads/media/logo/logo_dark.png"}',       NOW(3), NOW(3)),
(UUID(), 'site_logo_light',       '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
(UUID(), 'site_favicon',          '*', '{"url":"/uploads/media/logo/logo_light.png"}',      NOW(3), NOW(3)),
(UUID(), 'site_apple_touch_icon', '*', '{"url":"/uploads/media/apple/apple-touch-icon.png"}', NOW(3), NOW(3)),
(UUID(), 'site_app_icon_512',     '*', '{"url":"/uploads/media/logo/logo-icon-512.png"}',   NOW(3), NOW(3)),
(UUID(), 'site_og_default_image', '*', '{"url":"/uploads/media/logo/og-image.png"}',        NOW(3), NOW(3));

-- =============================================================
-- CONTACT (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'contact_phone_display',  '*', '"0312 000 00 00"', NOW(3), NOW(3)),
(UUID(), 'contact_phone_tel',      '*', '"03120000000"', NOW(3), NOW(3)),
(UUID(), 'contact_email',          '*', '"info@kamanilan.com"', NOW(3), NOW(3)),
(UUID(), 'contact_to_email',       '*', '"info@kamanilan.com"', NOW(3), NOW(3)),
(UUID(), 'contact_address',        '*', '"Kaman, Kırşehir, Türkiye"', NOW(3), NOW(3)),
(UUID(), 'contact_whatsapp_display', '*', '"+49 172 384 60 68"', NOW(3), NOW(3)),
(UUID(), 'contact_whatsapp_link',  '*', '"https://wa.me/491723846068"', NOW(3), NOW(3));

-- =============================================================
-- STORAGE / UPLOAD CONFIG (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'storage_driver',             '*', '"local"', NOW(3), NOW(3)),
(UUID(), 'storage_local_root',         '*', '"/www/wwwroot/kamanilan/uploads"', NOW(3), NOW(3)),
(UUID(), 'storage_local_base_url',     '*', '"/uploads"', NOW(3), NOW(3)),
(UUID(), 'storage_cdn_public_base',    '*', '"https://cdn.kamanilan.com"', NOW(3), NOW(3)),
(UUID(), 'storage_public_api_base',    '*', '"https://kamanilan.com/api"', NOW(3), NOW(3)),
(UUID(), 'cloudinary_cloud_name',      '*', '""', NOW(3), NOW(3)),
(UUID(), 'cloudinary_api_key',         '*', '""', NOW(3), NOW(3)),
(UUID(), 'cloudinary_api_secret',      '*', '"__SET_IN_ENV__"', NOW(3), NOW(3)),
(UUID(), 'cloudinary_folder',          '*', '"uploads"', NOW(3), NOW(3)),
(UUID(), 'cloudinary_unsigned_preset', '*', '""', NOW(3), NOW(3));

-- =============================================================
-- SMTP / MAIL CONFIG (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'smtp_host',        '*', '"smtp.example.com"', NOW(3), NOW(3)),
(UUID(), 'smtp_port',        '*', '587', NOW(3), NOW(3)),
(UUID(), 'smtp_username',    '*', '"info@kamanilan.com"', NOW(3), NOW(3)),
(UUID(), 'smtp_password',    '*', '"__SET_IN_ENV__"', NOW(3), NOW(3)),
(UUID(), 'smtp_from_email',  '*', '"info@kamanilan.com"', NOW(3), NOW(3)),
(UUID(), 'smtp_from_name',   '*', '"Kaman İlan"', NOW(3), NOW(3)),
(UUID(), 'smtp_ssl',         '*', 'false', NOW(3), NOW(3));

-- =============================================================
-- HEADER (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'header_info_text',  '*', '"Kaman\'da ilan vermek ücretsiz"', NOW(3), NOW(3)),
(UUID(), 'header_cta_label',  '*', '"İLAN VER"', NOW(3), NOW(3));

-- =============================================================
-- HEADER MENU (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(
  UUID(),
  'header_menu',
  '*',
  '[
    {"title":"ANASAYFA","path":"/","pageKey":"home","type":"link"},
    {"title":"İLANLAR","path":"/ilanlar","pageKey":"listings","type":"link"},
    {"title":"KATEGORİLER","path":"/kategoriler","pageKey":"kategoriler","type":"link"},
    {"title":"KURUMSAL","path":"#","pageKey":"kurumsal","type":"dropdown","itemsKey":"menu_kurumsal"},
    {"title":"İLETİŞİM","path":"/iletisim","pageKey":"contact","type":"link"}
  ]',
  NOW(3),
  NOW(3)
);

-- =============================================================
-- FOOTER (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'footer_keywords',    '*', '["Ücretsiz İlan","Satılık","Kiralık","Takas","Hayvan İlanları","Araç İlanları","Kaman İlanları","Kırşehir"]', NOW(3), NOW(3)),
(UUID(), 'footer_services',    '*', '["Ücretsiz İlan Ver","İlan Ara","Kategorilere Göz At"]', NOW(3), NOW(3)),
(UUID(), 'footer_quick_links', '*', '[{"title":"Anasayfa","path":"/","pageKey":"home"},{"title":"İlanlar","path":"/ilanlar","pageKey":"listings"},{"title":"Kategoriler","path":"/kategoriler","pageKey":"kategoriler"},{"title":"Hakkımızda","path":"/hakkimizda","pageKey":"about"},{"title":"İletişim","path":"/iletisim","pageKey":"contact"}]', NOW(3), NOW(3));

-- =============================================================
-- MENU (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(
  UUID(),
  'menu_kurumsal',
  '*',
  '[{"title":"HAKKIMIZDA","path":"/hakkimizda","pageKey":"about"},{"title":"S.S.S.","path":"/sss","pageKey":"faq"},{"title":"İLETİŞİM","path":"/iletisim","pageKey":"contact"}]',
  NOW(3),
  NOW(3)
);

-- =============================================================
-- i18n CONFIG (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'app_locales',    '*', '[{"code":"tr","label":"Türkçe","is_active":true,"is_default":true}]', NOW(3), NOW(3)),
(UUID(), 'default_locale', '*', '"tr"', NOW(3), NOW(3));

-- =============================================================
-- SEO GLOBAL / DEFAULTS (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'seo_defaults', '*',
 '{"canonicalBase":"https://kamanilan.com","siteName":"Kaman İlan | Kaman\'da Her Şey Burada","description":"Kaman\'da satılık, kiralık, takas ilanları. Emlak, hayvan, araç, yiyecek ve daha fazlası. Ücretsiz ilan ver, kolayca ara.","ogLocale":"tr_TR","author":"Kaman İlan","themeColor":"#2D6A4F","twitterCard":"summary_large_image","robots":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1","googlebot":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}',
 NOW(3), NOW(3)),
(UUID(), 'public_base_url', '*', '"http://localhost:3000"', NOW(3), NOW(3)),
(UUID(), 'site_title', '*', '"Kaman İlan"', NOW(3), NOW(3)),
(UUID(), 'company_brand', '*', '{"name":"Kaman İlan","shortName":"Kaman İlan"}', NOW(3), NOW(3)),
(UUID(), 'socials', '*', '{"instagram":"https://www.instagram.com/kamanilan","facebook":"https://www.facebook.com/profile.php?id=61586451088043","twitter":"https://www.twitter.com/kamanilan"}', NOW(3), NOW(3)),
(UUID(), 'social_facebook_url',  '*', '"https://www.facebook.com/profile.php?id=61586451088043"',  NOW(3), NOW(3)),
(UUID(), 'social_instagram_url', '*', '"https://www.instagram.com/kamanilan"', NOW(3), NOW(3)),
(UUID(), 'social_twitter_url',   '*', '"https://www.twitter.com/kamanilan"',   NOW(3), NOW(3)),
(UUID(), 'seo_social_same_as', '*', '["https://www.instagram.com/kamanilan","https://www.facebook.com/profile.php?id=61586451088043"]', NOW(3), NOW(3)),
(UUID(), 'seo_app_icons', '*',
 '{"appleTouchIcon":"/uploads/media/logo/logo_light.png","favicon":"/uploads/media/logo/logo_light.png","logoIcon192":"/uploads/media/logo/logo_light.png","logoIcon512":"/uploads/media/logo/logo_light.png"}',
 NOW(3), NOW(3)),
(UUID(), 'seo_amp_google_client_id_api', '*', '"googleanalytics"', NOW(3), NOW(3));

-- =============================================================
-- SEO SAYFA BAZLI (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'seo_pages_home', '*',
 '{"title":"Kaman İlan | Kaman\'da Her Şey Burada","description":"Kaman\'da satılık, kiralık, takas ilanları. Emlak, hayvan, araç, yiyecek ve daha fazlası. Ücretsiz ilan ver, kolayca ara.","keywords":"kaman ilan, kaman satılık, kaman kiralık, kaman emlak, kaman hayvan, kaman araç, kırşehir ilan","ogImage":"/uploads/media/logo/og-image.png"}',
 NOW(3), NOW(3)),
(UUID(), 'seo_pages_listings', '*',
 '{"title":"İlanlar | Kaman İlan","description":"Kaman\'daki tüm ilanları inceleyin. Emlak, hayvan, araç, yiyecek kategorilerinde filtreli arama.","keywords":"kaman ilanlar, satılık, kiralık, takas, kaman, kırşehir","ogImage":"/uploads/media/logo/og-image.png"}',
 NOW(3), NOW(3)),
(UUID(), 'seo_pages_contact', '*',
 '{"title":"İletişim | Kaman İlan","description":"Kaman İlan ile iletişime geçin. Sorularınız için bize ulaşın.","keywords":"kaman ilan iletişim, kaman","ogImage":"/uploads/media/logo/og-image.png"}',
 NOW(3), NOW(3)),
(UUID(), 'seo_pages_about', '*',
 '{"title":"Hakkımızda | Kaman İlan","description":"Kaman İlan hakkında bilgi edinin. Kaman ve Kırşehir\'in ücretsiz ilan platformu.","keywords":"kaman ilan hakkında, kaman ilan sitesi","ogImage":"/uploads/media/logo/og-image.png"}',
 NOW(3), NOW(3)),
(UUID(), 'seo_pages_listing_detail', '*',
 '{"titleTemplate":"{{title}} | Kaman İlan","descriptionTemplate":"{{title}} ilanı. Kaman İlan\'da satılık, kiralık ve takas ilanlarını inceleyin.","keywordsTemplate":"kaman ilan, {{title}}, satılık, kiralık, takas","ogImage":"/uploads/media/logo/og-image.png"}',
 NOW(3), NOW(3));

-- =============================================================
-- JSON-LD (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
 (UUID(), 'seo_local_business', '*',
  '{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kaman İlan","description":"Kaman ve çevresinde ücretsiz ilan verme ve arama platformu","url":"https://kamanilan.com","telephone":"+90-312-000-0000","address":{"@type":"PostalAddress","addressLocality":"Kaman","addressRegion":"Kırşehir","addressCountry":"TR"},"geo":{"@type":"GeoCoordinates","latitude":39.3553,"longitude":33.7239},"sameAs":["https://www.instagram.com/kamanilan","https://www.facebook.com/profile.php?id=61586451088043"]}',
  NOW(3), NOW(3));

-- =============================================================
-- HOMEPAGE SECTIONS (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'homepage_sections', '*',
 '[{"key":"hero","enabled":true,"order":1,"label":"Hero Bölümü"},{"key":"categories","enabled":true,"order":2,"label":"Tüm Kategoriler"},{"key":"featured","enabled":true,"order":3,"label":"Öne Çıkan İlanlar"},{"key":"recent","enabled":true,"order":4,"label":"Son İlanlar"}]',
 NOW(3), NOW(3));

-- =============================================================
-- CTA (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'cta_post_listing_title',    '*', '"Ücretsiz İlan Ver"', NOW(3), NOW(3)),
(UUID(), 'cta_post_listing_subtitle', '*', '"Kaman\'da ilanınızı saniyeler içinde yayınlayın"', NOW(3), NOW(3)),
(UUID(), 'cta_post_listing_path',     '*', '"/ilan-ver"', NOW(3), NOW(3));

-- =============================================================
-- ADMIN UI BRANDING (locale='*' — global)
-- =============================================================
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(
  UUID(),
  'ui_admin_config',
  '*',
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
      "favicon_svg":"/uploads/media/logo/logo_light.png",
      "apple_touch_icon":"/uploads/media/logo/logo_light.png",
      "logo":"/uploads/media/logo/logo_light.png",
      "logo_dark":"/uploads/media/logo/logo_dark.png",
      "logo_icon":"/uploads/media/logo/logo_light.png",
      "meta":{
        "title":"Kaman İlan Admin Panel",
        "description":"Kaman İlan yönetim paneli",
        "og_url":"https://kamanilan.com/admin",
        "og_title":"Kaman İlan Admin Panel",
        "og_description":"Kaman İlan yönetim paneli ile ilan yönetimi",
        "og_image":"/uploads/media/logo/og-image.png",
        "twitter_card":"summary_large_image"
      }
    }
  }',
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_admin',
  '*',
  '{
    "app_name":"Kaman İlan Admin Panel",
    "app_version":"v1.0.0",
    "developer_branding":{"name":"Kaman İlan","url":"https://kamanilan.com","full_name":"Kaman İlan"},
    "nav":{
      "labels":{
        "general":"Genel / Yönetim",
        "content":"İçerik Yönetimi",
        "marketing":"Pazarlama",
        "communication":"İletişim & CRM",
        "system":"Sistem & Ayarlar"
      },
      "items":{
        "dashboard":"Özet",
        "site_settings":"Site Ayarları",
        "theme_management":"Tema Kontrolü",
        "custom_pages":"Özel Sayfalar",
        "categories":"Kategoriler",
        "subcategories":"Alt Kategoriler",
        "products":"İlanlar",
        "sellers":"Satıcılar",
        "flash_sale":"Flash Sale",
        "sliders":"Slider",
        "faqs":"S.S.S.",
        "contacts":"İletişim Mesajları",
        "reviews":"Yorumlar",
        "campaign_settings":"Kampanya Ayarları",
        "mail":"E-Posta",
        "users":"Kullanıcılar",
        "storage":"Dosya Yöneticisi",
        "db":"Veritabanı"
      }
    },
    "common":{
      "actions":{
        "create":"Oluştur",
        "edit":"Düzenle",
        "delete":"Sil",
        "save":"Kaydet",
        "cancel":"İptal",
        "refresh":"Yenile",
        "search":"Ara",
        "filter":"Filtrele",
        "close":"Kapat",
        "back":"Geri",
        "confirm":"Onayla"
      },
      "states":{
        "loading":"Yükleniyor...",
        "error":"İşlem başarısız.",
        "empty":"Veri bulunamadı.",
        "updating":"Güncelleniyor...",
        "saving":"Kaydediliyor..."
      }
    }
  }',
  NOW(3),
  NOW(3)
);
