/* 95_integration_settings_seed.sql — Third-party API integration defaults */

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.kargo.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.kargo.base_url', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.kargo.api_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.kargo.api_secret', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.geliver.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.geliver.base_url', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.geliver.api_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.geliver.api_secret', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.google.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.google.client_id', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.google.client_secret', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.google.api_key', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.google_maps.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.google_maps.api_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.google_maps.map_id', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.facebook.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.facebook.app_id', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.facebook.app_secret', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.facebook.access_token', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

-- AI genel ayarlar (provider_order = hangi sağlayıcı önce denenir)
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.ai.enabled',        'true',                       NOW(3), NOW(3)),
  (UUID(), 'integration.ai.provider_order', '"groq,openai,anthropic,gemini"', NOW(3), NOW(3)),
  (UUID(), 'integration.ai.temperature',    '0.5',                        NOW(3), NOW(3)),
  (UUID(), 'integration.ai.max_tokens',     '2500',                       NOW(3), NOW(3)),
  (UUID(), 'integration.ai.system_prompt',  '""',                         NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

-- Groq
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.groq.enabled',  'false',                             NOW(3), NOW(3)),
  (UUID(), 'integration.groq.api_key',  '""',                                NOW(3), NOW(3)),
  (UUID(), 'integration.groq.model',    '"llama-3.3-70b-versatile"',         NOW(3), NOW(3)),
  (UUID(), 'integration.groq.base_url', '"https://api.groq.com/openai/v1"',  NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

-- OpenAI
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.openai.enabled',  'false',                          NOW(3), NOW(3)),
  (UUID(), 'integration.openai.api_key',  '""',                             NOW(3), NOW(3)),
  (UUID(), 'integration.openai.model',    '"gpt-4o-mini"',                  NOW(3), NOW(3)),
  (UUID(), 'integration.openai.base_url', '"https://api.openai.com/v1"',    NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

-- Anthropic
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.anthropic.enabled',  'false',                              NOW(3), NOW(3)),
  (UUID(), 'integration.anthropic.api_key',  '""',                                 NOW(3), NOW(3)),
  (UUID(), 'integration.anthropic.model',    '"claude-3-5-haiku-20241022"',        NOW(3), NOW(3)),
  (UUID(), 'integration.anthropic.base_url', '"https://api.anthropic.com/v1"',     NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

-- Gemini
INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.gemini.enabled',  'false',                                                          NOW(3), NOW(3)),
  (UUID(), 'integration.gemini.api_key',  '""',                                                             NOW(3), NOW(3)),
  (UUID(), 'integration.gemini.model',    '"gemini-2.0-flash"',                                             NOW(3), NOW(3)),
  (UUID(), 'integration.gemini.base_url', '"https://generativelanguage.googleapis.com/v1beta/openai"',      NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.cloudinary.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.cloudinary.cloud_name', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.cloudinary.api_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.cloudinary.api_secret', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.cloudinary.folder', '"uploads"', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.telegram.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.telegram.bot_token', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.telegram.default_chat_id', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.telegram.webhook_secret', '""', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);

INSERT INTO `site_settings` (`id`,`key`,`value`,`created_at`,`updated_at`) VALUES
  (UUID(), 'integration.iyzico.enabled', 'false', NOW(3), NOW(3)),
  (UUID(), 'integration.iyzico.api_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.iyzico.secret_key', '""', NOW(3), NOW(3)),
  (UUID(), 'integration.iyzico.base_url', '"https://sandbox-api.iyzipay.com"', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updated_at` = NOW(3);
