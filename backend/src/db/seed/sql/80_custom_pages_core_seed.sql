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
   '<div class="flex flex-col gap-16">',
     '<div>',
       '<div class="eyebrow mb-6 uppercase tracking-widest">Hikayemiz</div>',
       '<h1 class="font-fraunces text-4xl md:text-6xl text-ink leading-tight mb-8">Kaman''ın Bereketli Topraklarından <em>Dijital Vitrine</em></h1>',
       '<p class="text-xl text-text-2 leading-relaxed font-manrope">',
         'Kaman İlan, Anadolu''nun kalbinde, Kırşehir''in bereketli ilçesi Kaman''da yerel ticaretin ve komşuluk hukukunun dijital dünyadaki temsilcisi olarak doğdu. ',
         'Amacımız, sadece bir ilan sitesi olmak değil; Kaman''ın coğrafi işaretli cevizinden hayvan pazarına, satılık bağ evinden yerel iş ilanlarına kadar her türlü değeri hak ettiği prestijle dünyaya duyurmaktır.',
       '</p>',
     '</div>',
     
     '<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-ivory/30 p-10 md:p-16 rounded-[40px] border border-line">',
       '<div class="space-y-6">',
          '<h2 class="font-fraunces text-3xl text-ink">Neden <em>Kaman İlan?</em></h2>',
          '<p class="text-text-2">Geleneksel ilan sitelerinin karmaşasından uzak, sadece bölgemize özel, temiz ve güvenilir bir platform sunuyoruz. Aracıları aradan kaldırarak doğrudan üreticiyle tüketiciyi, mülk sahibiyle alıcıyı buluşturuyoruz.</p>',
          '<ul class="space-y-4">',
            '<li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full bg-saffron"></span> <span class="text-sm font-bold uppercase tracking-wider text-ink">Bölgesel Uzmanlık</span></li>',
            '<li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full bg-saffron"></span> <span class="text-sm font-bold uppercase tracking-wider text-ink">Güven Odaklı Süreç</span></li>',
            '<li class="flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full bg-saffron"></span> <span class="text-sm font-bold uppercase tracking-wider text-ink">Prestijli İlan Sunumu</span></li>',
          '</ul>',
       '</div>',
       '<div class="p-8 bg-ink rounded-[32px] text-parchment space-y-4 shadow-3xl">',
          '<div class="h-1 w-12 bg-saffron"></div>',
          '<p class="font-fraunces italic text-2xl">"Toprağın bereketini dürüst ticaretle birleştiriyor, Kaman''ın geleceğini dijitalle inşa ediyoruz."</p>',
          '<p class="font-mono text-[9px] uppercase tracking-[0.3em] opacity-50">— Kaman İlan Vizyonu</p>',
       '</div>',
     '</div>',
     
     '<div class="grid md:grid-cols-3 gap-10">',
        '<div>',
          '<h3 class="font-fraunces text-2xl mb-4 text-ink">Misyonumuz</h3>',
          '<p class="text-text-3 text-sm leading-relaxed">Yerel üreticinin emeğini koruyarak, Kaman ekonomisine dijital güç katmak ve ilan verme sürecini herkes için zahmetsiz hale getirmek.</p>',
        '</div>',
        '<div>',
          '<h3 class="font-fraunces text-2xl mb-4 text-ink">Vizyonumuz</h3>',
          '<p class="text-text-3 text-sm leading-relaxed">Türkiye''de yerel ilan platformları arasında tasarım ve güven açısından örnek gösterilen, Kaman''ın dijital hafızası olan bir marka olmak.</p>',
        '</div>',
        '<div>',
          '<h3 class="font-fraunces text-2xl mb-4 text-ink">Değerlerimiz</h3>',
          '<p class="text-text-3 text-sm leading-relaxed">Şeffaflık, yerel kalkınmaya destek, kullanıcı dostu teknoloji ve Kaman''ın kültürel dokusuna saygı.</p>',
        '</div>',
     '</div>',
   '</div>'
 )),
 'Hakkımızda — Kaman İlan | Yerel Güç, Dijital Vizyon',
 'Kaman İlan: Kaman cevizi, emlak, hayvan pazarı ve iş ilanları için bölgenin en prestijli yerel ilan platformu.'
);

