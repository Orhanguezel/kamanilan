-- =============================================================
-- FILE: 70_property_tag_links_seed.sql
-- Kaman Ilan - Ornek property <-> tag iliskileri
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'sahibinden'
WHERE p.`slug` = 'satilik-3-1-daire-kaman-merkez';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'ekspertizli'
WHERE p.`slug` = '2020-fiat-egea-temiz';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'bakimli'
WHERE p.`slug` = '2020-fiat-egea-temiz';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'ureticiden'
WHERE p.`slug` = 'kabuklu-kaman-cevizi-yeni-hasat-25kg';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'veteriner-kontrollu'
WHERE p.`slug` = 'satilik-simental-dana-veteriner-kontrollu';

INSERT IGNORE INTO `property_tag_links` (`property_id`, `tag_id`)
SELECT p.`id`, t.`id`
FROM `properties` p
JOIN `listing_tags` t ON t.`slug` = 'gunluk-uretim'
WHERE p.`slug` = 'gunluk-ciftlik-sutu-10-lt';
