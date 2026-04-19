/* 96_popups_seed.sql — Kaman İlan popup & topbar seed (AA-compliant colors) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Sadece topbar aktif. Sidebar popups kapatıldı — ekranın her yerini kaplıyordu.
-- Renkler: ink (#1A120B) + saffron (#C9931A) — WCAG AA 5.5:1 kontrast.

INSERT IGNORE INTO `popups` (`uuid`,`type`,`title`,`content`,`background_color`,`text_color`,`button_text`,`button_color`,`button_hover_color`,`button_text_color`,`link_url`,`link_target`,`text_behavior`,`scroll_speed`,`closeable`,`delay_seconds`,`display_frequency`,`is_active`,`display_order`) VALUES
('a0000001-0000-4000-8000-000000000001','topbar',
  '🌿 Kaman İlan''a Hoş Geldiniz!',
  '🏡 Ücretsiz ilan verin  •  🔍 Binlerce ilan arasından arayın  •  🤝 Güvenli alım satım platformu  •  📱 Mobil uyumlu deneyim  •  ✨ Bugün üye olun ve avantajlardan yararlanın!',
  '#1A120B','#FAF5EA',
  'İlan Ver',
  '#C9931A','#A87611','#1A120B',
  '/ilan-ver','_self',
  'marquee',55,1,0,'always',1,1
);
