-- ============================================================
-- FILE: 120_articles_kaman_seed.sql
-- Kaman odakli yerel haber seed'i (SEO: rekabetsiz long-tail)
-- Strateji: strateji.md §Ay 2 — Trafik Motoru: Haber Tarafi
-- Hedef keywords: Kaman belediyesi, ceviz festivali, hava durumu,
--                 otobüs saatleri, nöbetçi eczane, bor madeni,
--                 Kırşehir Kaman yolu, Kaman cevizi
-- ============================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `articles`
  (`uuid`, `locale`, `title`, `slug`, `excerpt`, `content`, `category`,
   `author`, `tags`, `reading_time`,
   `meta_title`, `meta_description`,
   `is_published`, `is_featured`, `display_order`, `published_at`)
VALUES

-- ------------------------------------------------------------
-- 1. Kaman Ceviz Festivali (YEREL — ana hedef)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Ceviz Festivali 2026: Tarih, Program ve Ulaşım Rehberi',
 'kaman-ceviz-festivali-2026',
 'Dünyanın en kaliteli cevizlerinden birinin üretildiği Kaman''da her yıl düzenlenen Ceviz Festivali bu yıl da yoğun ilgi bekliyor. İşte tarih, program ve ulaşım bilgileri.',
 '<p>Kaman Ceviz Festivali, Kırşehir''in Kaman ilçesinde her yıl eylül ayının ikinci haftasında düzenlenen, Türkiye''nin en köklü yerel festivallerinden biridir. Festival, Kaman cevizinin hasat dönemine denk gelecek şekilde planlanıyor.</p><h2>Festival Programı</h2><p>Açılış töreninin ardından üç gün süren festivalde ceviz kırma yarışması, yerel müzik grupları, folklor gösterileri ve ceviz ürünleri sergisi yer alıyor. Özellikle "en iri ceviz" ve "en çok ceviz kıran" yarışmaları izleyicilerden büyük ilgi görüyor.</p><h2>Ulaşım</h2><p>Ankara''dan Kaman''a gelmek için E-90 karayolu üzerinden yaklaşık 2 saatlik yolculuk yapılabilir. Kırşehir şehir merkezinden ise 40 km mesafededir. Festival günlerinde Ankara—Kaman arasında ek otobüs seferleri düzenleniyor.</p><h2>Konaklama</h2><p>Kaman merkezde sınırlı sayıda pansiyon bulunuyor. Yoğun talep nedeniyle Kırşehir şehir merkezinde konaklamayı tercih eden ziyaretçi sayısı da azımsanmayacak ölçüde.</p><h2>Ceviz Alışverişi</h2><p>Festival boyunca yerel üreticiler hem kabuklu hem iç ceviz satışı yapıyor. Festival fiyatları şehirdeki toptancılardan yaklaşık %15-20 daha uygun oluyor.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kaman, ceviz festivali, Kırşehir, yerel etkinlik', 4,
 'Kaman Ceviz Festivali 2026 | Tarih & Program | Kamanilan',
 'Kaman Ceviz Festivali 2026 programı, ulaşım rehberi, konaklama seçenekleri ve festival etkinlikleri için güncel rehber.',
 1, 1, 1, NOW(3)),

