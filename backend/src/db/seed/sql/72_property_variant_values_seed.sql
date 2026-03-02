-- =============================================================
-- FILE: 72_property_variant_values_seed.sql
-- Runs AFTER 63_units_variants_schema.sql + 64_units_variants_seed.sql
-- so listing_variants table is guaranteed to exist.
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- ── 21 — Emlak (real estate) ──────────────────────────────────

-- 31000000-0000-4000-8000-000000000001 3+1 Daire
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, '3+1'
  FROM `listing_variants` WHERE `slug` = 'oda-sayisi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, '120'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, 'kombi'
  FROM `listing_variants` WHERE `slug` = 'isitma' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, '3'
  FROM `listing_variants` WHERE `slug` = 'kat-no' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, '5'
  FROM `listing_variants` WHERE `slug` = 'toplam-kat' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000001', `id`, '8'
  FROM `listing_variants` WHERE `slug` = 'bina-yasi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 31000000-0000-4000-8000-000000000002 2+1 Daire kiralik
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000002', `id`, '2+1'
  FROM `listing_variants` WHERE `slug` = 'oda-sayisi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000002', `id`, '85'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000002', `id`, 'dogalgaz'
  FROM `listing_variants` WHERE `slug` = 'isitma' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000002', `id`, 'bos'
  FROM `listing_variants` WHERE `slug` = 'kullanim-durumu' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 31000000-0000-4000-8000-000000000003 Isyeri
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000003', `id`, '65'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000003', `id`, 'kiralik'
  FROM `listing_variants` WHERE `slug` = 'kullanim-durumu' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 31000000-0000-4000-8000-000000000004 Bahceli Mustakil
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000004', `id`, '4+1'
  FROM `listing_variants` WHERE `slug` = 'oda-sayisi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000004', `id`, '180'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000004', `id`, 'merkezi'
  FROM `listing_variants` WHERE `slug` = 'isitma' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000004', `id`, '1'
  FROM `listing_variants` WHERE `slug` = 'bahce' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 31000000-0000-4000-8000-000000000005 Arsa
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000005', `id`, '500'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 31000000-0000-4000-8000-000000000006 1+1 Stüdyo
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000006', `id`, '1+1'
  FROM `listing_variants` WHERE `slug` = 'oda-sayisi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000006', `id`, '45'
  FROM `listing_variants` WHERE `slug` = 'net-metrekare' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '31000000-0000-4000-8000-000000000006', `id`, '1'
  FROM `listing_variants` WHERE `slug` = 'esyali' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ── 22 — Hayvan & Tarım ───────────────────────────────────────

-- 32000000-0000-4000-8000-000000000001 Safkan Akkaraman
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000001', `id`, 'Akkaraman'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000001', `id`, '55'
  FROM `listing_variants` WHERE `slug` = 'canli-agirlik' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 32000000-0000-4000-8000-000000000002 Simental İnek
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000002', `id`, 'Simental'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000002', `id`, '620'
  FROM `listing_variants` WHERE `slug` = 'canli-agirlik' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 32000000-0000-4000-8000-000000000003 Küçükbaş Sürüsü
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000003', `id`, 'Karayaka'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 32000000-0000-4000-8000-000000000004 Kangal Köpek
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000004', `id`, 'Kangal'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000004', `id`, '40'
  FROM `listing_variants` WHERE `slug` = 'canli-agirlik' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 32000000-0000-4000-8000-000000000005 Damızlık Boğa
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000005', `id`, 'Montofon'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000005', `id`, '850'
  FROM `listing_variants` WHERE `slug` = 'canli-agirlik' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 32000000-0000-4000-8000-000000000006 Kaz
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000006', `id`, 'Yerli Kaz'
  FROM `listing_variants` WHERE `slug` = 'hayvan-irki' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '32000000-0000-4000-8000-000000000006', `id`, '4'
  FROM `listing_variants` WHERE `slug` = 'canli-agirlik' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ── 23 — Araç & Motosiklet ────────────────────────────────────

-- 33000000-0000-4000-8000-000000000001 Fiat Egea 2021
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000001', `id`, '2021'
  FROM `listing_variants` WHERE `slug` = 'yapim-yili' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000001', `id`, '62000'
  FROM `listing_variants` WHERE `slug` = 'kilometre' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000001', `id`, 'dizel'
  FROM `listing_variants` WHERE `slug` = 'yakit-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 33000000-0000-4000-8000-000000000002 Massey Ferguson traktör
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000002', `id`, '2008'
  FROM `listing_variants` WHERE `slug` = 'yapim-yili' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000002', `id`, 'dizel'
  FROM `listing_variants` WHERE `slug` = 'yakit-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 33000000-0000-4000-8000-000000000003 Renault Clio kiralik
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000003', `id`, '2020'
  FROM `listing_variants` WHERE `slug` = 'yapim-yili' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000003', `id`, '74000'
  FROM `listing_variants` WHERE `slug` = 'kilometre' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 33000000-0000-4000-8000-000000000004 Honda PCX 125
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000004', `id`, '2022'
  FROM `listing_variants` WHERE `slug` = 'yapim-yili' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000004', `id`, '9800'
  FROM `listing_variants` WHERE `slug` = 'kilometre' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000004', `id`, 'benzin'
  FROM `listing_variants` WHERE `slug` = 'yakit-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 33000000-0000-4000-8000-000000000005 Mini Ekskavatör
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '33000000-0000-4000-8000-000000000005', `id`, '2023'
  FROM `listing_variants` WHERE `slug` = 'yapim-yili' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ── 24 — Kaman Cevizi & Gıda ─────────────────────────────────

-- 34000000-0000-4000-8000-000000000001 İç Ceviz 5 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000001', `id`, '5'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000001', `id`, 'vakum'
  FROM `listing_variants` WHERE `slug` = 'ambalaj-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000002 Köy Yogurdu 3 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000002', `id`, '3'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000002', `id`, 'kavanoz'
  FROM `listing_variants` WHERE `slug` = 'ambalaj-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000003 Taze Kasar 2 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000003', `id`, '2'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000004 Elma Kasasi 18 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000004', `id`, '18'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000004', `id`, 'koli'
  FROM `listing_variants` WHERE `slug` = 'ambalaj-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000005 Kurutulmus Biber 1 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000005', `id`, '1'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000006 Nohut 25 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000006', `id`, '25'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000006', `id`, 'cuval'
  FROM `listing_variants` WHERE `slug` = 'ambalaj-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- 34000000-0000-4000-8000-000000000007 Tam Bugday Unu 10 KG
INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000007', `id`, '10'
  FROM `listing_variants` WHERE `slug` = 'urun-agirligi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

INSERT INTO `property_variant_values` (`property_id`, `variant_id`, `value`)
SELECT '34000000-0000-4000-8000-000000000007', `id`, 'koli'
  FROM `listing_variants` WHERE `slug` = 'ambalaj-tipi' LIMIT 1
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
