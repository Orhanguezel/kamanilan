-- =============================================================
-- FILE: src/db/seed/sql/86_orders_payments_schema.sql
-- DESCRIPTION: Payment gateways, orders, order items and payments
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. Payment Gateways
CREATE TABLE IF NOT EXISTS payment_gateways (
  id           CHAR(36)     NOT NULL,
  name         VARCHAR(255) NOT NULL,
  slug         VARCHAR(100) NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  is_test_mode TINYINT(1)   NOT NULL DEFAULT 1,
  config       TEXT         DEFAULT NULL, -- JSON formatted credentials/settings
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY payment_gateways_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Addresses (Additional addresses for checkout)
CREATE TABLE IF NOT EXISTS user_addresses (
  id              CHAR(36)     NOT NULL,
  user_id         CHAR(36)     NOT NULL,
  title           VARCHAR(255) NOT NULL, -- e.g. "Ev", "İş"
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(50)  NOT NULL,
  email           VARCHAR(255) DEFAULT NULL,
  address_line    TEXT         NOT NULL,
  city            VARCHAR(128) NOT NULL,
  district        VARCHAR(128) NOT NULL,
  postal_code     VARCHAR(32)  DEFAULT NULL,
  is_default      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY user_addresses_user_id_idx (user_id),
  CONSTRAINT fk_user_addresses_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id                  CHAR(36)       NOT NULL,
  user_id             CHAR(36)       NOT NULL,
  order_number        VARCHAR(50)    NOT NULL,
  status              VARCHAR(50)    NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
  total_amount        DECIMAL(12,2)  NOT NULL,
  currency            VARCHAR(10)    NOT NULL DEFAULT 'TRY',
  shipping_address_id CHAR(36)       DEFAULT NULL,
  billing_address_id  CHAR(36)       DEFAULT NULL,
  payment_gateway_id  CHAR(36)       DEFAULT NULL,
  payment_status      VARCHAR(50)    NOT NULL DEFAULT 'unpaid', -- unpaid, paid, failed, refunded
  order_notes         TEXT           DEFAULT NULL,
  transaction_id      VARCHAR(255)   DEFAULT NULL,
  created_at          DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY orders_number_unique (order_number),
  KEY orders_user_id_idx (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_orders_gateway
    FOREIGN KEY (payment_gateway_id) REFERENCES payment_gateways (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id          CHAR(36)       NOT NULL,
  order_id    CHAR(36)       NOT NULL,
  property_id CHAR(36)       NOT NULL,
  title       VARCHAR(255)   NOT NULL,
  quantity    INT            NOT NULL DEFAULT 1,
  price       DECIMAL(12,2)  NOT NULL,
  currency    VARCHAR(10)    NOT NULL DEFAULT 'TRY',
  options     TEXT           DEFAULT NULL, -- JSON
  created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY order_items_order_id_idx (order_id),
  KEY order_items_property_id_idx (property_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_property
    FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payments (Detailed transaction logs)
CREATE TABLE IF NOT EXISTS payments (
  id                CHAR(36)       NOT NULL,
  order_id          CHAR(36)       NOT NULL,
  gateway_id        CHAR(36)       NOT NULL,
  transaction_id    VARCHAR(255)   DEFAULT NULL,
  amount            DECIMAL(12,2)  NOT NULL,
  currency          VARCHAR(10)    NOT NULL DEFAULT 'TRY',
  status            VARCHAR(50)    NOT NULL, -- success, failure, pending
  raw_response      TEXT           DEFAULT NULL, -- JSON response from gateway
  created_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY payments_order_id_idx (order_id),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payments_gateway
    FOREIGN KEY (gateway_id) REFERENCES payment_gateways (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Initial Seed for Payment Gateways
INSERT INTO payment_gateways (id, name, slug, is_active, is_test_mode, config)
VALUES (
  'iyzico-gateway-id-001',
  'Iyzico',
  'iyzico',
  1,
  {{IYZICO_IS_TEST_MODE}},
  CONCAT('{"apiKey":"', '{{IYZICO_API_KEY}}', '","secretKey":"', '{{IYZICO_SECRET_KEY}}', '","baseUrl":"', '{{IYZICO_BASE_URL}}', '"}')
)
ON DUPLICATE KEY UPDATE
  is_test_mode = VALUES(is_test_mode),
  config       = VALUES(config),
  updated_at   = CURRENT_TIMESTAMP(3);

INSERT IGNORE INTO payment_gateways (id, name, slug, is_active, is_test_mode, config)
VALUES (
  'bank-transfer-id-002', 
  'Banka Havalesi / EFT', 
  'bank_transfer', 
  1, 
  0, 
  '{"bankName":"Ziraat Bankası","accountHolder":"Orhan Güzel","iban":"TR00 0000 0000 0000 0000 0000 00"}'
);