-- ------------------------------------------------------------
-- 2. Kaman Cevizi (YEREL + EKONOMI — uzun vadeli SEO)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Cevizi Neden Dünyada Bu Kadar Ünlü?',
 'kaman-cevizi-neden-unlu',
 'Kaman cevizi, kabuğunun inceliği ve iç veriminin yüksekliği ile dünya pazarlarında özel bir yere sahip. Sert kabuklu cevizden farkı nedir?',
 '<p>Kaman cevizi, Kırşehir''in Kaman ilçesine özgü coğrafi işaretli bir üründür. Türkiye''nin en değerli cevizlerinden biri olarak kabul edilen Kaman cevizi, incecik kabuğu ve yüksek iç randımanı ile öne çıkar.</p><h2>Neden Özel?</h2><p>Kaman''ın volkanik toprağı, ılıman kara iklimi ve geleneksel yetiştiricilik yöntemleri cevizin lezzetini belirliyor. Bir Kaman cevizinin iç randımanı %55-60 civarındadır; bu oran endüstriyel cevizlerde %35-40 arasında kalır.</p><h2>Coğrafi İşaret</h2><p>Kaman cevizi, Türk Patent ve Marka Kurumu tarafından tescilli coğrafi işaretli ürün statüsündedir. Yalnızca Kaman ve çevresinde yetiştirilen cevizler bu isimle satılabilir.</p><h2>Yıllık Üretim</h2><p>Kaman ve köylerinde yıllık ortalama 3.500-4.000 ton ceviz üretilmektedir. Bu miktarın önemli bir kısmı Avrupa ülkelerine ihraç edilir.</p><h2>Nasıl Anlaşılır?</h2><p>Gerçek Kaman cevizi kabuğuna hafif baskıyla açılır. Kabuğun rengi açık krem tonundadır, iç cevizler ise altın sarısıdır. Satın alırken coğrafi işaret etiketini mutlaka kontrol edin.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kaman cevizi, coğrafi işaret, Kırşehir, tarım', 4,
 'Kaman Cevizi | Coğrafi İşaret | Kamanilan',
 'Kaman cevizi neden dünyada ünlü? Coğrafi işaretli Kaman cevizinin özellikleri, yıllık üretimi ve gerçek olanı tanıma rehberi.',
 1, 1, 2, NOW(3)),

-- ------------------------------------------------------------
-- 3. Kaman Belediyesi (GUNDEM — yuksek arama)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Belediyesi 2026 Hizmetleri ve İletişim Rehberi',
 'kaman-belediyesi-2026-hizmetler',
 'Kaman Belediyesi''nin 2026 yılında vatandaşlara sunduğu hizmetler, başvuru kanalları ve iletişim bilgileri.',
 '<p>Kaman Belediyesi, Kırşehir iline bağlı Kaman ilçesinin yerel yönetim birimidir. Belediyenin sunduğu hizmetler temizlik, fen işleri, sosyal yardım, kültür-spor etkinlikleri, zabıta ve park-bahçe başlıkları altında yürütülmektedir.</p><h2>Başvuru Kanalları</h2><p>Vatandaşlar belediye hizmetleri için ilçe merkezindeki hizmet binasına gidebilir veya e-Belediye portalı üzerinden online başvuru yapabilir.</p><h2>Önemli Hizmetler</h2><ul><li>Emlak vergisi ödemeleri</li><li>İmar başvuruları</li><li>Evsel atık toplama</li><li>Nikah başvuruları</li><li>Sosyal yardım talepleri</li><li>Kültür merkezi etkinlik duyuruları</li></ul><h2>Çağrı Merkezi</h2><p>Belediye hizmetleri hakkında bilgi almak için belediye santralini arayarak ilgili birime yönlendirme alabilirsiniz.</p><h2>Web Sitesi</h2><p>Güncel duyurular, ihale ilanları, etkinlik programları ve hizmet rehberi belediyenin resmi web sitesinde paylaşılmaktadır.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kaman belediyesi, yerel yönetim, Kırşehir', 3,
 'Kaman Belediyesi | Hizmetler & İletişim 2026 | Kamanilan',
 'Kaman Belediyesi hizmetleri, başvuru kanalları, çağrı merkezi ve vatandaş hizmet rehberi — güncel 2026 bilgileri.',
 1, 0, 3, NOW(3)),

