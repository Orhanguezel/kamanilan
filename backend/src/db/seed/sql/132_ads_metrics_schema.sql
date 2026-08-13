CREATE TABLE IF NOT EXISTS ads_daily_metrics (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NOT NULL, metric_date DATE NOT NULL,
  device ENUM('desktop','mobile') NOT NULL, scope_key VARCHAR(190) NOT NULL DEFAULT 'global',
  impressions INT NOT NULL DEFAULT 0, unique_impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0, unique_clicks INT NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY ads_daily_metrics_uq (banner_id,metric_date,device,scope_key), INDEX ads_daily_metrics_date_idx (metric_date,banner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_metric_uniques (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NOT NULL, metric_date DATE NOT NULL,
  visitor_hash VARCHAR(64) NOT NULL, event_type ENUM('impression','click') NOT NULL,
  device ENUM('desktop','mobile') NOT NULL, scope_key VARCHAR(190) NOT NULL DEFAULT 'global',
  UNIQUE KEY ads_metric_uniques_uq (banner_id,metric_date,visitor_hash,event_type,device,scope_key), INDEX ads_metric_uniques_date_idx (metric_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_visitor_frequency (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NOT NULL, visitor_hash VARCHAR(64) NOT NULL,
  total_impressions INT NOT NULL DEFAULT 0, daily_impressions INT NOT NULL DEFAULT 0, daily_date DATE NULL,
  last_page_hash VARCHAR(64) NULL, last_impression_at DATETIME(3) NULL, last_click_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY ads_visitor_frequency_uq (banner_id,visitor_hash), INDEX ads_visitor_frequency_updated_idx (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_conversions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NOT NULL,
  event_type ENUM('listing_view','offer_submit','phone_click','whatsapp_click','seller_contact','directions_click','favorite_add') NOT NULL,
  entity_type ENUM('listing','seller','product') NOT NULL, entity_id VARCHAR(128) NOT NULL,
  visitor_hash VARCHAR(64) NOT NULL, source_position VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY ads_conversions_unique (banner_id,event_type,entity_type,entity_id,visitor_hash),
  INDEX ads_conversions_date_idx (created_at,banner_id), INDEX ads_conversions_entity_idx (entity_type,entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
