/* 50_categories_schema.sql — Kaman İlan (i18n: parent + child tables) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- DROP (children first — FK constraint order)
-- =============================================================
DROP TABLE IF EXISTS `sub_category_i18n`;
DROP TABLE IF EXISTS `sub_categories`;
DROP TABLE IF EXISTS `category_i18n`;
DROP TABLE IF EXISTS `categories`;

-- =============================================================
-- PARENT: categories
-- =============================================================
CREATE TABLE `categories` (
  `id`               CHAR(36)     NOT NULL,
  `module_key`       VARCHAR(64)  NOT NULL DEFAULT 'general',
  `name`             VARCHAR(255) DEFAULT NULL,
  `slug`             VARCHAR(255) DEFAULT NULL,
  `description`      TEXT         DEFAULT NULL,
  `image_url`        LONGTEXT     DEFAULT NULL,
  `storage_asset_id` CHAR(36)     DEFAULT NULL,
  `alt`              VARCHAR(255) DEFAULT NULL,
  `icon`             VARCHAR(255) DEFAULT NULL,
  `has_cart`         TINYINT(1)   NOT NULL DEFAULT 1,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1)   NOT NULL DEFAULT 0,
  `is_unlimited`     TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order`    INT          NOT NULL DEFAULT 0,
  `whatsapp_number`  VARCHAR(20)  DEFAULT NULL,
  `phone_number`     VARCHAR(20)  DEFAULT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `categories_active_idx`        (`is_active`),
  KEY `categories_order_idx`         (`display_order`),
  KEY `categories_module_key_idx`    (`module_key`),
  KEY `categories_storage_asset_idx` (`storage_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CHILD: category_i18n
-- =============================================================
CREATE TABLE `category_i18n` (
  `id`               CHAR(36)     NOT NULL,
  `category_id`      CHAR(36)     NOT NULL,
  `locale`           VARCHAR(8)   NOT NULL DEFAULT 'tr',
  `name`             VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL,
  `description`      TEXT         DEFAULT NULL,
  `alt`              VARCHAR(255) DEFAULT NULL,
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` VARCHAR(500) DEFAULT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_category_i18n_slug_locale` (`slug`, `locale`),
  UNIQUE KEY `ux_category_i18n_parent_locale` (`category_id`, `locale`),
  KEY `category_i18n_locale_idx` (`locale`),
  KEY `category_i18n_slug_idx`   (`slug`),
  CONSTRAINT `fk_category_i18n_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PARENT: sub_categories
-- =============================================================
CREATE TABLE `sub_categories` (
  `id`               CHAR(36)     NOT NULL,
  `category_id`      CHAR(36)     NOT NULL,
  `name`             VARCHAR(255) DEFAULT NULL,
  `slug`             VARCHAR(255) DEFAULT NULL,
  `description`      TEXT         DEFAULT NULL,
  `image_url`        LONGTEXT     DEFAULT NULL,
  `storage_asset_id` CHAR(36)     DEFAULT NULL,
  `alt`              VARCHAR(255) DEFAULT NULL,
  `icon`             VARCHAR(255) DEFAULT NULL,
  `has_cart`         TINYINT(1)   NOT NULL DEFAULT 1,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order`    INT          NOT NULL DEFAULT 0,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sub_categories_category_id_idx`   (`category_id`),
  KEY `sub_categories_active_idx`        (`is_active`),
  KEY `sub_categories_order_idx`         (`display_order`),
  KEY `sub_categories_storage_asset_idx` (`storage_asset_id`),
  CONSTRAINT `fk_sub_categories_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CHILD: sub_category_i18n
-- =============================================================
CREATE TABLE `sub_category_i18n` (
  `id`              CHAR(36)     NOT NULL,
  `sub_category_id` CHAR(36)     NOT NULL,
  `locale`          VARCHAR(8)   NOT NULL DEFAULT 'tr',
  `name`            VARCHAR(255) NOT NULL,
  `slug`            VARCHAR(255) NOT NULL,
  `description`     TEXT         DEFAULT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_sub_category_i18n_slug_locale`   (`slug`, `locale`),
  UNIQUE KEY `ux_sub_category_i18n_parent_locale` (`sub_category_id`, `locale`),
  KEY `sub_category_i18n_locale_idx` (`locale`),
  KEY `sub_category_i18n_slug_idx`   (`slug`),
  CONSTRAINT `fk_sub_category_i18n_sub` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =============================================================
   CATEGORY PARENT SEEDS (18 adet)
   ============================================================= */
