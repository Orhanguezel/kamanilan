/* 121_legal_pages_gzl.sql — Kaman İlan yasal metinleri ve işletmeci bilgileri */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @operator_name := 'GZL Danışmanlık Hizmetleri ve Teknoloji Limited Şirketi';
SET @operator_email := 'info@kamanilan.com';
SET @operator_address := 'Gemlik/Bursa';

UPDATE custom_pages_i18n
SET content = JSON_OBJECT('html', CONCAT(
  '<div class="editorial-content"><div class="eyebrow mb-6">Yasal Bilgilendirme</div>',
  '<h1>Gizlilik Politikası</h1>',
  '<p><strong>Son güncelleme: 11 Ağustos 2026</strong></p>',
  '<p>Kaman İlan platformu, ', @operator_name, ' (“Şirket”) tarafından işletilmektedir. Şirket, kullanıcı gizliliğini ve kişisel verilerin güvenliğini korumayı taahhüt eder.</p>',
  '<h2>Toplanan bilgiler</h2><p>Üyelik ve ilan işlemleri kapsamında kimlik ve iletişim bilgileri, hesap ve işlem kayıtları, ilan içerikleri, ödeme ve fatura bilgileri ile IP adresi, cihaz ve erişim kayıtları işlenebilir.</p>',
  '<h2>İşleme amaçları</h2><p>Veriler; üyelik ve ilan hizmetlerinin sunulması, kullanıcı doğrulama, iletişim, ödeme süreçleri, güvenlik ve kötüye kullanımın önlenmesi, müşteri desteği, hizmet geliştirme ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.</p>',
  '<h2>Paylaşım ve saklama</h2><p>Veriler yalnızca hizmetin gerektirdiği ölçüde ödeme, barındırma, e-posta ve teknik altyapı sağlayıcılarıyla veya yetkili kamu kurumlarıyla paylaşılabilir. Veriler ilgili mevzuat ve işleme amacı için gerekli süre boyunca saklanır.</p>',
  '<h2>Haklarınız</h2><p>KVKK kapsamındaki başvuru haklarınızın ayrıntıları <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfasında açıklanmıştır. Başvurularınızı <a href="mailto:', @operator_email, '">', @operator_email, '</a> adresine iletebilirsiniz.</p>',
  '<h2>Veri sorumlusu</h2><p>', @operator_name, '<br>', @operator_address, '<br>E-posta: <a href="mailto:', @operator_email, '">', @operator_email, '</a></p></div>'
)),
meta_title = 'Gizlilik Politikası | Kaman İlan',
meta_description = 'Kaman İlan platformunun kişisel veri işleme, paylaşım, güvenlik ve saklama esasları.'
WHERE locale = 'tr' AND slug = 'gizlilik-politikasi';

UPDATE custom_pages_i18n
SET content = JSON_OBJECT('html', CONCAT(
  '<div class="editorial-content"><div class="eyebrow mb-6">Şartlar ve Koşullar</div>',
  '<h1>Kullanım Koşulları</h1><p><strong>Son güncelleme: 11 Ağustos 2026</strong></p>',
  '<p>Kaman İlan, ', @operator_name, ' tarafından işletilen çevrim içi ilan platformudur. Platformu kullanmanız bu koşulları kabul ettiğiniz anlamına gelir.</p>',
  '<h2>Platformun rolü</h2><p>Kaman İlan, ilan verenlerle ilgilenen kullanıcıları buluşturan aracı hizmet sağlayıcıdır. İlan konusu ürün veya hizmetin satıcısı değildir; taraflar arasındaki sözleşmenin ifası, ürünün niteliği, teslimat veya ödeme uyuşmazlıklarından ilan sahibi sorumludur.</p>',
  '<h2>Hesap ve ilan sorumluluğu</h2><ul><li>Kullanıcılar doğru, güncel ve hukuka uygun bilgi vermelidir.</li><li>Yanıltıcı, sahte, mükerrer, hak ihlali oluşturan veya yasa dışı ilan yayınlanamaz.</li><li>Hesap güvenliği ve hesap üzerinden gerçekleştirilen işlemler kullanıcı sorumluluğundadır.</li></ul>',
  '<h2>İçerik denetimi</h2><p>Şirket; mevzuata veya bu koşullara aykırı içerikleri inceleme, yayından kaldırma, hesabı askıya alma ve gerekli hallerde yetkili mercilere bildirme hakkını saklı tutar.</p>',
  '<h2>Fikri haklar ve sorumluluk</h2><p>Platform tasarımı, yazılımı ve markaları Şirkete veya lisans verenlere aittir. Hizmetin kesintisiz veya hatasız olacağı garanti edilmez. Şirketin sorumluluğu emredici mevzuatın izin verdiği sınırlarla sınırlıdır.</p>',
  '<h2>Uygulanacak hukuk</h2><p>Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Tüketici işlemlerinde tüketicinin yerleşim yerindeki hakem heyeti ve tüketici mahkemelerine ilişkin yasal haklar saklıdır.</p>',
  '<h2>İletişim</h2><p>', @operator_name, '<br>', @operator_address, '<br>E-posta: <a href="mailto:', @operator_email, '">', @operator_email, '</a></p></div>'
)),
meta_title = 'Kullanım Koşulları | Kaman İlan',
meta_description = 'Kaman İlan üyelik, ilan yayınlama ve platform kullanım koşulları.'
WHERE locale = 'tr' AND slug = 'kullanim-kosullari';

