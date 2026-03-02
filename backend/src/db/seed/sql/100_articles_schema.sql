-- ============================================================
-- FILE: 100_articles_schema.sql
-- Kendi haberlerimiz – articles tablosu
-- ============================================================

CREATE TABLE IF NOT EXISTS `articles` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid`             CHAR(36)     NOT NULL,
  `locale`           VARCHAR(10)  NOT NULL DEFAULT 'tr',

  `title`            VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(255) NOT NULL,
  `excerpt`          VARCHAR(500)     NULL,
  `content`          LONGTEXT         NULL,

  -- gundem | spor | ekonomi | teknoloji | kultur | saglik | dunya | yerel | genel
  `category`         VARCHAR(100) NOT NULL DEFAULT 'genel',

  -- Kapak görseli
  `cover_image_url`  VARCHAR(500)     NULL,
  `cover_asset_id`   CHAR(36)         NULL,
  `alt`              VARCHAR(255)     NULL,

  -- Video içerik
  `video_url`        VARCHAR(500)     NULL,

  -- Yazar / kaynak
  `author`           VARCHAR(255)     NULL,
  `source`           VARCHAR(255)     NULL,
  `source_url`       VARCHAR(500)     NULL,

  -- Etiketler (virgülle ayrılmış)
  `tags`             VARCHAR(500)     NULL,

  -- Okuma süresi (dakika)
  `reading_time`     INT UNSIGNED     NULL DEFAULT 0,

  -- SEO
  `meta_title`       VARCHAR(255)     NULL,
  `meta_description` VARCHAR(500)     NULL,

  `is_published`     TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `is_featured`      TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `display_order`    INT UNSIGNED        NOT NULL DEFAULT 0,

  `published_at`     DATETIME(3)      NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_art_uuid`         (`uuid`),
  UNIQUE KEY `uniq_art_slug_locale`  (`slug`, `locale`),
  KEY `idx_art_locale`               (`locale`),
  KEY `idx_art_category`             (`category`),
  KEY `idx_art_published`            (`is_published`),
  KEY `idx_art_featured`             (`is_featured`),
  KEY `idx_art_pub_at`               (`published_at`),
  KEY `idx_art_cover_asset`          (`cover_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Örnek veriler
-- ============================================================

INSERT IGNORE INTO `articles`
  (`uuid`, `locale`, `title`, `slug`, `excerpt`, `content`, `category`,
   `author`, `tags`, `reading_time`,
   `meta_title`, `meta_description`,
   `is_published`, `is_featured`, `display_order`, `published_at`)
VALUES
  (UUID(), 'tr',
   'Yapay Zeka Alanında Yeni Gelişmeler',
   'yapay-zeka-alaninda-yeni-gelismeler',
   'Yapay zeka teknolojisi her geçen gün daha da gelişiyor. İşte son haberler...',
   '<p>Yapay zeka alanında önemli gelişmeler yaşanmaya devam ediyor. Araştırmacılar yeni modeller geliştirirken şirketler de bu teknolojileri ürünlerine entegre etmektedir.</p>',
   'teknoloji',
   'Redaksiyon', 'yapay zeka, teknoloji, ai', 3,
   'Yapay Zeka Haberleri | Teknoloji',
   'Yapay zeka alanındaki son gelişmeleri takip edin.',
   1, 1, 1, NOW(3)),

  (UUID(), 'tr',
   'Ekonomide Son Durum: Piyasalar Ne Yönde?',
   'ekonomide-son-durum-piyasalar-ne-yonde',
   'Global piyasalarda hareketli bir dönem yaşanıyor. Uzmanlar görüşlerini paylaşıyor...',
   '<p>Küresel ekonomide önemli gelişmeler yaşanıyor. Merkez bankaları faiz kararlarını açıklarken piyasalar bu gelişmelere hassas tepkiler veriyor.</p>',
   'ekonomi',
   'Ekonomi Masası', 'ekonomi, piyasa, borsa', 4,
   'Ekonomi Haberleri | Piyasalar',
   'Güncel ekonomi ve piyasa haberlerini takip edin.',
   1, 0, 2, NOW(3)),

  (UUID(), 'tr',
   'Spor Dünyasından Önemli Gelişmeler',
   'spor-dunyasindan-onemli-gelismeler',
   'Bu haftanın spor gündemi oldukça hareketli geçti. İşte tüm sonuçlar...',
   '<p>Futbol, basketbol ve diğer spor dallarında heyecanlı gelişmeler yaşandı. Ligler devam ederken milli takımlar da önemli maçlara hazırlanıyor.</p>',
   'spor',
   'Spor Servisi', 'spor, futbol, basketbol', 2,
   'Spor Haberleri | Güncel Sonuçlar',
   'Spor dünyasındaki son gelişmeleri kaçırmayın.',
   1, 0, 3, NOW(3)),

  (UUID(), 'tr',
   'Sağlık Haberleri: Uzmanlardan Önemli Uyarılar',
   'saglik-haberleri-uzmanlardan-onemli-uyarilar',
   'Sağlık uzmanları mevsim geçişlerinde dikkat edilmesi gereken konulara vurgu yaptı...',
   '<p>Sağlık uzmanları, mevsim değişimlerinde bağışıklık sistemini güçlü tutmak için önerilerde bulundu. Düzenli egzersiz ve dengeli beslenme ön plana çıkıyor.</p>',
   'saglik',
   'Sağlık Editörü', 'sağlık, wellness, beslenme', 5,
   'Sağlık Haberleri | Uzman Görüşleri',
   'Sağlıklı yaşam için uzman önerilerini inceleyin.',
   1, 0, 4, NOW(3));
