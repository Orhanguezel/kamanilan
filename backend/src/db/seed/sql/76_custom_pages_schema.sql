-- =============================================================
-- FILE: 076_custom_pages.sql  (KAMAN ILAN • Drizzle şemayla birebir)
-- =============================================================

DROP TABLE IF EXISTS `custom_pages`;

CREATE TABLE `custom_pages` (
  `id`               CHAR(36)      NOT NULL,
  `title`            VARCHAR(255)  NOT NULL,
  `slug`             VARCHAR(255)  NOT NULL,
  `locale`           VARCHAR(10)   NOT NULL DEFAULT 'tr',
  `module_key`       VARCHAR(64)   NOT NULL DEFAULT 'about',

  -- JSON-string: {"html":"..."}
  `content`          LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
                     CHECK (JSON_VALID(`content`)),

  -- ✅ Storage pattern (şema ile aynı adlar)
  `image_url`         VARCHAR(500) DEFAULT NULL,
  `storage_asset_id`  CHAR(36)     DEFAULT NULL,
  `alt`               VARCHAR(255) DEFAULT NULL,

  `meta_title`       VARCHAR(255)  DEFAULT NULL,
  `meta_description` VARCHAR(500)  DEFAULT NULL,
  `is_published`     TINYINT(1)    NOT NULL DEFAULT 0,

  `created_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_custom_pages_slug_locale`   (`slug`,`locale`),
  KEY        `custom_pages_locale_idx`       (`locale`),
  KEY        `custom_pages_module_key_idx`   (`module_key`),
  KEY        `custom_pages_created_idx`      (`created_at`),
  KEY        `custom_pages_updated_idx`      (`updated_at`),
  KEY        `custom_pages_is_published_idx` (`is_published`),
  KEY        `custom_pages_asset_idx`        (`storage_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED (Kaman İlan sayfaları) – storage alanları opsiyonel, NULL geçiyoruz
-- =============================================================

INSERT INTO `custom_pages`
(`id`, `title`, `slug`, `content`,
 `image_url`, `storage_asset_id`, `alt`,
 `meta_title`, `meta_description`, `is_published`, `created_at`, `updated_at`)
VALUES

-- =============================================================
-- HAKKIMIZDA
-- =============================================================
(
  UUID(),
  'Hakkımızda',
  'hakkimizda',
  JSON_OBJECT('html',
    CONCAT(
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
    )
  ),
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80', NULL, 'Kaman İlan - Hakkımızda',
  'Hakkımızda - Kaman İlan | Güvenilir İlan Platformu',
  'Kaman İlan: emlak, hayvan, araç ve köy ürünleri kategorilerinde şeffaf süreç, doğru fiyatlama ve güçlü ilan yönetimi sunar.',
  1,
  NOW(3), NOW(3)
),

-- =============================================================
-- MİSYON & VİZYON
-- =============================================================
(
  UUID(),
  'Misyonumuz - Vizyonumuz',
  'misyon-vizyon',
  JSON_OBJECT('html',
    CONCAT(
      '<section class="container mx-auto px-4 py-8">',
        '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Misyonumuz - Vizyonumuz</h1>',
        '<p class="text-slate-700 mb-8">',
          'Kaman İlan olarak ilan süreçlerini daha <strong>anlaşılır</strong>, daha <strong>güvenli</strong> ve ',
          'daha <strong>verimli</strong> hale getirmek için çalışıyoruz.',
        '</p>',
        '<div class="grid grid-cols-1 gap-8">',
          '<div class="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl shadow-sm border border-slate-200">',
            '<div class="flex items-center mb-4">',
              '<div class="w-10 h-10 bg-slate-900 rounded-full text-white flex items-center justify-center mr-3">🎯</div>',
              '<h2 class="text-2xl text-slate-900 m-0">Misyonumuz</h2>',
            '</div>',
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
            '<div class="flex items-center mb-4">',
              '<div class="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center mr-3">🌟</div>',
              '<h2 class="text-2xl text-blue-800 m-0">Vizyonumuz</h2>',
            '</div>',
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
          '<div class="grid sm:grid-cols-2 gap-4">',
            '<div class="bg-white border-l-4 border-slate-900 p-4 rounded-r-lg shadow-sm">',
              '<h3 class="text-slate-900 font-semibold mb-2">📍 Bölgesel Uzmanlık</h3>',
              '<ul class="text-sm text-slate-700 space-y-1">',
                '<li>• Piyasa analizi ve emsal karşılaştırma</li>',
                '<li>• Doğru fiyatlama ve strateji</li>',
                '<li>• Etkin ilan ve sunum yönetimi</li>',
              '</ul>',
            '</div>',
            '<div class="bg-white border-l-4 border-blue-600 p-4 rounded-r-lg shadow-sm">',
              '<h3 class="text-blue-800 font-semibold mb-2">🤝 Müşteri Deneyimi</h3>',
              '<ul class="text-sm text-slate-700 space-y-1">',
                '<li>• Düzenli bilgilendirme</li>',
                '<li>• Hızlı iletişim ve takip</li>',
                '<li>• Güvenli işlem süreçleri</li>',
              '</ul>',
            '</div>',
          '</div>',
        '</div>',
      '</section>'
    )
  ),
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1400&q=80', NULL, 'Kaman İlan - Misyon Vizyon',
  'Misyonumuz ve Vizyonumuz - Kaman İlan | Şeffaf İlan Süreci',
  'Kaman İlan misyonu: doğru fiyatlama, profesyonel pazarlama, güvenli süreç. Vizyon: bölgede örnek gösterilen, müşteri deneyimi güçlü ilan markası.',
  1,
  NOW(3), NOW(3)
),

-- =============================================================
-- KALİTE POLİTİKAMIZ
-- =============================================================
(
  UUID(),
  'Kalite Politikamız',
  'kalite-politikamiz',
  JSON_OBJECT('html',
    CONCAT(
      '<section class="container mx-auto px-4 py-8">',
        '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kalite Politikamız</h1>',
        '<p class="text-slate-700 mb-8">',
          'Kaman İlan olarak hizmet kalitemizi; <strong>şeffaflık</strong>, <strong>doğru bilgi</strong> ve ',
          '<strong>düzenli süreç yönetimi</strong> üzerine kurarız.',
        '</p>',
        '<div class="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border-l-4 border-blue-600 shadow-sm mb-8">',
          '<h2 class="text-2xl text-slate-900 mb-6 flex items-center">',
            '<span class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4 text-white">🏆</span>',
            'Hizmet Standartlarımız',
          '</h2>',
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
        '<div class="bg-white border border-slate-200 p-8 rounded-xl shadow-sm mb-8">',
          '<h2 class="text-xl text-blue-800 mb-6 flex items-center">',
            '<span class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white text-sm">🔍</span>',
            'Kalite Kontrol Sürecimiz',
          '</h2>',
          '<div class="grid md:grid-cols-2 gap-6">',
            '<div class="space-y-4">',
              '<div class="flex items-start"><span class="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">1</span><div><h3 class="text-sm text-slate-900 mb-1">Ön Analiz</h3><p class="text-xs text-slate-600">Emsal, fiyat aralığı ve satış/kiralama stratejisi</p></div></div>',
              '<div class="flex items-start"><span class="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">2</span><div><h3 class="text-sm text-slate-900 mb-1">Portföy Hazırlığı</h3><p class="text-xs text-slate-600">İlan metni, görseller, konum ve temel bilgiler</p></div></div>',
              '<div class="flex items-start"><span class="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">3</span><div><h3 class="text-sm text-slate-900 mb-1">Aday Yönetimi</h3><p class="text-xs text-slate-600">Görüşmeler, talepler, geri bildirim ve eleme</p></div></div>',
            '</div>',
            '<div class="space-y-4">',
              '<div class="flex items-start"><span class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">4</span><div><h3 class="text-sm text-slate-900 mb-1">Teklif & Müzakere</h3><p class="text-xs text-slate-600">Şeffaf pazarlık yönetimi ve net bilgilendirme</p></div></div>',
              '<div class="flex items-start"><span class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">5</span><div><h3 class="text-sm text-slate-900 mb-1">Sözleşme Süreci</h3><p class="text-xs text-slate-600">Evrak kontrol, sözleşme koordinasyonu</p></div></div>',
              '<div class="flex items-start"><span class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white text-xs mt-1">6</span><div><h3 class="text-sm text-slate-900 mb-1">Teslim & Takip</h3><p class="text-xs text-slate-600">Teslim adımı ve memnuniyet takibi</p></div></div>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="bg-gradient-to-r from-slate-900 to-blue-700 text-white p-8 rounded-xl shadow-sm">',
          '<div class="flex items-center mb-4">',
            '<span class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 text-2xl">🤝</span>',
            '<h2 class="text-xl m-0">Kalite Taahhüdümüz</h2>',
          '</div>',
          '<div class="space-y-4 text-white/95">',
            '<p>',
              'Her işlemde <strong>doğru bilgi</strong>, <strong>şeffaf iletişim</strong> ve <strong>düzenli takip</strong> ile ',
              'müşteri memnuniyetini en üst seviyede tutmayı taahhüt ederiz.',
            '</p>',
          '</div>',
        '</div>',
      '</section>'
    )
  ),
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', NULL, 'Kaman İlan - Kalite Politikası',
  'Kalite Politikamız - Kaman İlan | Şeffaf ve Veri Temelli Hizmet',
  'Kaman İlan kalite politikası: doğru fiyatlama, güvenilir ilan sunumu, düzenli süreç yönetimi ve müşteri memnuniyeti odaklı danışmanlık.',
  1,
  NOW(3), NOW(3)
),

-- =============================================================
-- KAMPANYA (Örnek)
-- =============================================================
(
  UUID(),
  'Yeni Yıl İlan Vitrini Kampanyası',
  'yeni-yil-kampanyasi',
  JSON_OBJECT('html', CONCAT(
    '<div class="min-h-screen bg-slate-50 py-8">',
    '  <div class="container mx-auto px-4 max-w-4xl">',
    '    <a href="/" class="inline-flex items-center gap-2 mb-6 border border-slate-900 text-slate-900 rounded-md px-3 py-2 hover:bg-slate-100 transition">&#8592; Ana Sayfaya Dön</a>',
    '    <article class="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">',
    '      <div class="relative h-64 md:h-80">',
    '        <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&amp;fit=crop&amp;w=1400&amp;q=80" alt="Yeni Yıl İlan Vitrini Kampanyası" class="w-full h-full object-cover" />',
    '        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>',
    '        <div class="absolute bottom-4 left-4 text-white"><span class="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">Kampanya</span></div>',
    '      </div>',
    '      <div class="p-6 md:p-8">',
    '        <div class="flex items-center gap-4 mb-6 text-sm text-slate-600">',
    '          <div class="flex items-center gap-2"><span>📅</span><span>Ocak 2026</span></div>',
    '          <div class="flex items-center gap-2"><span>🏷️</span><span>Gayrimenkul</span></div>',
    '        </div>',
    '        <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Yeni Yıl İlan Vitrini Kampanyası</h1>',
    '        <div class="prose max-w-none space-y-6">',
    '          <div class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">',
    '            <h2 class="text-xl font-semibold text-blue-800 mb-3">🎁 Seçili Portföylerde Özel Danışmanlık Desteği</h2>',
    '            <p class="text-slate-700 leading-relaxed">Yeni yıl dönemi boyunca, seçili ilanlarda satış/kiralama sürecine özel ilan hazırlığı ve hedefli pazarlama desteği sunuyoruz. Kampanya koşulları ilan tipine göre değişebilir.</p>',
    '          </div>',
    '          <div class="grid md:grid-cols-2 gap-6">',
    '            <div class="bg-white border border-slate-200 p-6 rounded-lg">',
    '              <h3 class="text-lg font-semibold text-slate-900 mb-4">Kapsam</h3>',
    '              <ul class="space-y-2 text-slate-700">',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span>İlan analizi & doğru fiyatlama</li>',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span>İlan metni ve görsel sunum önerileri</li>',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span>Hedef kitleye yönelik pazarlama planı</li>',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-600 rounded-full"></span>Görüşme ve teklif yönetimi</li>',
    '              </ul>',
    '            </div>',
    '            <div class="bg-white border border-slate-200 p-6 rounded-lg">',
    '              <h3 class="text-lg font-semibold text-slate-900 mb-4">Şartlar</h3>',
    '              <ul class="space-y-2 text-slate-700">',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-slate-900 rounded-full"></span>Kampanya dönemi boyunca geçerlidir</li>',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-slate-900 rounded-full"></span>Seçili ilanlarda uygulanır</li>',
    '                <li class="flex items-center gap-2"><span class="w-2 h-2 bg-slate-900 rounded-full"></span>Detaylar için iletişime geçiniz</li>',
    '              </ul>',
    '            </div>',
    '          </div>',
    '          <div class="bg-slate-100 p-6 rounded-lg">',
    '            <h3 class="text-xl font-semibold text-slate-900 mb-4">🕐 Kampanya Süresi</h3>',
    '            <p class="text-slate-700 leading-relaxed mb-4">Kampanya <strong>Ocak 2026</strong> boyunca geçerlidir. İlanlarınız için uygunluk ve detaylı bilgi için bizimle iletişime geçin.</p>',
    '            <div class="flex flex-col sm:flex-row gap-3">',
    '              <a href="/iletisim" class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">İletişim Formu</a>',
    '              <a href="/ilanlar" class="inline-flex items-center justify-center border border-blue-600 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md">İlanları Görüntüle</a>',
    '            </div>',
    '          </div>',
    '          <div class="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">',
    '            <h3 class="text-lg font-semibold text-yellow-800 mb-3">⚠️ Bilgilendirme</h3>',
    '            <p class="text-yellow-700 leading-relaxed">Bu sayfa örnek kampanya içeriğidir. Gerçek kampanya koşulları ve kapsamı admin panelden güncellenebilir.</p>',
    '          </div>',
    '        </div>',
    '      </div>',
    '    </article>',
    '  </div>',
    '</div>'
  )),
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80',
  NULL,
  'Yeni Yıl İlan Vitrini Kampanyası',
  'Yeni Yıl İlan Vitrini Kampanyası - Kaman İlan',
  'Ocak 2026 boyunca seçili ilanlarda özel danışmanlık ve hedefli pazarlama desteği. Detaylar için iletişime geçin.',
  1,
  NOW(3), NOW(3)
)

ON DUPLICATE KEY UPDATE
  `title`            = VALUES(`title`),
  `content`          = VALUES(`content`),
  `image_url`        = VALUES(`image_url`),
  `storage_asset_id` = VALUES(`storage_asset_id`),
  `alt`              = VALUES(`alt`),
  `meta_title`       = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`),
  `is_published`     = VALUES(`is_published`),
  `updated_at`       = VALUES(`updated_at`);

-- module_key backfill for seeded pages
UPDATE `custom_pages` SET `module_key` = 'about' WHERE `slug` IN ('hakkimizda', 'misyon-vizyon');
UPDATE `custom_pages` SET `module_key` = 'quality' WHERE `slug` IN ('kalite-politikamiz');
UPDATE `custom_pages` SET `module_key` = 'campaign' WHERE `slug` IN ('yeni-yil-kampanyasi');
