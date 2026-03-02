-- =============================================================
-- FILE: 64_units_variants_seed.sql
-- Kaman Ilan - Units + Variants initial data
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

INSERT INTO `units`
(`id`,`name`,`slug`,`symbol`,`type`,`precision`,`is_active`,`display_order`)
VALUES
('64000000-0000-4000-8000-000000000001','Adet','piece','adet','piece',0,1,1),
('64000000-0000-4000-8000-000000000002','Kilogram','kg','kg','weight',2,1,2),
('64000000-0000-4000-8000-000000000003','Litre','lt','lt','volume',2,1,3),
('64000000-0000-4000-8000-000000000004','Metrekare','m2','m2','area',2,1,4),
('64000000-0000-4000-8000-000000000005','Ay','month','ay','time',0,1,5),
('64000000-0000-4000-8000-000000000006','Yil','year','yil','time',0,1,6)
ON DUPLICATE KEY UPDATE
  `name`          = VALUES(`name`),
  `slug`          = VALUES(`slug`),
  `symbol`        = VALUES(`symbol`),
  `type`          = VALUES(`type`),
  `precision`     = VALUES(`precision`),
  `is_active`     = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`),
  `updated_at`    = CURRENT_TIMESTAMP(3);

INSERT INTO `listing_variants`
(
  `id`,`name`,`slug`,`description`,`value_type`,
  `category_id`,`sub_category_id`,`unit_id`,`options_json`,
  `is_required`,`is_filterable`,`is_active`,`display_order`
)
VALUES
-- ── Araç / Motosiklet ────────────────────────────────────────
(
  '64100000-0000-4000-8000-000000000001',
  'Yapim Yili','yapim-yili','Aracin model yili','number',
  '10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000011',NULL,NULL,
  0,1,1,1
),
(
  '64100000-0000-4000-8000-000000000002',
  'Kilometre','kilometre','Aracin toplam km bilgisi','number',
  '10000000-0000-4000-8000-000000000002',NULL,'64000000-0000-4000-8000-000000000001',NULL,
  0,1,1,2
),
(
  '64100000-0000-4000-8000-000000000003',
  'Yakit Tipi','yakit-tipi','Arac yakit turu','single_select',
  '10000000-0000-4000-8000-000000000002',NULL,NULL,
  JSON_ARRAY('benzin','dizel','lpg','hibrit','elektrik'),
  0,1,1,3
),
-- ── Hayvan & Tarim ───────────────────────────────────────────
(
  '64100000-0000-4000-8000-000000000004',
  'Hayvan Irki','hayvan-irki','Buyukbas/kucukbas irk bilgisi','text',
  '10000000-0000-4000-8000-000000000005',NULL,NULL,NULL,
  0,1,1,1
),
(
  '64100000-0000-4000-8000-000000000005',
  'Canli Agirlik','canli-agirlik','Hayvanin yaklasik agirligi','number',
  '10000000-0000-4000-8000-000000000005',NULL,'64000000-0000-4000-8000-000000000002',NULL,
  0,1,1,2
),
-- ── Kaman Cevizi / Gida ──────────────────────────────────────
(
  '64100000-0000-4000-8000-000000000006',
  'Urun Agirligi','urun-agirligi','Satisa sunulan urunun net agirligi','number',
  '10000000-0000-4000-8000-000000000004',NULL,'64000000-0000-4000-8000-000000000002',NULL,
  0,1,1,1
),
(
  '64100000-0000-4000-8000-000000000007',
  'Ambalaj Tipi','ambalaj-tipi','Urun ambalaj formu','single_select',
  '10000000-0000-4000-8000-000000000004',NULL,NULL,
  JSON_ARRAY('vakum','kavanoz','koli','cuval'),
  0,1,1,2
),
-- ── Emlak & Kira ─────────────────────────────────────────────
(
  '64100000-0000-4000-8000-000000000008',
  'Oda Sayisi','oda-sayisi','Konut oda tipi (1+1, 2+1 ...)','single_select',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,
  JSON_ARRAY('1+0','1+1','2+0','2+1','2+2','3+1','3+2','4+1','4+2','5+1','6+1'),
  0,1,1,1
),
(
  '64100000-0000-4000-8000-000000000009',
  'Net Metrekare','net-metrekare','Kullanim alani net m2','number',
  '10000000-0000-4000-8000-000000000001',NULL,'64000000-0000-4000-8000-000000000004',NULL,
  0,1,1,2
),
(
  '64100000-0000-4000-8000-000000000010',
  'Bina Yasi','bina-yasi','Binanin yaklasik yasi (yil)','number',
  '10000000-0000-4000-8000-000000000001',NULL,'64000000-0000-4000-8000-000000000006',NULL,
  0,1,1,3
),
(
  '64100000-0000-4000-8000-000000000011',
  'Kat No','kat-no','Dairenin bulundugu kat','number',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,4
),
(
  '64100000-0000-4000-8000-000000000012',
  'Toplam Kat','toplam-kat','Binanin toplam kat sayisi','number',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,5
),
(
  '64100000-0000-4000-8000-000000000013',
  'Isitma','isitma','Isitma turu','single_select',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,
  JSON_ARRAY('kombi','dogalgaz','merkezi','soba','klima','yerden','isi-pompasi','yok'),
  0,1,1,6
),
(
  '64100000-0000-4000-8000-000000000014',
  'Kullanim Durumu','kullanim-durumu','Tasinmazin kullanim durumu','single_select',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,
  JSON_ARRAY('bos','kiralik','sahibi-kullaniyor','kiracili','bilinmiyor'),
  0,1,1,7
),
(
  '64100000-0000-4000-8000-000000000015',
  'Esyali','esyali','Esyali mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,8
),
(
  '64100000-0000-4000-8000-000000000016',
  'Site Ici','site-ici','Site icinde mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,9
),
(
  '64100000-0000-4000-8000-000000000017',
  'Balkon','balkon','Balkon var mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,10
),
(
  '64100000-0000-4000-8000-000000000018',
  'Otopark','otopark','Otopark var mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,11
),
(
  '64100000-0000-4000-8000-000000000019',
  'Asansor','asansor','Asansor var mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,12
),
(
  '64100000-0000-4000-8000-000000000020',
  'Bahce','bahce','Bahce var mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,13
),
(
  '64100000-0000-4000-8000-000000000021',
  'Teras','teras','Teras var mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,14
),
(
  '64100000-0000-4000-8000-000000000022',
  'Krediye Uygun','krediye-uygun','Krediye uygun mu?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,15
),
(
  '64100000-0000-4000-8000-000000000023',
  'Takas','takas','Takas kabul edilir mi?','boolean',
  '10000000-0000-4000-8000-000000000001',NULL,NULL,NULL,
  0,1,1,16
)
ON DUPLICATE KEY UPDATE
  `name`           = VALUES(`name`),
  `slug`           = VALUES(`slug`),
  `description`    = VALUES(`description`),
  `value_type`     = VALUES(`value_type`),
  `category_id`    = VALUES(`category_id`),
  `sub_category_id`= VALUES(`sub_category_id`),
  `unit_id`        = VALUES(`unit_id`),
  `options_json`   = VALUES(`options_json`),
  `is_required`    = VALUES(`is_required`),
  `is_filterable`  = VALUES(`is_filterable`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = CURRENT_TIMESTAMP(3);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