-- ------------------------------------------------------------
-- 4. Kaman Otobus Saatleri (EVERGREEN — sticky traffic)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Otobüs Saatleri: Ankara, Kırşehir ve Kayseri Seferleri',
 'kaman-otobus-saatleri-ankara-kirsehir-kayseri',
 'Kaman''dan Ankara, Kırşehir ve Kayseri''ye kalkan otobüs seferlerinin güncel saatleri ve firma bilgileri.',
 '<p>Kaman ilçesinden çevre illere ve büyükşehirlere düzenli otobüs seferleri yapılmaktadır. Kaman Otogar''ı merkezde yer alıyor ve yoğun olarak Ankara, Kırşehir ve Kayseri yönüne sefer veriliyor.</p><h2>Kaman—Ankara Seferleri</h2><p>Kaman''dan Ankara''ya günde ortalama 8-10 sefer yapılmaktadır. Sabah erken saatlerden (05:30-07:00) başlayan seferler, akşam saatlerine kadar devam eder. Yolculuk süresi yaklaşık 2-2,5 saattir. AŞTİ''ye varış zamanları firma yoğunluğuna göre değişir.</p><h2>Kaman—Kırşehir Seferleri</h2><p>Kırşehir şehir merkezine minibüs ve otobüs seferleri 30 dakikada bir düzenlenir. Yolculuk süresi yaklaşık 40-50 dakikadır. Bu seferler il içi toplu ulaşım niteliğindedir.</p><h2>Kaman—Kayseri Seferleri</h2><p>Kayseri''ye günde 3-4 sefer yapılır. Yolculuk süresi yaklaşık 3 saattir. Firmalar seferlerini Kayseri otogarı üzerinden düzenler.</p><h2>Bilet ve İletişim</h2><p>Kaman otogarındaki firma gişelerinden bilet alabilir veya online bilet satış platformları üzerinden rezervasyon yapabilirsiniz. Güncel saatler için otogarı aramanız önerilir — sefer saatleri mevsime göre değişebilir.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kaman otobüs, ulaşım, Ankara, Kırşehir, Kayseri', 3,
 'Kaman Otobüs Saatleri | Ankara, Kırşehir, Kayseri | Kamanilan',
 'Kaman otogar otobüs saatleri: Ankara, Kırşehir ve Kayseri seferlerinin güncel tarifesi, süre ve bilet bilgileri.',
 1, 1, 4, NOW(3)),

-- ------------------------------------------------------------
-- 5. Kaman Hava Durumu (EVERGREEN — dusuk rekabet)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Hava Durumu: Mevsimsel Ortalamalar ve İklim Özellikleri',
 'kaman-hava-durumu-iklim',
 'Kaman''da hangi mevsimde nasıl bir hava beklenir? İklim özellikleri, yağış ortalamaları ve seyahat planlaması için rehber.',
 '<p>Kaman ilçesi, Orta Anadolu bölgesinde yer alan ve karasal iklimin belirgin şekilde hissedildiği bir yerleşim yeridir. Yazları sıcak ve kurak, kışları soğuk ve karlı geçer.</p><h2>Yaz Ayları (Haziran-Ağustos)</h2><p>Kaman''da yaz ayları genellikle sıcak ve kuraktır. Gündüz sıcaklıklar 30-35°C aralığında seyrederken, gece 15-18°C''ye düşer. Ağustos ayı en sıcak dönemdir.</p><h2>Kış Ayları (Aralık-Şubat)</h2><p>Kış aylarında Kaman''da kar yağışı sık görülür. Gündüz sıcaklıklar 0°C civarında, gece ise -5°C ile -15°C arasında değişebilir. Ocak ayı en soğuk dönemdir.</p><h2>İlkbahar ve Sonbahar</h2><p>Nisan-Mayıs ve Eylül-Ekim ayları Kaman''ı ziyaret etmek için en ideal dönemlerdir. Hava ılıman, doğa ise bol yeşildir. Ceviz festivali bu dönemlere denk gelir.</p><h2>Yağış</h2><p>Yıllık ortalama yağış miktarı 400-450 mm civarındadır. En yağışlı aylar kış sonu ve ilkbahardır.</p><h2>Seyahat Önerisi</h2><p>Kaman''ı ziyaret edecekler için en konforlu dönem mayıs-haziran ile eylül-ekim ayları arasıdır. Kış aylarında yola çıkmadan önce güncel meteorolojik uyarıları kontrol etmek önemlidir.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kaman hava durumu, iklim, seyahat', 3,
 'Kaman Hava Durumu ve İklim | Mevsim Rehberi | Kamanilan',
 'Kaman ilçesi iklim özellikleri, mevsimsel hava durumu, yağış ortalamaları ve en uygun seyahat dönemleri.',
 1, 0, 5, NOW(3)),

