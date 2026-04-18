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
      { "key": "hero", "enabled": true, "order": 1, "variant": "editorial-collage" },
      { "key": "categories", "enabled": true, "order": 2, "variant": "grid-featured" },
      { "key": "featured", "enabled": true, "order": 3, "limit": 6 },
      { "key": "spotlight", "enabled": true, "order": 4, "label": "Kaman Cevizi Spotlight" },
      { "key": "recent", "enabled": true, "order": 5, "limit": 12 }
    ]
  }',
  NOW(3),
  NOW(3)
);

-- Site ayarlarını da bu temaya göre güncelle
UPDATE `site_settings` SET `value` = '"#c9931a"' WHERE `key` = 'ui_theme_color';
UPDATE `site_settings` SET `value` = '{"primaryHex":"#c9931a","darkMode":"light","radius":"12px"}' WHERE `key` = 'ui_theme';
