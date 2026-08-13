CREATE TABLE IF NOT EXISTS ads_packages (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(96) NOT NULL, name VARCHAR(160) NOT NULL,
  billing_period ENUM('daily','weekly','monthly','custom') NOT NULL DEFAULT 'monthly', duration_days INT NOT NULL DEFAULT 30,
  price DECIMAL(12,2) NOT NULL, currency VARCHAR(8) NOT NULL DEFAULT 'TRY', devices JSON NULL,
  impression_limit INT NULL, click_limit INT NULL, includes_firm_profile TINYINT NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0, custom_price_allowed TINYINT NOT NULL DEFAULT 0,
  is_active TINYINT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY ads_packages_slug_uq (slug), INDEX ads_packages_active_idx (is_active,billing_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_package_slots (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, package_id INT NOT NULL, slot_key VARCHAR(64) NOT NULL,
  UNIQUE KEY ads_package_slots_uq (package_id,slot_key), INDEX ads_package_slots_slot_idx (slot_key,package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NOT NULL,
  transaction_type ENUM('payment','refund') NOT NULL DEFAULT 'payment', amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'TRY', payment_method ENUM('cash','bank_transfer','card','other') NOT NULL,
  paid_at DATETIME(3) NOT NULL, reference_number VARCHAR(160) NULL, notes VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX ads_payments_banner_idx (banner_id,paid_at), INDEX ads_payments_reference_idx (reference_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_price_overrides (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, banner_id INT NULL, slot_key VARCHAR(64) NOT NULL,
  suggested_price DECIMAL(12,2) NOT NULL, applied_price DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0, reason VARCHAR(500) NOT NULL, calculation JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX ads_price_overrides_banner_idx (banner_id,created_at), INDEX ads_price_overrides_slot_idx (slot_key,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_waitlist (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, position VARCHAR(64) NOT NULL, title VARCHAR(190) NOT NULL,
  advertiser VARCHAR(160) NULL, source_type ENUM('custom','listing','seller','code') NOT NULL DEFAULT 'custom',
  listing_id CHAR(36) NULL, seller_id CHAR(36) NULL, device ENUM('all','desktop','mobile') NOT NULL DEFAULT 'all',
  preferred_start_at DATETIME(3) NULL, preferred_end_at DATETIME(3) NULL, priority INT NOT NULL DEFAULT 0,
  status ENUM('waiting','offered','converted','cancelled') NOT NULL DEFAULT 'waiting', notes VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX ads_waitlist_status_idx (status,priority,created_at), INDEX ads_waitlist_position_idx (position,preferred_start_at,preferred_end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_seller_deals (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, seller_id CHAR(36) NOT NULL,
  status ENUM('lead','contacted','negotiating','won','lost') NOT NULL DEFAULT 'lead',
  deal_type ENUM('reklam','sponsorluk','premium','diger') NOT NULL DEFAULT 'reklam', notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX ads_seller_deals_seller_idx (seller_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_seller_sponsorships (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, seller_id CHAR(36) NOT NULL, starts_at DATETIME(3) NOT NULL,
  ends_at DATETIME(3) NOT NULL, is_active TINYINT NOT NULL DEFAULT 1,
  INDEX ads_seller_sponsorships_seller_idx (seller_id,is_active,starts_at,ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