-- ------------------------------------------------------------
-- 6. Nobetci Eczane (SAGLIK — sticky)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Nöbetçi Eczane Sistemi: Nasıl Çalışır ve Nereden Öğrenirim?',
 'kaman-nobetci-eczane-sistemi',
 'Kaman''da nöbetçi eczaneleri öğrenmek için başvurabileceğiniz kanallar ve nöbet sisteminin işleyişi.',
 '<p>Kaman ilçesinde mesai saatleri dışında ve hafta sonları ilaç ihtiyacı için nöbetçi eczane sistemi işlemektedir. Türkiye Eczacıları Birliği''nin belirlediği çalışma kurallarına göre ilçedeki eczaneler sırayla nöbet tutar.</p><h2>Nöbet Saatleri</h2><p>Hafta içi nöbetler 19:00-08:30 arasında, hafta sonu ve resmi tatillerde ise tüm gün boyunca sürer. Nöbetçi eczane o günkü nöbet saatleri boyunca açık tutulur.</p><h2>Nöbetçi Eczaneyi Nasıl Öğrenirim?</h2><ul><li><strong>112 Acil:</strong> Telefonla arayıp nöbetçi eczane bilgisi alınabilir</li><li><strong>Eczacıları Birliği Web Sitesi:</strong> İl ve ilçe seçerek güncel liste görüntülenir</li><li><strong>Eczane Vitrinleri:</strong> Kapalı olan eczanelerin kapılarında o günkü nöbetçi eczane adı yazılı olur</li><li><strong>Yerel Haber Siteleri:</strong> Güncel nöbet listesi sıklıkla paylaşılır</li></ul><h2>Acil Durumlar</h2><p>Reçeteli ilaç veya acil sağlık problemi için nöbetçi eczane yanı sıra Kaman Devlet Hastanesi acil servisi de alternatiftir. Hayati durumda 112 aranmalıdır.</p><h2>Resmi Tatil ve Bayramlar</h2><p>Ramazan Bayramı, Kurban Bayramı, yılbaşı ve resmi tatillerde sürekli olarak en az bir eczane açık bulunur.</p>',
 'saglik',
 'Kaman İlan Haber', 'nöbetçi eczane, Kaman, sağlık', 3,
 'Kaman Nöbetçi Eczane Rehberi | Kamanilan',
 'Kaman''da nöbetçi eczane nasıl öğrenilir? Nöbet saatleri, başvuru kanalları ve acil durum rehberi.',
 1, 0, 6, NOW(3)),

-- ------------------------------------------------------------
-- 7. Kirsehir-Kaman Yolu (YEREL)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kırşehir—Kaman Yolu: Mesafe, Süre ve Güzergâh Detayları',
 'kirsehir-kaman-yolu-mesafe-sure',
 'Kırşehir şehir merkezinden Kaman''a ulaşım için güzergâh, mesafe, süre ve yol durumu bilgileri.',
 '<p>Kırşehir''in il merkezi olan Kırşehir şehri ile Kaman ilçesi arasındaki karayolu güzergâhı, ilin en yoğun kullanılan yerel rotalarından biridir. Hem günlük ulaşım hem ticari amaçlarla sürekli olarak trafik akışı yaşanmaktadır.</p><h2>Mesafe ve Süre</h2><p>Kırşehir-Kaman arası yaklaşık 40 kilometre uzunluğundadır. Standart hava ve trafik koşullarında yolculuk süresi yaklaşık 40-50 dakika sürmektedir.</p><h2>Güzergâh</h2><p>Kırşehir''den Kaman''a ulaşmak için D-765 karayolu kullanılır. Güzergâh boyunca küçük köyler ve tarım alanları yer alır. Yol genel olarak düz ve bakımlı olup yaz aylarında seyahat güvenlidir.</p><h2>Toplu Taşıma</h2><p>Kırşehir otogarından Kaman''a düzenli minibüs ve otobüs seferleri vardır. Seferler 30 dakikada bir yapılır. Biletler otogardaki firma gişelerinden alınabilir.</p><h2>Kış Aylarında Dikkat</h2><p>Kış aylarında kar ve buzlanma nedeniyle yol koşulları zorlaşabilir. Karayolları Genel Müdürlüğü''nün yol durumu uyarılarını takip etmek önemlidir.</p><h2>Alternatif Güzergâhlar</h2><p>Acil durumlar için Mucur üzerinden alternatif bir güzergâh mevcuttur. Ancak bu rota yaklaşık 15 km daha uzundur.</p>',
 'yerel',
 'Kaman İlan Haber', 'Kırşehir Kaman yol, ulaşım, mesafe', 3,
 'Kırşehir Kaman Yolu | Mesafe & Güzergâh | Kamanilan',
 'Kırşehir Kaman arası mesafe, yolculuk süresi, güzergâh detayları ve kış aylarında yol durumu.',
 1, 0, 7, NOW(3)),

