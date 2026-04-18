import type { Metadata } from "next";
import Link from "next/link";
import { Store, Bell, ChevronRight, MessageCircle, ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { t } from "@/lib/t";

export const metadata: Metadata = {
  title: "Mağazalar — Kaman İlan",
  description:
    "Kaman İlan'da mağaza açma özelliği yakında aktif olacak. Mağazanızı açmak için şimdiden kayıt olun.",
  alternates: { canonical: "/magazalar" },
};

const FEATURES = [
  {
    emoji: "🏪",
    title: "Kendi Mağazanız",
    desc: "Tüm ürün ve ilanlarınızı tek bir profil altında toplayın. Müşterilerinize markanızı tanıtın.",
  },
  {
    emoji: "⭐",
    title: "Değerlendirme & Yorum",
    desc: "Alıcılar mağazanızı değerlendirebilecek. Güvenilirliğinizi artırın, daha fazla satış yapın.",
  },
  {
    emoji: "📊",
    title: "Mağaza İstatistikleri",
    desc: "Kaç kişi mağazanızı ziyaret etti, hangi ürünlere ilgi var? Veriye dayalı karar alın.",
  },
  {
    emoji: "🔔",
    title: "Müşteri Bildirimleri",
    desc: "Yeni ilanlarınızda takipçileriniz otomatik bilgilendirilsin.",
  },
];

export default function MagazalarPage() {
  return (
    <main className="min-h-screen bg-paper">

      {/* ── Hero ── */}
      <section className="bg-ink py-24 lg:py-40 relative overflow-hidden">
        {/* Editorial Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron opacity-[0.03] skew-x-[-12deg] translate-x-12" />
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            <div className="flex items-center gap-4 mb-10">
               <div className="h-px w-10 bg-saffron" />
               <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-saffron">PREMIUM İŞLETMELER</span>
               <div className="h-px w-10 bg-saffron" />
            </div>

            <h1 className="font-fraunces text-4xl md:text-7xl font-medium tracking-tight text-paper mb-10 leading-[0.95]">
              Kaman İlan&apos;da <br />
              <em className="text-saffron not-italic italic">Kendi Mağazanızı</em> Kurun.
            </h1>

            <p className="text-parchment opacity-60 text-lg md:text-xl leading-relaxed mb-16 max-w-2xl font-manrope">
              Esnaf ve işletmeler için hazırladığımız özel mağaza ekosistemi çok yakında yayına giriyor. Markanızı dijital dünyada Kaman&apos;ın en büyük pazar yerinde temsil edin.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href={ROUTES.CONTACT}
                className="btn-editorial bg-saffron text-ink border-none shadow-2xl"
              >
                <span>
                   Beni Bilgilendir
                   <Bell className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={ROUTES.LISTINGS}
                className="btn-editorial bg-transparent border-white/20 text-white hover:bg-white/5"
              >
                <span>
                   İlanlara Göz At
                   <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section className="py-32">
        <div className="container">
          <div className="section-header mb-16 text-center lg:text-center justify-center flex flex-col items-center">
             <div className="eyebrow">Ayrıcalıklar</div>
             <h2 className="section-title">Neden <em>Mağaza</em> Açmalısınız?</h2>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-10 rounded-[32px] bg-white border border-black/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl"
              >
                <div className="mb-8 text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]">{f.emoji}</div>
                <h3 className="font-fraunces text-2xl font-medium text-ink mb-4">
                  {f.title}
                </h3>
                <p className="text-sm text-walnut opacity-60 leading-relaxed font-manrope">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Şimdiden ilan ver CTA ── */}
      <section className="pb-32">
        <div className="container">
          <div className="relative rounded-[48px] bg-ivory p-10 md:p-20 text-center overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-0 left-0 w-full h-full font-fraunces text-[200px] text-ink opacity-[0.02] italic pointer-events-none select-none flex items-center justify-center">
              Mağaza
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
               <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-saffron-2 mb-6 italic">
                 SİZİ BEKLERKEN
               </p>
               <h2 className="font-fraunces text-3xl md:text-5xl font-medium text-ink mb-8 leading-tight">
                 Ücretsiz İlanınızı <br /><em>Hemen Bugün</em> Verin
               </h2>
               <p className="text-walnut opacity-70 mb-12 leading-relaxed">
                 Mağaza özelliği hazır olana kadar Kaman İlan&apos;da ücretsiz ilan vererek müşterilerinize ulaşmaya başlayabilirsiniz. İlk adımınızı şimdiden atın.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Link
                   href={ROUTES.POST_LISTING}
                   className="btn-editorial bg-ink text-white"
                 >
                   <span>
                      Ücretsiz İlan Ver
                      <ArrowRight className="h-4 w-4" />
                   </span>
                 </Link>
                 <Link
                   href={ROUTES.CONTACT}
                   className="ghost-link px-10 py-5"
                 >
                   {t("footer.contact_us")}
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
