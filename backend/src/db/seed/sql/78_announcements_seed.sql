/* 78_announcements_seed.sql — Kaman İlan duyurular */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `announcements`;

CREATE TABLE `announcements` (
  `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `uuid`              CHAR(36)        NOT NULL,
  `locale`            VARCHAR(10)     NOT NULL DEFAULT 'tr',
  `title`             VARCHAR(255)    NOT NULL,
  `slug`              VARCHAR(255)    NOT NULL,
  `excerpt`           VARCHAR(500)    NULL,
  `content`           LONGTEXT        NULL,
  `category`          VARCHAR(100)    NOT NULL DEFAULT 'duyuru',
  `cover_image_url`   VARCHAR(500)    NULL,
  `cover_asset_id`    CHAR(36)        NULL,
  `alt`               VARCHAR(255)    NULL,
  `author`            VARCHAR(255)    NULL,
  `meta_title`        VARCHAR(255)    NULL,
  `meta_description`  VARCHAR(500)    NULL,
  `is_published`      TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `is_featured`       TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `display_order`     INT UNSIGNED    NOT NULL DEFAULT 0,
  `published_at`      DATETIME(3)     NULL,
  `created_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ann_uuid`        (`uuid`),
  UNIQUE KEY `uniq_ann_slug_locale` (`slug`, `locale`),
  KEY `idx_ann_locale`     (`locale`),
  KEY `idx_ann_category`   (`category`),
  KEY `idx_ann_published`  (`is_published`),
  KEY `idx_ann_featured`   (`is_featured`),
  KEY `idx_ann_pub_at`     (`published_at`),
  KEY `idx_ann_cover_asset`(`cover_asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Öne çıkan duyurular (is_featured=1) ──────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000001','tr',
  'Kaman İlan Platformu Hizmete Girdi!',
  'kaman-ilan-platformu-hizmete-girdi',
  'Kaman ve çevre ilçelerin en kapsamlı ücretsiz ilan platformu artık yayında. Evinizi, arabanızı, eşyalarınızı kolayca satın.',
  '<h2>Kaman İlan Hizmete Açıldı</h2>
<p>Uzun süredir beklenen <strong>Kaman İlan</strong> platformu, Kaman ve çevre ilçe sakinlerinin ihtiyaçlarına yönelik ücretsiz ilan hizmeti sunmak amacıyla hizmete girmiştir.</p>
<p>Platformumuzda <strong>Emlak, Araç, Hayvan, Yiyecek</strong> ve daha birçok kategoride ilan verebilirsiniz. Tüm ilanlar <strong>tamamen ücretsiz</strong> yayınlanmaktadır.</p>
<h3>Nasıl İlan Verebilirsiniz?</h3>
<ol>
  <li>Sağ üst köşedeki <strong>"Üye Ol"</strong> butonuna tıklayın.</li>
  <li>Ad, e-posta ve şifrenizle hızlıca hesap oluşturun.</li>
  <li><strong>"İlan Ver"</strong> butonuna tıklayın, kategorinizi seçin ve ilanınızı yayınlayın.</li>
</ol>
<p>Sorularınız için <a href="/iletisim">İletişim</a> sayfamızdan bize ulaşabilirsiniz.</p>',
  'duyuru','Kaman İlan Ekibi',1,1,1,DATE_SUB(NOW(3), INTERVAL 30 DAY)
),
(
  'b0000001-0000-4000-8000-000000000002','tr',
  'Açılış Dönemi: Tüm İlanlar 6 Ay Ücretsiz!',
  'acilis-donemi-tum-ilanlar-ucretsiz',
  'Platformumuzu daha iyi tanımanız için başlangıç döneminde tüm kategorilerde ilan vermek tamamen ücretsiz. Sınırsız fotoğraf yükleme dahil.',
  '<h2>Ücretsiz İlan Kampanyası</h2>
<p>Platformumuzun açılışını kutlamak amacıyla <strong>ilk 6 ay</strong> boyunca tüm kategorilerde ilan vermek tamamen ücretsizdir.</p>
<h3>Kampanya Kapsamındaki Özellikler</h3>
<ul>
  <li>✅ Sınırsız ilan</li>
  <li>✅ İlan başına 10 fotoğraf yükleme</li>
  <li>✅ Anında yayına alma</li>
  <li>✅ Alıcılarla doğrudan mesajlaşma</li>
  <li>✅ İlanlarını öne çıkarma (günde 1 adet)</li>
</ul>
<p>Bu fırsatı değerlendirerek ilanlarınızı şimdi yayınlayın!</p>',
  'kampanya','Kaman İlan Ekibi',1,1,2,DATE_SUB(NOW(3), INTERVAL 28 DAY)
),
(
  'b0000001-0000-4000-8000-000000000003','tr',
  'Kaman Cevizi Hasatı Başlıyor — Özel Kampanya',
  'kaman-cevizi-hasati-basladi',
  'Kaman''ın meşhur cevizi hasat sezonu açıldı! Üreticiler doğrudan platforma ilan verebilir, alıcılar en taze cevizi bulabilir.',
  '<h2>Ceviz Sezonu Kampanyası</h2>
<p>Kaman, dünyaca ünlü Kaman cevizinin anavatanıdır. Bu yıl hasat sezonu Eylül ayında başlıyor!</p>
<p>Üreticiler için özel kolaylıklar:</p>
<ul>
  <li>🌰 Yiyecek kategorisinde ceviz ilanları <strong>ücretsiz öne çıkarma</strong> hakkı</li>
  <li>🚚 Kargo ve teslimat bilgilerini ilana ekleyebilme</li>
  <li>📞 Doğrudan alıcı iletişimi</li>
</ul>
<p>Kaman cevizini taze almak isteyen alıcılar için <a href="/ilanlar?type=food">Yiyecek kategorisine</a> göz atabilirsiniz.</p>',
  'kampanya','Kaman İlan Ekibi',1,1,3,DATE_SUB(NOW(3), INTERVAL 15 DAY)
);