INSERT INTO `categories`
  (`id`, `module_key`, `image_url`, `alt`, `icon`,
   `has_cart`, `is_active`, `is_featured`, `is_unlimited`, `display_order`,
   `whatsapp_number`, `phone_number`)
VALUES
  ('10000000-0000-4000-8000-000000000001','general','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80','Satılık ve kiralık konut ilanları','🏠',0,1,1,0,1,NULL,NULL),
  ('10000000-0000-4000-8000-000000000002','general','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop&auto=format&q=80','Araç ve motosiklet ilanları','🚗',0,1,1,0,2,NULL,NULL),
  ('10000000-0000-4000-8000-000000000003','general','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format&q=80','İkinci el eşya ilanları','📦',1,1,1,0,3,NULL,NULL),
  ('10000000-0000-4000-8000-000000000004','general','https://images.unsplash.com/photo-1508349249800-277c55b8e86d?w=400&h=300&fit=crop&auto=format&q=80','Kaman cevizi üreticiden taze','🌰',1,1,1,0,4,NULL,NULL),
  ('10000000-0000-4000-8000-000000000005','general','https://images.unsplash.com/photo-1500595046743-cd271d694d30?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400','Tarım ve hayvan ilanları','🐄',0,1,1,0,5,NULL,NULL),
  ('10000000-0000-4000-8000-000000000006','general','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&auto=format&q=80','Kaman bölgesi iş ilanları','💼',0,1,1,0,6,NULL,NULL),
  ('10000000-0000-4000-8000-000000000007','general','https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format&q=80','Taze süt ve süt ürünleri ilanları','🥛',1,1,0,0,7,NULL,NULL),
  ('10000000-0000-4000-8000-000000000008','general','https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format&q=80','Taze meyve ve sebze ilanları','🍎',1,1,0,0,8,NULL,NULL),
  ('10000000-0000-4000-8000-000000000009','general','https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop&auto=format&q=80','Hububat ve bakliyat ilanları','🌾',1,1,0,0,9,NULL,NULL);

INSERT INTO `categories`
  (`id`, `module_key`, `image_url`, `alt`, `icon`,
   `has_cart`, `is_active`, `is_featured`, `is_unlimited`, `display_order`,
   `whatsapp_number`, `phone_number`)
VALUES
  ('10000000-0000-4000-8000-000000000010','general','https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&auto=format&q=80','Genel satış ilanları','🛒',1,1,0,0,10,NULL,NULL),
  ('10000000-0000-4000-8000-000000000011','general','https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&auto=format&q=80','Giyim ve tekstil ilanları','👗',1,1,0,0,11,NULL,NULL),
  ('10000000-0000-4000-8000-000000000012','general','https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format&q=80','Elektronik ürün ilanları','📱',1,1,0,0,12,NULL,NULL),
  ('10000000-0000-4000-8000-000000000013','general','https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&auto=format&q=80','Usta ve hizmet ilanları','🛠️',0,1,0,0,13,NULL,NULL),
  ('10000000-0000-4000-8000-000000000014','general','https://images.unsplash.com/photo-1416664806563-884af9c2a3d4?w=400&h=300&fit=crop&auto=format&q=80','Araç gereç ve alet ilanları','🔧',1,1,0,0,14,NULL,NULL),
  ('10000000-0000-4000-8000-000000000015','general','https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format&q=80','Kiralık işyeri ilanları','🏢',0,1,0,0,15,NULL,NULL),
  ('10000000-0000-4000-8000-000000000016','general','https://images.unsplash.com/photo-1548550023-2cdb937e3b2d?w=400&h=300&fit=crop&auto=format&q=80','Kümes hayvanları ilanları','🐔',1,1,0,0,16,NULL,NULL),
  ('10000000-0000-4000-8000-000000000017','general','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format&q=80','Arsa ve tarla ilanları','🛖',0,1,0,0,17,NULL,NULL),
  ('10000000-0000-4000-8000-000000000018','general',NULL,NULL,'🕊️',0,1,0,1,18,NULL,NULL);

