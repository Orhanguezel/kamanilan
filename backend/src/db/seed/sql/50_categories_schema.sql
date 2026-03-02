/* ============================================================
   50_categories_schema.sql
   Kaman İlan — Kategoriler & Alt Kategoriler
   ============================================================ */

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

/* ── categories ─────────────────────────────────────────── */
DROP TABLE IF EXISTS `sub_categories`;
DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id`               CHAR(36)     NOT NULL,
  `name`             VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL,
  `description`      TEXT,
  `image_url`        LONGTEXT,
  `storage_asset_id` CHAR(36),
  `alt`              VARCHAR(255),
  `icon`             VARCHAR(100),
  `has_cart`         TINYINT(1)   NOT NULL DEFAULT 1,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1)   NOT NULL DEFAULT 0,
  `is_unlimited`     TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order`    INT          NOT NULL DEFAULT 0,
  `whatsapp_number`  VARCHAR(50),
  `phone_number`     VARCHAR(50),
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_uq` (`slug`),
  KEY `categories_active_idx` (`is_active`),
  KEY `categories_order_idx` (`display_order`),
  KEY `categories_storage_asset_idx` (`storage_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ── sub_categories ─────────────────────────────────────── */
CREATE TABLE `sub_categories` (
  `id`               CHAR(36)     NOT NULL,
  `category_id`      CHAR(36)     NOT NULL,
  `name`             VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL,
  `description`      TEXT,
  `image_url`        LONGTEXT,
  `storage_asset_id` CHAR(36),
  `alt`              VARCHAR(255),
  `icon`             VARCHAR(100),
  `has_cart`         TINYINT(1)   NOT NULL DEFAULT 1,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1)   NOT NULL DEFAULT 0,
  `display_order`    INT          NOT NULL DEFAULT 0,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_categories_parent_slug_uq` (`category_id`, `slug`),
  KEY `sub_categories_category_id_idx` (`category_id`),
  KEY `sub_categories_active_idx` (`is_active`),
  KEY `sub_categories_order_idx` (`display_order`),
  KEY `sub_categories_storage_asset_idx` (`storage_asset_id`),
  CONSTRAINT `fk_sub_categories_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ============================================================
   KATEGORILER (18 adet)
   image_url → Unsplash CDN (seed için; admin panelden değiştirilebilir)
   icon      → emoji (resim yüklenemezse fallback olarak kullanılır)
   ============================================================ */
-- Kolon listesi: id, name, slug, description, image_url, alt, icon,
--   has_cart, is_active, is_featured, is_unlimited, display_order,
--   whatsapp_number, phone_number
INSERT INTO `categories`
  (`id`, `name`, `slug`, `description`, `image_url`, `alt`, `icon`,
   `has_cart`, `is_active`, `is_featured`, `is_unlimited`, `display_order`,
   `whatsapp_number`, `phone_number`)