-- ─── Haberler ──────────────────────────────────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000004','tr',
  'Tarım ve Hayvancılık Kategorisi Eklendi',
  'tarim-hayancilik-kategorisi-eklendi',
  'Kaman ilçesinin tarım ve hayvancılık sektörüne yönelik özel kategori hizmete girdi. Traktör, ekipman, büyük ve küçük baş hayvan ilanları için.',
  '<h2>Tarım & Hayvancılık Kategorisi</h2>
<p>Kaman ilçemizin temel geçim kaynakları arasında yer alan tarım ve hayvancılık sektörüne yönelik <strong>Tarım & Hayvancılık</strong> kategorimiz hizmete girmiştir.</p>
<h3>Bu Kategoride Neler İlan Edebilirsiniz?</h3>
<ul>
  <li>Traktör ve tarım makineleri</li>
  <li>Sulama sistemleri ve ekipmanları</li>
  <li>Büyükbaş ve küçükbaş hayvanlar</li>
  <li>Arazi ve tarla kiralama/satışı</li>
  <li>Tohum, gübre ve tarım ürünleri</li>
  <li>Meyve ve sebze toptan satışı</li>
</ul>',
  'haber','Kaman İlan Ekibi',1,0,4,DATE_SUB(NOW(3), INTERVAL 25 DAY)
),
(
  'b0000001-0000-4000-8000-000000000005','tr',
  'Kaman İlan Mobil Uygulaması Geliyor',
  'mobil-uygulama-geliyor',
  'iOS ve Android için Kaman İlan mobil uygulaması yakında yayında! Beta testçi başvuruları alınıyor.',
  '<h2>Mobil Uygulama Yolda</h2>
<p>Kaman İlan iOS ve Android uygulamaları için geliştirme sürecimiz tüm hızıyla devam etmektedir.</p>
<h3>Uygulamada Neler Olacak?</h3>
<ul>
  <li>📱 Anlık bildirimler — ilana teklif gelince haberin olsun</li>
  <li>📸 Telefondan doğrudan fotoğraf çekip yükleme</li>
  <li>🔔 Kayıtlı aramalar için yeni ilan bildirimi</li>
  <li>💬 Yerleşik mesajlaşma sistemi</li>
</ul>
<h3>Beta Testçisi Olmak İster misiniz?</h3>
<p>Beta testçilerimize <strong>6 ay ücretsiz premium üyelik</strong> hediye edeceğiz. İlgilenenler <a href="/iletisim">İletişim</a> sayfamızdan başvurabilir.</p>',
  'haber','Kaman İlan Ekibi',1,0,5,DATE_SUB(NOW(3), INTERVAL 20 DAY)
),
(
  'b0000001-0000-4000-8000-000000000006','tr',
  'Mesajlaşma Özelliği Devreye Alındı',
  'mesajlasma-ozelligi-devreye-alindi',
  'Artık alıcı ve satıcılar platform üzerinden telefon numarasını paylaşmadan güvenli şekilde mesajlaşabiliyor.',
  '<h2>Güvenli Mesajlaşma Sistemi</h2>
<p>Platformumuzda alıcı ve satıcıların telefon numarası ya da kişisel bilgi paylaşmadan iletişim kurabilmesini sağlayan <strong>yerleşik mesajlaşma sistemi</strong> devreye alınmıştır.</p>
<h3>Özellikler</h3>
<ul>
  <li>Gerçek zamanlı mesaj iletimi</li>
  <li>İlan görseli mesaj başlığında görünür</li>
  <li>Okundu/iletildi bildirimi</li>
  <li>Spam ve taciz bildirme butonu</li>
</ul>',
  'haber','Kaman İlan Ekibi',1,0,6,DATE_SUB(NOW(3), INTERVAL 18 DAY)
),
(
  'b0000001-0000-4000-8000-000000000007','tr',
  'Kaman Belediyesi ile İşbirliği Protokolü İmzalandı',
  'kaman-belediyesi-isbirligi-protokolu',
  'Kaman Belediyesi ile imzalanan protokol kapsamında yerel esnaf ve üreticiler için özel avantajlar sunulacak.',
  '<h2>Belediye İşbirliği</h2>
<p>Kaman Belediyesi ile imzalanan işbirliği protokolü kapsamında yerel esnaf ve üreticilerimize özel destekler sunulacaktır.</p>
<h3>Protokol Kapsamında</h3>
<ul>
  <li>Yerel esnaf ilanları belediye web sitesinde duyurulacak</li>
  <li>Kaman cevizi ve el sanatları üreticilerine özel vitrin</li>
  <li>Sosyal medya tanıtım desteği</li>
</ul>',
  'haber','Kaman İlan Ekibi',1,0,7,DATE_SUB(NOW(3), INTERVAL 12 DAY)
);