/* =============================================================
   CATEGORY i18n SEEDS (locale='tr')
   ============================================================= */
INSERT INTO `category_i18n` (`id`,`category_id`,`locale`,`name`,`slug`,`description`) VALUES
(UUID(),'10000000-0000-4000-8000-000000000001','tr','Emlak & Kira','emlak-kira','Satılık ve kiralık konut, villa, arsa, bağ evi'),
(UUID(),'10000000-0000-4000-8000-000000000002','tr','Araç & Motosiklet','arac-motosiklet','Otomobil, kamyonet, traktör, motosiklet, iş makinası'),
(UUID(),'10000000-0000-4000-8000-000000000003','tr','2. El Eşya','ikinci-el','Mobilya, beyaz eşya, mutfak gereçleri, kitap ve daha fazlası'),
(UUID(),'10000000-0000-4000-8000-000000000004','tr','Kaman Cevizi','kaman-cevizi','Türkiye''nin en lezzetli ceviziyle üreticiden alışveriş'),
(UUID(),'10000000-0000-4000-8000-000000000005','tr','Hayvan & Tarım','hayvan-tarim','Büyükbaş, küçükbaş, arı balı, tarım ekipmanı ve ürünleri'),
(UUID(),'10000000-0000-4000-8000-000000000006','tr','İş İlanları','is-ilanlari','Kaman ve çevresindeki tam zamanlı, part-time, serbest işler'),
(UUID(),'10000000-0000-4000-8000-000000000007','tr','Süt & Yoğurt','sut-yogurt','Taze süt, yoğurt, tereyağı, peynir, ayran ve kefir'),
(UUID(),'10000000-0000-4000-8000-000000000008','tr','Meyve & Sebze','meyve-sebze','Taze meyve, sebze, organik ürünler, kurutulmuş gıdalar'),
(UUID(),'10000000-0000-4000-8000-000000000009','tr','Hububat & Bakliyat','hububat-bakliyat','Buğday, arpa, nohut, mercimek, fasulye, mısır'),
(UUID(),'10000000-0000-4000-8000-000000000010','tr','Genel Satış','genel-satis','Oyuncak, spor, hobi, bebek ürünleri ve el yapımı eşyalar'),
(UUID(),'10000000-0000-4000-8000-000000000011','tr','Giyim & Tekstil','giyim-tekstil','Kadın, erkek, çocuk giyim, ayakkabı, aksesuar ve kumaş'),
(UUID(),'10000000-0000-4000-8000-000000000012','tr','Elektronik','elektronik','Telefon, tablet, laptop, TV, ses sistemi ve elektrikli aletler'),
(UUID(),'10000000-0000-4000-8000-000000000013','tr','Usta & Hizmet','usta-hizmet','Elektrikçi, tesisatçı, boyacı, nakliye ve temizlik hizmetleri'),
(UUID(),'10000000-0000-4000-8000-000000000014','tr','Araç Gereç','arac-gerec','El aletleri, tarım aletleri, yapı malzeme, yedek parça'),
(UUID(),'10000000-0000-4000-8000-000000000015','tr','Kiralık İşyeri','kiralik-isyeri','Dükkan, depo, ofis ve arazi kiralama ilanları'),
(UUID(),'10000000-0000-4000-8000-000000000016','tr','Kümes Hayvanları','kumes-hayvanlari','Tavuk, hindi, kaz, ördek, civciv ve yumurta ilanları'),
(UUID(),'10000000-0000-4000-8000-000000000017','tr','Arsa & Tarla','arsa-tarla','Satılık tarla, bağ, bahçe, arsa ve mera ilanları'),
(UUID(),'10000000-0000-4000-8000-000000000018','tr','Cenaze İlanları','cenaze','Vefat duyuruları ve kırkı-mevlit ilanları');

