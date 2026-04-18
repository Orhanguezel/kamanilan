import type { Metadata } from "next";
import Link from "next/link";
import { Info, Target, ShieldCheck, Mail, FileText, ChevronRight, ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Kurumsal — Kaman İlan",
  description: "Kaman İlan hakkında kurumsal bilgiler, misyonumuz, vizyonumuz ve yasal metinler.",
  alternates: { canonical: "/kurumsal" },
};

const PAGES = [
  {
    title: "Hakkımızda",
    desc: "Kaman İlan'ın kuruluş hikayesi ve yerel pazar vizyonu.",
    href: ROUTES.ABOUT,
    icon: Info,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Misyon & Vizyon",
    desc: "Gelecek hedeflerimiz ve temel değerlerimiz.",
    href: ROUTES.MISSION_VISION,
    icon: Target,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Kalite Politikamız",
    desc: "Hizmet standartlarımız ve güvenilirlik ilkelerimiz.",
    href: ROUTES.QUALITY_POLICY,
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "İletişim",
    desc: "Bize ulaşabileceğiniz tüm kanallar ve ofis adresimiz.",
    href: ROUTES.CONTACT,
    icon: Mail,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Kullanım Koşulları",
    desc: "Platform kullanımına dair yasal bilgilendirme.",
    href: ROUTES.TERMS,
    icon: FileText,
    color: "bg-slate-50 text-slate-600"
  },
  {
    title: "Gizlilik Politikası",
    desc: "Veri güvenliği ve çerez kullanımı detayları.",
    href: ROUTES.PRIVACY,
    icon: ShieldCheck,
    color: "bg-rose-50 text-rose-600"
  }
];

export default function KurumsalPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--col-paper))]">
      {/* ── Hero ── */}
      <section className="bg-[hsl(var(--col-ink))] py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-[hsl(var(--col-saffron))] opacity-5 skew-x-[-20deg] translate-x-12" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <nav className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white opacity-40">
               <Link href="/" className="hover:text-[hsl(var(--col-saffron))] transition-colors">Ana Sayfa</Link>
               <span className="opacity-20">/</span>
               <span className="text-white">Sayfalar</span>
            </nav>
            <h1 className="font-fraunces text-5xl lg:text-8xl font-medium tracking-tight text-white mb-8 leading-none">
              Kurumsal <br /><em>Sayfalar</em>
            </h1>
            <p className="text-[hsl(var(--col-parchment))] opacity-50 text-lg leading-relaxed font-manrope">
              Kaman İlan platformuna dair tüm kurumsal bilgilere, yasal metinlere ve iletişim kanallarımıza bu sayfadan ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PAGES.map((page) => (
              <Link 
                key={page.href} 
                href={page.href}
                className="group p-10 rounded-[40px] bg-white border border-black/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl flex flex-col h-full"
              >
                <div className={`h-16 w-16 rounded-2xl ${page.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                   <page.icon className="h-7 w-7" />
                </div>
                <h3 className="font-fraunces text-2xl font-medium text-[hsl(var(--col-ink))] mb-4 group-hover:text-[hsl(var(--col-saffron-2))] transition-colors">
                  {page.title}
                </h3>
                <p className="text-sm text-[hsl(var(--col-walnut))] opacity-60 leading-relaxed font-manrope mb-10 flex-1">
                  {page.desc}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[hsl(var(--col-ink))] group-hover:gap-4 transition-all pt-6 border-t border-black/5">
                   SAYFAYI GÖRÜNTÜLE <ArrowRight className="h-3 w-3 -rotate-45" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Yardım CTA ── */}
      <section className="pb-32">
        <div className="container">
           <div className="relative rounded-[48px] bg-[hsl(var(--col-ivory))] p-10 md:p-24 text-center overflow-hidden border border-black/5 shadow-inner">
              <div className="relative z-10 max-w-2xl mx-auto">
                 <h2 className="font-fraunces text-3xl md:text-5xl font-medium text-[hsl(var(--col-ink))] mb-8">Yardıma mı ihtiyacınız var?</h2>
                 <p className="text-[hsl(var(--col-walnut))] opacity-70 mb-12 leading-relaxed">
                   Aradığınız bilgiyi bulamadıysanız veya bir sorunuz varsa destek ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href={ROUTES.CONTACT} className="btn-editorial bg-[hsl(var(--col-ink))] text-white px-12">
                       <span>İletişim Formu</span>
                    </Link>
                    <Link href="mailto:info@kamanilan.com" className="btn-editorial bg-transparent border-black/10 text-[hsl(var(--col-ink))] px-12">
                       <span>E-posta Gönder</span>
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </main>
  );
}
