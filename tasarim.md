Siteyi inceledim. Kaman'a özel yerel bir ilan platformu — özellikle Kaman cevizi gibi bölgesel ürünlerin öne çıktığı bir yapı. Premium bir taslak hazırlamadan önce design skill'ini okuyayım ki en kaliteli çıktıyı üretebileyim.Harika, şimdi tasarım için net bir yön belirleyebilirim. Site Kaman'ın yerel kimliğine odaklı — özellikle Kaman cevizi gibi bölgesel ürünler öne çıkıyor. Klasik mavi-corporate "sahibinden" görünümü yerine **editorial/local-luxury** bir yön seçeceğim: Anatolia toprağından ilham alan sıcak palet (ceviz kabuğu, buğday, safran), dergi tarzı serif tipografi, asimetrik kompozisyon. Kaman'a özgü, premium ama samimi.Taslak hazır. İşte tasarım kararlarının özeti — frontend'e çevirirken bunları bilmen işini kolaylaştırır:

**Tasarım yönü: "Editorial local-luxury"**
Sahibinden.com / letgo gibi klasik mavi-corporate ilan siteleri yerine, Kaman'ın **yerel kimliğine** özel bir his verdim — dergi/editorial estetik, ceviz-buğday-toprak renk paleti, bölgesel "coğrafi işaret" vurgusu.

**Renk paleti** (`:root` içinde CSS variables)
- `--ink: #1a120b` ana metin/dark surface (sıcak siyah)
- `--saffron: #c9931a` birincil accent (safran sarısı)
- `--cream / --paper / --ivory` sıcak nötr arkaplanlar
- `--walnut, --hazel, --wheat` ceviz tonları
- `--olive, --moss` tarım temalı accent

**Tipografi**
- `Fraunces` — variable serif, başlıklarda italic + `SOFT` ekseni ile dergi hissi
- `Manrope` — body
- `JetBrains Mono` — eyebrow/meta etiketler, "uppercase + letter-spacing" tekniğiyle editorial hava

**Dikkat edilecek önemli özellikler**
1. **Hero** — asimetrik kart kolajı (`.hero-card-1/2/3`) + dönen "Kaman Cevizi" rozeti (`@keyframes spin`)
2. **Kategoriler** — featured (span 2) "Kaman Cevizi" kartı öne çıkıyor, hover'da dark tema + saffron icon
3. **Spotlight bölümü** — Kaman cevizi için dergi sayfası gibi hero, arkaplanda dev italic "CEVİZ · WALNUT" yazı tekrarı (`::before`)
4. **Listing card'lar** — `.listing-card` ve `.listing-card.large` varyantları; badges (featured, verified, urgent, new)
5. **Top strip** — dark navigasyonun üstünde Kırşehir/konum bilgisi
6. **Grain texture** — `body::before` üzerinde SVG noise overlay (editorial his için)

**Frontend'e çevirme ipuçları**
- Listing card'lar component'e bölmeye hazır (`ListingCard`, `ListingCardLarge`, `CategoryCard`)
- Badge sistemi ayrı bir prop olarak geçilebilir (`type: 'featured' | 'new' | 'verified' | 'urgent'`)
- CSS variables sayesinde dark mode eklenirse sadece `:root` değiştirilir
- Tüm SVG'ler inline — Lucide/Heroicons ile kolayca değiştirilir
- `.section-header` pattern'i tekrar eden bir layout — layout component'ine taşınabilir

Render edip görmek istersen HTML dosyasını tarayıcıda aç, ya da React/Next'e port'larken yardımcı olmamı istersen söyle.