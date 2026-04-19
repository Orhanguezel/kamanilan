-- =============================================================
-- FILE: 98_banners_seed.sql
-- Banner tablosu: CREATE + örnek reklam bannerları
--
-- desktop_row  → bannerin hangi ana sayfa satırında gösterileceği
--   0 = ana sayfada yok (haber sidebar, listings sayfası vb.)
--   1 = 1. reklam satırı (tema: banner_row_1)
--   2 = 2. reklam satırı (tema: banner_row_2)
--   3 = 3. reklam satırı (tema: banner_row_3)
--
-- desktop_columns → o satırda kaç eşit sütun olacağı
--   1 = tam genişlik (12/12)
--   2 = yarım genişlik (6/12 × 2)
--   3 = üçte bir genişlik (4/12 × 3)
--
-- ÖNEMLİ: Aynı satırdaki tüm bannerlar ilk bannerin desktop_columns
-- değerini kullanır. Birbirine zıt değer girilmesi önerilmez.
--
-- Renk kuralı: 80-10-10 → açık arka plan, koyu metin, amber CTA
--   ❌ background_color: '#1B4332'  (koyu yeşil — asla!)
--   ✅ background_color: '#EBF4FF'  (çok açık marka tonu)
--
-- is_active=1 → yayında   |   is_active=0 → rezerv (admin aktifleştirir)
-- display_order → küçük önce gösterilir (1, 2, 3...)
-- =============================================================

SET NAMES utf8mb4;


-- =============================================================
-- ██  banner_row_1  ██  desktop_row=1, desktop_columns=1
-- Tam genişlik (12/12), tek banner bir satırda
-- Rezerv: ID 3 (is_active=0, admin aktifleştirir)
-- =============================================================

INSERT IGNORE INTO `banners`
(
  `id`, `uuid`, `title`, `slug`,
  `subtitle`, `description`,
  `image_url`, `alt`,
  `background_color`, `title_color`, `description_color`,
  `button_text`, `button_color`, `button_hover_color`, `button_text_color`,
  `link_url`, `link_target`,
  `is_active`, `display_order`,
  `desktop_row`, `desktop_columns`,
  `advertiser_name`, `contact_info`
)
VALUES

-- ── ID 1: Tarım Kooperatifi ────────────────────────────────────────────────
(
  1,
  'ba000001-0000-4000-8000-000000000001',
  'Kaman Tarım Kooperatifi',
  'kaman-tarim-kooperatifi',
  'Üreticiden Tüketiciye — Aracısız, Taze, Güvenilir',
  'Kaman ve çevre köylerin tarım ürünleri, organik gıda ve hayvancılık ilanları kooperatif güvencesiyle. Üye olun, avantajlı fiyatlardan yararlanın.',
  NULL,
  'Kaman Tarım Kooperatifi — Üreticiden Tüketiciye',
  '#EEF7EF', '#1A3C25', '#3D6B50',
  'Ürünleri İncele', '#D4873C', '#BF7230', '#FFFFFF',
  '/ilanlar?kategori=tarim-urunleri', '_self',
  1, 1,
  1, 1,
  'Kaman Tarım Satış Kooperatifi', '+90 386 712 0000'
),

-- ── ID 2: Platform öz-tanıtım (reklam satılınca is_active=0) ──────────────
(
  2,
  'ba000002-0000-4000-8000-000000000002',
  'Kaman İlan''da Reklam Verin',
  'kaman-ilan-reklam-ver-top',
  'İşletmenizi Binlerce Kişiye Duyurun',
  'Kaman ve çevre ilçelerden her gün yüzlerce kullanıcı bu sayfayı ziyaret ediyor. Aylık sabit ücretle işletmenizi öne çıkarın.',
  NULL,
  'Kaman İlan — Reklam Fırsatı',
  '#FFFBF0', '#78350F', '#92400E',
  'Fiyat Al', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  1, 1,
  NULL, NULL
),