-- ─── Kampanyalar ───────────────────────────────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000008','tr',
  'Ramazan Özel: Yiyecek İlanlarında Ücretsiz Öne Çıkarma',
  'ramazan-yiyecek-ilanlari-one-cikarma',
  'Ramazan boyunca yiyecek kategorisindeki tüm ilanlar ücretsiz öne çıkarılıyor. Ev yapımı ürünlerinizi şimdi listeleyin.',
  '<h2>Ramazan Kampanyası</h2>
<p>Ramazan ayı boyunca <strong>Yiyecek kategorisindeki</strong> tüm ilanlar ücretsiz olarak öne çıkarılacaktır.</p>
<h3>Kampanya Detayları</h3>
<ul>
  <li>📅 Süre: Ramazan ayı boyunca</li>
  <li>🍽️ Kapsam: Yiyecek kategorisindeki tüm ilanlar</li>
  <li>🆓 Öne çıkarma: Tamamen ücretsiz</li>
</ul>
<p>Ev yapımı börek, çorba, pide, tatlı ve diğer Ramazan lezzetlerinizi şimdi listeleyin!</p>',
  'kampanya','Kaman İlan Ekibi',1,0,8,DATE_SUB(NOW(3), INTERVAL 10 DAY)
),
(
  'b0000001-0000-4000-8000-000000000009','tr',
  'İlk İlanını Ver, Profil Rozetini Kazan',
  'ilk-ilanini-ver-rozet-kazan',
  'Platformda ilk ilanını veren kullanıcılar "İlk İlan" rozeti kazanıyor. Rozetli profiller %40 daha fazla ilgi görüyor.',
  '<h2>Rozet Sistemi Başladı</h2>
<p>Platforma yeni eklenen <strong>rozet sistemi</strong> ile aktif kullanıcılar ödüllendiriliyor.</p>
<h3>Kazanabileceğiniz Rozetler</h3>
<ul>
  <li>🏅 İlk İlan — İlk ilanını verene</li>
  <li>⭐ Güvenilir Satıcı — 5 başarılı satışa</li>
  <li>🌟 Süper Satıcı — 20 başarılı satışa</li>
  <li>👑 Platinum — 50+ satışa</li>
</ul>
<p>Rozetli profiller arama sonuçlarında <strong>%40 daha fazla</strong> tıklanma alıyor!</p>',
  'kampanya','Kaman İlan Ekibi',1,0,9,DATE_SUB(NOW(3), INTERVAL 8 DAY)
),
(
  'b0000001-0000-4000-8000-000000000010','tr',
  'Arkadaşını Davet Et, İkisi de Kazan',
  'arkadasini-davet-et-kazan',
  'Arkadaşını Kaman İlan''a davet et, o da ilk ilanını verince ikisi de 1 ay ücretsiz öne çıkarma hakkı kazanıyor.',
  '<h2>Arkadaş Davet Kampanyası</h2>
<p>Kaman İlan topluluğunu büyütmek için <strong>arkadaş davet kampanyası</strong> başlatıyoruz!</p>
<h3>Nasıl Çalışır?</h3>
<ol>
  <li>Profilinizden kişisel davet linkinizi kopyalayın</li>
  <li>Arkadaşınızla paylaşın</li>
  <li>Arkadaşınız kayıt olup ilk ilanını verince <strong>her ikiniz de 1 ay ücretsiz öne çıkarma</strong> hakkı kazanırsınız</li>
</ol>',
  'kampanya','Kaman İlan Ekibi',1,0,10,DATE_SUB(NOW(3), INTERVAL 5 DAY)
);

