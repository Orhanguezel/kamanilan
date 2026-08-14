# Kamanilan — Sosyal Medya Kanalları

14 Ağustos 2026

## Kanallar

| Kanal | Adres |
|---|---|
| Site | https://kamanilan.com |
| **WhatsApp Kanalı** | https://whatsapp.com/channel/0029Vb8K3Sj8vd1JGMBtyV02 |

## WhatsApp Kanalı hakkında bilinmesi gerekenler

**Kanal ≠ grup.** Kanal linki `whatsapp.com/channel/...`, grup linki
`chat.whatsapp.com/...` biçimindedir. Kanalda takipçi sınırsızdır ve takipçiler ne
yöneticinin ne birbirinin telefon numarasını görür; grupta ise 1.024 üye tavanı
vardır ve **herkes herkesin numarasını görür**. İlan portalı gibi ticari bir kitlede
grup üye listesi toplanabilir bir müşteri listesine dönüşür — bu yüzden yayın için
grup değil kanal kullanılır.

**API yok.** WhatsApp Kanallarına programlı gönderi atılamaz; zamanlama, webhook veya
entegrasyon desteklenmiyor (Facebook gruplarındaki durumun aynısı). Günde tek kanala
tek gönderi elle atılır, bu sürdürülebilir. Üçüncü taraf "kanal API" servisleri
(Whapi vb.) resmî değildir, kullanım şartlarını ihlal eder ve numara/hesap kapatma
riski taşır — **kullanılmayacak.**

**Kanal ayarlarında "iletmeyi / ekran görüntüsünü engelle" AÇILMAYACAK.** İçeriğin
iletilmesi dağıtımın kendisidir; bu ayar onu keser.

## Yapılacaklar

1. Kanal linkini siteye ekle: alt bilgi ve iletişim sayfası.
2. Schema `sameAs` dizisine ekle.
3. Yayın ritmi: günün öne çıkan ilanları / yeni ilan özetleri. Her gönderide
   kamanilan.com'a dönen bir bağlam olsun.
4. İçerik görselleri iletilmeye uygun tasarlanmalı — köşede site adresi filigranı.
   Referans desen: `hal-fiyatlari/scripts/gunluk-fiyat-karti.py`.

## İlgili belgeler

- Kanal/grup/sayfa iş bölümü ve Meta Groups API kısıtı:
  `bayramozukoyu/docs/SOSYAL-MEDYA.md`
- Dağıtım stratejisi (görsel iletme mantığı):
  `tarim-dijital-ekosistem/projects/hal-fiyatlari/docs/DAGITIM-TESHISI-2026-08-14.md`