-- ── ID 3: Rezerv — Kış Kampanyası (is_active=0) ───────────────────────────
(
  3,
  'ba000003-0000-4000-8000-000000000003',
  'Kış Kampanyası Başladı',
  'kis-kampanyasi-basladi',
  'Sezonun En İyi Tarım Ekipman Fırsatları',
  'Kışlık ekipman ve yem stoklarında yıl sonu indirimleri. Hasat öncesi hazırlıklarınızı şimdiden yapın.',
  NULL,
  'Kış Kampanyası Banner',
  '#EBF5FB', '#1B2A4A', '#2E5073',
  'Kampanyayı Gör', '#2980B9', '#1F618D', '#FFFFFF',
  '/kampanyalar', '_self',
  0, 10,
  1, 1,
  NULL, NULL
),


-- =============================================================
-- ██  banner_row_2  ██  desktop_row=2, desktop_columns=2
-- Yarım genişlik (6/12 × 2), iki banner yan yana
-- Rezerv: ID 11 (is_active=1), 12, 13 (is_active=0)
-- =============================================================

-- ── ID 10: Ege Traktör — Sol ───────────────────────────────────────────────
(
  10,
  'ba000010-0000-4000-8000-000000000010',
  'Ege Traktör — Kaman Yetkili Bayii',
  'ege-traktor-kaman-bayii',
  'Yeni & İkinci El Traktör · Servis · Yedek Parça',
  'John Deere, New Holland ve Türk yapımı traktörlerde yetkili bayii. Hasat öncesi revizyon için randevu alın.',
  NULL,
  'Ege Traktör — Kaman',
  '#EBF4FF', '#1E3A8A', '#2D5FA6',
  'Teklif Al', '#2563EB', '#1D4ED8', '#FFFFFF',
  'tel:+905550010001', '_self',
  1, 1,
  2, 2,
  'Ege Traktör Ltd. Şti.', '+90 555 001 0001'
),