-- ─── Etkinlikler ───────────────────────────────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000011','tr',
  'Kaman Ceviz Festivali — İlan Özel Stantları',
  'kaman-ceviz-festivali-ilan-stantlari',
  'Yıllık Kaman Ceviz Festivali''nde platformumuzun özel standında üreticiler, ilanlarını anında oluşturabiliyor.',
  '<h2>Ceviz Festivali Özel Stantları</h2>
<p>Kaman''ın geleneksel <strong>Ceviz Festivali</strong>''nde bu yıl Kaman İlan olarak da yer alacağız!</p>
<h3>Festival Standımızda</h3>
<ul>
  <li>Ücretsiz ilan oluşturma ve fotoğraf yükleme yardımı</li>
  <li>Dijital pazarlama ipuçları</li>
  <li>Platform tanıtım ve demo</li>
  <li>Üreticiler için özel rozet ve hediyeler</li>
</ul>
<p><strong>Tarih:</strong> Festival süresince<br>
<strong>Yer:</strong> Kaman Meydanı — Kaman İlan Standı</p>',
  'etkinlik','Kaman İlan Ekibi',1,0,11,DATE_SUB(NOW(3), INTERVAL 22 DAY)
),
(
  'b0000001-0000-4000-8000-000000000012','tr',
  'Ücretsiz Dijital Pazarlama Semineri — Kaman',
  'ucretsiz-dijital-pazarlama-semineri',
  'Kaman İlan, yerel esnaf ve üreticiler için ücretsiz "Dijital Pazarlama ve Etkili İlan Hazırlama" semineri düzenliyor.',
  '<h2>Dijital Pazarlama Semineri</h2>
<p>Yerel esnafımıza ve üreticilerimize yönelik <strong>ücretsiz dijital pazarlama semineri</strong> düzenliyoruz.</p>
<h3>Seminer Konuları</h3>
<ul>
  <li>Etkili ilan başlığı nasıl yazılır?</li>
  <li>Ürün fotoğrafı nasıl çekilir?</li>
  <li>Sosyal medyada ilan paylaşımı</li>
  <li>Alıcılarla iletişim ipuçları</li>
</ul>
<p><strong>Kontenjan sınırlıdır.</strong> Kayıt için <a href="/iletisim">İletişim</a> sayfamızdan başvurun.</p>',
  'etkinlik','Kaman İlan Ekibi',1,0,12,DATE_SUB(NOW(3), INTERVAL 6 DAY)
);

-- ─── Güncellemeler ─────────────────────────────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000013','tr',
  'Yeni Özellik: Harita Üzerinde İlan Konumu',
  'yeni-ozellik-harita-uzerinde-ilan-konumu',
  'Artık ilanınıza harita üzerinden konum ekleyebilirsiniz. Alıcılar mülk veya ürünün tam konumunu görebiliyor.',
  '<h2>Harita Konumu Özelliği</h2>
<p>İlanlarınıza artık <strong>harita üzerinden konum</strong> ekleyebilirsiniz. Emlak ve taşınmaz ilanlarında bu özellik özellikle işe yarıyor.</p>
<h3>Nasıl Kullanılır?</h3>
<ol>
  <li>İlan oluşturma formunda "Konum" bölümüne gidin</li>
  <li>Harita üzerinde mülk/ürün konumunu işaretleyin</li>
  <li>İlanınızı kaydedin</li>
