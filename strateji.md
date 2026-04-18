Siteye baktım. Durum seni uyandırmam gereken bir noktada, o yüzden direkt konuşacağım:

**Site şu an hiçbir gelir modeli için hazır değil.** Anasayfada "Öne Çıkan" ve "Son İlanlar" başlıkları var ama içi boş. Sponsor satmak için esnafa göstereceğin "canlı vitrin" yok, AdSense'in onaylayacağı içerik hiç yok, Google'ın indeksleyeceği değerli bir şey yok. Şu haliyle bir esnaf siteyi açtığında "burada kimse yok" deyip kapatır — sponsorluk satışı bu senaryoda imkânsız. AdSense ise zaten bu yoğunlukta "düşük değerli içerik" sebebiyle ret yer.

Açık gerçek şu: **ilan siteleri ilgisizlik yüzünden ölür.** Bir ilan sitesi network effect'e bağlı — alıcı yoksa satıcı ilan vermez, ilan yoksa alıcı uğramaz. Bu çarkı döndüren ilk itme her zaman operatörden gelir. "İlgilenmiyorum ama para kazansın" ile ilan sitesi uyuşmaz. Haber/blog sitesi bir noktaya kadar atıl dururken Google trafiği çekebilir, ama ilan sitesi **aktif operatör** ister.

Şu an üç gerçekçi yol var, ve bunların dışında bir şey maalesef yok:Seçimine göre somut aksiyon planı çıkaralım — her yolun gerektirdiği şey çok farklı, o yüzden boşa kod yazmadan önce yön netleşsin.  

Tamam, bu güzel bir commitment. Şimdi Kaman ölçeğinde **gerçekten işleyen** bir plan çıkaralım. Büyük şehir playbook'unu uygulamak boşa enerji harcatır — Kaman'da kazananı farklı şeyler belirliyor.

## Önce Acı Gerçek: Asıl Rakibin Google Değil, Facebook

Kaman'da muhtemelen şu an aktif "Kaman İlan", "Kaman Emlak", "Kaman Alışveriş" gibi **Facebook grupları ve WhatsApp grupları** var ve insanlar orada hızlı sonuç alıyor. Senin işin bu grupların alışkanlığını kırmak ya da o grupların **yanında yaşamak**. Sahibinden.com Kaman gibi ilçelerde neredeyse boş, orası rakibin değil. 

İlk iş: Facebook'ta "Kaman" araması yap, hangi gruplar aktif, kaç üyeli, günde kaç post — **rekabet haritası çıkar**. Bu 1-2 saatlik iş, stratejini belirleyecek.

## 3-6 Ay Yol Haritası

### Ay 1 — Tohum Ekme (Soğuk Start Problemi)

İlan sitesinin ölüm nedeni boşluk. İlk hedef: siteyi ziyaret eden birinin **"burada gerçekten bir şey var"** hissiyatı.

- İlk hafta **200+ ilan hedefle**. Kendi çevrenden, tanıdık esnaftan, Facebook gruplarındaki açık postları (kişiye ulaşıp izin alarak) aktar. Gerekirse eş dost adına birkaç gerçek ilan koy.
- Her kategoride **en az 5-10 ilan** olsun. Boş kategori güvensizlik yayar.
- **İlan vermeyi saniyeler içinde yapılabilir hale getir**: telefon + fotoğraf + başlık + kategori, bitti. Kayıt zorunluluğu bile kaldır — telefon doğrulaması yeter. Sürtünme = ölüm.
- WhatsApp butonu ekle her ilanda. Kaman'da insanlar arama değil WhatsApp mesajı atıyor.

### Ay 2 — Trafik Motoru: Haber Tarafı

Haber tarafın aslında en büyük koz. Çünkü "Kaman" araması yapan herkes için var olmak demek. İlan sitesinin kendisi SEO'da zayıftır; haber sitesi güçlüdür.

- Günde **1 yerel haber** — belediye kararı, okul, tarım, bor madeni, hava, yol, etkinlik, cenaze, spor. Kopyala değil, kendi cümlelerin.
- Hedef kelimeler: "Kaman belediyesi", "Kaman hava durumu", "Kaman otobüs saatleri", "Kaman ceviz festivali", "Kırşehir Kaman yol", "Kaman nöbetçi eczane". Bunlar aylık aranma hacmi küçük ama **rekabetsiz** — 2. ayın sonunda birinci sayfadasın.
- **Google News başvurusu** — haber sitesi statüsü alırsan trafiğin 3-5 katına çıkar.
- Pratik eklentiler: nöbetçi eczane sayfası, otobüs saatleri sayfası, hava durumu widget'ı — bunlar sürekli geri gelen ziyaretçi yaratır (sticky content).

