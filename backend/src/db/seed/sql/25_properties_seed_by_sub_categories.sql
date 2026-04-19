-- =============================================================
-- FILE: 25_properties_seed_by_sub_categories.sql
-- Amaç: Her alt kategori (sub_categories) için en az 1 örnek resimli ilan
-- Not: Kolay okunabilir olması için açıklamalar sade tutuldu.
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

INSERT INTO `properties`
(
  `id`,
  `user_id`,
  `title`, `slug`,
  `status`,
  `category_id`, `sub_category_id`,
  `address`, `district`, `city`, `neighborhood`,
  `description`,
  `price`, `currency`,
  `listing_no`, `badge_text`, `featured`,
  `image_url`, `alt`,
  `display_order`, `is_active`,
  `created_at`, `updated_at`
)
VALUES
-- ─────────────────────────────────────────────────────────────
-- Emlak & Kira  sub kategorileri
-- category_id: 10000000-0000-4000-8000-000000000001
-- ─────────────────────────────────────────────────────────────
(
  '35000000-0000-4000-8000-000000000001',
  @SELLER_ID,
  'Kiralık 2+1 Daire - Merkezde', 'kiralik-2-1-daire-merkez-alt-kategori',
  'kiralik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000001',
  'Merkez Mah. Cumhuriyet Cad. No:5', 'Kaman', 'Kırşehir', 'Merkez',
  'Merkezde, asansörlü binada kiralık 2+1 daire.',
  18000.00, 'TRY',
  'KMN-EML-SC-0001', 'Alt Kategori Örnek', 1,
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Kiralık daire örnek ilan',
  401, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY), CURRENT_TIMESTAMP(3)
),
(
  '35000000-0000-4000-8000-000000000002',
  @SELLER_ID,
  'Satılık 3+1 Daire - Site İçinde', 'satilik-3-1-daire-site-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000002',
  'Site İçi Yolu No:12', 'Kaman', 'Kırşehir', 'Cumhuriyet',
  'Otopark ve çocuk parkı olan site içinde satılık geniş daire.',
  2950000.00, 'TRY',
  'KMN-EML-SC-0002', 'Site İçi', 1,
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık daire örnek ilan',
  402, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '35000000-0000-4000-8000-000000000003',
  @SELLER_ID,
  'Kiralık Müstakil Ev - Bahçeli', 'kiralik-mustakil-ev-bahceli-alt-kategori',
  'kiralik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000003',
  'Bağlar Mah. 8. Sokak', 'Kaman', 'Kırşehir', 'Bağlar',
  'Geniş bahçeli, müstakil kiralık aile evi.',
  22000.00, 'TRY',
  'KMN-EML-SC-0003', NULL, 0,
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Kiralık bahçeli ev',
  403, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 5 DAY), CURRENT_TIMESTAMP(3)
),
(
  '35000000-0000-4000-8000-000000000004',
  @SELLER_ID,
  'Satılık Arsa - Yola Cephe 600 m2', 'satilik-arsa-yola-cephe-600m2-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000004',
  'Cevizlik Mevkii', 'Kaman', 'Kırşehir', 'Yeniyapan',
  'Yola cephe, hafif eğimli verimli arsa.',
  960000.00, 'TRY',
  'KMN-EML-SC-0004', NULL, 0,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık arsa örneği',
  404, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 9 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '35000000-0000-4000-8000-000000000005',
  @SELLER_ID,
  'Kiralık Dükkan - Cadde Üzeri', 'kiralik-dukkan-cadde-uzeri-alt-kategori',
  'kiralik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000005',
  'Çarşı Cad. No:18', 'Kaman', 'Kırşehir', 'Çarşı',
  'Yaya trafiği yüksek konumda kiralık dükkan.',
  30000.00, 'TRY',
  'KMN-EML-SC-0005', 'Cadde Üzeri', 1,
  'https://images.unsplash.com/photo-1529424301806-4be0bb154e3b?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Kiralık dükkan örnek ilan',
  405, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), CURRENT_TIMESTAMP(3)
),
(
  '35000000-0000-4000-8000-000000000006',
  @SELLER_ID,
  'Satılık Villa - Havuzlu', 'satilik-villa-havuzlu-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000001', '51000001-0000-4000-8000-000000000006',
  'Yukarıbey Mah. 3. Sokak', 'Kaman', 'Kırşehir', 'Yukarıbey',
  'Özel havuzlu, geniş bahçeli lüks villa.',
  8250000.00, 'TRY',
  'KMN-EML-SC-0006', 'Lüks', 1,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık villa örnek ilan',
  406, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 10 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),