</ol>
<p>Konumlu ilanlar arama sonuçlarında <strong>harita görünümünde</strong> de listeleniyor.</p>',
  'guncelleme','Kaman İlan Ekibi',1,0,13,DATE_SUB(NOW(3), INTERVAL 16 DAY)
),
(
  'b0000001-0000-4000-8000-000000000014','tr',
  'Arama Filtrelerine Fiyat Aralığı Eklendi',
  'arama-filtrelerine-fiyat-araligi-eklendi',
  'İlanlar sayfasında artık min-max fiyat aralığı ile filtreleme yapabilirsiniz. Bütçenize uygun ilanları kolayca bulun.',
  '<h2>Fiyat Aralığı Filtresi</h2>
<p>Kullanıcı geri bildirimleri doğrultusunda <strong>fiyat aralığı filtreleme</strong> özelliği eklendi.</p>
<p>Artık arama sayfasında minimum ve maksimum fiyat belirleyerek bütçenize uygun ilanları kolayca listeleyebilirsiniz.</p>',
  'guncelleme','Kaman İlan Ekibi',1,0,14,DATE_SUB(NOW(3), INTERVAL 14 DAY)
),
(
  'b0000001-0000-4000-8000-000000000015','tr',
  'Güvenlik Güncellemesi — Hesap Koruması',
  'guvenlik-guncellemesi-hesap-korumasi',
  'İki faktörlü kimlik doğrulama (2FA) ve şüpheli giriş bildirimi özelliği hesaplarınıza eklendi.',
  '<h2>Hesap Güvenliği Güçlendirildi</h2>
<p>Kullanıcı hesaplarının güvenliğini artırmak amacıyla önemli güncellemeler yapılmıştır.</p>
<h3>Yeni Güvenlik Özellikleri</h3>
<ul>
  <li>🔐 <strong>İki Faktörlü Doğrulama (2FA)</strong> — SMS veya uygulama ile</li>
  <li>🚨 <strong>Şüpheli Giriş Bildirimi</strong> — Farklı konumdan giriş e-posta bildirimi</li>
  <li>🔒 <strong>Oturum Yönetimi</strong> — Açık oturumları görüp kapatabilme</li>
</ul>
<p>Bu özellikleri etkinleştirmek için <a href="/hesabim">Hesabım</a> sayfasını ziyaret edin.</p>',
  'guncelleme','Sistem Yöneticisi',1,0,15,DATE_SUB(NOW(3), INTERVAL 9 DAY)
),
(
  'b0000001-0000-4000-8000-000000000016','tr',
  'Platform Bakım Duyurusu — 1 Mart 2026',
  'platform-bakim-duyurusu-1-mart-2026',
  '1 Mart 2026 tarihinde saat 03:00-05:00 arasında planlı bakım yapılacak. Bu sürede platforma erişimde kısa kesinti yaşanabilir.',
  '<h2>Planlı Bakım Çalışması</h2>
<p><strong>Tarih:</strong> 1 Mart 2026<br>
<strong>Saat:</strong> 03:00 – 05:00 (TSİ)</p>
<p>Altyapı güncellemesi ve veritabanı optimizasyonu nedeniyle kısa süreli erişim kesintisi yaşanabilir.</p>
<p>İlanlarınız etkilenmeyecek; sadece platform erişiminde geçici bir duraklama olacaktır. Anlayışınız için teşekkür ederiz.</p>',
  'guncelleme','Sistem Yöneticisi',1,0,16,DATE_SUB(NOW(3), INTERVAL 3 DAY)
);

-- ─── Genel duyurular ───────────────────────────────────────────────────────

INSERT INTO `announcements`
  (`uuid`,`locale`,`title`,`slug`,`excerpt`,`content`,`category`,`author`,`is_published`,`is_featured`,`display_order`,`published_at`)
