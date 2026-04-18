/* 83_faqs.sql — Kaman Ilan (i18n: parent + faqs_i18n) */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================
-- PARENT: faqs
-- =============================================================
DROP TABLE IF EXISTS `faqs_i18n`;
DROP TABLE IF EXISTS `faqs`;

CREATE TABLE `faqs` (
  `id`            CHAR(36)    NOT NULL,
  `is_active`     TINYINT(1)  NOT NULL DEFAULT 1,
  `display_order` INT         NOT NULL DEFAULT 0,
  `created_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `faqs_active_idx` (`is_active`),
  KEY `faqs_order_idx` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CHILD: faqs_i18n
-- =============================================================
CREATE TABLE `faqs_i18n` (
  `id`         CHAR(36)     NOT NULL,
  `faq_id`     CHAR(36)     NOT NULL,
  `locale`     VARCHAR(10)  NOT NULL DEFAULT 'tr',
  `question`   VARCHAR(500) NOT NULL,
  `answer`     LONGTEXT     NOT NULL,
  `slug`       VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_faqs_i18n_parent_locale` (`faq_id`, `locale`),
  UNIQUE KEY `ux_faqs_i18n_locale_slug` (`locale`, `slug`),
  KEY `faqs_i18n_locale_idx` (`locale`),
  KEY `faqs_i18n_slug_idx` (`slug`),
  CONSTRAINT `fk_faqs_i18n_faq` FOREIGN KEY (`faq_id`) REFERENCES `faqs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SEED DATA
-- =============================================================

-- Parent rows
SET @faq1 = UUID(); SET @faq2 = UUID(); SET @faq3 = UUID();
SET @faq4 = UUID(); SET @faq5 = UUID(); SET @faq6 = UUID();
SET @faq7 = UUID(); SET @faq8 = UUID(); SET @faq9 = UUID();

INSERT INTO `faqs` (`id`, `is_active`, `display_order`) VALUES
(@faq1, 1, 1), (@faq2, 1, 2), (@faq3, 1, 3),
(@faq4, 1, 4), (@faq5, 1, 5), (@faq6, 1, 6),
(@faq7, 1, 7), (@faq8, 1, 8), (@faq9, 1, 9);

-- i18n rows (locale='tr')
INSERT INTO `faqs_i18n` (`id`, `faq_id`, `locale`, `question`, `answer`, `slug`) VALUES
(UUID(), @faq1, 'tr',
 'Emlak alım-satım sürecinde bize güvenebilir misiniz?',
 'Sürecin her adımında şeffaf ve yazılı ilerleriz: portföy doğrulama, tapu/imar kontrolü, fiyat analizi, pazarlık, sözleşme ve tapu işlemleri. Amacımız alıcı ve satıcı için riskleri azaltarak işlemi sorunsuz tamamlamaktır.',
 'emlak-alim-satim-surecinde-bize-guvenebilir-misiniz'),

(UUID(), @faq2, 'tr',
 'Konut fiyatları hangi faktörlere göre değişir?',
 'Fiyatı en çok etkileyen unsurlar: lokasyon, m², oda sayısı, bina yaşı, kat/cephe, ulaşım ve sosyal imkanlar, tapu niteliği (kat mülkiyeti/irtifakı), imar durumu, site aidatı, manzara ve bölgedeki arz-talep. Ayrıca doğru pazarlama ve ilan kalitesi de satış hızını doğrudan etkiler.',
 'konut-fiyatlari-hangi-faktorlere-gore-degisir'),

(UUID(), @faq3, 'tr',
 'Satılık veya kiralık ev ilanı vermek için hangi bilgilere ihtiyaç var?',
 'İlan için temel bilgiler: adres/lokasyon, net/brüt m², oda sayısı, bina yaşı, kat bilgisi, ısınma tipi, aidat, tapu durumu, varsa site özellikleri ve doğru fotoğraflar. Satılıkta ayrıca tapu fotokopisi ve varsa iskan/ruhsat bilgileri süreci hızlandırır.',
 'satilik-veya-kiralik-ev-ilani-vermek-icin-hangi-bilgilere-ihtiyac-var'),

(UUID(), @faq4, 'tr',
 'Evi satmak istediğimde nasıl bir yol izlemeliyim?',
 'Önce doğru fiyat analizi yapılır ve satış stratejisi belirlenir. Ardından taşınmazın tapu/imar kontrolleri yapılır, profesyonel fotoğraf ve ilan metni hazırlanır, hedef kitleye göre platformlarda yayınlanır. Görüşmeler sonrası kapora/sözleşme düzenlenir ve tapu randevusu ile devir tamamlanır.',
 'evi-satmak-istedigimde-nasil-bir-yol-izlemeliyim'),

(UUID(), @faq5, 'tr',
 'Kiralama sürecinde ev sahibi ve kiracı için en önemli noktalar nelerdir?',
 'Kira sözleşmesinin doğru düzenlenmesi, depozito ve ödeme planının net olması, demirbaş listesinin tutanakla kayıt altına alınması ve teslim tutanağı hazırlanması kritik konulardır. Kiracı tarafında gelir/kimlik doğrulama, ev sahibi tarafında taşınmazın hukuki durumu ve aidat/borç kontrolleri yapılmalıdır.',
 'kiralama-surecinde-ev-sahibi-ve-kiraci-icin-en-onemli-noktalar-nelerdir'),

(UUID(), @faq6, 'tr',
 'Tapu işlemleri ne kadar sürer ve hangi belgeler gerekir?',
 'Süre; tapu müdürlüğünün yoğunluğuna ve evrakların eksiksiz olmasına göre değişir. Genellikle randevu günü devir tamamlanır. Kimlik, tapu bilgileri, belediye rayiç bedel yazısı, DASK poliçesi ve gerekli harç/masraf ödemeleri temel kalemlerdir. Detaylar taşınmazın niteliğine göre farklılaşabilir.',
 'tapu-islemleri-ne-kadar-surer-ve-hangi-belgeler-gerekir'),

(UUID(), @faq7, 'tr',
 'Konut kredisi ile ev almak mümkün mü? Süreç nasıl işler?',
 'Evet. Banka ön onay sonrası taşınmaz için ekspertiz yapılır ve kredi limiti belirlenir. Uygun bulunursa kredi sözleşmesi imzalanır, ipotek tesisi yapılır ve ödeme planına göre satış tapuda tamamlanır. Kredi sürecinde taşınmazın tapu/imar uygunluğu önemlidir.',
 'konut-kredisi-ile-ev-almak-mumkun-mu-surec-nasil-isler'),

(UUID(), @faq8, 'tr',
 'Ekspertiz raporu nedir, neden önemlidir?',
 'Ekspertiz raporu, taşınmazın piyasa değerini ve fiziksel/hukuki durumunu inceleyen değerlendirmedir. Kredi kullanımında banka için zorunlu olabilir. Alıcı açısından ise aşırı fiyatlandırma riskini azaltır ve satın alma kararını daha sağlıklı hale getirir.',
 'ekspertiz-raporu-nedir-neden-onemlidir'),

(UUID(), @faq9, 'tr',
 'Emlak komisyonu nasıl hesaplanır ve ne zaman ödenir?',
 'Komisyon oranı ve ödeme koşulları, yapılan hizmet sözleşmesine göre belirlenir. Genellikle işlem sonuçlandığında (satışta tapu devrinde, kiralamada sözleşme imzalanınca) tahsil edilir. Hizmet kapsamı (pazarlama, portföy yönetimi, evrak takibi, gösterim, pazarlık vb.) net biçimde yazılı olmalıdır.',
 'emlak-komisyonu-nasil-hesaplanir-ve-ne-zaman-odenir');