-- ------------------------------------------------------------
-- 8. Kaman Bor Madeni (EKONOMI — yuksek arama)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman Bor Madeni: Türkiye''nin Stratejik Kaynağı',
 'kaman-bor-madeni-stratejik-kaynak',
 'Kaman ilçesi yakınlarındaki bor madeni, Türkiye''nin dünya bor rezervlerindeki üstünlüğünün önemli ayaklarından biri.',
 '<p>Kaman ilçesi, Türkiye''nin stratejik bor rezervleri bakımından önemli bir konuma sahiptir. Eti Maden İşletmeleri''nin Kaman yakınlarındaki tesisleri bor üretimi ve zenginleştirmesi alanında faaliyet gösteriyor.</p><h2>Bor Nedir?</h2><p>Bor, endüstriyel pek çok alanda kullanılan kritik bir mineraldir. Cam, seramik, deterjan, tarım, ilaç, savunma sanayi ve nükleer enerji gibi sektörlerde bor bileşikleri vazgeçilmezdir.</p><h2>Türkiye''nin Dünyadaki Yeri</h2><p>Türkiye, dünya bor rezervlerinin yaklaşık %73''üne sahiptir. Bu bakımdan ülke dünyanın en büyük bor üreticisi ve ihracatçısı konumundadır. Kaman tesisleri bu üretimin belirli bir bölümünü karşılamaktadır.</p><h2>İstihdam</h2><p>Eti Maden''in Kaman''daki faaliyetleri yerel istihdama önemli katkı sağlamakta ve ilçe ekonomisine can suyu olmaktadır. Yöre halkından işçi ve teknisyen istihdamı ön plandadır.</p><h2>Çevre Koruması</h2><p>Bor üretim tesisleri çevre koruma standartlarına uyumlu olarak faaliyet yürütür. Atık yönetimi ve rehabilitasyon çalışmaları düzenli denetime tabidir.</p>',
 'ekonomi',
 'Kaman İlan Haber', 'Kaman bor madeni, Eti Maden, stratejik maden', 4,
 'Kaman Bor Madeni | Türkiye''nin Stratejik Kaynağı | Kamanilan',
 'Kaman bor madeni ve Eti Maden tesisleri: Türkiye''nin dünyadaki bor üstünlüğünde Kaman''ın rolü, istihdam ve ekonomik etkileri.',
 1, 0, 8, NOW(3)),