-- ── ID 11: Dr. Kaya Veteriner — Rezerv aktif (satır 2'de, kullanılabilir) ─
(
  11,
  'ba000011-0000-4000-8000-000000000011',
  'Dr. Kaya Veteriner Kliniği',
  'dr-kaya-veteriner-klinigi',
  '7/24 Acil · Büyükbaş · Küçükbaş · Kanatlı',
  'Kaman merkez muayenehanesi ve köy ziyaret hizmeti. Aşı, tedavi, gebelik takibi. 20 yıllık tecrübe.',
  NULL,
  'Dr. Kaya Veteriner Kliniği',
  '#ECFDF5', '#064E3B', '#065F46',
  'Hemen Ara', '#059669', '#047857', '#FFFFFF',
  'tel:+905550020002', '_self',
  0, 12,
  2, 2,
  'Dr. Ahmet Kaya Veteriner Kliniği', '+90 555 002 0002'
),

-- ── ID 12: Rezerv — Kaman Yem Deposu (is_active=0) ───────────────────────
(
  12,
  'ba000012-0000-4000-8000-000000000012',
  'Kaman Yem Deposu',
  'kaman-yem-deposu',
  'Toptan & Perakende — Tüm Hayvan Yemi Çeşitleri',
  'Büyükbaş, küçükbaş ve kanatlı için karma yem, kaba yem, silaj. Sezonluk stok indirimleri.',
  NULL,
  'Kaman Yem Deposu',
  '#FEFCE8', '#713F12', '#854D0E',
  'Fiyat Listesi', '#CA8A04', '#A16207', '#FFFFFF',
  'tel:+905550030003', '_self',
  0, 10,
  2, 2,
  'Kaman Yem ve Tarım A.Ş.', '+90 555 003 0003'
),

-- ── ID 13: Rezerv — Kaman Elektrik Malzeme (is_active=0) ─────────────────
(
  13,
  'ba000013-0000-4000-8000-000000000013',
  'Kaman Elektrik Malzeme',
  'kaman-elektrik-malzeme',
  'Sulama Motoru · Çiftlik Elektrik Tesisatı · Solar',
  'Tarımsal sulama sistemleri, güneş enerjili pompa kurulumu, çiftlik aydınlatma. Yerinde montaj.',
  NULL,
  'Kaman Elektrik Malzeme',
  '#EFF6FF', '#1E3A8A', '#1E40AF',
  'Bilgi Al', '#3B82F6', '#2563EB', '#FFFFFF',
  'tel:+905550040004', '_self',
  0, 11,
  2, 2,
  'Kaman Elektrik İnşaat Ltd.', '+90 555 004 0004'
),


-- =============================================================
-- ██  banner_row_3  ██  desktop_row=3, desktop_columns=3
-- Üçte bir genişlik (4/12 × 3), üç banner yan yana
-- Rezerv: ID 23, 24, 25 (is_active=0)
-- =============================================================

-- ── ID 20: Kaman Gübre ve Tarım Deposu ───────────────────────────────────
(
  20,
  'ba000020-0000-4000-8000-000000000020',
  'Kaman Gübre ve Tarım Deposu',
  'kaman-gubre-tarim-deposu',
  'Tohumdan Hasada Her Şey',
  'Gübre, tohum, ilaç ve tarım ekipmanları. Toptan ve perakende. Ücretsiz tavsiye.',
  NULL,
  'Kaman Gübre ve Tarım',
  '#FFF1F2', '#881337', '#9F1239',
  'Kataloğu Gör', '#E11D48', '#BE123C', '#FFFFFF',
  'tel:+905550050005', '_self',
  1, 1,
  3, 3,
  'Kaman Gübre ve Tarım A.Ş.', '+90 555 005 0005'
),

-- ── ID 21: Kaman Fırını ───────────────────────────────────────────────────
(
  21,
  'ba000021-0000-4000-8000-000000000021',
  'Kaman Fırını',
  'kaman-firini',
  'Sabah 05:00''dan İtibaren Taze Ekmek',
  'Köy ekmeği, çörek, simit ve unlu mamuller. Kooperatife toplu sipariş için arayın.',
  NULL,
  'Kaman Fırını',
  '#FFF7ED', '#7C2D12', '#9A3412',
  'Sipariş Ver', '#EA580C', '#C2410C', '#FFFFFF',
  'tel:+905550060006', '_self',
  1, 2,
  3, 3,
  'Kaman Ekmek Fırını', '+90 555 006 0006'
),

-- ── ID 22: Kaman Petrol — Akaryakıt ──────────────────────────────────────
(
  22,
  'ba000022-0000-4000-8000-000000000022',
  'Kaman Petrol — Akaryakıt',
  'kaman-petrol-akaryakit',
  'Motorin · Benzin · LPG · Kurtarma',
  'Kaman çevreyolu Petrol Ofisi bayii. Traktör ve tarım makinesi mazotu toptan teslimat.',
  NULL,
  'Kaman Petrol Bayii',
  '#F0F4F8', '#1E2A3A', '#2C3E50',
  'Konum Al', '#334155', '#1E293B', '#FFFFFF',
  'tel:+905550070007', '_self',
  1, 3,
  3, 3,
  'Kaman Petrol Bayii Ltd.', '+90 555 007 0007'
),

-- ── ID 23: Rezerv — Kaman Çiçekçi (is_active=0) ──────────────────────────
(
  23,
  'ba000023-0000-4000-8000-000000000023',
  'Kaman Çiçekçi',
  'kaman-cicekci',
  'Mevsim Çiçekleri · Saksılı Bitkiler · Çelenk',
  'Düğün, taziye ve özel günler için Kaman''ın tek çiçekçisi. Sipariş için arayın.',
  NULL,
  'Kaman Çiçekçi',
  '#FDF4FF', '#581C87', '#6B21A8',
  'Sipariş Ver', '#9333EA', '#7E22CE', '#FFFFFF',
  'tel:+905550080008', '_self',
  0, 10,
  3, 3,
  'Kaman Çiçekçilik', '+90 555 008 0008'
),

-- ── ID 24: Rezerv — Kaman Noterliği (is_active=0) ────────────────────────
(
  24,
  'ba000024-0000-4000-8000-000000000024',
  'Kaman Noterliği',
  'kaman-noterligi',
  'Tapu Devri · Araç Satışı · Vekaletname',
  'Her türlü noter işleminiz için. Randevusuz, hızlı hizmet. Hafta içi 09:00-17:00.',
  NULL,
  'Kaman Noterliği',
  '#F8FAFC', '#1E293B', '#334155',
  'Randevu Al', '#475569', '#334155', '#FFFFFF',
  'tel:+905550090009', '_self',
  0, 11,
  3, 3,
  'Kaman 1. Noterliği', '+90 386 712 1111'
),

-- ── ID 25: Rezerv — Kaman Demir Çelik (is_active=0) ──────────────────────
(
  25,
  'ba000025-0000-4000-8000-000000000025',
  'Kaman Demir Çelik',
  'kaman-demir-celik',
  'İnşaat Demiri · Profil · Sac · Boru',
  'Ahır, depo ve çiftlik inşaatı için demir çelik malzeme. Kesim ve büküm hizmeti.',
  NULL,
  'Kaman Demir Çelik',
  '#F1F5F9', '#1E293B', '#334155',
  'Fiyat Sor', '#64748B', '#475569', '#FFFFFF',
  'tel:+905550100010', '_self',
  0, 12,
  3, 3,
  'Kaman Demir Çelik Ltd.', '+90 555 010 0010'
),


-- =============================================================
-- ██  /ilanlar sayfası üstü  ██  ID: 30 (aktif), 31 (rezerv)
-- desktop_row=0 → ana sayfada değil, ID ile çağrılır
-- =============================================================

-- ── ID 30: Gübre Deposu sezon banneri ─────────────────────────────────────
(
  30,
  'ba000030-0000-4000-8000-000000000030',
  'Kaman Gübre — Sezon İndirimi %15',
  'kaman-gubre-sezon-indirimi',
  'Ekim Dönemi Öncesi Toplu Alım Fırsatı',
  'DAP, ÜRE, 20-20-0 ve organik gübre. 10 ton üzeri siparişlerde ücretsiz teslimat. Stoklar sınırlı.',
  NULL,
  'Kaman Gübre Sezon İndirimi',
  '#ECFDF5', '#064E3B', '#065F46',
  'Hemen Sipariş Ver', '#D4873C', '#BF7230', '#FFFFFF',
  'tel:+905550050005', '_self',
  1, 1,
  0, 1,
  'Kaman Gübre ve Tarım A.Ş.', '+90 555 005 0005'
),

-- ── ID 31: Rezerv — Platform öz-tanıtım (is_active=0) ────────────────────
(
  31,
  'ba000031-0000-4000-8000-000000000031',
  'Bu Alana Reklam Verebilirsiniz',
  'ilanlar-sayfa-reklam-ver',
  'Günlük Yüzlerce İlan Arayanın Dikkatini Çekin',
  'İlan listesi sayfası reklamı — hedefli, etkili, uygun fiyatlı. Detaylar için Reklam Ver sayfasını ziyaret edin.',
  NULL,
  'İlanlar Sayfası Reklam Alanı',
  '#FFFBF0', '#78350F', '#92400E',
  'Bilgi Al', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  0, 10,
  0, 1,
  NULL, NULL
),


-- =============================================================
-- ██  news_sidebar  ██  ID: 50, 51  — /haberler kenar çubuğu
-- desktop_row=0 → newsListSections.bannerIds ile çağrılır
-- =============================================================

-- ── ID 50: Haberler sidebar reklam ver ───────────────────────────────────
(
  50,
  'ba000050-0000-4000-8000-000000000050',
  'Haberler Sayfası Reklam Alanı',
  'haberler-sidebar-reklam-ver',
  'Bu Alana Reklam Verin',
  'Haberler sayfasını ziyaret eden yüzlerce okuyucunun dikkatini çekin. Günlük sabit ücretle işletmenizi duyurun.',
  NULL,
  'Haberler Sidebar — Reklam Ver',
  '#FFFBF0', '#78350F', '#92400E',
  'Reklam Ver', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 1,
  0, 1,
  NULL, NULL
),

-- ── ID 51: Haberler sidebar 2 ─────────────────────────────────────────────
(
  51,
  'ba000051-0000-4000-8000-000000000051',
  'Haberler Sidebar — İkinci Alan',
  'haberler-sidebar-2-reklam-ver',
  'Bu Alana da Reklam Verin',
  'İkinci sidebar reklam slotu. Üst slotla birlikte çift görünürlük.',
  NULL,
  'Haberler Sidebar 2 — Reklam Ver',
  '#F0FDF4', '#14532D', '#166534',
  'Bilgi Al', '#059669', '#047857', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  0, 1,
  NULL, NULL
),


-- =============================================================
-- ██  news_list_full  ██  ID: 52, 53  — /haberler tam genişlik
-- desktop_row=0 → newsListSections.banner_full_* ile çağrılır
-- =============================================================

-- ── ID 52: Haberler listesi üst tam genişlik reklam ───────────────────────
(
  52,
  'ba000052-0000-4000-8000-000000000052',
  'Haberler Üst Reklam Alanı',
  'haberler-ust-tam-genislik-reklam',
  'Bu Alana Reklam Verin',
  'Haberler sayfasının üstündeki tam genişlik reklam alanı. Kaman bölgesinden yüzlerce okuyucuya günlük ulaşın.',
  NULL,
  'Haberler Üst Tam Genişlik — Reklam Ver',
  '#FFFBF0', '#78350F', '#92400E',
  'Reklam Ver', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 1,
  0, 1,
  NULL, NULL
),

-- ── ID 53: Haberler listesi alt tam genişlik reklam ───────────────────────
(
  53,
  'ba000053-0000-4000-8000-000000000053',
  'Haberler Alt Reklam Alanı',
  'haberler-alt-tam-genislik-reklam',
  'Bu Alana Reklam Verin',
  'Haberler listesinin altındaki tam genişlik reklam alanı. Haberleri okuyan kitlenize ulaşın.',
  NULL,
  'Haberler Alt Tam Genişlik — Reklam Ver',
  '#EFF6FF', '#1E3A8A', '#1E40AF',
  'Bilgi Al', '#3B82F6', '#2563EB', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  0, 1,
  NULL, NULL
),


-- =============================================================
-- ██  news_detail  ██  ID: 55, 56  — /haberler/[slug] sidebar
-- desktop_row=0 → newsDetailSections.bannerIds ile çağrılır
-- =============================================================

-- ── ID 55: Haber detayı üst reklam ───────────────────────────────────────
(
  55,
  'ba000055-0000-4000-8000-000000000055',
  'Haber Detayı Reklam Alanı',
  'haber-detay-reklam-ver',
  'Bu Alana Reklam Verin',
  'Haber okuyan meraklı ziyaretçilerin dikkatini çekin. Hedefli, etkili reklam alanı.',
  NULL,
  'Haber Detay Sidebar — Reklam Ver',
  '#FFFBF0', '#78350F', '#92400E',
  'Reklam Ver', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 1,
  0, 1,
  NULL, NULL
),

-- ── ID 56: Haber detayı alt reklam ───────────────────────────────────────
(
  56,
  'ba000056-0000-4000-8000-000000000056',
  'Haber Detayı — Alt Reklam',
  'haber-detay-alt-reklam-ver',
  'Alt Reklam Alanı — Reklam Verin',
  'Haberin alt kısmında yer alan reklam slotu. Okuyucunun ilgi alanına uygun.',
  NULL,
  'Haber Detay Alt — Reklam Ver',
  '#EFF6FF', '#1E3A8A', '#1E40AF',
  'Bilgi Al', '#3B82F6', '#2563EB', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  0, 1,
  NULL, NULL
),

-- ── ID 57: Haber detayı üst TAM GENİŞLİK reklam (12/12) ─────────────────
(
  57,
  'ba000057-0000-4000-8000-000000000057',
  'Makale Üstü Tam Genişlik Reklam',
  'haber-detay-ust-tam-genislik-reklam',
  'Bu Alana Reklam Verin',
  'Haber içeriğinin hemen üstünde yer alan tam genişlik (12/12) reklam alanı. Yüksek görünürlük, hedefli kitle.',
  NULL,
  'Makale Üstü Tam Genişlik — Reklam Ver',
  '#FFFBF0', '#78350F', '#92400E',
  'Reklam Ver', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 1,
  0, 1,
  NULL, NULL
),

-- ── ID 58: Haber detayı alt TAM GENİŞLİK reklam (12/12) ─────────────────
(
  58,
  'ba000058-0000-4000-8000-000000000058',
  'Makale Altı Tam Genişlik Reklam',
  'haber-detay-alt-tam-genislik-reklam',
  'Bu Alana Reklam Verin',
  'Haber içeriğinin hemen altında tam genişlik (12/12) reklam alanı. Okuyucunun dikkatini içerikten sonra çekin.',
  NULL,
  'Makale Altı Tam Genişlik — Reklam Ver',
  '#EFF6FF', '#1E3A8A', '#1E40AF',
  'Bilgi Al', '#3B82F6', '#2563EB', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  0, 1,
  NULL, NULL
),


-- =============================================================
-- ██  banner_row_4  ██  desktop_row=4, desktop_columns=1
-- Tam genişlik (12/12) — tek banner, Banner #4 slotu
-- =============================================================

-- ── ID 60: Kaman Ziraat Bankası Bayii ─────────────────────────────────────
(
  60,
  'ba000060-0000-4000-8000-000000000060',
  'Kaman Ziraat Odası',
  'kaman-ziraat-odasi-banner',
  'Çiftçi Kaydı · Destekler · Belgeler',
  'Tarımsal desteklerden yararlanmak için çiftçi kaydınızı yaptırın. ÇKS, GTS ve SGK işlemleri için Ziraat Odamızı ziyaret edin.',
  NULL,
  'Kaman Ziraat Odası',
  '#F0FAF4', '#14532D', '#166534',
  'Bilgi Al', '#16A34A', '#15803D', '#FFFFFF',
  'tel:+903867120001', '_self',
  1, 1,
  4, 1,
  'Kaman Ziraat Odası', '+90 386 712 0001'
),


-- =============================================================
-- ██  banner_row_5  ██  desktop_row=5, desktop_columns=1
-- 4/12 genişlik — Son İlanlar (8/12) yanında Banner #5 slotu
-- =============================================================

-- ── ID 61: Kaman Veteriner İlaç ───────────────────────────────────────────
(
  61,
  'ba000061-0000-4000-8000-000000000061',
  'Kaman Veteriner İlaç ve Malzeme',
  'kaman-veteriner-ilac-malzeme',
  'Aşı · İlaç · Ekipman',
  'Tüm hayvan ilaçları, aşılar ve veteriner malzemeleri. Toptan fiyat, hızlı teslimat.',
  NULL,
  'Kaman Veteriner İlaç',
  '#FEF9EE', '#78350F', '#92400E',
  'Sipariş Ver', '#D97706', '#B45309', '#FFFFFF',
  'tel:+903867120002', '_self',
  1, 1,
  5, 1,
  'Kaman Veteriner İlaç Ltd.', '+90 386 712 0002'
),

-- ── ID 63: Banner #5 ikinci slot — desktop_row=5, display_order=2 ──────────
(
  63,
  'ba000063-0000-4000-8000-000000000063',
  'Kaman İlan''da Reklam Verin',
  'kaman-ilan-reklam-ver-row5',
  'Bu Alana Reklam Verin',
  'Kaman bölgesinden günlük yüzlerce aktif kullanıcıya ulaşın. Uygun fiyatlı reklam slotları için bizimle iletişime geçin.',
  NULL,
  'Kaman İlan — Reklam Alanı',
  '#FFFBF0', '#78350F', '#92400E',
  'Fiyat Al', '#D97706', '#B45309', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 2,
  5, 1,
  NULL, NULL
),


-- =============================================================
-- ██  banner_row_6  ██  desktop_row=6, desktop_columns=1
-- Tam genişlik (12/12) — tek banner, Banner #6 slotu
-- =============================================================

-- ── ID 62: Kaman Belediyesi Duyuru Alanı ──────────────────────────────────
(
  62,
  'ba000062-0000-4000-8000-000000000062',
  'Kaman''da Reklam Verin',
  'kaman-ilan-reklam-ver-bottom',
  'Hedefli · Uygun Fiyatlı · Etkili',
  'Kaman ve çevre ilçelerden binlerce kullanıcıya ulaşın. İşletmenizi öne çıkarmak için reklam alanı alın.',
  NULL,
  'Kaman İlan — Alt Reklam Alanı',
  '#EEF4FF', '#1E3A8A', '#2D5FA6',
  'Fiyat Al', '#2563EB', '#1D4ED8', '#FFFFFF',
  '/reklam-ver', '_self',
  1, 1,
  6, 1,
  NULL, NULL
),


-- =============================================================
-- ██  banner_row_2  ██  ID: 40  — Murat Meşe (sağ kart, desktop_row=2)
-- =============================================================

-- ── ID 40: Murat Meşe ─────────────────────────────────────────────────────
(
  40,
  'ba000040-0000-4000-8000-000000000040',
  'Murat Meşe',
  'murat-mese-hizar-bahce-hizmetleri',
  'Hızar · Odun · Bahçe · Çapa · Çim Ekimi',
  'Kaman ve çevre köylere hizmet. Hızar ile odun ve kereste kesimi, bahçe düzenleme, çapa ve çim ekimi. Uygun fiyat, güvenilir iş.',
  '/uploads/media/murat-mese-banner.svg',
  'Murat Meşe — Hızar, Odun Kesimi, Bahçe Hizmetleri Kaman',
  '#F0FDF4', '#14532D', '#166534',
  'Hemen Ara', '#D97706', '#B45309', '#FFFFFF',
  'tel:+905XXXXXXXXX', '_self',
  1, 2,
  2, 2,
  'Murat Meşe', '+90 5XX XXX XX XX'
);

-- =============================================================
-- Banner görselleri (storage_assets üzerinden)
-- Not: image_url + image_asset_id birlikte set edilir; admin panelden değiştirilebilir.
-- =============================================================
UPDATE `banners`
SET
  `image_asset_id` = CASE `id`
    WHEN 1  THEN '00009700-0000-4000-8000-000000000004'
    WHEN 2  THEN '00009700-0000-4000-8000-000000000003'
    WHEN 3  THEN '00009700-0000-4000-8000-000000000001'
    WHEN 10 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 11 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 12 THEN '00009700-0000-4000-8000-000000000001'
    WHEN 13 THEN '00009700-0000-4000-8000-000000000001'
    WHEN 20 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 21 THEN '00009700-0000-4000-8000-000000000001'
    WHEN 22 THEN '00009700-0000-4000-8000-000000000001'
    WHEN 23 THEN '00009400-0000-4000-8000-000000000096'
    WHEN 24 THEN '00009400-0000-4000-8000-000000000096'
    WHEN 25 THEN '00009400-0000-4000-8000-000000000096'
    WHEN 30 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 31 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 50 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 51 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 52 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 53 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 55 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 56 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 57 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 58 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 60 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 61 THEN '00009700-0000-4000-8000-000000000004'
    WHEN 62 THEN '00009700-0000-4000-8000-000000000003'
    WHEN 63 THEN '00009700-0000-4000-8000-000000000003'
    ELSE `image_asset_id`
  END,
  `image_url` = CASE `id`
    WHEN 1  THEN 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=1200&h=600&fit=crop&q=80' -- Tarım Koop
    WHEN 2  THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 3  THEN 'https://images.unsplash.com/photo-1508349249800-277c55b8e86d?w=1200&h=600&fit=crop&q=80'
    WHEN 10 THEN 'https://images.unsplash.com/photo-1530268576203-5cbe015a8d90?w=1200&h=600&fit=crop&q=80' -- Traktör
    WHEN 11 THEN 'https://images.unsplash.com/photo-1532187875605-2fe358a71428?w=1200&h=600&fit=crop&q=80' -- Veteriner
    WHEN 12 THEN 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&h=600&fit=crop&q=80' -- Yem
    WHEN 13 THEN 'https://images.unsplash.com/photo-1558444479-c8f027d3a339?w=1200&h=600&fit=crop&q=80' -- Elektrik
    WHEN 20 THEN 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=1200&h=600&fit=crop&q=80' -- Gübre
    WHEN 21 THEN 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop&q=80' -- Fırın
    WHEN 22 THEN 'https://images.unsplash.com/photo-1551025537-4d929944de88?w=1200&h=600&fit=crop&q=80' -- Petrol
    WHEN 23 THEN 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&h=600&fit=crop&q=80' -- Çiçekçi
    WHEN 24 THEN 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop&q=80' -- Noter
    WHEN 25 THEN 'https://images.unsplash.com/photo-1533044309907-0fa3413da946?w=1200&h=600&fit=crop&q=80' -- Demir Çelik
    WHEN 30 THEN 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&h=600&fit=crop&q=80' -- Gübre Sezon
    WHEN 31 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 50 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 51 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 52 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 53 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 55 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 56 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 57 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 58 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 60 THEN 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&h=600&fit=crop&q=80' -- Ziraat Odası
    WHEN 61 THEN 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=600&fit=crop&q=80' -- Veteriner İlaç
    WHEN 62 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    WHEN 63 THEN 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop&q=80'
    ELSE `image_url`
  END
WHERE `id` IN (
  1, 2, 3, 10, 11, 12, 13, 20, 21, 22, 23, 24, 25, 30, 31,
  50, 51, 52, 53, 55, 56, 57, 58, 60, 61, 62, 63
);