VALUES
  ('10000000-0000-4000-8000-000000000001','Emlak & Kira','emlak-kira',
   'Satılık ve kiralık konut, villa, arsa, bağ evi',
   'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80',
   'Satılık ve kiralık konut ilanları','🏠', 0,1,1,0,1, NULL,NULL),
  ('10000000-0000-4000-8000-000000000002','Araç & Motosiklet','arac-motosiklet',
   'Otomobil, kamyonet, traktör, motosiklet, iş makinası',
   'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop&auto=format&q=80',
   'Araç ve motosiklet ilanları','🚗', 0,1,1,0,2, NULL,NULL),
  ('10000000-0000-4000-8000-000000000003','2. El Eşya','ikinci-el',
   'Mobilya, beyaz eşya, mutfak gereçleri, kitap ve daha fazlası',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format&q=80',
   'İkinci el eşya ilanları','📦', 1,1,1,0,3, NULL,NULL),
  ('10000000-0000-4000-8000-000000000004','Kaman Cevizi','kaman-cevizi',
   'Türkiye''nin en lezzetli ceviziyle üreticiden alışveriş',
   'https://images.unsplash.com/photo-1508349249800-277c55b8e86d?w=400&h=300&fit=crop&auto=format&q=80',
   'Kaman cevizi üreticiden taze','🌰', 1,1,1,0,4, NULL,NULL),
  ('10000000-0000-4000-8000-000000000005','Hayvan & Tarım','hayvan-tarim',
   'Büyükbaş, küçükbaş, arı balı, tarım ekipmanı ve ürünleri',
   'https://images.unsplash.com/photo-1500595046743-cd271d694d30?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
   'Tarım ve hayvan ilanları','🐄', 0,1,1,0,5, NULL,NULL),
  ('10000000-0000-4000-8000-000000000006','İş İlanları','is-ilanlari',
   'Kaman ve çevresindeki tam zamanlı, part-time, serbest işler',
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&auto=format&q=80',
   'Kaman bölgesi iş ilanları','💼', 0,1,1,0,6, NULL,NULL),
  ('10000000-0000-4000-8000-000000000007','Süt & Yoğurt','sut-yogurt',
   'Taze süt, yoğurt, tereyağı, peynir, ayran ve kefir',
   'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format&q=80',
   'Taze süt ve süt ürünleri ilanları','🥛', 1,1,0,0,7, NULL,NULL),
  ('10000000-0000-4000-8000-000000000008','Meyve & Sebze','meyve-sebze',
   'Taze meyve, sebze, organik ürünler, kurutulmuş gıdalar',
   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format&q=80',
   'Taze meyve ve sebze ilanları','🍎', 1,1,0,0,8, NULL,NULL),
  ('10000000-0000-4000-8000-000000000009','Hububat & Bakliyat','hububat-bakliyat',
   'Buğday, arpa, nohut, mercimek, fasulye, mısır',
   'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop&auto=format&q=80',
   'Hububat ve bakliyat ilanları','🌾', 1,1,0,0,9, NULL,NULL),
  ('10000000-0000-4000-8000-000000000010','Genel Satış','genel-satis',
   'Oyuncak, spor, hobi, bebek ürünleri ve el yapımı eşyalar',
   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&auto=format&q=80',
   'Genel satış ilanları','🛒', 1,1,0,0,10, NULL,NULL),
  ('10000000-0000-4000-8000-000000000011','Giyim & Tekstil','giyim-tekstil',
   'Kadın, erkek, çocuk giyim, ayakkabı, aksesuar ve kumaş',
   'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&auto=format&q=80',
   'Giyim ve tekstil ilanları','👗', 1,1,0,0,11, NULL,NULL),
  ('10000000-0000-4000-8000-000000000012','Elektronik','elektronik',
   'Telefon, tablet, laptop, TV, ses sistemi ve elektrikli aletler',
   'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format&q=80',
   'Elektronik ürün ilanları','📱', 1,1,0,0,12, NULL,NULL),
  ('10000000-0000-4000-8000-000000000013','Usta & Hizmet','usta-hizmet',
   'Elektrikçi, tesisatçı, boyacı, nakliye ve temizlik hizmetleri',
   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&auto=format&q=80',
   'Usta ve hizmet ilanları','🛠️', 0,1,0,0,13, NULL,NULL),
  ('10000000-0000-4000-8000-000000000014','Araç Gereç','arac-gerec',
   'El aletleri, tarım aletleri, yapı malzeme, yedek parça',
   'https://images.unsplash.com/photo-1416664806563-884af9c2a3d4?w=400&h=300&fit=crop&auto=format&q=80',
   'Araç gereç ve alet ilanları','🔧', 1,1,0,0,14, NULL,NULL),
  ('10000000-0000-4000-8000-000000000015','Kiralık İşyeri','kiralik-isyeri',
   'Dükkan, depo, ofis ve arazi kiralama ilanları',
   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format&q=80',
   'Kiralık işyeri ilanları','🏢', 0,1,0,0,15, NULL,NULL),
  ('10000000-0000-4000-8000-000000000016','Kümes Hayvanları','kumes-hayvanlari',
   'Tavuk, hindi, kaz, ördek, civciv ve yumurta ilanları',
   'https://images.unsplash.com/photo-1548550023-2cdb937e3b2d?w=400&h=300&fit=crop&auto=format&q=80',
   'Kümes hayvanları ilanları','🐔', 1,1,0,0,16, NULL,NULL),
  ('10000000-0000-4000-8000-000000000017','Arsa & Tarla','arsa-tarla',
   'Satılık tarla, bağ, bahçe, arsa ve mera ilanları',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format&q=80',
   'Arsa ve tarla ilanları','🛖', 0,1,0,0,17, NULL,NULL),
  -- Cenaze İlanları: is_unlimited=1 (abonelik/limit gerektirmez)
  ('10000000-0000-4000-8000-000000000018','Cenaze İlanları','cenaze',
   'Vefat duyuruları ve kırkı-mevlit ilanları',
   NULL, NULL,'🕊️', 0,1,0,1,18, NULL,NULL);

/* ============================================================
   ALT KATEGORİLER
   ============================================================ */

