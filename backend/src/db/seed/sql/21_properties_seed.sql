-- =============================================================
-- FILE: 21_properties_seed.sql
-- Kaman İlan - general listing seed (category_id based)
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

INSERT INTO `properties`
(
  `id`,
  `user_id`,
  `title`, `slug`,
  `category_id`, `sub_category_id`,
  `status`,
  `address`, `district`, `city`, `neighborhood`,
  `description`,
  `price`, `currency`,
  `listing_no`, `badge_text`, `featured`,
  `image_url`, `alt`,
  `display_order`, `is_active`,
  `created_at`, `updated_at`
)
VALUES
(
  '31000000-0000-4000-8000-000000000001',
  @ADMIN_ID,
  'Satilik 3+1 Daire - Kaman Merkez', 'satilik-3-1-daire-kaman-merkez',
  '10000000-0000-4000-8000-000000000001', NULL,
  'satilik',
  'Yeni Mahalle Ataturk Cad. No:14', 'Kaman', 'Kırşehir', 'Merkez',
  'Kaman merkezde aileye uygun genis daire.',
  2350000.00, 'TRY',
  'KMN-EML-0001', 'One Cikan', 1,
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kaman merkez satilik daire',
  1, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 8 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '31000000-0000-4000-8000-000000000002',
  @SELLER_ID,
  '2020 Model Fiat Egea 1.4 - Temiz', '2020-fiat-egea-temiz',
  '10000000-0000-4000-8000-000000000002', NULL,
  'satilik',
  'Sanayi Sitesi 4. Blok', 'Kaman', 'Kırşehir', 'Sanayi',
  'Bakımlı, ekspertiz raporlu araç.',
  845000.00, 'TRY',
  'KMN-ARC-0002', 'Bakimli', 1,
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Satilik otomobil',
  2, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '31000000-0000-4000-8000-000000000003',
  @CUSTOMER_ID,
  'Ikinci El Kose Takimi - Temiz Kullanildi', 'ikinci-el-kose-takimi-temiz-kullanildi',
  '10000000-0000-4000-8000-000000000003', NULL,
  'satilik',
  'Bahceler Mahallesi 22. Sokak', 'Kaman', 'Kırşehir', 'Bahceler',
  'Lekesiz, deformesiz ikinci el kose takimi.',
  17500.00, 'TRY',
  'KMN-IKI-0003', NULL, 0,
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Ikinci el oturma grubu',
  3, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 5 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000004',
  @SELLER_ID,
  'Kabuklu Kaman Cevizi - Yeni Hasat 25 KG', 'kabuklu-kaman-cevizi-yeni-hasat-25kg',
  '10000000-0000-4000-8000-000000000004', NULL,
  'satilik',
  'Ceviz Uretici Birligi Deposu', 'Kaman', 'Kırşehir', 'Sofular',
  'Yeni sezon Kaman cevizi, dogrudan ureticiden.',
  4950.00, 'TRY',
  'KMN-CEV-0004', 'Yeni Hasat', 1,
  'https://images.unsplash.com/photo-1615485737651-10f6f5b9b5d4?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kabuklu ceviz',
  4, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 10 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '31000000-0000-4000-8000-000000000005',
  @SELLER_ID,
  'Satilik Simental Dana - Veteriner Kontrollu', 'satilik-simental-dana-veteriner-kontrollu',
  '10000000-0000-4000-8000-000000000005', NULL,
  'satilik',
  'Ciftlik Yolu 3. Km', 'Kaman', 'Kırşehir', 'Ciftlikler',
  'Asilari tam, kupe kaydi mevcut.',
  132000.00, 'TRY',
  'KMN-HYT-0005', 'Saglikli', 1,
  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80', 'Satılık büyükbaş hayvan',
  5, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '31000000-0000-4000-8000-000000000006',
  @ADMIN_ID,
  'Kasiyer Araniyor - Kaman Merkez Market', 'kasiyer-araniyor-kaman-merkez-market',
  '10000000-0000-4000-8000-000000000006', NULL,
  'acik',
  'Ataturk Cad. No:48', 'Kaman', 'Kırşehir', 'Merkez',
  'Deneyimli kasiyer arayisimiz vardir.',
  25000.00, 'TRY',
  'KMN-ISI-0006', 'Acil', 0,
  'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'İş ilanı ofis',
  6, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000007',
  @SELLER_ID,
  'Gunluk Ciftlik Sutu - 10 LT', 'gunluk-ciftlik-sutu-10-lt',
  '10000000-0000-4000-8000-000000000007', NULL,
  'satilik',
  'Sut Toplama Noktasi', 'Kaman', 'Kırşehir', 'Merkez',
  'Sabah sagim, soguk zincirle teslim.',
  420.00, 'TRY',
  'KMN-SYT-0007', 'Gunluk', 1,
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Taze sut',
  7, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000008',
  @SELLER_ID,
  'Organik Domates - 15 KG Kasa', 'organik-domates-15kg-kasa',
  '10000000-0000-4000-8000-000000000008', NULL,
  'satilik',
  'Hal Ici 12 Numara', 'Kaman', 'Kırşehir', 'Pazar',
  'Ilacsiz uretim domates, tarladan kasaya.',
  680.00, 'TRY',
  'KMN-MYS-0008', NULL, 0,
  'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Organik domates kasasi',
  8, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000009',
  @SELLER_ID,
  'Nohut - Elekten Gecmis 50 KG', 'nohut-elekten-gecmis-50kg',
  '10000000-0000-4000-8000-000000000009', NULL,
  'satilik',
  'Tahil Pazari', 'Kaman', 'Kırşehir', 'Sanayi',
  'Yeni sezon nohut, cuval bazli satis.',
  2950.00, 'TRY',
  'KMN-HUB-0009', NULL, 0,
  'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Nohut cuvali',
  9, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '31000000-0000-4000-8000-000000000010',
  @CUSTOMER_ID,
  'Dag Bisikleti - Az Kullanilmis', 'dag-bisikleti-az-kullanilmis',
  '10000000-0000-4000-8000-000000000010', NULL,
  'satilik',
  'Cumhuriyet Mahallesi', 'Kaman', 'Kırşehir', 'Cumhuriyet',
  '26 jant dag bisikleti, bakimlari yapildi.',
  9500.00, 'TRY',
  'KMN-GNS-0010', 'Firsat', 0,
  'https://images.unsplash.com/photo-1511994298241-608e28f14fde?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Dag bisikleti',
  10, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 6 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '31000000-0000-4000-8000-000000000011',
  @CUSTOMER_ID,
  'Kislik Mont - Erkek L Beden', 'kislik-mont-erkek-l-beden',
  '10000000-0000-4000-8000-000000000011', NULL,
  'satilik',
  'Pazar Yeri 2. Koridor', 'Kaman', 'Kırşehir', 'Pazar',
  'Su gecirmez, temiz kullanilmis mont.',
  1750.00, 'TRY',
  'KMN-GYM-0011', NULL, 0,
  'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Erkek mont',
  11, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 9 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 3 DAY)
),
(
  '31000000-0000-4000-8000-000000000012',
  @CUSTOMER_ID,
  'Ikinci El iPhone 13 - 128 GB', 'ikinci-el-iphone-13-128gb',
  '10000000-0000-4000-8000-000000000012', NULL,
  'satilik',
  'Merkez Telefoncular Carsisi', 'Kaman', 'Kırşehir', 'Merkez',
  'Kutulu, faturali, pil sagligi yuksek.',
  27900.00, 'TRY',
  'KMN-ELK-0012', 'Kutulu', 1,
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Akilli telefon',
  12, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000013',
  @SELLER_ID,
  'Elektrikci Hizmeti - Acil Ariza', 'elektrikci-hizmeti-acil-ariza',
  '10000000-0000-4000-8000-000000000013', NULL,
  'hizmet',
  'Kaman Geneli', 'Kaman', 'Kırşehir', 'Merkez',
  'Acil elektrik arizalari icin yerinde servis.',
  750.00, 'TRY',
  'KMN-UST-0013', '7/24', 1,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Elektrik tamir hizmeti',
  13, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000014',
  @ADMIN_ID,
  'Tarim Ilaclama Pompasi - Motorlu', 'tarim-ilaclama-pompasi-motorlu',
  '10000000-0000-4000-8000-000000000014', NULL,
  'satilik',
  'Sanayi Sitesi A Blok', 'Kaman', 'Kırşehir', 'Sanayi',
  'Calisir durumda motorlu ilaclama pompasi.',
  12400.00, 'TRY',
  'KMN-AGR-0014', NULL, 0,
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Tarim ekipmani',
  14, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 11 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY)
),
(
  '31000000-0000-4000-8000-000000000015',
  @ADMIN_ID,
  'Kiralik 120 m2 Dukkan - Cadde Uzeri', 'kiralik-120m2-dukkan-cadde-uzeri',
  '10000000-0000-4000-8000-000000000001', NULL,
  'kiralik',
  'Carsi Mah. Inonu Cad. No:22', 'Kaman', 'Kırşehir', 'Carsi',
  'Yaya trafigi yuksek konumda kiralik dukkan.',
  28000.00, 'TRY',
  'KMN-KIR-0015', 'Merkezi', 1,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Kiralik dukkan',
  15, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 4 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000016',
  @CUSTOMER_ID,
  'Gezen Tavuk Yumurtasi - 30 Lu Koli', 'gezen-tavuk-yumurtasi-30lu-koli',
  '10000000-0000-4000-8000-000000000005', NULL,
  'satilik',
  'Kümes Çiftliği Yolu', 'Kaman', 'Kırşehir', 'Köy İçi',
  'Gunluk toplanmis gezen tavuk yumurtasi.',
  290.00, 'TRY',
  'KMN-KUM-0016', 'Gunluk', 0,
  'https://images.unsplash.com/photo-1506976785307-8732e854ad03?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Koy yumurtasi',
  16, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY), CURRENT_TIMESTAMP(3)
),
(
  '31000000-0000-4000-8000-000000000017',
  @ADMIN_ID,
  'Satilik Tarla - Sulamaya Uygun 8 Donum', 'satilik-tarla-sulamaya-uygun-8-donum',
  '10000000-0000-4000-8000-000000000015', NULL,
  'satilik',
  'Yeniyapan Koyu Mevkii', 'Kaman', 'Kırşehir', 'Yeniyapan',
  'Yola cephe, verimli toprak yapisina sahip tarla.',
  1860000.00, 'TRY',
  'KMN-ARS-0017', NULL, 0,
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Satilik tarla',
  17, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 13 DAY), DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 2 DAY)
),
(
  '31000000-0000-4000-8000-000000000018',
  @ADMIN_ID,
  'Vefat İlanı - Ahmet Yıldız', 'vefat-ilani-ahmet-yildiz',
  '10000000-0000-4000-8000-000000000016', NULL,
  'duyuru',
  'Merkez Cami Karsisi', 'Kaman', 'Kırşehir', 'Merkez',
  'Merhum Ahmet Yildiz icin cenaze duyurusu.',
  0.00, 'TRY',
  'KMN-CNZ-0018', 'Duyuru', 0,
  'https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?fm=jpg&ixlib=rb-4.0.3&q=60&w=2400', 'Anma cicekleri',
  18, 1,
  DATE_SUB(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY), CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE
  `user_id`         = VALUES(`user_id`),
  `title`           = VALUES(`title`),
  `slug`            = VALUES(`slug`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `status`          = VALUES(`status`),
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

-- Variant values are inserted in 72_property_variant_values_seed.sql
-- (runs after listing_variants table is created at step 63)

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
