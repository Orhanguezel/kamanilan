/* 80_custom_pages_core_seed.sql — Kaman İlan (i18n split) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================
-- Parent UUIDs
-- =============================================================
SET @pg_hakkimizda  = UUID();
SET @pg_gizlilik    = UUID();
SET @pg_kullanim    = UUID();
SET @pg_kalite      = UUID();
SET @pg_misyon      = UUID();

-- =============================================================
-- PARENT: custom_pages
-- =============================================================
INSERT INTO `custom_pages`
  (`id`, `module_key`, `is_published`, `display_order`, `featured_image`, `storage_asset_id`)
VALUES
  (@pg_hakkimizda, 'about',    1, 1, 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80', NULL),
  (@pg_gizlilik,   'kvkk',     1, 2, NULL, NULL),
  (@pg_kullanim,   'contract', 1, 3, NULL, NULL),
  (@pg_kalite,     'quality',  1, 4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', NULL),
  (@pg_misyon,     'about',    1, 5, 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1400&q=80', NULL);

-- =============================================================
-- CHILD: custom_pages_i18n (locale='tr')
-- =============================================================

-- Hakkimizda
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_hakkimizda, 'tr',
 'Hakkımızda',
 'hakkimizda',
 JSON_OBJECT('html', CONCAT(
   '<section class="container mx-auto px-4 py-8">',
     '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kaman İlan Hakkında</h1>',
     '<p class="text-slate-700 leading-relaxed mb-6">',
       '<strong>Kaman İlan</strong>, alım-satım ve kiralama süreçlerinde müşterilerine ',
       '<strong>şeffaf, güvenilir ve hızlı</strong> hizmet sunmayı hedefleyen bir ilan platformudur.',
       ' Bölgenizin dinamiklerini bilen ekibimizle; emlak, hayvan, araç ve köy ürünleri kategorilerinde ',
       '<em>doğru fiyatlama</em>, <em>pazarlama</em> ve <em>işlem yönetimi</em> sağlıyoruz.',
     '</p>',
     '<div class="grid md:grid-cols-2 gap-6">',
       '<div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">',
         '<h2 class="text-xl font-semibold text-slate-900 mb-3">Ne Yapıyoruz?</h2>',
         '<ul class="space-y-2 text-slate-700">',
           '<li>• İlan performans analizi ve emsal analizi</li>',
           '<li>• Profesyonel ilan sunumu ve hedefli pazarlama</li>',
           '<li>• Alıcı/kiracı aday yönetimi ve randevu organizasyonu</li>',
           '<li>• Sözleşme, tapu ve işlem takibi</li>',
         '</ul>',
       '</div>',
       '<div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">',
         '<h2 class="text-xl font-semibold text-slate-900 mb-3">Neden Kaman İlan?</h2>',
         '<ul class="space-y-2 text-slate-700">',
           '<li>• Şeffaf süreç ve düzenli bilgilendirme</li>',
           '<li>• Müşteri odaklı danışmanlık yaklaşımı</li>',
           '<li>• Bölgesel uzmanlık ve veri temelli karar</li>',
           '<li>• Hızlı iletişim ve güçlü takip</li>',
         '</ul>',
       '</div>',
     '</div>',
     '<div class="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">',
       '<p class="text-slate-700 m-0">',
         '<strong>Hedefimiz:</strong> İlanınız için en doğru stratejiyi belirlemek ve ',
         'ilan yayını ve iletişim sürecini güvenle tamamlamaktır.',
       '</p>',
     '</div>',
   '</section>'
 )),
 'Hakkımızda - Kaman İlan | Güvenilir İlan Platformu',
 'Kaman İlan: emlak, hayvan, araç ve köy ürünleri kategorilerinde şeffaf süreç, doğru fiyatlama ve güçlü ilan yönetimi sunar.'
);

-- Gizlilik Politikasi
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_gizlilik, 'tr',
 'Gizlilik Politikası',
 'gizlilik-politikasi',
 JSON_OBJECT('html',
   '<section><h1>Gizlilik Politikası</h1><p>Kaman İlan, kişisel verilerin korunmasını öncelik kabul eder.</p><p>Toplanan veriler yalnızca hizmet sunumu, güvenlik ve yasal yükümlülükler kapsamında işlenir.</p></section>'
 ),
 'Gizlilik Politikası - Kaman İlan',
 'Kaman İlan gizlilik politikası ve veri işleme esasları.'
);

-- Kullanim Kosullari
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_kullanim, 'tr',
 'Kullanım Koşulları',
 'kullanim-kosullari',
 JSON_OBJECT('html',
   '<section><h1>Kullanım Koşulları</h1><p>Platformu kullanan tüm kullanıcılar ilan yayın kurallarını ve yürürlükteki mevzuatı kabul eder.</p><p>Yanıltıcı içerik, yasaklı ürün/hizmet ilanı ve hak ihlali içeren paylaşımlar kaldırılır.</p></section>'
 ),
 'Kullanım Koşulları - Kaman İlan',
 'Kaman İlan kullanım koşulları ve ilan yayın kuralları.'
);

-- Kalite Politikamiz
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_kalite, 'tr',
 'Kalite Politikamız',
 'kalite-politikamiz',
 JSON_OBJECT('html', CONCAT(
   '<section class="container mx-auto px-4 py-8">',
     '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kalite Politikamız</h1>',
     '<p class="text-slate-700 mb-8">',
       'Kaman İlan olarak hizmet kalitemizi; <strong>şeffaflık</strong>, <strong>doğru bilgi</strong> ve ',
       '<strong>düzenli süreç yönetimi</strong> üzerine kurarız.',
     '</p>',
     '<div class="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border-l-4 border-blue-600 shadow-sm mb-8">',
       '<h2 class="text-2xl text-slate-900 mb-6">Hizmet Standartlarımız</h2>',
       '<div class="space-y-5 text-slate-700">',
         '<p>',
           '<strong>Doğru fiyatlama</strong> için emsal analizi, bölgesel trendler ve mülk özelliklerini birlikte değerlendiririz. ',
           'İlan sunumunda <em>kaliteli içerik</em> ve <em>doğru konum bilgisi</em> ile güven veririz.',
         '</p>',
         '<p>',
           'Süreç boyunca müşterilerimizi düzenli bilgilendirir; görüşme, teklif ve sözleşme adımlarını ',
           '<strong>net ve izlenebilir</strong> şekilde yönetiriz.',
         '</p>',
       '</div>',
     '</div>',
     '<div class="bg-gradient-to-r from-slate-900 to-blue-700 text-white p-8 rounded-xl shadow-sm">',
       '<h2 class="text-xl mb-4">Kalite Taahhüdümüz</h2>',
       '<p class="text-white/95">',
         'Her işlemde <strong>doğru bilgi</strong>, <strong>şeffaf iletişim</strong> ve <strong>düzenli takip</strong> ile ',
         'müşteri memnuniyetini en üst seviyede tutmayı taahhüt ederiz.',
       '</p>',
     '</div>',
   '</section>'
 )),
 'Kalite Politikamız - Kaman İlan | Şeffaf ve Veri Temelli Hizmet',
 'Kaman İlan kalite politikası: doğru fiyatlama, güvenilir ilan sunumu, düzenli süreç yönetimi ve müşteri memnuniyeti odaklı danışmanlık.'
);

-- Misyonumuz - Vizyonumuz
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_misyon, 'tr',
 'Misyonumuz - Vizyonumuz',
 'misyon-vizyon',
 JSON_OBJECT('html', CONCAT(
   '<section class="container mx-auto px-4 py-8">',
     '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Misyonumuz - Vizyonumuz</h1>',
     '<p class="text-slate-700 mb-8">',
       'Kaman İlan olarak ilan süreçlerini daha <strong>anlaşılır</strong>, daha <strong>güvenli</strong> ve ',
       'daha <strong>verimli</strong> hale getirmek için çalışıyoruz.',
     '</p>',
     '<div class="grid grid-cols-1 gap-8">',
       '<div class="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl shadow-sm border border-slate-200">',
         '<h2 class="text-2xl text-slate-900 m-0">Misyonumuz</h2>',
         '<div class="space-y-4 text-slate-700">',
           '<p>',
             '<strong>Şeffaf ve güvenilir danışmanlık</strong> yaklaşımıyla, satıcı ve alıcıyı doğru bilgilerle buluşturmak; ',
             '<em>doğru fiyatlama</em>, <em>doğru pazarlama</em> ve <em>doğru iletişim</em> ile süreci yönetmek.',
           '</p>',
           '<p>',
             'Her ilanı veri odaklı analiz ederek, ilanın potansiyelini doğru anlatmak ve iletişim sürecini ',
             '<strong>hızlı, düzenli ve güvenli</strong> şekilde sonuçlandırmak.',
           '</p>',
         '</div>',
       '</div>',
       '<div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">',
         '<h2 class="text-2xl text-blue-800 m-0">Vizyonumuz</h2>',
         '<div class="space-y-4 text-slate-700">',
           '<p>',
             '<strong>Bölgesinde örnek gösterilen</strong> bir ilan platformu markası olmak; ',
             'müşteri deneyimini teknoloji ve disiplinli süreç yönetimiyle güçlendirmek.',
           '</p>',
           '<p>',
             'İlan ekosisteminde <em>güven</em> ve <em>şeffaflık</em> standartlarını yükselterek, ',
             'uzun vadeli müşteri ilişkileri kurmak.',
           '</p>',
         '</div>',
       '</div>',
     '</div>',
   '</section>'
 )),
 'Misyonumuz ve Vizyonumuz - Kaman İlan | Şeffaf İlan Süreci',
 'Kaman İlan misyonu: doğru fiyatlama, profesyonel pazarlama, güvenli süreç. Vizyon: bölgede örnek gösterilen, müşteri deneyimi güçlü ilan markası.'
);
