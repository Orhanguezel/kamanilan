# Kaman İlan Reklam Hazırlık Denetimi — 12 Ağustos 2026

## Yönetici özeti

Site işlevsel ve ana dönüşüm rotaları erişilebilir durumda. Bu çalışmada ödeme yüzeyleri kapalı tutuldu, içerik doğruluğu ve sitemap temizlendi, doğrulanmamış örnek reklamlar gizlendi ve kritik görseller optimize edildi. Buna rağmen geniş kitleli ücretli reklam başlatmadan önce ilan arzının artırılması ve dönüşüm olaylarının ölçülmesi gerekiyor.

En büyük ticari risk teknik değil, içerik yoğunluğudur: canlı API yalnızca 2 aktif ilan döndürüyor. Reklam bütçesi doğrudan genel ziyaretçi trafiğine verilirse kullanıcıların önemli bölümü boş kategori deneyimi yaşayacaktır.

## Kritik bulgular

### P0 — Reklam başlamadan tamamlanmalı

1. **İlan arzı çok düşük:** 2 aktif ilan var ve ikisi de aynı kategoride. Önce Kaman/Kırşehir için doğrulanmış başlangıç envanteri oluşturulmalı.
2. **Dönüşüm olayları eksik:** Google Ads etiketi yükleniyor fakat kodda `sign_up`, `generate_lead`, `listing_submit`, telefon ve WhatsApp tıklaması gibi dönüşüm olayları yok. Kampanya optimizasyonu yalnız sayfa ziyaretiyle yapılamaz.
3. **Ana sayfa mobil hızı hâlâ zayıf:** Mobil Lighthouse performansı 56, LCP 8.14 saniye. Önceki 17.5 saniyeye göre güçlü iyileşme var ancak reklam açılış sayfası hedefi olan 2.5 saniyenin üzerinde.
4. **İçerik doğrulama süreci gerekli:** Yeni ilan sayısı artırılırken telefon, fiyat, konum, görsel hakkı ve ilan sahibinin onayı kayıt altına alınmalı.

### P1 — İlk kampanya döneminde tamamlanmalı

1. Kategori ve şehir bazında boş sonuç analitiği eklenmeli.
2. İlan verme hunisi adımları ölçülmeli: giriş/kayıt, form başlangıcı, form hatası, başarılı gönderim, moderasyon onayı.
3. Telefon/WhatsApp tıklamaları ilan ve kategori kimliğiyle ölçülmeli.
4. Ana sayfa hero hareketleri ve istemci tarafı bağımlılıkları sadeleştirilmeli.
5. Cloudflare'ın robots.txt içine eklediği `Content-Signal` direktifi Lighthouse tarafından geçersiz sayılıyor. Google taraması engellenmiyor, ancak yapı sadeleştirilmeli.

### P2 — Büyüme aşaması

1. Kaydedilmiş aramalar ve yeni ilan bildirimleri.
2. Satıcı başvuru hunisi ve onay SLA raporu.
3. İlan kalite puanı, mükerrer ilan ve spam tespiti.
4. Kategori başına organik açılış sayfası; yalnız yeterli aktif ilan olduğunda indexleme.

## Uygulanan değişiklikler