UPDATE custom_pages_i18n
SET content = JSON_OBJECT('html', CONCAT(
  '<div class="editorial-content"><div class="eyebrow mb-6">Çerezler</div>',
  '<h1>Çerez Politikası</h1><p><strong>Son güncelleme: 11 Ağustos 2026</strong></p>',
  '<p>Kaman İlan, ', @operator_name, ' tarafından işletilmektedir. Platform; oturumun sürdürülmesi, güvenlik, tercihlerin hatırlanması, performans ölçümü ve hizmet geliştirme amaçlarıyla çerezlerden yararlanabilir.</p>',
  '<h2>Çerez türleri</h2><ul><li><strong>Zorunlu çerezler:</strong> Giriş, güvenlik ve temel işlevler için gereklidir.</li><li><strong>Tercih çerezleri:</strong> Dil ve görünüm seçimlerini hatırlar.</li><li><strong>Analitik çerezler:</strong> Açık rıza verilmesi halinde platform kullanımını ölçer.</li><li><strong>Pazarlama çerezleri:</strong> Açık rıza verilmesi halinde reklam performansını ölçebilir.</li></ul>',
  '<h2>Tercihlerin yönetimi</h2><p>Zorunlu olmayan çerezler açık rızanıza dayanır. Tercihlerinizi çerez panelinden veya tarayıcı ayarlarından değiştirebilirsiniz. Zorunlu çerezlerin engellenmesi bazı özelliklerin çalışmamasına neden olabilir.</p>',
  '<h2>İletişim</h2><p>Sorularınız için <a href="mailto:', @operator_email, '">', @operator_email, '</a> adresine yazabilirsiniz.</p></div>'
)),
meta_title = 'Çerez Politikası | Kaman İlan',
meta_description = 'Kaman İlan çerez türleri, kullanım amaçları ve tercih yönetimi.'
WHERE locale = 'tr' AND slug = 'cerez-politikasi';

SET @kvkk_page_id := UUID();
INSERT INTO custom_pages (id, module_key, is_published, display_order)
SELECT @kvkk_page_id, 'kvkk', 1, 4
WHERE NOT EXISTS (SELECT 1 FROM custom_pages_i18n WHERE locale = 'tr' AND slug = 'kvkk-aydinlatma-metni');