-- Gizlilik Politikasi
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_gizlilik, 'tr',
 'Gizlilik Politikası',
 'gizlilik-politikasi',
 JSON_OBJECT('html', CONCAT(
   '<div class="editorial-content">',
     '<div class="eyebrow mb-6">Yasal Bilgilendirme</div>',
     '<h1>Gizlilik ve Veri Güvenliği</h1>',
     '<p>Kaman İlan olarak kişisel verilerinizin güvenliği bizim için en üst düzeyde önceliğe sahiptir. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, platformumuzu kullanırken paylaştığınız her türlü veriyi sadece size daha iyi hizmet sunmak ve yasal yükümlülüklerimizi yerine getirmek amacıyla işliyoruz.</p>',
     '<h2>Hangi Verileri Topluyoruz?</h2>',
     '<p>Üyelik işlemleri sırasında adınız, e-posta adresiniz ve telefon numaranız gibi temel iletişim bilgilerinizi topluyoruz. Bu bilgiler, ilanlarınızın doğrulanması ve alıcılarla sağlıklı iletişim kurmanız için gereklidir.</p>',
     '<h2>Verilerin Paylaşımı</h2>',
     '<p>Kişisel verileriniz, açık rızanız olmaksızın üçüncü taraflarla reklam veya pazarlama amacıyla paylaşılmaz. Sadece adli makamların yasal talepleri doğrultusunda ilgili kurumlarla paylaşım yapılabilir.</p>',
     '<blockquote>Güvenliğiniz, Kaman İlan güvencesi altındadır.</blockquote>',
   '</div>'
 )),
 'Gizlilik Politikası — Kaman İlan',
 'Kaman İlan gizlilik politikası ve veri işleme esasları hakkında detaylı bilgiler.'
);

-- Kullanım Kosullari
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_kullanim, 'tr',
 'Kullanım Koşulları',
 'kullanim-kosullari',
 JSON_OBJECT('html', CONCAT(
   '<div class="editorial-content">',
     '<div class="eyebrow mb-6">Şartlar & Koşullar</div>',
     '<h1>Platform Kullanım Kuralları</h1>',
     '<p>Kaman İlan platformuna hoş geldiniz. Bu platformu kullanarak aşağıda belirtilen şartları kabul etmiş sayılırsınız. Kurallarımız, yerel ticaretin huzurunu ve güvenini korumak amacıyla oluşturulmuştur.</p>',
     '<h2>İlan Yayın Kuralları</h2>',
     '<ul>',
       '<li>Yanıltıcı, sahte veya yasa dışı içerik barındıran ilanlar yasaktır.</li>',
       '<li>Her ilan, doğru kategori altında ve gerçek bilgilerle yayınlanmalıdır.</li>',
       '<li>Kullanıcılar, yayınladıkları ilanların içeriğinden bizzat sorumludur.</li>',
     '</ul>',
     '<h2>Hesap Güvenliği</h2>',
     '<p>Hesabınızın güvenliği sizin sorumluluğunuzdadır. Şifrenizi kimseyle paylaşmayınız. Şüpheli bir durum fark ettiğinizde lütfen destek birimimizle iletişime geçiniz.</p>',
     '<blockquote>Dürüst ticaret, Kaman İlan''ın temelidir.</blockquote>',
   '</div>'
 )),
 'Kullanım Koşulları — Kaman İlan',
 'Kaman İlan kullanım koşulları ve ilan yayın kuralları hakkında resmi detaylar.'
);