/* =============================================================
   SUB_CATEGORIES PARENT SEEDS
   ============================================================= */

-- 01 Emlak & Kira
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','🏢',0,1,1),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','🏢',0,1,2),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','🌿',0,1,3),
  ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','🏡',0,1,4),
  ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','🏪',0,1,5);

-- 02 Arac & Motosiklet
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000002','🚗',0,1,1),
  ('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000002','🚛',0,1,2),
  ('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000002','🚜',0,1,3),
  ('20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000002','🏍️',0,1,4),
  ('20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000002','⚙️',0,1,5);

-- 03 2. El Esya
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000003','🪑',1,1,1),
  ('20000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000003','🫧',1,1,2),
  ('20000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000003','🍳',1,1,3),
  ('20000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000003','📚',1,1,4),
  ('20000000-0000-4000-8000-000000000025','10000000-0000-4000-8000-000000000003','📦',1,1,5);

-- 04 Kaman Cevizi
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000031','10000000-0000-4000-8000-000000000004','🌰',1,1,1),
  ('20000000-0000-4000-8000-000000000032','10000000-0000-4000-8000-000000000004','🌰',1,1,2),
  ('20000000-0000-4000-8000-000000000033','10000000-0000-4000-8000-000000000004','🌱',1,1,3),
  ('20000000-0000-4000-8000-000000000034','10000000-0000-4000-8000-000000000004','🫙',1,1,4),
  ('20000000-0000-4000-8000-000000000035','10000000-0000-4000-8000-000000000004','✨',1,1,5);

-- 05 Hayvan & Tarim
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000041','10000000-0000-4000-8000-000000000005','🐄',0,1,1),
  ('20000000-0000-4000-8000-000000000042','10000000-0000-4000-8000-000000000005','🐑',0,1,2),
  ('20000000-0000-4000-8000-000000000043','10000000-0000-4000-8000-000000000005','🍯',1,1,3),
  ('20000000-0000-4000-8000-000000000044','10000000-0000-4000-8000-000000000005','💊',1,1,4),
  ('20000000-0000-4000-8000-000000000045','10000000-0000-4000-8000-000000000005','⚙️',1,1,5);

-- 06 Is Ilanlari
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000051','10000000-0000-4000-8000-000000000006','💼',0,1,1),
  ('20000000-0000-4000-8000-000000000052','10000000-0000-4000-8000-000000000006','🕐',0,1,2),
  ('20000000-0000-4000-8000-000000000053','10000000-0000-4000-8000-000000000006','🧑‍💻',0,1,3),
  ('20000000-0000-4000-8000-000000000054','10000000-0000-4000-8000-000000000006','🎓',0,1,4),
  ('20000000-0000-4000-8000-000000000055','10000000-0000-4000-8000-000000000006','👷',0,1,5);

-- 07 Sut & Yogurt
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000061','10000000-0000-4000-8000-000000000007','🥛',1,1,1),
  ('20000000-0000-4000-8000-000000000062','10000000-0000-4000-8000-000000000007','🫙',1,1,2),
  ('20000000-0000-4000-8000-000000000063','10000000-0000-4000-8000-000000000007','🧈',1,1,3),
  ('20000000-0000-4000-8000-000000000064','10000000-0000-4000-8000-000000000007','🧀',1,1,4),
  ('20000000-0000-4000-8000-000000000065','10000000-0000-4000-8000-000000000007','🥤',1,1,5);

