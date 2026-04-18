/* 97_slider.sql — Kaman Ilan (i18n: parent + slider_i18n) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `slider_i18n`;
DROP TABLE IF EXISTS `slider`;

CREATE TABLE `slider` (
  `id`             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `uuid`           CHAR(36)        NOT NULL,
  `image_url`      TEXT            DEFAULT NULL,
  `image_asset_id` CHAR(36)        DEFAULT NULL,
  `image2_url`     TEXT            DEFAULT NULL,
  `badge_text`     VARCHAR(100)    DEFAULT NULL,
  `badge_color`    VARCHAR(100)    DEFAULT NULL,
  `gradient`       TEXT            DEFAULT NULL,
  `featured`       TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `display_order`  INT UNSIGNED    NOT NULL DEFAULT 0,
  `created_at`     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_slider_uuid` (`uuid`),
  KEY `idx_slider_active`       (`is_active`),
  KEY `idx_slider_order`        (`display_order`),
  KEY `idx_slider_image_asset`  (`image_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `slider_i18n` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `slider_id`   INT UNSIGNED    NOT NULL,
  `locale`      VARCHAR(8)      NOT NULL DEFAULT 'tr',
  `name`        VARCHAR(255)    NOT NULL,
  `slug`        VARCHAR(255)    NOT NULL,
  `description` TEXT            DEFAULT NULL,
  `alt`         VARCHAR(255)    DEFAULT NULL,
  `button_text` VARCHAR(100)    DEFAULT NULL,
  `button_link` VARCHAR(255)    DEFAULT NULL,
  `created_at`  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_slider_i18n_parent_locale` (`slider_id`, `locale`),
  UNIQUE KEY `ux_slider_i18n_slug_locale`   (`slug`, `locale`),
  KEY `slider_i18n_locale_idx` (`locale`),
  KEY `slider_i18n_slug_idx`   (`slug`),
  CONSTRAINT `fk_slider_i18n_slider` FOREIGN KEY (`slider_id`) REFERENCES `slider` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED: slider parent rows
-- =============================================================
INSERT INTO `slider`
  (`id`,`uuid`,`image_url`,`image_asset_id`,`image2_url`,`badge_text`,`badge_color`,`gradient`,`featured`,`is_active`,`display_order`,`created_at`,`updated_at`)
VALUES
(1,UUID(),'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=900&q=80','Kaman Cevizi','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 42%, 12%) 0%, hsl(153, 39%, 28%) 55%, hsl(155, 38%, 38%) 100%)',1,1,1,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(2,UUID(),'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80','Emlak ve Kira','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 50%, 10%) 0%, hsl(153, 42%, 22%) 55%, hsl(151, 39%, 42%) 100%)',1,1,2,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(3,UUID(),'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80','Arac ve Motosiklet','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 42%, 9%) 0%, hsl(153, 42%, 18%) 55%, hsl(153, 39%, 30%) 100%)',0,1,3,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(4,UUID(),'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80',NULL,'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80','Hayvan ve Tarim','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 50%, 12%) 0%, hsl(153, 42%, 24%) 55%, hsl(151, 39%, 40%) 100%)',0,1,4,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(5,UUID(),'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1600&q=80','Kumes Hayvanlari','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 45%, 10%) 0%, hsl(153, 35%, 23%) 55%, hsl(153, 31%, 36%) 100%)',0,1,5,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(6,UUID(),'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80','Sut ve Yogurt','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 44%, 12%) 0%, hsl(153, 35%, 24%) 55%, hsl(151, 33%, 39%) 100%)',0,1,6,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000');

INSERT INTO `slider`
  (`id`,`uuid`,`image_url`,`image_asset_id`,`image2_url`,`badge_text`,`badge_color`,`gradient`,`featured`,`is_active`,`display_order`,`created_at`,`updated_at`)
VALUES
(7,UUID(),'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80','Meyve ve Sebze','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 45%, 11%) 0%, hsl(153, 36%, 25%) 55%, hsl(151, 34%, 39%) 100%)',0,1,7,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(8,UUID(),'https://arastirma.tarimorman.gov.tr/gktaem/IcerikResimleri/DuyuruResimleri/Hububat.jpg?RenditionId=3',NULL,'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80','Hububat ve Bakliyat','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 40%, 11%) 0%, hsl(153, 33%, 24%) 55%, hsl(151, 30%, 38%) 100%)',0,1,8,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(9,UUID(),'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80','Genel Satis','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 43%, 9%) 0%, hsl(153, 37%, 21%) 55%, hsl(153, 32%, 34%) 100%)',0,1,9,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(10,UUID(),'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=900&q=80','Giyim ve Tekstil','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 41%, 11%) 0%, hsl(153, 34%, 23%) 55%, hsl(151, 31%, 37%) 100%)',0,1,10,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(11,UUID(),'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80','Elektronik','hsl(30 64% 53%)','linear-gradient(130deg, hsl(153, 44%, 9%) 0%, hsl(153, 36%, 21%) 55%, hsl(153, 32%, 35%) 100%)',0,1,11,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000'),
(12,UUID(),'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1600&q=80',NULL,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80','Usta ve Hizmet','hsl(155 38% 41%)','linear-gradient(130deg, hsl(153, 42%, 12%) 0%, hsl(153, 35%, 24%) 55%, hsl(151, 31%, 39%) 100%)',0,1,12,'2026-02-23 00:00:00.000','2026-02-23 00:00:00.000');

-- =============================================================
-- SEED: slider_i18n rows (locale='tr')
-- =============================================================
INSERT INTO `slider_i18n` (`slider_id`,`locale`,`name`,`slug`,`description`,`alt`,`button_text`,`button_link`) VALUES
(1,'tr','Kaman Cevizi: Yeni Hasat Ilanlari','kaman-cevizi-yeni-hasat-ilanlari','Kaman cevizinde yeni hasat urunlerini dogrudan ureticiden kesfedin.','Kaman cevizi urunleri','Kaman Cevizi Ilanlari','/ilanlar?category=kaman-cevizi'),
(2,'tr','Emlak ve Kira Ilanlari','emlak-ve-kira-ilanlari','Kaman merkez ve koylerde daire, isyeri, arsa ve tarla ilanlari.','Kaman emlak ilanlari','Emlak Ilanlarini Incele','/ilanlar?category=emlak-kira'),
(3,'tr','Arac ve Motosiklet Pazari','arac-ve-motosiklet-pazari','Otomobil, motosiklet, traktor ve is makinasi ilanlari tek yerde.','Arac ilanlari','Arac Ilanlari','/ilanlar?category=arac-motosiklet'),
(4,'tr','Hayvan ve Tarim Ilanlari','hayvan-ve-tarim-ilanlari','Buyukbas, kucukbas, tarim ekipmani ve ilgili ilanlara hizli ulasin.','Hayvan ve tarim ilanlari','Hayvan ve Tarim Ilanlari','/ilanlar?category=hayvan-tarim'),
(5,'tr','Kumes Hayvanlari Ilanlari','kumes-hayvanlari-ilanlari','Tavuk, hindi, kaz ve diger kumes hayvani ilanlarini goruntuleyin.','Kumes hayvani ilanlari','Kumes Ilanlari','/ilanlar?category=kumes-hayvanlari'),
(6,'tr','Sut ve Yogurt Urunleri','sut-ve-yogurt-urunleri','Gunluk sut, yogurt, peynir ve tereyagi ilanlarini kesfedin.','Sut ve yogurt urunleri','Sut Urunleri','/ilanlar?category=sut-yogurt'),
(7,'tr','Meyve ve Sebze Ilanlari','meyve-ve-sebze-ilanlari','Kaman ve cevresinden taze meyve sebze urunlerini bulun.','Meyve sebze ilanlari','Meyve Sebze Ilanlari','/ilanlar?category=meyve-sebze'),
(8,'tr','Hububat ve Bakliyat Ilanlari','hububat-ve-bakliyat-ilanlari','Bugday, arpa, nohut, mercimek ve diger bakliyat ilanlari.','Hububat bakliyat ilanlari','Hububat Ilanlari','/ilanlar?category=hububat-bakliyat'),
(9,'tr','Genel Satis ve Firsat Ilanlari','genel-satis-ve-firsat-ilanlari','Elektronikten hobi urunlerine kadar farkli kategorilerde firsat ilanlari.','Genel satis ilanlari','Tum Ilanlar','/ilanlar?category=genel-satis'),
(10,'tr','Giyim ve Tekstil Ilanlari','giyim-ve-tekstil-ilanlari','Kadin, erkek ve cocuk giyim ilanlarini uygun fiyatla inceleyin.','Giyim tekstil ilanlari','Giyim Ilanlari','/ilanlar?category=giyim-tekstil'),
(11,'tr','Elektronik Ilanlari','elektronik-ilanlari','Telefon, tablet, bilgisayar ve diger elektronik urun ilanlari.','Elektronik urun ilanlari','Elektronik Ilanlari','/ilanlar?category=elektronik'),
(12,'tr','Usta ve Hizmet Ilanlari','usta-ve-hizmet-ilanlari','Elektrikci, tesisatci, boya ve diger usta hizmet ilanlari.','Usta ve hizmet ilanlari','Hizmet Ilanlari','/ilanlar?category=usta-hizmet');
