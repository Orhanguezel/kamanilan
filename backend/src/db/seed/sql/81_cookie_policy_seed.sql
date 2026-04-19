SET NAMES utf8mb4;

SET @pg_cerez = UUID();

INSERT INTO `custom_pages` 
  (`id`, `module_key`, `is_published`, `display_order`) 
VALUES 
  (@pg_cerez, 'legal', 1, 10);

INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_cerez, 'tr',
 'Çerez Politikası',
 'cerez-politikasi',
 JSON_OBJECT('html', CONCAT(
   '<div class="editorial-content">',
     '<div class="eyebrow mb-6">Tanımlama Teknolojileri</div>',
     '<h1>Çerez Kullanımı Hakkında</h1>',
     '<p>Kaman İlan olarak, platformumuzda kullanıcı deneyiminizi iyileştirmek, hizmetlerimizi optimize etmek ve güvenli bir ortam sunmak amacıyla çerezler (cookies) kullanmaktayız.</p>',
     '<h2>Çerez Nedir?</h2>',
     '<p>Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, siteyi daha verimli kullanmanıza ve tercihlerinizi hatırlamamıza yardımcı olur.</p>',
     '<h2>Kullandığımız Çerez Türleri</h2>',
     '<ul>',
       '<li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevlerini yerine getirmesi için gereklidir (örneğin oturum açma).</li>',
       '<li><strong>Performans Çerezleri:</strong> Sitenin nasıl kullanıldığını analiz etmemize ve hataları tespit etmemize yarar.</li>',
       '<li><strong>Fonksiyonel Çerezler:</strong> Dil tercihiniz gibi ayarları hatırlamamızı sağlar.</li>',
     '</ul>',
     '<blockquote>Çerez tercihlerinizi tarayıcı ayarlarınızdan dilediğiniz zaman değiştirebilirsiniz.</blockquote>',
   '</div>'
 )),
 'Çerez Politikası — Kaman İlan',
 'Kaman İlan web sitesinde kullanılan çerezler ve veri toplama yöntemleri hakkında bilgilendirme.'
);
