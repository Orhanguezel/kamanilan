-- concept-demo-2026 geçici tasarım kabul kayıtlarını kalıcı olarak siler.
-- Kullanım: mysql ... < backend/scripts/sql/remove-concept-demo.sql
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET @DEMO_TAG := 'concept-demo-2026';

DELETE FROM `article_likes`
WHERE `article_id` IN (SELECT `id` FROM `articles` WHERE FIND_IN_SET(@DEMO_TAG, REPLACE(`tags`, ', ', ',')) > 0);

DELETE FROM `article_comments`
WHERE `article_id` IN (SELECT `id` FROM `articles` WHERE FIND_IN_SET(@DEMO_TAG, REPLACE(`tags`, ', ', ',')) > 0);

DELETE FROM `articles`
WHERE FIND_IN_SET(@DEMO_TAG, REPLACE(`tags`, ', ', ',')) > 0;

DELETE FROM `property_assets`
WHERE `property_id` IN (SELECT `id` FROM `properties` WHERE `internal_note` = @DEMO_TAG);

DELETE FROM `properties`
WHERE `internal_note` = @DEMO_TAG;
