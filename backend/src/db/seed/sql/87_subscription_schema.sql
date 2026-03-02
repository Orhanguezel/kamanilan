-- =============================================================
-- FILE: src/db/seed/sql/87_subscription_schema.sql
-- Abonelik planları, özellikler, kullanıcı abonelikleri
-- =============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- 1. subscription_plans
-- ------------------------------------------------------------------
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plan_features;
DROP TABLE IF EXISTS subscription_plans;

CREATE TABLE subscription_plans (
  id            INT           NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(100)  NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT          DEFAULT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly  DECIMAL(10,2) DEFAULT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  is_default    TINYINT(1)    NOT NULL DEFAULT 0,
  display_order INT           NOT NULL DEFAULT 0,
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY subscription_plans_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- 2. subscription_plan_features
-- ------------------------------------------------------------------
CREATE TABLE subscription_plan_features (
  id            INT          NOT NULL AUTO_INCREMENT,
  plan_id       INT          NOT NULL,
  feature_key   VARCHAR(100) NOT NULL,
  feature_value VARCHAR(255) NOT NULL,
  is_enabled    TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY spf_plan_key_unique (plan_id, feature_key),
  KEY spf_plan_idx (plan_id),
  CONSTRAINT spf_plan_fk FOREIGN KEY (plan_id)
    REFERENCES subscription_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- 3. user_subscriptions
-- ------------------------------------------------------------------
CREATE TABLE user_subscriptions (
  id         INT         NOT NULL AUTO_INCREMENT,
  user_id    CHAR(36)    NOT NULL,
  plan_id    INT         NOT NULL,
  starts_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at DATETIME(3) DEFAULT NULL,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY user_subscriptions_user_unique (user_id),
  KEY us_plan_idx (plan_id),
  CONSTRAINT us_plan_fk FOREIGN KEY (plan_id)
    REFERENCES subscription_plans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------
-- 4. Plan seed (Ücretsiz / Temel / Pro)
-- ------------------------------------------------------------------
INSERT INTO subscription_plans
  (id, slug, name, description, price_monthly, price_yearly, is_active, is_default, display_order)
VALUES
  (1, 'free',  'Ücretsiz', 'Yeni üyelere otomatik atanan ücretsiz plan. Temel özelliklerle başlayın.',    0.00,   NULL,   1, 1, 1),
  (2, 'basic', 'Temel',    'Daha fazla ilan ve uzun süre yayın için uygun başlangıç paketi.',             149.00, 990.00, 1, 0, 2),
  (3, 'pro',   'Pro',      'Sınırsız ilan, video ekleme ve öne çıkarma özelliğiyle tam profesyonel paket.', 349.00, 2990.00, 1, 0, 3);

-- ------------------------------------------------------------------
-- 5. Feature seed
-- feature_value: "-1" = sınırsız, sayı = limit, "true"/"false"
-- ------------------------------------------------------------------
INSERT INTO subscription_plan_features
  (plan_id, feature_key, feature_value, is_enabled)
VALUES
  -- Ücretsiz (id=1)
  (1, 'max_active_listings',  '2',     1),
  (1, 'listing_duration_days','30',    1),
  (1, 'can_add_video',        'false', 1),
  (1, 'can_feature_listing',  'false', 1),
  (1, 'can_boost_listing',    'false', 1),

  -- Temel (id=2)
  (2, 'max_active_listings',  '15',    1),
  (2, 'listing_duration_days','60',    1),
  (2, 'can_add_video',        'false', 1),
  (2, 'can_feature_listing',  'false', 1),
  (2, 'can_boost_listing',    'false', 1),

  -- Pro (id=3)
  (3, 'max_active_listings',  '-1',    1),
  (3, 'listing_duration_days','-1',    1),
  (3, 'can_add_video',        'true',  1),
  (3, 'can_feature_listing',  'true',  1),
  (3, 'can_boost_listing',    'true',  1);
