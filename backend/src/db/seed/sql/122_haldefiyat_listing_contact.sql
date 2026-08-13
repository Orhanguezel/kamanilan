-- HalDeFiyat'tan alınan gerçek Nohut & Mercimek ilanları doğrudan iletişim ilanıdır.
-- Numara arayüzde açık metin olarak gösterilmez; yalnızca ara/WhatsApp düğmelerinde kullanılır.
UPDATE `categories`
SET
  `phone_number` = '05364828175',
  `whatsapp_number` = '05364828175',
  `updated_at` = NOW(3)
WHERE `id` = '10000000-0000-4000-8000-000000000009'
  AND `slug` = 'hububat-bakliyat';

UPDATE `sub_categories`
SET
  `has_cart` = 0,
  `updated_at` = NOW(3)
WHERE `id` = '20000000-0000-4000-8000-000000000083'
  AND `slug` = 'nohut-mercimek';
