-- Bootstrap ile gelen doğrulanmamış demo içerikler canlı/yayınlanabilir değildir.
-- Kayıtları silmeyerek admin incelemesi ve geri alma imkanı korunur.
UPDATE `announcements`
SET `is_published` = 0, `updated_at` = NOW(3)
WHERE `uuid` LIKE 'b0000001-0000-4000-8000-0000000000%';

UPDATE `articles`
SET `is_published` = 0, `updated_at` = NOW(3)
WHERE `slug` IN (
  'yapay-zeka-alaninda-yeni-gelismeler',
  'ekonomide-son-durum-piyasalar-ne-yonde',
  'spor-dunyasindan-onemli-gelismeler',
  'saglik-haberleri-uzmanlardan-onemli-uyarilar',
  'kaman-ceviz-festivali-2026',
  'kaman-cevizi-neden-unlu',
  'kaman-belediyesi-2026-hizmetler',
  'kaman-otobus-saatleri-ankara-kirsehir-kayseri',
  'kaman-hava-durumu-iklim',
  'kaman-nobetci-eczane-sistemi',
  'kirsehir-kaman-yolu-mesafe-sure',
  'kaman-bor-madeni-stratejik-kaynak',
  'kaman-tarihi-selcuklu-mirasi',
  'kaman-emlak-fiyat-trendleri'
);
