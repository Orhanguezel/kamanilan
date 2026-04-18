# Kamanilan — Ilan Bootstrap Plani

> Amac: Siteye ilk gercek icerigi (30-200+ ilan) yasal ve surdurulebilir sekilde doldurmak, ayni zamanda uzun vadeli emlakci/sirket akisini acmak.
> Hedef kitle: Bireysel ilan sahipleri + emlakci/sirket hesaplari.

---

## Yapilmayacaklar (onemli)

Asagidaki yontemler kisa vadede cazip gorunur ama **sistemin sonunu getirir** — yapilmayacak:

- Sahibinden, Hepsiemlak, Emlakjet gibi sitelerden **scrape edilmis** ilanlari kopyalamak
  - Sahibinden'in Turkiye'de scraper'lara acilmis davasi var
  - Ilandaki fotograf ilan sahibinin **telif hakki** kapsamindadir
  - Telefon + isim + adres icermesi nedeniyle **KVKK ihlali**
- Facebook gruplarindan izinsiz ilan + fotograf cekmek (ayni KVKK/telif sorunu)
- "Sahte ilan" ile vitrin doldurmak — ilk gerceк kullanici hayal kirikligiyla doner, bir daha gelmez

---

## Mevcut Altyapi (hazir olan)

Backend'de bu moduller zaten var:

- `proporties` — ilan tablosu + CRUD
- `myListings` — kullanicinin kendi ilanlari
- `seller` — sirket/emlakci hesabi
- `subscription` — ucretli plan altyapisi
- `categories`, `subcategories`, `listingTags`, `listingBrands` — taksonomi
- `banner` — ana sayfa banner yonetimi
- Iyzipay entegrasyonu

**Yani altyapi hazir, eksik olan:** icerik (ilan), emlakci icin toplu import, launch kampanya UX'i.

---

## 4 Haftalik Bootstrap Plani

### Hafta 1 — Elle 30-50 gercek ilan

Hedef: Siteye gelen ilk ziyaretcinin "burada gercekten bir seyler var" hissetmesi.

#### Kaynaklar (izinli)

1. **Kendi cevren**
   - Aile/arkadas cevresinde kiralik/satilik ev, arsa, dukkan olanlara ulas
   - "Ucretsiz yayinlayayim, siteyi test ediyoruz" teklifi
   - Fotograf + bilgi + yazili izin al
   - Hedef: 10-20 ilan

2. **Yerel emlakci ziyareti** (yuz yuze)
   - Kaman/Kayseri'de 5-10 emlakci dukkanina **fiziksel** git
   - Teklif: "Vitrin ilanlarinizi ucretsiz kamanilan.com'a ekleyeyim; sizin logonuz + telefonunuzla yayinlansin"
   - Emlakcinin kaybi yok, sana 20-50 ilan gelir
   - WhatsApp iletisimi ac, sonraki guncellemeler icin kanal kur

3. **Facebook gruplari — post atma (scrape degil)**
   - "Kaman Ilan", "Kaman Emlak", "Kayseri Kiralik" gibi gruplara sen post at:
     > "Kamanilan.com yayinda. Ilk 100 ilan ucretsiz + one cikarilmis. Bireysel ve emlakci kayitlari acildi."
   - Insanlar kendileri gelir, sen scrape etmezsin → veri senin, izin sahibinin

#### Hedef (hafta sonunda)
- 30+ yayinda ilan
- 5+ emlakci anlasmasi
- Her kategoride en az 3-5 ilan (bos kategori guvensizlik yayar)

---

### Hafta 2 — Toplu import altyapisi (en kritik teknik is)

Bir emlakci elinde 50-200 ilan var. Elle tek tek girmek = emlakci yarida birakir. Bu hafta **sadece** bu ozellige odaklan:

#### Ozellikler

1. **Excel/CSV import**
   - Emlakci paneline upload ekrani
   - Kolon eslestirme (baslik, fiyat, m2, oda, konum, ...)
   - Validation + hata raporu
   - Onay sonrasi toplu INSERT

2. **Sahibinden-uyumlu XML feed**
   - Emlakcilarin cogu zaten sahibinden icin XML hazirliyor
   - Ayni XML'i kabul et → emlakci tek tik ile 200 ilan yukler
   - Periyodik cekim opsiyonu (emlakci XML URL verir, sistem gunluk cektir)
   - **Bu kamanilan'in gercek rekabet silahi olabilir**