-- 08 Meyve & Sebze
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000071','10000000-0000-4000-8000-000000000008','🍎',1,1,1),
  ('20000000-0000-4000-8000-000000000072','10000000-0000-4000-8000-000000000008','🥬',1,1,2),
  ('20000000-0000-4000-8000-000000000073','10000000-0000-4000-8000-000000000008','🌿',1,1,3),
  ('20000000-0000-4000-8000-000000000074','10000000-0000-4000-8000-000000000008','🫙',1,1,4),
  ('20000000-0000-4000-8000-000000000075','10000000-0000-4000-8000-000000000008','🫙',1,1,5);

-- 09 Hububat & Bakliyat
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000081','10000000-0000-4000-8000-000000000009','🌾',1,1,1),
  ('20000000-0000-4000-8000-000000000082','10000000-0000-4000-8000-000000000009','🌾',1,1,2),
  ('20000000-0000-4000-8000-000000000083','10000000-0000-4000-8000-000000000009','🫘',1,1,3),
  ('20000000-0000-4000-8000-000000000084','10000000-0000-4000-8000-000000000009','🫘',1,1,4),
  ('20000000-0000-4000-8000-000000000085','10000000-0000-4000-8000-000000000009','🌽',1,1,5);

-- 10 Genel Satis
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000091','10000000-0000-4000-8000-000000000010','🎮',1,1,1),
  ('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000010','⚽',1,1,2),
  ('20000000-0000-4000-8000-000000000093','10000000-0000-4000-8000-000000000010','🧸',1,1,3),
  ('20000000-0000-4000-8000-000000000094','10000000-0000-4000-8000-000000000010','🪡',1,1,4),
  ('20000000-0000-4000-8000-000000000095','10000000-0000-4000-8000-000000000010','📦',1,1,5);

-- 11 Giyim & Tekstil
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000011','👗',1,1,1),
  ('20000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000011','👔',1,1,2),
  ('20000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000011','🧒',1,1,3),
  ('20000000-0000-4000-8000-000000000104','10000000-0000-4000-8000-000000000011','👟',1,1,4),
  ('20000000-0000-4000-8000-000000000105','10000000-0000-4000-8000-000000000011','🧵',1,1,5);

-- 12 Elektronik
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000111','10000000-0000-4000-8000-000000000012','📱',1,1,1),
  ('20000000-0000-4000-8000-000000000112','10000000-0000-4000-8000-000000000012','💻',1,1,2),
  ('20000000-0000-4000-8000-000000000113','10000000-0000-4000-8000-000000000012','📺',1,1,3),
  ('20000000-0000-4000-8000-000000000114','10000000-0000-4000-8000-000000000012','🔌',1,1,4),
  ('20000000-0000-4000-8000-000000000115','10000000-0000-4000-8000-000000000012','⚡',1,1,5);

-- 13 Usta & Hizmet
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000121','10000000-0000-4000-8000-000000000013','⚡',0,1,1),
  ('20000000-0000-4000-8000-000000000122','10000000-0000-4000-8000-000000000013','🔧',0,1,2),
  ('20000000-0000-4000-8000-000000000123','10000000-0000-4000-8000-000000000013','🖌️',0,1,3),
  ('20000000-0000-4000-8000-000000000124','10000000-0000-4000-8000-000000000013','🚚',0,1,4),
  ('20000000-0000-4000-8000-000000000125','10000000-0000-4000-8000-000000000013','🧹',0,1,5);

-- 14 Arac Gerec
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000131','10000000-0000-4000-8000-000000000014','🔨',1,1,1),
  ('20000000-0000-4000-8000-000000000132','10000000-0000-4000-8000-000000000014','⚙️',1,1,2),
  ('20000000-0000-4000-8000-000000000133','10000000-0000-4000-8000-000000000014','🏗️',1,1,3),
  ('20000000-0000-4000-8000-000000000134','10000000-0000-4000-8000-000000000014','🔩',1,1,4);

-- 15 Kiralik Isyeri
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000141','10000000-0000-4000-8000-000000000015','🏪',0,1,1),
  ('20000000-0000-4000-8000-000000000142','10000000-0000-4000-8000-000000000015','🏭',0,1,2),
  ('20000000-0000-4000-8000-000000000143','10000000-0000-4000-8000-000000000015','🏢',0,1,3),
  ('20000000-0000-4000-8000-000000000144','10000000-0000-4000-8000-000000000015','🌾',0,1,4);