-- 01 Emlak & Kira
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Satılık Daire',    'satilik-daire',   '🏢',0,1,1),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Kiralık Daire',    'kiralik-daire',   '🏢',0,1,2),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Satılık Arsa',     'satilik-arsa',    '🌿',0,1,3),
  ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','Köy Evi & Bağ',   'koy-evi-bag',     '🏡',0,1,4),
  ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','İşyeri & Dükkan',  'isyeri-dukkan',   '🏪',0,1,5);

-- 02 Araç & Motosiklet
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000002','Otomobil',         'otomobil',         '🚗',0,1,1),
  ('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000002','Kamyon & Kamyonet','kamyon-kamyonet',  '🚛',0,1,2),
  ('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000002','Traktör',          'traktor',          '🚜',0,1,3),
  ('20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000002','Motosiklet',       'motosiklet',       '🏍️',0,1,4),
  ('20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000002','İş Makinası',      'is-makinasi',      '⚙️',0,1,5);

-- 03 2. El Eşya
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000003','Mobilya & Ev Eşyası','mobilya',        '🪑',1,1,1),
  ('20000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000003','Beyaz Eşya',        'beyaz-esya',      '🫧',1,1,2),
  ('20000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000003','Mutfak Gereçleri',  'mutfak-gerecleri','🍳',1,1,3),
  ('20000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000003','Kitap & Kırtasiye', 'kitap-kirtasiye', '📚',1,1,4),
  ('20000000-0000-4000-8000-000000000025','10000000-0000-4000-8000-000000000003','Diğer Eşyalar',     'diger-esya',      '📦',1,1,5);

-- 04 Kaman Cevizi
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000031','10000000-0000-4000-8000-000000000004','İç Ceviz',         'ic-ceviz',        '🌰',1,1,1),
  ('20000000-0000-4000-8000-000000000032','10000000-0000-4000-8000-000000000004','Kabuklu Ceviz',    'kabuklu-ceviz',   '🌰',1,1,2),
  ('20000000-0000-4000-8000-000000000033','10000000-0000-4000-8000-000000000004','Ceviz Fidanı',     'ceviz-fidani',    '🌱',1,1,3),
  ('20000000-0000-4000-8000-000000000034','10000000-0000-4000-8000-000000000004','Ceviz Yağı & Ürünleri','ceviz-yagi',  '🫙',1,1,4),
  ('20000000-0000-4000-8000-000000000035','10000000-0000-4000-8000-000000000004','Kavaf Cevizi',     'kavaf-cevizi',    '✨',1,1,5);

-- 05 Hayvan & Tarım
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000041','10000000-0000-4000-8000-000000000005','Büyükbaş',          'buyukbas',        '🐄',0,1,1),
  ('20000000-0000-4000-8000-000000000042','10000000-0000-4000-8000-000000000005','Küçükbaş',          'kucukbas',        '🐑',0,1,2),
  ('20000000-0000-4000-8000-000000000043','10000000-0000-4000-8000-000000000005','Arı & Bal',         'ari-bal',         '🍯',1,1,3),
  ('20000000-0000-4000-8000-000000000044','10000000-0000-4000-8000-000000000005','Gübre & İlaç',      'gubre-ilac',      '💊',1,1,4),
  ('20000000-0000-4000-8000-000000000045','10000000-0000-4000-8000-000000000005','Tarım Ekipmanı',    'tarim-ekipmani',  '⚙️',1,1,5);

-- 06 İş İlanları
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000051','10000000-0000-4000-8000-000000000006','Tam Zamanlı',       'tam-zamanli',     '💼',0,1,1),
  ('20000000-0000-4000-8000-000000000052','10000000-0000-4000-8000-000000000006','Yarı Zamanlı',      'yari-zamanli',    '🕐',0,1,2),
  ('20000000-0000-4000-8000-000000000053','10000000-0000-4000-8000-000000000006','Serbest Çalışma',   'serbest',         '🧑‍💻',0,1,3),
  ('20000000-0000-4000-8000-000000000054','10000000-0000-4000-8000-000000000006','Staj',              'staj',            '🎓',0,1,4),
  ('20000000-0000-4000-8000-000000000055','10000000-0000-4000-8000-000000000006','Vasıfsız Eleman',   'vasifsiz',        '👷',0,1,5);

