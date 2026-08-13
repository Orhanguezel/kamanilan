CREATE TABLE IF NOT EXISTS seller_applications (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  store_name VARCHAR(180) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  note TEXT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  review_note TEXT NULL,
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_seller_applications_user (user_id),
  KEY idx_seller_applications_status_created (status, created_at),
  CONSTRAINT fk_seller_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_seller_applications_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
