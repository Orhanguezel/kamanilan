/* 61_theme_config.sql — Kaman İlan varsayılan tema (Ceviz Bahçesi — Yeşil Tema) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `theme_config`;

CREATE TABLE `theme_config` (
  `id`         CHAR(36)     NOT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `config`     MEDIUMTEXT   NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- Kaman İlan — Varsayılan Tema Konfigürasyonu
--
-- Ana Sayfa Bölüm Sırası (sections[].order):
--   1    hero            → Slider (tam genişlik)
--   2    categories      → Kategori bar (yatay kaydırmalı)
--   3    featured        → Öne çıkan ilanlar  (rowId: row_featured, span:8)
--   4    announcements_1 → Duyurular           (rowId: row_featured, span:4)
--   5    flash_sale      → Aktif kampanyalar (2-sütun renkli kartlar)
--   6    banner_row_1    → Reklam Alanı 1 (banner.desktop_row=1 olan bannerlar)
--   7    recent          → Son ilanlar          (rowId: row_recent, span:8)
--   8    news_feed       → Haberler             (rowId: row_recent, span:4)
--   9    banner_row_2    → Reklam Alanı 2 (banner.desktop_row=2 olan bannerlar)
--   10   infinite_listings → Tüm İlanlar (sonsuz kaydırma)
--   11   banner_row_3    → Reklam Alanı 3 (banner.desktop_row=3 olan bannerlar)
--
-- Reklam Yönetimi (98_banners_seed.sql):
--   Her banner kendi desktop_row (1/2/3) ve desktop_columns (1/2/3) değerini taşır.
--   banner_row_1 = desktop_row=1 → ID 1, 2      (desktop_columns=1, tam genişlik)
--   banner_row_2 = desktop_row=2 → ID 10, 40    (desktop_columns=2, yan yana)
--   banner_row_3 = desktop_row=3 → ID 20, 21, 22 (desktop_columns=3, üçlü grid)
--   Admin: Bannerlar sayfasında desktop_row ve desktop_columns ayarlayın.
--
-- Renk Kuralı (80-10-10): açık arka plan · amber CTA · asla koyu yeşil bg
-- =============================================================
INSERT INTO `theme_config` (`id`, `is_active`, `config`, `created_at`, `updated_at`) VALUES (
  '00000000-0000-4000-8000-000000000001',
  1,
  '{
    "colors": {
      "primary":     "#1B4332",
      "secondary":   "#40916C",
      "accent":      "#D4873C",
      "background":  "#F8FBF8",
      "foreground":  "#1A2E1E",
      "muted":       "#E8F2EB",
      "mutedFg":     "#52796F",
      "border":      "#C8DDD0",
      "destructive": "#ef4444",
      "success":     "#52B788",
      "navBg":       "#2D6A4F",
      "navFg":       "#F8FBF8",
      "footerBg":    "#1B4332",
      "footerFg":    "#E8F2EB"
    },
    "radius":     "0.375rem",
    "fontFamily": "Nunito, sans-serif",
    "darkMode":   "light",

    "sections": [

      {
        "key":     "hero",
        "enabled": true,
        "order":   1,
        "label":   "Hero Bölümü",
        "colsLg":  1,
        "colsMd":  1,
        "colsSm":  1,
        "limit":   null,
        "variant": "carousel"
      },

      {
        "key":     "categories",
        "enabled": true,
        "order":   2,
        "label":   "Tüm Kategoriler",
        "colsLg":  6,
        "colsMd":  4,
        "colsSm":  3,
        "limit":   null,
        "variant": "scroll"
      },

      {
        "key":     "featured",
        "enabled": true,
        "order":   3,
        "label":   "Öne Çıkan İlanlar",
        "colsLg":  2,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   6,
        "rowId":   "row_featured",
        "span":    8
      },
      {
        "key":     "announcements_1",
        "enabled": true,
        "order":   4,
        "label":   "Duyurular",
        "colsLg":  1,
        "colsMd":  1,
        "colsSm":  1,
        "limit":   6,
        "rowId":   "row_featured",
        "span":    4
      },

      {
        "key":     "flash_sale",
        "enabled": true,
        "order":   5,
        "label":   "Flash Fırsat Kampanyaları",
        "colsLg":  2,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   2
      },

      {
        "key":     "banner_row_1",
        "enabled": true,
        "order":   6,
        "label":   "Reklam Alanı 1"
      },

      {
        "key":     "recent",
        "enabled": true,
        "order":   7,
        "label":   "Son İlanlar",
        "colsLg":  2,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   6,
        "rowId":   "row_recent",
        "span":    8
      },
      {
        "key":     "news_feed",
        "enabled": true,
        "order":   8,
        "label":   "Haberler",
        "colsLg":  1,
        "colsMd":  1,
        "colsSm":  1,
        "limit":   6,
        "rowId":   "row_recent",
        "span":    4
      },

      {
        "key":     "banner_row_2",
        "enabled": true,
        "order":   9,
        "label":   "Reklam Alanı 2"
      },

      {
        "key":     "infinite_listings",
        "enabled": true,
        "order":   10,
        "label":   "Tüm İlanlar",
        "colsLg":  4,
        "colsMd":  3,
        "colsSm":  2,
        "limit":   null
      },

      {
        "key":     "banner_row_3",
        "enabled": true,
        "order":   11,
        "label":   "Reklam Alanı 3"
      },

      {
        "key":     "listings_hayvan",
        "enabled": false,
        "order":   12,
        "label":   "Hayvan İlanları",
        "variant": "animal",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_tarim",
        "enabled": false,
        "order":   13,
        "label":   "Tarım & Ekipman İlanları",
        "variant": "agriculture",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_emlak",
        "enabled": false,
        "order":   14,
        "label":   "Emlak & Arazi İlanları",
        "variant": "real_estate",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_arac",
        "enabled": false,
        "order":   15,
        "label":   "Araç & Makine İlanları",
        "variant": "vehicle",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_yiyecek",
        "enabled": false,
        "order":   16,
        "label":   "Tarım Ürünleri & Gıda",
        "variant": "food",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_satilik",
        "enabled": false,
        "order":   17,
        "label":   "Satılık İlanlar",
        "variant": "satilik",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      },
      {
        "key":     "listings_kiralik",
        "enabled": false,
        "order":   18,
        "label":   "Kiralık İlanlar",
        "variant": "kiralik",
        "colsLg":  4,
        "colsMd":  2,
        "colsSm":  1,
        "limit":   8
      }

    ],

    "pages": {
      "home": {
        "variant":   "default",
        "heroStyle": "carousel"
      },
      "listings": {
        "variant":      "default",
        "defaultView":  "grid",
        "filtersStyle": "sidebar",
        "adBannerPos":  "listing_top"
      },
      "listing_detail": {
        "variant": "default"
      },
      "campaigns": {
        "variant": "default"
      },
      "advertise": {
        "variant": "default"
      },
      "announcements": {
        "variant": "default"
      },
      "haberler": {
        "variant":              "default",
        "carouselCount":        "6",
        "gridStart":            "6",
        "sidebarEnabled":       "true",
        "perPage":              "60",
        "adBannerPos":          "news_sidebar"
      },
      "about":   { "variant": "centered" },
      "contact": { "variant": "default"  }
    },

    "newsListSections": [
      { "key": "banner_full_1",    "enabled": true,  "order": 0,  "label": "Tam Genişlik Reklam 1",  "bannerIds": "52" },
      { "key": "carousel",         "enabled": true,  "order": 1,  "label": "Carousel",               "count": 6 },
      { "key": "grid",             "enabled": true,  "order": 2,  "label": "Haber Listesi",           "cols":  3 },
      { "key": "banner_sidebar_1", "enabled": true,  "order": 3,  "label": "Sidebar Üst Reklam",      "bannerIds": "50" },
      { "key": "sidebar",          "enabled": true,  "order": 4,  "label": "Kenar Çubuğu",            "count": 8 },
      { "key": "banner_sidebar_2", "enabled": true,  "order": 5,  "label": "Sidebar Alt Reklam",      "bannerIds": "51" },
      { "key": "banner_full_2",    "enabled": true,  "order": 10, "label": "Tam Genişlik Reklam 2",   "bannerIds": "53" }
    ],

    "newsDetailSections": [
      { "key": "banner_full_1",    "enabled": true,  "order": 0,  "label": "Makale Üstü Tam Reklam",  "bannerIds": "57" },
      { "key": "cover",            "enabled": true,  "order": 1,  "label": "Kapak Görseli"                              },
      { "key": "meta",             "enabled": true,  "order": 2,  "label": "Yazar & Tarih"                              },
      { "key": "body",             "enabled": true,  "order": 3,  "label": "Makale İçeriği"                             },
      { "key": "video",            "enabled": true,  "order": 4,  "label": "Video Embed"                                },
      { "key": "tags",             "enabled": true,  "order": 5,  "label": "Etiketler"                                  },
      { "key": "comments",         "enabled": true,  "order": 6,  "label": "Yorumlar"                                   },
      { "key": "banners_top",      "enabled": true,  "order": 7,  "label": "Sidebar Üst Reklam",      "bannerIds": "55" },
      { "key": "related",          "enabled": true,  "order": 8,  "label": "İlgili Haberler",         "count": 7        },
      { "key": "banners_bottom",   "enabled": true,  "order": 9,  "label": "Sidebar Alt Reklam",      "bannerIds": "56" },
      { "key": "banner_full_2",    "enabled": true,  "order": 10, "label": "Makale Altı Tam Reklam",  "bannerIds": "58" }
    ],

    "layout_blocks": [
      {"id":"hero__1",                    "type":"hero",                    "instance":1,"enabled_disabled":"on", "config":{}},
      {"id":"category__1",                "type":"category",                "instance":1,"enabled_disabled":"on", "config":{"cols_lg":6}},
      {"id":"flash_sale__1",              "type":"flash_sale",              "instance":1,"enabled_disabled":"on", "config":{"flash_sale_span":6}},
      {"id":"flash_sale__2",              "type":"flash_sale",              "instance":2,"enabled_disabled":"on", "config":{"flash_sale_span":6}},
      {"id":"product_featured__1",        "type":"product_featured",        "instance":1,"enabled_disabled":"on", "config":{"section_span":8,"cols_lg":4,"limit":8}},
      {"id":"announcements__1",           "type":"announcements",           "instance":1,"enabled_disabled":"on", "config":{"section_span":4,"limit":7}},
      {"id":"banner_section__1",          "type":"banner_section",          "instance":1,"enabled_disabled":"on", "config":{"banner_span":4}},
      {"id":"banner_section__2",          "type":"banner_section",          "instance":2,"enabled_disabled":"on", "config":{"banner_span":4}},
      {"id":"banner_section__3",          "type":"banner_section",          "instance":3,"enabled_disabled":"on", "config":{"banner_span":4}},
      {"id":"product_top_selling__1",     "type":"product_top_selling",     "instance":1,"enabled_disabled":"on", "config":{"section_span":8,"cols_lg":4,"limit":8}},
      {"id":"news_feed__1",               "type":"news_feed",               "instance":1,"enabled_disabled":"on", "config":{"section_span":4,"cols_lg":3,"limit":9}},
      {"id":"banner_section__4",          "type":"banner_section",          "instance":4,"enabled_disabled":"on", "config":{"banner_span":12}},
      {"id":"product_latest__1",          "type":"product_latest",          "instance":1,"enabled_disabled":"on", "config":{"section_span":8,"cols_lg":4,"limit":8}},
      {"id":"banner_section__5",          "type":"banner_section",          "instance":5,"enabled_disabled":"on", "config":{"banner_span":4}},
      {"id":"popular_product_section__1", "type":"popular_product_section", "instance":1,"enabled_disabled":"on", "config":{"section_span":12,"cols_lg":4,"limit":10}},
      {"id":"banner_section__6",          "type":"banner_section",          "instance":6,"enabled_disabled":"on", "config":{"banner_span":12}},
      {"id":"top_stores_section__1",      "type":"top_stores_section",      "instance":1,"enabled_disabled":"on", "config":{"section_span":12}},
      {"id":"newsletters_section__1",     "type":"newsletters_section",     "instance":1,"enabled_disabled":"on", "config":{"section_span":12}}
    ]
  }',
  NOW(3),
  NOW(3)
);
