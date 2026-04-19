"use client";

import Link from "next/link";
import {
  Megaphone,
  LayoutTemplate,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { t } from "@/lib/t";
import { useSiteSettingsQuery } from "@/modules/site/site.service";
import { ROUTES } from "@/config/routes";

/* ─── Reklam konumları ────────────────────────────────────────────── */

const AD_POSITIONS = [
  {
    key: "home_top",
    label: "Manşet Üstü",
    desc: "Ana sayfanın en üstünde, editoryal akışın hemen başında yer alan prestijli alan.",
    size: "1280x250px",
    visibility: "Maksimum",
    priceWeekly: 150,
    accent: "saffron",
  },
  {
    key: "listing_top",
    label: "İlan Listesi",
    desc: "Arama sonuçlarının en başında, doğrudan hedef kitleye ulaşan stratejik konum.",
    size: "970x250px",
    visibility: "Hedefli",
    priceWeekly: 120,
    accent: "olive",
  },
  {
    key: "home_middle",
    label: "Haber/İçerik Arası",
    desc: "İçerik akışı içinde doğal (native) bir görünüm sunan etkileşim odaklı alan.",
    size: "728x90px",
    visibility: "Yüksek",
    priceWeekly: 100,
    accent: "walnut",
  },
  {
    key: "home_bottom",
    label: "Alt Akış",
    desc: "Sayfa sonundaki kurumsal bölümler arasında konumlanan ekonomik seçenek.",
    size: "300x250px",
    visibility: "Standart",
    priceWeekly: 70,
    accent: "bark",
  },
];

/* ─── Adımlar ─────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    title: "Konum Seçimi",
    desc: "İşletmenizin hedeflerine en uygun reklam alanını ve yayın süresini belirleyin.",
  },
  {
    num: "02",
    title: "Hızlı İletişim",
    desc: "WhatsApp veya telefon üzerinden ekibimizle detayları ve özel fiyatları netleştirin.",
  },
  {
    num: "03",
    title: "Tasarım Gönderimi",
    desc: "Reklam materyallerinizi (görsel, link, başlık) dijital ortamda bize iletin.",
  },
  {
    num: "04",
    title: "Aynı Gün Yayım",
    desc: "Onay ve ödeme sonrasında reklamınız 24 saat içerisinde sistemde aktifleşir.",
  },
];

export default function ReklamVerPage() {
  const { data: site } = useSiteSettingsQuery([
    "contact_whatsapp_link",
    "stats_active_ads",
    "stats_monthly_visit",
    "stats_satisfaction",
    "stats_support_hours",
  ]);

  const whatsappLink = site?.contact_whatsapp_link as string | undefined;

  // Stats from DB with realistic logical fallbacks
  const stats = [
    { val: (site?.stats_active_ads as string) || "1.250+", label: "AKTİF İLAN" },
    { val: (site?.stats_monthly_visit as string) || "45.000+", label: "AYLIK ZİYARET" },
    { val: (site?.stats_satisfaction as string) || "%98", label: "MEMNUNİYET" },
    { val: (site?.stats_support_hours as string) || "7/24", label: "DESTEK" },
  ];

  return (
    <main className="bg-cream min-h-screen">
      
      {/* ── 1. Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 border-b border-line overflow-hidden">
        {/* Dekoratif Blob */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-saffron/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative z-10">
          <nav className="mb-10 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-3">
             <Link href={ROUTES.HOME} className="hover:text-saffron transition-colors">Ana Sayfa</Link>
             <ChevronRight className="h-3 w-3 opacity-30" />
             <span className="text-ink">Reklam Ver</span>
          </nav>

          <div className="max-w-4xl">
             <div className="eyebrow mb-6">İşletmenizi Tanıtın</div>
             <h1 className="font-fraunces text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.95] text-ink mb-8">
               Kaman İlan'da <br />
               <em className="italic font-normal text-saffron-2">Yerinizi Alın</em>
             </h1>
             <p className="text-lg md:text-xl text-text-2 leading-relaxed max-w-2xl font-manrope">
                Kırşehir ve Kaman bölgesinin en aktif ilan platformunda binlerce yerel ziyaretçiye ulaşın. 
                İşletmenizin görünürlüğünü artırmak için size özel reklam çözümlerini keşfedin.
             </p>
          </div>

          {/* İstatistikler */}
          <div className="mt-16 pt-12 border-t border-line grid grid-cols-2 lg:grid-cols-4 gap-12">
             {stats.map((s, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                   <div className="font-fraunces text-4xl text-ink font-light italic">{s.val}</div>
                   <div className="font-mono text-[10px] uppercase tracking-widest text-text-3">{s.label}</div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── 2. Konumlar ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="section-header">
             <div>
                <div className="eyebrow mb-4">Ad Positions</div>
                <h2 className="section-title">Reklam <em>Konumları</em></h2>
             </div>
             <p className="md:max-w-xs text-sm text-text-3 font-manrope">
                Stratejinize göre tercih edebileceğiniz farklı boyut ve etkileşim oranına sahip alanlar.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {AD_POSITIONS.map((pos) => (
                <div key={pos.key} className="premium-card group flex flex-col p-8 bg-paper">
                   <div className="mb-8 flex items-center justify-between">
                      <div className="p-3 bg-cream rounded-2xl border border-line-2 group-hover:scale-110 transition-transform duration-500">
                         <LayoutTemplate className="h-6 w-6 text-walnut" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 bg-ink text-cream rounded-full">
                         {pos.visibility}
                      </span>
                   </div>

                   <h3 className="font-fraunces text-2xl text-ink mb-3">{pos.label}</h3>
                   <p className="text-sm text-text-2 leading-relaxed mb-6 flex-grow font-manrope">
                      {pos.desc}
                   </p>

                   <div className="mt-auto space-y-4 pt-6 border-t border-line">
                      <div className="flex justify-between items-center text-[10px] font-mono text-text-3 uppercase tracking-wider">
                         <span>Boyut</span>
                         <span className="text-ink font-bold">{pos.size}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <div className="text-[10px] font-mono uppercase text-text-3 mb-1">Haftalık</div>
                         <div className="text-3xl font-fraunces text-saffron-2">₺{pos.priceWeekly}</div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-3">
                * Fiyatlar kampanya dönemlerine göre değişiklik gösterebilir.
             </p>
          </div>
        </div>
      </section>

      {/* ── 3. Nasıl Çalışır ───────────────────────────────────────── */}
      <section className="py-24 bg-paper border-y border-line">
        <div className="container">
          <div className="text-center mb-16">
             <div className="eyebrow mb-6">Workflow</div>
             <h2 className="section-title">Reklam <em>Süreci</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
             {STEPS.map((step, idx) => (
                <div key={idx} className="relative text-center md:text-left">
                   <div className="font-fraunces text-7xl text-saffron/10 absolute -top-8 left-0 select-none">
                      {step.num}
                   </div>
                   <div className="relative pt-6">
                      <h3 className="font-fraunces text-xl text-ink mb-3">{step.title}</h3>
                      <p className="text-sm text-text-2 leading-relaxed font-manrope">
                         {step.desc}
                      </p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── 4. Gereksinimler & CTA ──────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             
             {/* Sol: Teknik Bilgi */}
             <div>
                <div className="eyebrow mb-6">Specifications</div>
                <h2 className="font-fraunces text-4xl text-ink mb-8 leading-tight">
                  Reklam Materyali <br /><em>Gereksinimleri</em>
                </h2>
                <div className="space-y-6">
                   {[
                     "Başlık ve kısa açıklama metinleri",
                     "Yüksek çözünürlüklü .PNG / .JPG görsel",
                     "Yönlendirilecek web adresi (veya telefon)",
                     "Hedeflenen yayın başlangıç tarihi"
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-4 group">
                        <div className="h-2 w-2 rounded-full bg-saffron group-hover:scale-150 transition-transform duration-300" />
                        <span className="text-text-2 font-manrope">{item}</span>
                     </div>
                   ))}
                </div>
                
                <div className="mt-10 p-6 bg-parchment/30 border border-saffron/10 rounded-2xl flex items-start gap-4">
                   <Zap className="h-5 w-5 text-saffron mt-1 flex-shrink-0" />
                   <p className="text-xs text-text-3 font-manrope leading-relaxed italic">
                      <b>Hızlı Yayın Avantajı:</b> Tüm materyaller hazır olduğunda reklamınız ödeme onayı sonrası 24 saat içinde yayına girer.
                   </p>
                </div>
             </div>

             {/* Sağ: CTA Box */}
             <div className="relative">
                <div className="absolute inset-0 bg-ink rounded-[40px] rotate-2 scale-105 opacity-5" />
                <div className="relative bg-ink text-cream p-12 md:p-16 rounded-[40px] shadow-editorial-3 overflow-hidden">
                   {/* Arka plan süsü */}
                   <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
                   
                   <Megaphone className="h-12 w-12 text-saffron mb-8" />
                   <h2 className="font-fraunces text-4xl md:text-5xl mb-6 tracking-tight">Hemen <br /><em>Başlayalım</em></h2>
                   <p className="text-parchment/60 font-manrope mb-10 leading-relaxed max-w-sm">
                      Kaman'da görünürlüğünüzü artırmak ve size özel teklif almak için bizimle iletişime geçin.
                   </p>

                   <div className="flex flex-col gap-4">
                      {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-editorial bg-saffron text-ink">
                           <span>
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp&apos;tan Yazın
                           </span>
                        </a>
                      )}

                      <Link href={ROUTES.CONTACT} className="btn-editorial bg-transparent border border-cream/20 hover:bg-cream">
                         <span>
                            <MessageCircle className="h-4 w-4" />
                            Mesaj Gönder
                         </span>
                      </Link>

                      {!whatsappLink && (
                        <Link href={ROUTES.CONTACT} className="btn-editorial bg-saffron text-ink">
                           <span>
                              İletişime Geçin <ArrowRight className="h-4 w-4" />
                           </span>
                        </Link>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

    </main>
  );
}