3. **Toplu fotograf upload**
   - ZIP upload → icindeki fotograflari ilan ile eslestirme (dosya adi = ilan kodu)
   - Cloudinary'e otomatik yukleme

#### Neden oncelikli?
- Bir emlakci anlasmasi = 50-200 ilan
- Bireysel kullanicidan 200 ilan icin 200 ayri kisi bulman gerekir
- Emlakci acisindan en yuksek sikayet: "sahibinden'den nasil tasinacagim"

---

### Hafta 3 — Launch kampanyasi + UX

#### Ana sayfa

- **Ucretsiz donem banner'i**: "Acilisa ozel 6 ay ucretsiz premium"
- **Bos kategori UX'i**: "Ilan bulunamadi" yerine → "Bu kategoride ilk ilanini sen yayinla, 3 ay ucretsiz one cikar"
- Ust menude "Emlakci misiniz? Ucretsiz baslayin" CTA

#### SEO temeli

- Her **kategori + sehir/ilce** kombinasyonu icin landing page
  - Ornek: `/kiralik-daire/kaman`, `/satilik-arsa/kayseri-kocasinan`
- Ilan yoksa bile sayfalar indexlensin (Google'a erken sinyal)
- Title + description pattern'i: `"{Sehir} {Kategori} Ilanlari | Kamanilan"`
- Her sayfaya semantik H1, internal link (komsu ilce, alt kategori)

#### Iletisim

- WhatsApp/Telegram grubu: emlakcilarla direkt iletisim
- Admin panelinde toplu duyuru araci

---

### Hafta 4 — Gelir modeli aktivasyonu

#### Subscription modulunu ac

- **Bireysel**: Ucretsiz (sinirli ilan sayisi, ornegin 3 aktif ilan)
- **Emlakci paketleri**:
  - Baslangic: aylik X TL, 50 aktif ilan
  - Profesyonel: aylik Y TL, 200 aktif ilan + vitrin
  - Kurumsal: aylik Z TL, sinirsiz + XML sync + API
- Ilk 3-6 ay %50 indirim veya ucretsiz donem (pazara girme fiyati)

#### Vitrin / one cikarma paketleri

- Banner modulu zaten var
- Ilan bazinda "one cikar" opsiyonu (7/30 gun paketler)
- Iyzipay entegrasyonu mevcut, sadece UI'da plan secim ekrani gerek

---

## Oncelik Sirasi (acil → sonra)

| Sira | Is | Etki | Sure |
|------|-----|------|------|
| 1 | **Toplu import** (Excel + Sahibinden XML) | Cok yuksek — 1 emlakci = 50-200 ilan | 3-5 gun |
| 2 | **Admin seed script** (30 ornek ilan) | Orta — siteyi bos gostermez | 1 gun |
| 3 | **Emlakci outreach metni** (WhatsApp + ziyaret script'i) | Yuksek — gercek ilan kaynagi | 0.5 gun |
| 4 | **Kategori + sehir landing page** | Yuksek uzun vadeli SEO | 2-3 gun |
| 5 | **Launch banner + ucretsiz donem UX** | Orta — conversion artirir | 1-2 gun |
| 6 | **Subscription aktif etme + Iyzipay UI** | Gelir icin | 2-3 gun |

---

## Net Basari Olcusu

### Hafta 1 sonu
- 30+ ilan yayinda
- 5+ emlakci iletisimde

### Ay 1 sonu
- 150+ ilan (en az 1 emlakci XML ile besliyor)
- Gunluk 50+ ziyaretci
- Ilk ucretli abonelik

### Ay 3 sonu
- 500+ ilan
- 10+ aktif emlakci hesabi
- Ayda 5000+ ziyaretci
- Aylik gelir: pazara bagli — hedef en az sunucu giderini karsilamasi

---

## Bir Sonraki Adim

Bu plandan **ilk baslanacak is**: toplu import (Excel + sahibinden-uyumlu XML).

Sebep: Altyapi hazir olmadan emlakci outreach'i yaparsan, emlakciyi "ilan tek tek gireceksin" diye kacirirsin. Once import'u yap, sonra emlakcilara "XML'inizi verin, saniyeler icinde yukleyelim" diyebil.
