-- Kaman İlan Google Analytics 4 ve Google Ads web etiketi kimlikleri.
INSERT INTO `site_settings` (`id`,`key`,`locale`,`value`,`created_at`,`updated_at`) VALUES
(UUID(), 'ga4_property_id',       '*', '"534417595"',      NOW(3), NOW(3)),
(UUID(), 'ga4_stream_id',         '*', '"14481791763"',    NOW(3), NOW(3)),
(UUID(), 'ga4_stream_name',       '*', '"kaman ilan"',     NOW(3), NOW(3)),
(UUID(), 'ga4_measurement_id',    '*', '"G-F0L4J8X30T"',  NOW(3), NOW(3)),
(UUID(), 'google_ads_customer_id','*', '"215-828-1044"',   NOW(3), NOW(3)),
(UUID(), 'google_ads_conversion_id','*','"AW-18115197942"',NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `updated_at` = NOW(3);
