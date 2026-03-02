-- =============================================================
-- FILE: src/db/seed/sql/99_wallet_schema.sql
-- DESCRIPTION: Wallet and wallet_transactions tables
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id               CHAR(36)        NOT NULL,
  user_id          CHAR(36)        NOT NULL,
  balance          DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
  total_earnings   DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
  total_withdrawn  DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
  currency         VARCHAR(10)     NOT NULL DEFAULT 'TRY',
  status           ENUM('active','suspended','closed') NOT NULL DEFAULT 'active',
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY wallets_user_id_unique (user_id),
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                CHAR(36)        NOT NULL,
  wallet_id         CHAR(36)        NOT NULL,
  user_id           CHAR(36)        NOT NULL,
  type              ENUM('credit','debit') NOT NULL,
  amount            DECIMAL(14,2)   NOT NULL,
  currency          VARCHAR(10)     NOT NULL DEFAULT 'TRY',
  purpose           VARCHAR(255)    NOT NULL DEFAULT '',
  description       TEXT            DEFAULT NULL,
  payment_status    ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref   VARCHAR(255)    DEFAULT NULL,
  is_admin_created  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY wallet_tx_wallet_id_idx (wallet_id),
  KEY wallet_tx_user_id_idx (user_id),
  KEY wallet_tx_created_idx (created_at),
  CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