-- 16 Kümes Hayvanları
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000151','10000000-0000-4000-8000-000000000016','🐔',1,1,1),
  ('20000000-0000-4000-8000-000000000152','10000000-0000-4000-8000-000000000016','🦃',1,1,2),
  ('20000000-0000-4000-8000-000000000153','10000000-0000-4000-8000-000000000016','🦢',1,1,3),
  ('20000000-0000-4000-8000-000000000154','10000000-0000-4000-8000-000000000016','🐣',1,1,4);

-- 17 Arsa & Tarla
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000161','10000000-0000-4000-8000-000000000017','🌾',0,1,1),
  ('20000000-0000-4000-8000-000000000162','10000000-0000-4000-8000-000000000017','🍇',0,1,2),
  ('20000000-0000-4000-8000-000000000163','10000000-0000-4000-8000-000000000017','📍',0,1,3),
  ('20000000-0000-4000-8000-000000000164','10000000-0000-4000-8000-000000000017','🌿',0,1,4);

-- 18 Cenaze Ilanlari
INSERT INTO `sub_categories` (`id`,`category_id`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000171','10000000-0000-4000-8000-000000000018','🕊️',0,1,1),
  ('20000000-0000-4000-8000-000000000172','10000000-0000-4000-8000-000000000018','🕌',0,1,2);

/* =============================================================
   SUB_CATEGORY_I18N SEEDS (locale='tr')
   ============================================================= */

-- 01 Emlak & Kira
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000001','tr','Satılık Daire','satilik-daire'),
(UUID(),'20000000-0000-4000-8000-000000000002','tr','Kiralık Daire','kiralik-daire'),
(UUID(),'20000000-0000-4000-8000-000000000003','tr','Satılık Arsa','satilik-arsa'),
(UUID(),'20000000-0000-4000-8000-000000000004','tr','Köy Evi & Bağ','koy-evi-bag'),
(UUID(),'20000000-0000-4000-8000-000000000005','tr','İşyeri & Dükkan','isyeri-dukkan');

-- 02 Arac & Motosiklet
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000011','tr','Otomobil','otomobil'),
(UUID(),'20000000-0000-4000-8000-000000000012','tr','Kamyon & Kamyonet','kamyon-kamyonet'),
(UUID(),'20000000-0000-4000-8000-000000000013','tr','Traktör','traktor'),
(UUID(),'20000000-0000-4000-8000-000000000014','tr','Motosiklet','motosiklet'),
(UUID(),'20000000-0000-4000-8000-000000000015','tr','İş Makinası','is-makinasi');

-- 03 2. El Esya
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000021','tr','Mobilya & Ev Eşyası','mobilya'),
(UUID(),'20000000-0000-4000-8000-000000000022','tr','Beyaz Eşya','beyaz-esya'),
(UUID(),'20000000-0000-4000-8000-000000000023','tr','Mutfak Gereçleri','mutfak-gerecleri'),
(UUID(),'20000000-0000-4000-8000-000000000024','tr','Kitap & Kırtasiye','kitap-kirtasiye'),
(UUID(),'20000000-0000-4000-8000-000000000025','tr','Diğer Eşyalar','diger-esya');

-- 04 Kaman Cevizi
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000031','tr','İç Ceviz','ic-ceviz'),
(UUID(),'20000000-0000-4000-8000-000000000032','tr','Kabuklu Ceviz','kabuklu-ceviz'),
(UUID(),'20000000-0000-4000-8000-000000000033','tr','Ceviz Fidanı','ceviz-fidani'),
(UUID(),'20000000-0000-4000-8000-000000000034','tr','Ceviz Yağı & Ürünleri','ceviz-yagi'),
(UUID(),'20000000-0000-4000-8000-000000000035','tr','Kavaf Cevizi','kavaf-cevizi');

-- 05 Hayvan & Tarim
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000041','tr','Büyükbaş','buyukbas'),
(UUID(),'20000000-0000-4000-8000-000000000042','tr','Küçükbaş','kucukbas'),
(UUID(),'20000000-0000-4000-8000-000000000043','tr','Arı & Bal','ari-bal'),
(UUID(),'20000000-0000-4000-8000-000000000044','tr','Gübre & İlaç','gubre-ilac'),
(UUID(),'20000000-0000-4000-8000-000000000045','tr','Tarım Ekipmanı','tarim-ekipmani');

-- 06 Is Ilanlari
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000051','tr','Tam Zamanlı','tam-zamanli'),
(UUID(),'20000000-0000-4000-8000-000000000052','tr','Yarı Zamanlı','yari-zamanli'),
(UUID(),'20000000-0000-4000-8000-000000000053','tr','Serbest Çalışma','serbest'),
(UUID(),'20000000-0000-4000-8000-000000000054','tr','Staj','staj'),
(UUID(),'20000000-0000-4000-8000-000000000055','tr','Vasıfsız Eleman','vasifsiz');

-- 07 Sut & Yogurt
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000061','tr','Taze Süt','taze-sut'),
(UUID(),'20000000-0000-4000-8000-000000000062','tr','Yoğurt','yogurt'),
(UUID(),'20000000-0000-4000-8000-000000000063','tr','Tereyağı','tereyagi'),
(UUID(),'20000000-0000-4000-8000-000000000064','tr','Peynir','peynir'),
(UUID(),'20000000-0000-4000-8000-000000000065','tr','Ayran & Kefir','ayran-kefir');

-- 08 Meyve & Sebze
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000071','tr','Meyve','meyve'),
(UUID(),'20000000-0000-4000-8000-000000000072','tr','Sebze','sebze'),
(UUID(),'20000000-0000-4000-8000-000000000073','tr','Organik Ürünler','organik'),
(UUID(),'20000000-0000-4000-8000-000000000074','tr','Kurutulmuş Gıdalar','kurutulmus'),
(UUID(),'20000000-0000-4000-8000-000000000075','tr','Turşu & Konserve','tursu-konserve');

-- 09 Hububat & Bakliyat
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000081','tr','Buğday & Un','bugday-un'),
(UUID(),'20000000-0000-4000-8000-000000000082','tr','Arpa & Yulaf','arpa-yulaf'),
(UUID(),'20000000-0000-4000-8000-000000000083','tr','Nohut & Mercimek','nohut-mercimek'),
(UUID(),'20000000-0000-4000-8000-000000000084','tr','Fasulye & Bakla','fasulye-bakla'),
(UUID(),'20000000-0000-4000-8000-000000000085','tr','Mısır & Pirinç','misir-pirinc');

-- 10 Genel Satis
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000091','tr','Oyuncak & Hobi','oyuncak-hobi'),
(UUID(),'20000000-0000-4000-8000-000000000010','tr','Spor & Outdoor','spor-outdoor'),
(UUID(),'20000000-0000-4000-8000-000000000093','tr','Bebek & Çocuk','bebek-cocuk'),
(UUID(),'20000000-0000-4000-8000-000000000094','tr','El Yapımı Ürünler','el-yapimi'),
(UUID(),'20000000-0000-4000-8000-000000000095','tr','Diğer','diger-satis');

-- 11 Giyim & Tekstil
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000101','tr','Kadın Giyim','kadin-giyim'),
(UUID(),'20000000-0000-4000-8000-000000000102','tr','Erkek Giyim','erkek-giyim'),
(UUID(),'20000000-0000-4000-8000-000000000103','tr','Çocuk Giyim','cocuk-giyim'),
(UUID(),'20000000-0000-4000-8000-000000000104','tr','Ayakkabı & Çanta','ayakkabi-canta'),
(UUID(),'20000000-0000-4000-8000-000000000105','tr','Tekstil & Kumaş','tekstil-kumas');

-- 12 Elektronik
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000111','tr','Telefon & Tablet','telefon-tablet'),
(UUID(),'20000000-0000-4000-8000-000000000112','tr','Laptop & Bilgisayar','laptop-pc'),
(UUID(),'20000000-0000-4000-8000-000000000113','tr','TV & Ses Sistemi','tv-ses'),
(UUID(),'20000000-0000-4000-8000-000000000114','tr','Elektrikli Alet','elektrikli-alet'),
(UUID(),'20000000-0000-4000-8000-000000000115','tr','Diğer Elektronik','diger-elektronik');

-- 13 Usta & Hizmet
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000121','tr','Elektrikçi','elektrikci'),
(UUID(),'20000000-0000-4000-8000-000000000122','tr','Tesisatçı & Su','tesisatci'),
(UUID(),'20000000-0000-4000-8000-000000000123','tr','Boyacı & Tadilat','boyaci-tadilat'),
(UUID(),'20000000-0000-4000-8000-000000000124','tr','Nakliye & Taşıma','nakliye'),
(UUID(),'20000000-0000-4000-8000-000000000125','tr','Temizlik','temizlik');

-- 14 Arac Gerec
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000131','tr','El Aletleri','el-aletleri'),
(UUID(),'20000000-0000-4000-8000-000000000132','tr','Tarım Aletleri','tarim-aletleri'),
(UUID(),'20000000-0000-4000-8000-000000000133','tr','Yapı & İnşaat','yapi-insaat'),
(UUID(),'20000000-0000-4000-8000-000000000134','tr','Yedek Parça','yedek-parca');

-- 15 Kiralik Isyeri
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000141','tr','Dükkan & Mağaza','dukkan-magaza'),
(UUID(),'20000000-0000-4000-8000-000000000142','tr','Depo & Antrepo','depo-antrepo'),
(UUID(),'20000000-0000-4000-8000-000000000143','tr','Ofis','ofis'),
(UUID(),'20000000-0000-4000-8000-000000000144','tr','Arazi & Çiftlik','arazi-ciftlik');

-- 16 Kümes Hayvanları
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000151','tr','Tavuk & Yumurta','tavuk-yumurta'),
(UUID(),'20000000-0000-4000-8000-000000000152','tr','Hindi','hindi'),
(UUID(),'20000000-0000-4000-8000-000000000153','tr','Kaz & Ördek','kaz-ordek'),
(UUID(),'20000000-0000-4000-8000-000000000154','tr','Civciv & Piliç','civciv');

-- 17 Arsa & Tarla
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000161','tr','Tarla','tarla'),
(UUID(),'20000000-0000-4000-8000-000000000162','tr','Bağ & Bahçe','bag-bahce'),
(UUID(),'20000000-0000-4000-8000-000000000163','tr','Arsa','arsa'),
(UUID(),'20000000-0000-4000-8000-000000000164','tr','Mera & Çayır','mera-cayir');

-- 18 Cenaze Ilanlari
INSERT INTO `sub_category_i18n` (`id`,`sub_category_id`,`locale`,`name`,`slug`) VALUES
(UUID(),'20000000-0000-4000-8000-000000000171','tr','Vefat Duyurusu','vefat-duyurusu'),
(UUID(),'20000000-0000-4000-8000-000000000172','tr','Kırkı & Mevlit','kirki-mevlit');

-- =============================================================
-- SYNC: i18n → parent (backward-compat: name/slug/description)
-- =============================================================
UPDATE `categories` c
  JOIN `category_i18n` ci ON ci.category_id = c.id AND ci.locale = 'tr'
  SET c.name = ci.name, c.slug = ci.slug, c.description = ci.description;

UPDATE `sub_categories` sc
  JOIN `sub_category_i18n` sci ON sci.sub_category_id = sc.id AND sci.locale = 'tr'
  SET sc.name = sci.name, sc.slug = sci.slug, sc.description = sci.description;

SET FOREIGN_KEY_CHECKS = 1;