-- ─────────────────────────────────────────────────────────────
-- Araç & Motosiklet  sub kategorileri
-- category_id: 10000000-0000-4000-8000-000000000002
-- ─────────────────────────────────────────────────────────────
(
  '35000000-0000-4000-8000-000000000007',
  @SELLER_ID,
  'Satılık Otomobil - Dizel Manuel', 'satilik-otomobil-dizel-manuel-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000001',
  'Sanayi Sitesi A Blok', 'Kaman', 'Kırşehir', 'Sanayi',
  'Bakımlı, tramer kaydı düşük dizel otomobil.',
  785000.00, 'TRY',
  'KMN-VHC-SC-0001', 'Temiz', 1,
  'https://images.unsplash.com/photo-1542362567-b07e54358753?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık otomobil alt kategori ilanı',
  407, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '35000000-0000-4000-8000-000000000008',
  @CUSTOMER_ID,
  'Satılık Motosiklet - Şehir İçi Kullanım', 'satilik-motosiklet-sehir-ici-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000002',
  'Otogar Caddesi', 'Kaman', 'Kırşehir', 'Merkez',
  'Az kilometreli, şehir içi kullanıma uygun motosiklet.',
  135000.00, 'TRY',
  'KMN-VHC-SC-0002', NULL, 0,
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık motosiklet alt kategori ilanı',
  408, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 5 DAY), CURRENT_TIMESTAMP(3)
),
(
  '35000000-0000-4000-8000-000000000009',
  @SELLER_ID,
  'Satılık Traktör - Çift Çeker', 'satilik-traktor-cift-ceker-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000003',
  'Koy Garajı', 'Kaman', 'Kırşehir', 'Yukarıbey',
  'Tarla işlerine hazır, çift çeker traktör.',
  1480000.00, 'TRY',
  'KMN-VHC-SC-0003', NULL, 0,
  'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık traktör alt kategori ilanı',
  409, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 8 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '35000000-0000-4000-8000-000000000010',
  @SELLER_ID,
  'Satılık Kamyon - Uzun Şase', 'satilik-kamyon-uzun-sase-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000004',
  'Nakliyeciler Sitesi', 'Kaman', 'Kırşehir', 'Sanayi',
  'Nakliyeye uygun, bakımlı kamyon.',
  2150000.00, 'TRY',
  'KMN-VHC-SC-0004', 'Nakliyeye Uygun', 1,
  'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık kamyon alt kategori ilanı',
  410, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 11 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY)
),
(
  '35000000-0000-4000-8000-000000000011',
  @SELLER_ID,
  'Satılık Minibüs - Okul Taşıtı', 'satilik-minibus-okul-tasiti-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000005',
  'Okul Yolu Üzeri', 'Kaman', 'Kırşehir', 'Merkez',
  'Okul servisi olarak kullanılmış bakımlı minibüs.',
  685000.00, 'TRY',
  'KMN-VHC-SC-0005', NULL, 0,
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık minibüs alt kategori ilanı',
  411, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), CURRENT_TIMESTAMP(3)
),
(
  '35000000-0000-4000-8000-000000000012',
  @CUSTOMER_ID,
  'Dağ Bisikleti - 27 Vites', 'dag-bisikleti-27-vites-alt-kategori',
  'satilik',
  '10000000-0000-4000-8000-000000000002', '51000002-0000-4000-8000-000000000006',
  'Spor Sahası Yanı', 'Kaman', 'Kırşehir', 'Cumhuriyet',
  'Az kullanılmış, 27 vites dağ bisikleti.',
  12500.00, 'TRY',
  'KMN-VHC-SC-0006', 'Az Kullanılmış', 0,
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400',
  'Satılık bisiklet alt kategori ilanı',
  412, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
)

-- Not: 2. El Eşya, Kaman Cevizi, Hayvan & Tarım,
-- İş İlanları, Süt & Yoğurt, Meyve & Sebze,
-- Elektronik, Usta & Hizmet ve Arsa & Tarla
-- alt kategorileri için de aynı mantıkla en az birer
-- örnek ilan aşağıdaki bloklarda tanımlanmalıdır.
-- İhtiyaca göre bu dosya genişletilebilir.

ON DUPLICATE KEY UPDATE
  `user_id`         = VALUES(`user_id`),
  `title`           = VALUES(`title`),
  `slug`            = VALUES(`slug`),
  `status`          = VALUES(`status`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `address`         = VALUES(`address`),
  `district`        = VALUES(`district`),
  `city`            = VALUES(`city`),
  `neighborhood`    = VALUES(`neighborhood`),
  `description`     = VALUES(`description`),
  `price`           = VALUES(`price`),
  `currency`        = VALUES(`currency`),
  `listing_no`      = VALUES(`listing_no`),
  `badge_text`      = VALUES(`badge_text`),
  `featured`        = VALUES(`featured`),
  `image_url`       = VALUES(`image_url`),
  `alt`             = VALUES(`alt`),
  `display_order`   = VALUES(`display_order`),
  `is_active`       = VALUES(`is_active`),
  `updated_at`      = CURRENT_TIMESTAMP(3);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