- Sitemap 178 URL'den 17 doğrulanmış URL'ye indirildi.
- Boş kategori-şehir kombinasyonları sitemap'ten kaldırıldı ve boş dinamik sayfalar `noindex, follow` yapıldı.
- Kategori sayfalarındaki boş şehir bağlantı ağı kaldırıldı.
- Ana sayfadaki 1.250+, 45.000+ ve %98 gibi doğrulanmamış metrikler gerçek aktif ilan sayısı ve ürün özellikleriyle değiştirildi.
- Hero kategori parametresi ilan listesinin beklediği `category` alanıyla eşleştirildi.
- Reklam verme sayfasındaki “binlerce kullanıcı/en aktif platform” iddiaları kaldırıldı.
- Üst bilgi bandındaki trafik iddiaları doğrulanabilir ifadelerle değiştirildi.
- Örnek telefonlu/doğrulanmamış işletme banner'ları pasife alındı; reklam alanı metinlerinden yüzlerce/binlerce trafik iddiaları çıkarıldı.
- Hero, logo, kategori ve ilan görselleri WebP olarak optimize edildi; özgün dosyalar korundu.
- İlk ilan görselleri LCP için önceliklendirildi.
- Filtre alanlarına erişilebilir etiketler eklendi ve başlık hiyerarşisi düzeltildi.
- Üst bant yüklenirken 40 px alan ayrılarak layout shift azaltıldı.
- OneSignal ilk boyama yolundan çıkarıldı; kullanıcı etkileşimi veya 15 saniye sonra başlatılıyor.
- Google etiketi pencere yüklemesi sonrasına alındı.
- Sepet ve ödeme rotaları kapalı kalmaya devam ediyor.

## Lighthouse karşılaştırması

| Sayfa / metrik | Önce | Sonra |
|---|---:|---:|
| Ana sayfa mobil performans | 49 | 56 |
| Ana sayfa mobil LCP | 17.5 sn | 8.14 sn |
| Ana sayfa mobil FCP | 3.9 sn | 2.32 sn |
| Ana sayfa mobil TBT | 600 ms | 508 ms |
| Ana sayfa mobil transfer | 6.58 MB | 1.95 MB |
| Ana sayfa en iyi uygulamalar | 75 | 96 |
| İlanlar masaüstü performans | 75 | 92 |
| İlanlar masaüstü LCP | 5.2 sn | 1.84 sn |
| İlanlar masaüstü TBT | 50 ms | 0 ms |
| İlanlar masaüstü CLS | 0.048 | 0.020 |
| İlanlar erişilebilirlik | 95 | 100 |
| İlanlar en iyi uygulamalar | 78 | 100 |

Laboratuvar sonuçları ağ/CPU koşullarına göre değişebilir. Gerçek kullanıcı Core Web Vitals verisi reklam trafiği başladıktan sonra ayrıca izlenmelidir.

## Canlı kabul kontrolleri

- `/`, `/ilanlar`, `/iletisim`, `/reklam-ver`: HTTP 200.
- `/ilan-ver`: oturumsuz kullanıcı için giriş yönlendirmesi.
- `/sepet`, `/odeme`: ödeme kapalıyken yönlendirme.
- Sitemap: 17 URL, boş kategori-şehir URL'si yok.
- PM2: frontend, backend ve admin panel online.
- Güncel loglarda yeni social-login 500 veya deploy sonrası frontend hatası yok.
- Logda görünen `fast-xml-parser` hataları eski 11 Ağustos 13:44–13:47 sürümüne ait; mevcut süreç online.

## İlan büyütme ve reklam açılış eşiği

Genel trafik kampanyası için önerilen minimum başlangıç:

- En az 30–50 doğrulanmış aktif ilan.
- Hedeflenen her ana kategoride en az 5 anlamlı ilan.
- Her ilanda özgün görsel, açık fiyat veya “teklif alın”, güncel telefon ve konum.
- İlan gönderimi, kayıt ve iletişim dönüşümlerinin Ads/GA4 içinde test edilmiş olması.
- Mobil ana sayfa yerine ilk kampanyada dolu kategori veya ilan listesi açılış sayfası kullanılması.

Bu eşikler sağlanmadan geniş kampanya yerine ilan veren kazanım kampanyası daha mantıklıdır: hedef, ziyaretçi çekmekten önce yerel ilan arzını büyütmek olmalıdır.

## Geri alma ve yedekler

- Frontend yedeği: `/var/www/vps-guezel/kamanilan/shared/backups/ad-readiness-final-20260812-004257`
- Banner verisi yedeği: `/var/www/vps-guezel/kamanilan/shared/backups/ad-readiness-banners-20260811-224005/banners-before.sql`
- İçerik sonrası DB anlık görüntüsü: `/var/www/kamanilan/shared/backups/ad-readiness-20260811T215513/content-after.sql`

