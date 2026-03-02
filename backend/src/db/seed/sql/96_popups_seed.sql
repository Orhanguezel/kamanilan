/* 96_popups_seed.sql — Kaman İlan popup & topbar seed */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `popups`;

CREATE TABLE `popups` (
  `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `uuid`              CHAR(36)        NOT NULL,
  `type`              VARCHAR(30)     NOT NULL DEFAULT 'topbar',
  `title`             VARCHAR(255)    NOT NULL,
  `content`           TEXT            NULL,
  `background_color`  VARCHAR(30)     NULL,
  `text_color`        VARCHAR(30)     NULL,
  `button_text`       VARCHAR(100)    NULL,
  `button_color`      VARCHAR(30)     NULL,
  `button_hover_color` VARCHAR(30)   NULL,
  `button_text_color` VARCHAR(30)     NULL,
  `link_url`          VARCHAR(500)    NULL,
  `link_target`       VARCHAR(20)     NOT NULL DEFAULT '_self',
  `image_url`         TEXT            NULL,
  `image_asset_id`    CHAR(36)        NULL,
  `alt`               VARCHAR(255)    NULL,
  `text_behavior`     VARCHAR(20)     NOT NULL DEFAULT 'marquee',
  `scroll_speed`      INT UNSIGNED    NOT NULL DEFAULT 60,
  `closeable`         TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `delay_seconds`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `display_frequency` VARCHAR(20)     NOT NULL DEFAULT 'always',
  `is_active`         TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `display_order`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `start_at`          DATETIME(3)     NULL,
  `end_at`            DATETIME(3)     NULL,
  `created_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_popup_uuid` (`uuid`),
  KEY `idx_popup_type`      (`type`),
  KEY `idx_popup_active`    (`is_active`),
  KEY `idx_popup_order`     (`display_order`),
  KEY `idx_popup_img_asset` (`image_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TOPBAR ───────────────────────────────────────────────────────────────

-- Topbar 1: Ana kampanya kayan yazısı
INSERT INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000001','topbar',
  '🌿 Kaman İlan''a Hoş Geldiniz!',
  '🏡 Ücretsiz ilan verin  •  🔍 Binlerce ilan arasından arayın  •  🤝 Güvenli alım satım platformu  •  📱 Mobil uyumlu deneyim  •  ✨ Bugün üye olun ve avantajlardan yararlanın!',
  '#1B4332','#F5ECD7',
  'İlan Ver',
  '#D4873C','#BF6E28','#FFFFFF',
  '/ilan-ver','_self',
  'marquee',55,1,0,'always',1,1
);

-- Topbar 2: Kargo / teslimat bildirimi tarzı (rezerv, is_active=0)
INSERT INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000002','topbar',
  '⚡ Flaş Fırsatlar Başladı!',
  '⚡ Flash fiyat fırsatları şimdi aktif!  •  ⏰ Sınırlı süre  •  🎯 Özel fiyatlı ilanlar sizi bekliyor  •  Kaçırmayın!',
  '#0D3B2E','#FFD166',
  'Fırsatlara Git',
  '#D4873C','#BF6E28','#FFFFFF',
  '/?section=flash','_self',
  'marquee',70,1,0,'always',0,2
);

-- ─── SIDEBAR TOP ──────────────────────────────────────────────────────────

-- Sidebar top: Üye ol çağrısı
INSERT INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000003','sidebar_top',
  'Ücretsiz Üye Ol',
  'Hemen üye olun, ilanlarınızı yayınlayın ve binlerce alıcıya ulaşın. Üyelik tamamen ücretsiz!',
  '#1B4332','#F5ECD7',
  'Üye Ol →',
  '#D4873C','#BF6E28','#FFFFFF',
  '/uye-ol','_self',
  'static',60,1,3,'daily',1,3
);

-- ─── SIDEBAR CENTER ───────────────────────────────────────────────────────

-- Sidebar center: İlan ver kampanya
INSERT INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000004','sidebar_center',
  '📢 İlanınızı Yayınlayın',
  'Evinizi, arabanızı veya eşyalarınızı saniyeler içinde satışa çıkarın. Ücretsiz, hızlı ve kolay!',
  '#40916C','#FFFFFF',
  'Hemen İlan Ver',
  '#1B4332','#0D3B2E','#F5ECD7',
  '/ilan-ver','_self',
  'static',60,1,5,'always',1,4
);

-- ─── SIDEBAR BOTTOM ───────────────────────────────────────────────────────

-- Sidebar bottom: İletişim/destek
INSERT INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000005','sidebar_bottom',
  '💬 Yardım mı Lazım?',
  'Sorularınız için bize ulaşın. 7/24 destek ekibimiz yanınızda.',
  '#2D6A4F','#E8F2EB',
  'İletişim',
  '#D4873C','#BF6E28','#FFFFFF',
  '/iletisim','_self',
  'static',60,1,8,'always',1,5
);