VALUES
(
  'b0000001-0000-4000-8000-000000000017','tr',
  'Güvenli Alışveriş: Dolandırıcılıktan Korunma Rehberi',
  'guvenli-alisveris-dolandiriciliktan-korunma',
  'İkinci el alışverişte sık karşılaşılan dolandırıcılık yöntemleri ve korunma yolları hakkında kapsamlı rehber.',
  '<h2>Güvenli Alım-Satım Rehberi</h2>
<h3>Alıcılar İçin Uyarılar</h3>
<ul>
  <li>❌ Ürünü görmeden asla peşin ödeme yapmayın</li>
  <li>❌ Kripto para veya para havalesi ile ödeme talep edenlere inanmayın</li>
  <li>✅ Mümkünse yüz yüze teslim alın</li>
  <li>✅ Kamu alanında (çarşı, market önü) buluşun</li>
</ul>
<h3>Satıcılar İçin Uyarılar</h3>
<ul>
  <li>❌ Ürünü göndermeden önce ödemeyi almadan göndermeyin</li>
  <li>✅ Gerçek ve net fotoğraflar yükleyin</li>
  <li>✅ Fiyatı piyasaya uygun tutun</li>
</ul>
<p>Şüpheli ilanları <strong>Şikayet Et</strong> butonu ile bildirin. Ekibimiz 24 saat içinde inceleyecektir.</p>',
  'duyuru','Kaman İlan Ekibi',1,0,17,DATE_SUB(NOW(3), INTERVAL 23 DAY)
),
(
  'b0000001-0000-4000-8000-000000000018','tr',
  'İlan Fotoğrafı Çekme Rehberi — Daha Çok Alıcı',
  'ilan-fotografi-cekme-rehberi',
  'Kaliteli fotoğraflar ilanınıza 3 kat daha fazla tıklanma sağlıyor. Telefonu nasıl kullanacağınızı anlatan pratik rehber.',
  '<h2>Kaliteli İlan Fotoğrafı Nasıl Çekilir?</h2>
<p>Araştırmalar, kaliteli fotoğraflı ilanların <strong>3 kat daha fazla</strong> ilgi gördüğünü ortaya koymaktadır.</p>
<h3>Pratik İpuçları</h3>
<ul>
  <li>☀️ Gün ışığında veya iyi aydınlatılmış ortamda çekin</li>
  <li>🧹 Ürünü önceden temizleyin ve düzenleyin</li>
  <li>📐 Birden fazla açıdan (ön, yan, arka, detay) fotoğraflayın</li>
  <li>🎨 Sade arka plan kullanın — beyaz duvar idealdir</li>
  <li>🔍 Kusurları gizlemeyin; dürüst görseller alıcı güveni oluşturur</li>
  <li>📱 Telefonunuzu yatay tutun — 16:9 oran en iyi sonucu verir</li>
</ul>',
  'duyuru','Kaman İlan Ekibi',1,0,18,DATE_SUB(NOW(3), INTERVAL 17 DAY)
),
(
  'b0000001-0000-4000-8000-000000000019','tr',
  'Kullanım Koşulları Güncellendi',
  'kullanim-kosullari-guncellendi',
  'Platform kullanım koşullarımız ve gizlilik politikamız güncellendi. Değişiklikler 1 Mart 2026 tarihinde yürürlüğe girecek.',
  '<h2>Kullanım Koşulları Güncellemesi</h2>
<p>Platform kullanım koşullarımız ve gizlilik politikamız güncellendi. Başlıca değişiklikler:</p>
<ul>
  <li>Kişisel verilerin işlenmesi hakkında ek açıklamalar</li>
  <li>İlan içerik kurallarının netleştirilmesi</li>
  <li>Yasadışı ürün ve hizmet ilanlarına yönelik ek yaptırımlar</li>
</ul>
<p>Güncellenmiş koşulları <a href="/kullanim-kosullari">Kullanım Koşulları</a> sayfasında inceleyebilirsiniz.</p>',
  'duyuru','Kaman İlan Ekibi',1,0,19,DATE_SUB(NOW(3), INTERVAL 4 DAY)
),
(
  'b0000001-0000-4000-8000-000000000020','tr',
  'Kaman İlan Sosyal Medyada — Bizi Takip Edin',
  'kaman-ilan-sosyal-medyada',
  'Kaman İlan artık Instagram, Facebook ve Twitter''da! Güncel ilanlar, kampanyalar ve haberler için takip edin.',
  '<h2>Sosyal Medyada Kaman İlan</h2>
<p>Güncel ilanlar, kampanyalar ve haberler için sosyal medya hesaplarımızı takip edin!</p>
<ul>
  <li>📸 <strong>Instagram:</strong> @kamanilan — günün öne çıkan ilanları</li>
  <li>👥 <strong>Facebook:</strong> Kaman İlan — topluluk grubu</li>
  <li>🐦 <strong>Twitter/X:</strong> @kamanilan — anlık duyurular</li>
</ul>
<p>Sosyal medya hesaplarımızı takip eden kullanıcılara <strong>aylık öne çıkarma kuponları</strong> dağıtıyoruz!</p>',
  'duyuru','Kaman İlan Ekibi',1,0,20,DATE_SUB(NOW(3), INTERVAL 2 DAY)
);
