/* 62_editorial_luxury_theme.sql — Kaman İlan (Editorial Local-Luxury) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Mevcut temaları pasife çek (opsiyonel, is_active=1 kalsın ama biz yenisini default yapalım)
UPDATE `theme_config` SET `is_active` = 0;

INSERT INTO `theme_config` (`id`, `is_active`, `config`, `created_at`, `updated_at`) VALUES (
  '00000000-0000-4000-8000-000000000002',
  1,
  '{
    "name": "Editorial Luxury",
    "colors": {
      "primary":     "#1a120b",
      "secondary":   "#4a3020",
      "accent":      "#c9931a",
      "background":  "#faf5ea",
      "foreground":  "#1a120b",
      "muted":       "#ede2c9",
      "mutedFg":     "#8b7358",
      "border":      "rgba(26, 18, 11, 0.09)",
      "destructive": "#9a3520",
      "success":     "#4a6d2a",
      "navBg":       "#1a120b",
      "navFg":       "#fdfaf3",
      "footerBg":    "#1a120b",
      "footerFg":    "#fdfaf3",
      "surface":     "#fdfaf3",
      "surface2":    "#f5ecd7"
    },
    "tokens": {
      "serif":          "\"Fraunces\", serif",
      "sans":           "\"Manrope\", sans-serif",
      "mono":           "\"JetBrains Mono\", monospace",
      "softVariation":  "40",
      "radius":         "12px",
      "radiusLg":       "20px",
      "radiusSm":       "6px",
      "shadow1":        "0 1px 2px rgba(74, 48, 32, 0.06)",
      "shadow2":        "0 4px 20px -4px rgba(74, 48, 32, 0.12)",
      "shadow3":        "0 20px 50px -20px rgba(74, 48, 32, 0.25)",
      "grainOpacity":   "0.035"
    },
    "fontFamily": "Manrope, sans-serif",
    "darkMode":   "light",
    "sections": [
      { "key": "hero",              "enabled": true,  "order": 1, "variant": "editorial-collage" },
      { "key": "recent",            "enabled": true,  "order": 2, "limit": 12 },
      { "key": "featured",          "enabled": true,  "order": 3, "limit": 6 },
      { "key": "infinite_listings", "enabled": true,  "order": 4, "limit": 20 },
      { "key": "spotlight",         "enabled": true,  "order": 5, "label": "Kaman Cevizi Spotlight" },
      { "key": "announcements",     "enabled": true,  "order": 10, "limit": 5 },
      { "key": "news_feed",         "enabled": true,  "order": 11, "limit": 4 },
      { "key": "categories",        "enabled": true,  "order": 12, "variant": "grid-featured" },
      { "key": "flash_sale",        "enabled": false, "order": 20 },
      { "key": "banner_row_1",      "enabled": false, "order": 21 },
      { "key": "banner_row_2",      "enabled": false, "order": 22 },
      { "key": "banner_row_3",      "enabled": false, "order": 23 }
    ],
    "newsListSections": [
      { "key": "banner_full_1",    "enabled": true, "order": 0,  "label": "Tam Genişlik Reklam 1",  "bannerIds": "52" },
      { "key": "carousel",         "enabled": true, "order": 1,  "label": "Carousel",               "count": 6 },
      { "key": "grid",             "enabled": true, "order": 2,  "label": "Haber Listesi",          "cols":  3 },
      { "key": "banner_sidebar_1", "enabled": true, "order": 3,  "label": "Sidebar Üst Reklam",     "bannerIds": "50" },
      { "key": "sidebar",          "enabled": true, "order": 4,  "label": "Kenar Çubuğu",           "count": 8 },
      { "key": "banner_sidebar_2", "enabled": true, "order": 5,  "label": "Sidebar Alt Reklam",     "bannerIds": "51" },
      { "key": "banner_full_2",    "enabled": true, "order": 10, "label": "Tam Genişlik Reklam 2",  "bannerIds": "53" }
    ],
    "newsDetailSections": [
      { "key": "banner_full_1",    "enabled": true, "order": 0,  "label": "Makale Üstü Tam Reklam", "bannerIds": "57" },
      { "key": "cover",            "enabled": true, "order": 1,  "label": "Kapak Görseli" },
      { "key": "meta",             "enabled": true, "order": 2,  "label": "Yazar & Tarih" },
      { "key": "body",             "enabled": true, "order": 3,  "label": "Makale İçeriği" },
      { "key": "video",            "enabled": true, "order": 4,  "label": "Video Embed" },
      { "key": "tags",             "enabled": true, "order": 5,  "label": "Etiketler" },
      { "key": "comments",         "enabled": true, "order": 6,  "label": "Yorumlar" },
      { "key": "banners_top",      "enabled": true, "order": 7,  "label": "Sidebar Üst Reklam",     "bannerIds": "55" },
      { "key": "related",          "enabled": true, "order": 8,  "label": "İlgili Haberler",        "count": 7 },
      { "key": "banners_bottom",   "enabled": true, "order": 9,  "label": "Sidebar Alt Reklam",     "bannerIds": "56" },
      { "key": "banner_full_2",    "enabled": true, "order": 10, "label": "Makale Altı Tam Reklam", "bannerIds": "58" }
    ]
  }',
  NOW(3),
  NOW(3)
);

-- Site ayarlarını da bu temaya göre güncelle
UPDATE `site_settings` SET `value` = '"#c9931a"' WHERE `key` = 'ui_theme_color';
UPDATE `site_settings` SET `value` = '{"primaryHex":"#c9931a","darkMode":"light","radius":"12px"}' WHERE `key` = 'ui_theme';