-- Kalite Politikamiz
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_kalite, 'tr',
 'Kalite Politikamız',
 'kalite-politikamiz',
 JSON_OBJECT('html', CONCAT(
   '<div class="flex flex-col gap-16">',
     '<div>',
       '<div class="eyebrow mb-6">Standartlarımız</div>',
       '<h1 class="font-fraunces text-4xl md:text-5xl text-ink mb-8">Kusursuz Deneyim, <em>Sürdürülebilir Güven</em></h1>',
       '<p class="text-lg text-text-2 leading-relaxed">Kaman İlan kalitesini; şeffaf bilgi paylaşımı, kullanıcı dostu arayüz ve hızlı çözüm üretme disipliniyle tanımlarız.</p>',
     '</div>',
     
     '<div class="grid md:grid-cols-2 gap-8">',
       '<div class="p-10 border border-line rounded-[32px] hover:bg-ivory/20 transition-colors">',
         '<div class="mb-6 h-12 w-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron font-bold text-xl">01</div>',
         '<h3 class="font-fraunces text-2xl mb-4 text-ink">Veri Doğruluğu</h3>',
         '<p class="text-sm text-text-3">İlanlardaki bilgilerin güncel ve doğru olması için sürekli denetim yapıyoruz. Kaman cevizi gibi hassas ürünlerde sadece gerçek üreticilere yer veriyoruz.</p>',
       '</div>',
       '<div class="p-10 border border-line rounded-[32px] hover:bg-ivory/20 transition-colors">',
         '<div class="mb-6 h-12 w-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron font-bold text-xl">02</div>',
         '<h3 class="font-fraunces text-2xl mb-4 text-ink">Dijital Estetik</h3>',
         '<p class="text-sm text-text-3">İlanların sunum kalitesini artırarak, bölgedeki mülk ve ürünlerin gerçek değerini yansıtan editoryal bir görünüm sağlıyoruz.</p>',
       '</div>',
     '</div>',
     
     '<div class="bg-ink p-12 rounded-[40px] text-parchment text-center">',
       '<p class="font-fraunces text-2xl md:text-3xl opacity-90 italic">"Kalitemiz, Kaman halkının bize duyduğu güvenden beslenir."</p>',
     '</div>',
   '</div>'
 )),
 'Kalite Politikamız — Kaman İlan | Şeffaf ve Yerel Hizmet',
 'Hizmet standartlarımız: Veri doğruluğu, dijital estetik ve müşteri memnuniyeti.'
);

-- Misyonumuz - Vizyonumuz
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `meta_title`, `meta_description`)
VALUES
(UUID(), @pg_misyon, 'tr',
 'Misyonumuz - Vizyonumuz',
 'misyon-vizyon',
 JSON_OBJECT('html', CONCAT(
   '<div class="flex flex-col gap-12 lg:gap-24">',
     '<section class="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">',
       '<div>',
         '<div class="eyebrow mb-6">Misyon</div>',
         '<h2 class="font-fraunces text-4xl lg:text-6xl text-ink leading-tight mb-8">Yerel Gücü <em>Dijitalle Birleştirmek</em></h2>',
         '<p class="text-xl text-text-2">Kaman ve Kırşehir bölgesindeki ticaret ekosistemini dijitalleştirerek, herkes için erişilebilir, güvenilir ve prestijli bir pazar yeri oluşturmak temel görevimizdir.</p>',
       '</div>',
       '<div class="relative aspect-square md:aspect-video rounded-[48px] overflow-hidden bg-muted">',
         '<img src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1400&q=80" alt="Vizyon" class="object-cover w-full h-full opacity-80" />',
       '</div>',
     '</section>',

     '<section class="bg-ink text-white p-12 lg:p-24 rounded-[64px] shadow-3xl">',
       '<div class="max-w-3xl">',
         '<div class="eyebrow mb-6 text-saffron before:bg-saffron">Vizyon</div>',
         '<h2 class="font-fraunces text-4xl lg:text-7xl mb-12">Anadolu''nun <em>Modern İlan Hafızası</em> Olmak</h2>',
         '<p class="text-lg lg:text-2xl text-parchment/60 leading-relaxed">Kaman''dan başlayarak tüm Türkiye''ye yayılan, yerelliği lüks ve profesyonellik ile harmanlayan, güven denince akla gelen ilk dijital platform olmayı hedefliyoruz.</p>',
       '</div>',
     '</section>',
   '</div>'
 )),
 'Misyonumuz ve Vizyonumuz — Kaman İlan',
 'Kaman İlan misyonu: doğru fiyatlama, profesyonel pazarlama, güvenli süreç. Vizyon: bölgede örnek gösterilen, müşteri deneyimi güçlü ilan markası.'
);
