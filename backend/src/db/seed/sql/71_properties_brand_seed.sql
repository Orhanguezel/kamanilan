-- =============================================================
-- FILE: 71_properties_brand_seed.sql
-- Kaman Ilan - Ornek property.brand_id atamalari
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000001'
WHERE `slug` IN (
  'satilik-3-1-daire-kaman-merkez',
  'kiralik-120m2-dukkan-cadde-uzeri'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000002'
WHERE `slug` IN (
  '2020-fiat-egea-temiz',
  '2021-fiat-egea-1-6-multijet-tramer-kayitsiz',
  'kiralik-renault-clio-gunluk-haftalik-kaman'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000003'
WHERE `slug` = 'massey-ferguson-285s-traktor-bakimli';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000004'
WHERE `slug` = 'satilik-honda-pcx-125-duzgun-kullanildi';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000008'
WHERE `slug` IN (
  'kabuklu-kaman-cevizi-yeni-hasat-25kg',
  'ic-ceviz-vakumlu-5kg'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000009'
WHERE `slug` IN (
  'satilik-simental-dana-veteriner-kontrollu',
  'satilik-simental-duve-20-aylik',
  'satilik-akkaraman-koc-damizlik',
  'satilik-gezen-tavuk-50-adet'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000010'
WHERE `slug` IN (
  'gunluk-ciftlik-sutu-10-lt',
  'koy-yogurdu-3kg',
  'taze-kasar-peyniri-2kg'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000011'
WHERE `slug` IN (
  'organik-domates-15kg-kasa',
  'elma-kasasi-18kg',
  'kurutulmus-biber-1kg'
);

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000012'
WHERE `slug` = 'kislik-mont-erkek-l-beden';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000005'
WHERE `slug` = 'ikinci-el-iphone-13-128gb';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000013'
WHERE `slug` = 'elektrikci-hizmeti-acil-ariza';

UPDATE `properties`
SET `brand_id` = '65000000-0000-4000-8000-000000000014'
WHERE `slug` IN (
  'tarim-ilaclama-pompasi-motorlu',
  'is-makinesi-mini-ekskavator-2023-model'
);