-- 07 Süt & Yoğurt
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000061','10000000-0000-4000-8000-000000000007','Taze Süt',          'taze-sut',        '🥛',1,1,1),
  ('20000000-0000-4000-8000-000000000062','10000000-0000-4000-8000-000000000007','Yoğurt',            'yogurt',          '🫙',1,1,2),
  ('20000000-0000-4000-8000-000000000063','10000000-0000-4000-8000-000000000007','Tereyağı',          'tereyagi',        '🧈',1,1,3),
  ('20000000-0000-4000-8000-000000000064','10000000-0000-4000-8000-000000000007','Peynir',            'peynir',          '🧀',1,1,4),
  ('20000000-0000-4000-8000-000000000065','10000000-0000-4000-8000-000000000007','Ayran & Kefir',     'ayran-kefir',     '🥤',1,1,5);

-- 08 Meyve & Sebze
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000071','10000000-0000-4000-8000-000000000008','Meyve',             'meyve',           '🍎',1,1,1),
  ('20000000-0000-4000-8000-000000000072','10000000-0000-4000-8000-000000000008','Sebze',             'sebze',           '🥬',1,1,2),
  ('20000000-0000-4000-8000-000000000073','10000000-0000-4000-8000-000000000008','Organik Ürünler',   'organik',         '🌿',1,1,3),
  ('20000000-0000-4000-8000-000000000074','10000000-0000-4000-8000-000000000008','Kurutulmuş Gıdalar','kurutulmus',      '🫙',1,1,4),
  ('20000000-0000-4000-8000-000000000075','10000000-0000-4000-8000-000000000008','Turşu & Konserve',  'tursu-konserve',  '🫙',1,1,5);

-- 09 Hububat & Bakliyat
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000081','10000000-0000-4000-8000-000000000009','Buğday & Un',       'bugday-un',       '🌾',1,1,1),
  ('20000000-0000-4000-8000-000000000082','10000000-0000-4000-8000-000000000009','Arpa & Yulaf',      'arpa-yulaf',      '🌾',1,1,2),
  ('20000000-0000-4000-8000-000000000083','10000000-0000-4000-8000-000000000009','Nohut & Mercimek',  'nohut-mercimek',  '🫘',1,1,3),
  ('20000000-0000-4000-8000-000000000084','10000000-0000-4000-8000-000000000009','Fasulye & Bakla',   'fasulye-bakla',   '🫘',1,1,4),
  ('20000000-0000-4000-8000-000000000085','10000000-0000-4000-8000-000000000009','Mısır & Pirinç',    'misir-pirinc',    '🌽',1,1,5);

-- 10 Genel Satış
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000091','10000000-0000-4000-8000-000000000010','Oyuncak & Hobi',    'oyuncak-hobi',    '🎮',1,1,1),
  ('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000010','Spor & Outdoor',    'spor-outdoor',    '⚽',1,1,2),
  ('20000000-0000-4000-8000-000000000093','10000000-0000-4000-8000-000000000010','Bebek & Çocuk',     'bebek-cocuk',     '🧸',1,1,3),
  ('20000000-0000-4000-8000-000000000094','10000000-0000-4000-8000-000000000010','El Yapımı Ürünler', 'el-yapimi',       '🪡',1,1,4),
  ('20000000-0000-4000-8000-000000000095','10000000-0000-4000-8000-000000000010','Diğer',             'diger-satis',     '📦',1,1,5);

-- 11 Giyim & Tekstil
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000011','Kadın Giyim',       'kadin-giyim',     '👗',1,1,1),
  ('20000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000011','Erkek Giyim',       'erkek-giyim',     '👔',1,1,2),
  ('20000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000011','Çocuk Giyim',       'cocuk-giyim',     '🧒',1,1,3),
  ('20000000-0000-4000-8000-000000000104','10000000-0000-4000-8000-000000000011','Ayakkabı & Çanta',  'ayakkabi-canta',  '👟',1,1,4),
  ('20000000-0000-4000-8000-000000000105','10000000-0000-4000-8000-000000000011','Tekstil & Kumaş',   'tekstil-kumas',   '🧵',1,1,5);

-- 12 Elektronik
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000111','10000000-0000-4000-8000-000000000012','Telefon & Tablet',  'telefon-tablet',  '📱',1,1,1),
  ('20000000-0000-4000-8000-000000000112','10000000-0000-4000-8000-000000000012','Laptop & Bilgisayar','laptop-pc',      '💻',1,1,2),
  ('20000000-0000-4000-8000-000000000113','10000000-0000-4000-8000-000000000012','TV & Ses Sistemi',  'tv-ses',          '📺',1,1,3),
  ('20000000-0000-4000-8000-000000000114','10000000-0000-4000-8000-000000000012','Elektrikli Alet',   'elektrikli-alet', '🔌',1,1,4),
  ('20000000-0000-4000-8000-000000000115','10000000-0000-4000-8000-000000000012','Diğer Elektronik',  'diger-elektronik','⚡',1,1,5);

