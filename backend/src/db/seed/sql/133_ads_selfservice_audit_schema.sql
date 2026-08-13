CREATE TABLE IF NOT EXISTS seller_members (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, seller_id CHAR(36) NOT NULL, user_id CHAR(36) NOT NULL,
  role ENUM('owner','manager','creative','finance','viewer') NOT NULL DEFAULT 'viewer',
  can_view_financials TINYINT NOT NULL DEFAULT 0, is_active TINYINT NOT NULL DEFAULT 1, invited_by CHAR(36) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY seller_members_seller_user_uq (seller_id,user_id), INDEX seller_members_user_idx (user_id,is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_self_service_requests (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, seller_id CHAR(36) NOT NULL, banner_id INT NULL,
  requested_by VARCHAR(36) NOT NULL, request_type ENUM('creative_change','extension','new_slot','support') NOT NULL,
  status ENUM('pending','approved','rejected','revision_requested','cancelled') NOT NULL DEFAULT 'pending',
  payload JSON NOT NULL, requester_note TEXT NULL, review_note TEXT NULL, reviewed_by VARCHAR(36) NULL,
  reviewed_at DATETIME(3) NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX ads_ssr_seller_idx (seller_id,status), INDEX ads_ssr_banner_idx (banner_id), INDEX ads_ssr_requester_idx (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ads_audit_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('banner','slot','package','payment','request','pricing') NOT NULL,
  entity_id VARCHAR(64) NOT NULL, action VARCHAR(64) NOT NULL, actor_user_id VARCHAR(36) NULL,
  before_data JSON NULL, after_data JSON NULL, reason VARCHAR(500) NULL, is_financial TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX ads_audit_entity_idx (entity_type,entity_id,created_at), INDEX ads_audit_actor_idx (actor_user_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