INSERT INTO custom_pages_i18n (id, page_id, locale, title, slug, content, meta_title, meta_description)
SELECT UUID(), @kvkk_page_id, 'tr', 'KVKK Aydınlatma Metni', 'kvkk-aydinlatma-metni',
JSON_OBJECT('html', CONCAT(
  '<div class="editorial-content"><div class="eyebrow mb-6">6698 Sayılı Kanun</div><h1>KVKK Aydınlatma Metni</h1>',
  '<p><strong>Veri sorumlusu:</strong> ', @operator_name, '<br><strong>Adres:</strong> ', @operator_address, '<br><strong>E-posta:</strong> <a href="mailto:', @operator_email, '">', @operator_email, '</a></p>',
  '<h2>İşlenen kişisel veriler</h2><p>Kimlik, iletişim, kullanıcı hesabı, ilan ve işlem, ödeme, müşteri destek, hukuki işlem, işlem güvenliği, IP adresi, cihaz ve erişim kayıtları işlenebilir.</p>',
  '<h2>Amaç ve hukuki sebepler</h2><p>Veriler; sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine getirilmesi, bir hakkın tesisi ve korunması, temel haklara zarar vermemek kaydıyla meşru menfaat ve gerekli durumlarda açık rıza hukuki sebeplerine dayanılarak işlenir.</p>',
  '<h2>Aktarım</h2><p>Veriler; hizmetin sunulması için gerekli teknik altyapı, ödeme, e-posta ve barındırma sağlayıcılarına, danışmanlara ve kanunen yetkili kamu kurumlarına amaçla sınırlı olarak aktarılabilir. Yurt dışı aktarım gereken hallerde KVKK’nın 9. maddesindeki şartlara uyulur.</p>',
  '<h2>Toplama yöntemi</h2><p>Veriler üyelik ve ilan formları, iletişim kanalları, ödeme süreçleri, çerezler ve sunucu kayıtları üzerinden otomatik veya kısmen otomatik yollarla toplanır.</p>',
  '<h2>KVKK madde 11 kapsamındaki haklar</h2><p>Verinizin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarılan üçüncü kişileri bilme, düzeltme, silme veya yok etme isteme, bu işlemlerin aktarılan kişilere bildirilmesini isteme, otomatik analiz sonucuna itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.</p>',
  '<h2>Başvuru</h2><p>Kimliğinizi doğrulayan bilgiler ve talebinizle birlikte başvurunuzu <a href="mailto:', @operator_email, '">', @operator_email, '</a> adresine iletebilirsiniz. Başvurular mevzuattaki süreler içinde sonuçlandırılır.</p></div>'
)), 'KVKK Aydınlatma Metni | Kaman İlan', 'GZL Teknoloji veri sorumluluğunda Kaman İlan KVKK aydınlatma metni.'
WHERE NOT EXISTS (SELECT 1 FROM custom_pages_i18n WHERE locale = 'tr' AND slug = 'kvkk-aydinlatma-metni');

-- Sayfa daha önce oluşturulduysa kurumsal iletişim tercihlerini mevcut metne de uygula.
UPDATE custom_pages_i18n
SET content = JSON_OBJECT(
  'html',
  REPLACE(
    REPLACE(
      REPLACE(
        JSON_UNQUOTE(JSON_EXTRACT(content, '$.html')),
        'Cumhuriyet Mah. Hastane Cad. Şahinler Sit. C Blok No:12-C İç Kapı No:14 Gemlik/Bursa',
        @operator_address
      ),
      'info@gzlteknoloji.com',
      @operator_email
    ),
    'yazılı olarak şirket adresine veya ',
    ''
  )
),
meta_description = 'GZL Teknoloji veri sorumluluğunda Kaman İlan KVKK aydınlatma metni.',
updated_at = NOW(3)
WHERE locale = 'tr' AND slug = 'kvkk-aydinlatma-metni';

UPDATE site_settings SET value = JSON_QUOTE(@operator_email) WHERE `key` IN ('contact_email', 'contact_to_email');
UPDATE site_settings SET value = JSON_QUOTE(@operator_address) WHERE `key` = 'contact_address';
UPDATE site_settings SET value = JSON_QUOTE(''), updated_at = NOW(3) WHERE `key` IN ('contact_phone_display', 'contact_phone_tel');
UPDATE site_settings
SET value = JSON_OBJECT(
  'name', @operator_name,
  'short_name', 'GZL Teknoloji',
  'website', 'https://gzlteknoloji.com',
  'email', @operator_email,
  'legal', JSON_OBJECT(
    'vergi_dairesi', 'Gemlik',
    'vergi_no', '4542302453',
    'mersis', '0454230245300001',
    'ticaret_sicil', '7069 (Gemlik)',
    'adres', @operator_address
  )
), updated_at = NOW(3)
WHERE `key` = 'company_brand';