-- ------------------------------------------------------------
-- 9. Kaman Tarihi (KULTUR)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman''ın Tarihi: Selçuklu Mirasından Günümüze',
 'kaman-tarihi-selcuklu-mirasi',
 'Kaman ilçesinin tarihi derinliği Selçuklu dönemine uzanır. Tarihi yapılar, efsaneler ve kültürel miras.',
 '<p>Kaman, tarihi kökleri Orta Çağ''a kadar uzanan köklü bir Anadolu yerleşmesidir. İlçenin isim kökeni ve tarihi gelişimi, bölgenin Selçuklu-Osmanlı mirası ile iç içe geçmiştir.</p><h2>Selçuklu Dönemi</h2><p>Kaman''ın ilk yerleşim izleri Anadolu Selçuklu Devleti dönemine rastlar. O dönemde stratejik bir konum olarak bilinen Kaman, ticaret yolları üzerinde yer alıyordu.</p><h2>Osmanlı Dönemi</h2><p>Osmanlı İmparatorluğu döneminde Kaman, Ankara vilayetine bağlı bir kaza statüsünde kaldı. 19. yüzyılda tarım ve hayvancılık ana ekonomik faaliyetlerdi.</p><h2>Cumhuriyet Dönemi</h2><p>Cumhuriyetin ilanından sonra Kaman önce Ankara, daha sonra Kırşehir iline bağlandı. 20. yüzyılın ikinci yarısında bor madeni ve ceviz yetiştiriciliği ilçenin ekonomik yapısını şekillendirdi.</p><h2>Tarihi Yapılar</h2><p>Kaman''da ziyaret edilebilecek tarihi yapılar arasında eski camiler, geleneksel Anadolu evleri ve köy meydanlarındaki anıtlar yer alır. İlçe çevresindeki köylerde de tarihi değeri olan mekânlar bulunmaktadır.</p>',
 'kultur',
 'Kaman İlan Haber', 'Kaman tarihi, Selçuklu, Osmanlı, kültür', 3,
 'Kaman Tarihi | Selçuklu Mirası | Kamanilan',
 'Kaman ilçesinin Selçuklu döneminden günümüze uzanan tarihi. Tarihi yapılar, dönemler ve kültürel miras.',
 1, 0, 9, NOW(3)),

-- ------------------------------------------------------------
-- 10. Kaman Emlak Trendleri (EKONOMI — cross-sell)
-- ------------------------------------------------------------
(UUID(), 'tr',
 'Kaman''da Emlak: Son Dönem Fiyat Trendleri ve Bölgelere Göre Analiz',
 'kaman-emlak-fiyat-trendleri',
 'Kaman''da emlak piyasası nasıl seyrediyor? Merkez, köyler ve gelişim bölgelerinde fiyat eğilimleri.',
 '<p>Kaman ilçesinde emlak piyasası son yıllarda büyükşehirlere kıyasla çok daha istikrarlı bir seyir izliyor. Hem yerel yatırımcılar hem Kırşehir ve Ankara''dan gelen ikincil konut arayanlar bu piyasayı canlı tutuyor.</p><h2>İlçe Merkezi</h2><p>Kaman merkezinde satılık daire fiyatları geniş bir aralıkta seyrediyor. Yeni inşaat binalar ile eski yapıların fiyat farkı belirgin. Kiralık daire arz ve talebi dengeli.</p><h2>Köy ve Arsa Piyasası</h2><p>Kaman''a bağlı köylerde arsa fiyatları uygun seviyelerde. Özellikle ceviz bahçesi alım-satımı yerel halk arasında yaygın bir yatırım aracı.</p><h2>Gelişim Bölgeleri</h2><p>Son yıllarda belediye''nin imar planı güncellemeleri ile ilçenin çeperindeki bazı bölgelerde yeni yerleşim alanları açıldı. Bu bölgelerdeki arsa fiyatlarında hareketlilik görülüyor.</p><h2>Yatırımcı Profili</h2><p>Kaman emlak piyasasında alıcı profili üç gruba ayrılıyor:</p><ul><li>Yerel aileler ve gençler (oturum amaçlı)</li><li>Kırşehir ve Ankara''dan ikincil konut arayanlar</li><li>Ceviz yetiştiriciliği veya tarım amaçlı arsa alıcıları</li></ul><h2>Kaman İlanları</h2><p>Güncel Kaman emlak ilanlarını Kamanilan platformu üzerinden kategori ve bölgeye göre inceleyebilirsiniz.</p>',
 'ekonomi',
 'Kaman İlan Haber', 'Kaman emlak, fiyat trendleri, yatırım', 4,
 'Kaman Emlak Fiyat Trendleri | Bölge Analizi | Kamanilan',
 'Kaman ilçesi emlak piyasası: satılık daire fiyatları, köy arsa trendleri, gelişim bölgeleri ve yatırımcı profili.',
 1, 1, 10, NOW(3));