-- 13 Usta & Hizmet
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000121','10000000-0000-4000-8000-000000000013','Elektrikçi',        'elektrikci',      '⚡',0,1,1),
  ('20000000-0000-4000-8000-000000000122','10000000-0000-4000-8000-000000000013','Tesisatçı & Su',    'tesisatci',       '🔧',0,1,2),
  ('20000000-0000-4000-8000-000000000123','10000000-0000-4000-8000-000000000013','Boyacı & Tadilat',  'boyaci-tadilat',  '🖌️',0,1,3),
  ('20000000-0000-4000-8000-000000000124','10000000-0000-4000-8000-000000000013','Nakliye & Taşıma',  'nakliye',         '🚚',0,1,4),
  ('20000000-0000-4000-8000-000000000125','10000000-0000-4000-8000-000000000013','Temizlik',          'temizlik',        '🧹',0,1,5);

-- 14 Araç Gereç
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000131','10000000-0000-4000-8000-000000000014','El Aletleri',       'el-aletleri',     '🔨',1,1,1),
  ('20000000-0000-4000-8000-000000000132','10000000-0000-4000-8000-000000000014','Tarım Aletleri',    'tarim-aletleri',  '⚙️',1,1,2),
  ('20000000-0000-4000-8000-000000000133','10000000-0000-4000-8000-000000000014','Yapı & İnşaat',     'yapi-insaat',     '🏗️',1,1,3),
  ('20000000-0000-4000-8000-000000000134','10000000-0000-4000-8000-000000000014','Yedek Parça',       'yedek-parca',     '🔩',1,1,4);

-- 15 Kiralık İşyeri
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000141','10000000-0000-4000-8000-000000000015','Dükkan & Mağaza',   'dukkan-magaza',   '🏪',0,1,1),
  ('20000000-0000-4000-8000-000000000142','10000000-0000-4000-8000-000000000015','Depo & Antrepo',    'depo-antrepo',    '🏭',0,1,2),
  ('20000000-0000-4000-8000-000000000143','10000000-0000-4000-8000-000000000015','Ofis',              'ofis',            '🏢',0,1,3),
  ('20000000-0000-4000-8000-000000000144','10000000-0000-4000-8000-000000000015','Arazi & Çiftlik',   'arazi-ciftlik',   '🌾',0,1,4);

-- 16 Kümes Hayvanları
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000151','10000000-0000-4000-8000-000000000016','Tavuk & Yumurta',   'tavuk-yumurta',   '🐔',1,1,1),
  ('20000000-0000-4000-8000-000000000152','10000000-0000-4000-8000-000000000016','Hindi',             'hindi',           '🦃',1,1,2),
  ('20000000-0000-4000-8000-000000000153','10000000-0000-4000-8000-000000000016','Kaz & Ördek',       'kaz-ordek',       '🦢',1,1,3),
  ('20000000-0000-4000-8000-000000000154','10000000-0000-4000-8000-000000000016','Civciv & Piliç',    'civciv',          '🐣',1,1,4);

-- 17 Arsa & Tarla
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000161','10000000-0000-4000-8000-000000000017','Tarla',             'tarla',           '🌾',0,1,1),
  ('20000000-0000-4000-8000-000000000162','10000000-0000-4000-8000-000000000017','Bağ & Bahçe',       'bag-bahce',       '🍇',0,1,2),
  ('20000000-0000-4000-8000-000000000163','10000000-0000-4000-8000-000000000017','Arsa',              'arsa',            '📍',0,1,3),
  ('20000000-0000-4000-8000-000000000164','10000000-0000-4000-8000-000000000017','Mera & Çayır',      'mera-cayir',      '🌿',0,1,4);

-- 18 Cenaze İlanları
INSERT INTO `sub_categories` (`id`,`category_id`,`name`,`slug`,`icon`,`has_cart`,`is_active`,`display_order`) VALUES
  ('20000000-0000-4000-8000-000000000171','10000000-0000-4000-8000-000000000018','Vefat Duyurusu',    'vefat-duyurusu',  '🕊️',0,1,1),
  ('20000000-0000-4000-8000-000000000172','10000000-0000-4000-8000-000000000018','Kırkı & Mevlit',    'kirki-mevlit',    '🕌',0,1,2);

SET FOREIGN_KEY_CHECKS = 1;
