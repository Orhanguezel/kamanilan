-- =============================================================
-- FILE: 69_properties_brand_tags_schema.sql
-- property_tag_links M:N table (properties.brand_id 20_properties_schema.sql icinde)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `property_tag_links` (
  `property_id` CHAR(36)    NOT NULL,
  `tag_id`      CHAR(36)    NOT NULL,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE KEY `ux_property_tag_links` (`property_id`, `tag_id`),
  KEY `idx_property_tag_links_property` (`property_id`),
  KEY `idx_property_tag_links_tag` (`tag_id`),

  CONSTRAINT `fk_property_tag_links_property`
    FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `fk_property_tag_links_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `listing_tags` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