### Ay 3 — İlk Gelir: Yerel Esnaf

Artık "3 aydır yayındayız, aylık X ziyaretçi, Y ilan" diyebileceğin numaraların var. Esnaf turu zamanı.

- **İlk 3 sponsora "deneme" fiyatı ver**: 3 ay 500 TL/ay. Amaç para değil, vitrinde referans vaka. Emlakçı, galeri, düğün salonu en olası müşteriler.
- Self-servis "Vitrin ilan" (ücretli öne çıkarma) özelliğini aç — 50-100 TL tek seferlik. Panelden iyzico/PayTR entegrasyonu.
- Ana sayfa + kategori üstü + ilan detay sidebar olarak **3 premium slot** belirle. Ayda 6-8 sponsor = aylık 3.000-4.000 TL taban gelir.

### Ay 4-6 — Ölçeklendirme

- İçerik birikimi 3.000-5.000 aylık ziyaretçiye ulaştıysa **AdSense başvurusu**. Sponsor + AdSense hibrit çalışsın (satılmayan slot'ları AdSense doldursun, daha önce konuşmuştuk).
- **Kaman → Kırşehir geneli** pivotu düşün. "Kırşehir İlan" yapabilirsin; nüfus 10 kat artar, teknik efor aynı. Ama yereldeki tanınmayı kaybetmemek için "Kaman İlan, Kırşehir'e açıldı" şeklinde konumlan.

## Teknik Checklist (Developer İşi)

Büyüme tarafında kod üretmen gereken asıl şeyler:

- **Structured data**: Her ilanda `Product` + `Offer`, haberlerde `NewsArticle`, işletme sponsorlarda `LocalBusiness` schema.org JSON-LD. Google Rich Results için şart.
- **Dinamik sitemap** (ilan eklendiğinde güncellenen) + **robots.txt** + Search Console + Analytics kurulumu.
- **WhatsApp/Facebook paylaşım OG meta tag'leri** her ilan ve haberde dinamik. Kaman'da viral dağılım WhatsApp'tan olacak.
- **Moderasyon paneli**: ilan onay/red, bayrakla şikayet, toplu işlem. Yetişkin/illegal içerik AdSense'i ve itibarı öldürür.
- **Core Web Vitals** yeşil olsun. Resim lazy-load, WebP, CDN (Cloudflare bedava).
- **PWA**: "Ana ekrana ekle" özelliği — Kaman gibi mobil ağırlıklı yerde masaüstü uygulama hissi, düşük maliyetle büyük kazanç.
- **E-posta/SMS bildirim** altyapısı: "İlanın yayına girdi", "İlanın süresi doluyor" — geri dönüş sağlıyor.
- **Arama**: kategori + fiyat aralığı + Kaman mahalle filtresi (Kaman'ın mahallelerine göre filtre Sahibinden'de yok, senin farkın olabilir).

## Pazarlama — Kod Değil Ama Zorunlu

Kaman'da büyüme kanalları bunlar:

- **Facebook grupları**: Aktif gruplara üye ol, site spam'lama — ama arada "Kaman İlan'a şu ilan girdi, buyrun bakın" postu at. Bazı grup adminleriyle **partnerlik** kur: gruba link izni karşılığı sitende onlara tanıtım.
- **WhatsApp**: Kendi Kaman İlan broadcast listesi/kanalı kur. Günde 3-5 seçme ilan at.
- **Yerel muhtarlar, çarşı esnafı** ile yüz yüze: QR kodlu küçük A5 flyer yaptırıp dağıt. Basit ama etkili.
- **Kaman Ceviz Festivali** gibi yerel etkinliklerde görünürlük — sponsor ol/stant aç.
- **Yerel gazete + radyo** varsa barter: sende onlara banner, onlar sana "kamanilan.com" sözlü mention.

## İlk 7 Gün Yapılacaklar Listesi

Planın kağıtta kalmaması için ilk haftanın konkre kurulumu:

1. **Gün 1-2**: Facebook rekabet haritası + kendi çevrenden ilk 50 ilan
2. **Gün 3**: Search Console + Analytics + Sitemap + Schema.org kurulumu
3. **Gün 4**: İlan vermeyi 30 saniyeye indir (UX review)
4. **Gün 5-6**: İlk 10 haber yaz, yerel SEO'ya hazır
5. **Gün 7**: WhatsApp broadcast grubu + Facebook sayfası aç, ilk duyuru

---

Şimdi seninle daha derinlemesine çalışabileceğim birkaç nokta var. Hangisinden başlayalım?