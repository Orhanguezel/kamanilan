"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Zap, Search } from "lucide-react";
import type { SectionConfig } from "@/modules/theme/theme.type";
import { useSlidersQuery } from "@/modules/site/site.service";
import type { SliderItem } from "@/modules/site/site.type";
import { ROUTES } from "@/config/routes";

interface Props {
  config?: SectionConfig;
}

export function HeroSection({ config }: Props) {
  const { data: slides = [], isPending } = useSlidersQuery();
  const items = slides as SliderItem[];

  if (isPending) {
    return (
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="h-[500px] animate-pulse rounded-[32px] bg-parchment/50" />
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const mainSlide = items[0];

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-cream to-ivory py-20 lg:py-32 border-b border-border"
      style={{ contain: "layout paint" }}
    >
      {/* Dekoratif gradient blob'lar — contain: strict ile CLS'ye katki sifir */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[200px] -top-[200px] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,147,26,0.14),transparent_60%)]"
        style={{ contain: "strict", willChange: "transform" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[100px] -bottom-[150px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(95,109,54,0.08),transparent_60%)]"
        style={{ contain: "strict", willChange: "transform" }}
      />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1.2fr_1fr] items-center">
          
          {/* Sol: Copy / Editorial Content */}
          <div className="flex flex-col items-start max-w-[680px]">
            <div className="eyebrow mb-8">
              {mainSlide.badgeText || "Regional Hub · 2026"}
            </div>
            
            <h1 className="font-fraunces text-[clamp(44px,7vw,84px)] leading-[1.05] tracking-tight text-ink">
              {mainSlide.title.split(' ').map((word, i) => {
                const cleanWord = word.replace(/[:.,]/g, '');
                const isHighlighted = ["Kaman", "Cevizi", "Hasat", "Hasadı"].some(h => cleanWord.includes(h));
                
                return (
                  <span key={i}>
                    {isHighlighted ? (
                      <em className="inline-block relative not-italic font-medium text-saffron-2">
                        {word}
                        <span className="absolute bottom-[0.05em] left-0 right-0 h-[6px] bg-saffron/20 -z-10" />
                      </em>
                    ) : word}{" "}
                  </span>
                )
              })}
            </h1>

            <p className="mt-8 text-lg md:text-xl leading-relaxed text-text-2 max-w-[540px]">
              {mainSlide.description || "Kaman'ın bereketli topraklarından sofranıza gelen en taze ve kaliteli ürünler."}
            </p>

            {/* Premium Search Bar */}
            <form action={ROUTES.LISTINGS} className="mt-12 w-full max-w-[620px] transition-all duration-300">
               <div className="group relative flex items-center bg-paper rounded-full border border-border p-2 shadow-xl focus-within:border-saffron focus-within:shadow-2xl">
                 <div className="hidden md:flex items-center border-r border-border px-5 py-2">
                    <select aria-label="Kategori filtresi" name="kategori" className="bg-transparent text-[13px] font-bold outline-none cursor-pointer text-walnut uppercase tracking-wider">
                      <option value="">Tüm İlanlar</option>
                      <option value="ceviz">Ceviz</option>
                      <option value="emlak">Emlak</option>
                    </select>
                 </div>
                 <input 
                   name="q"
                   placeholder="Kaman'da ne arıyorsunuz?" 
                   className="flex-1 bg-transparent px-6 py-3 text-sm font-medium outline-none"
                 />
                 <button type="submit" aria-label="Ara" className="h-12 w-12 flex items-center justify-center rounded-full bg-ink text-saffron transition-all hover:rotate-[-15deg] hover:bg-saffron hover:text-ink">
                    <Search className="h-5 w-5" aria-hidden="true" />
                 </button>
               </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-2.5 items-center">
               <span className="font-mono text-[10px] uppercase tracking-widest text-text-3 mr-2">Trendler:</span>
               {["Satılık Arazi", "Yeni Mahsul", "Traktör"].map(tag => (
                 <Link key={tag} href={`${ROUTES.LISTINGS}?q=${tag}`} className="px-4 py-1.5 rounded-full border border-border text-[12px] font-bold text-walnut hover:bg-ink hover:text-saffron transition-all">
                   {tag}
                 </Link>
               ))}
            </div>
          </div>

          {/* Sağ: Editorial Visual Collage */}
          <div className="relative h-[480px] md:h-[600px] w-full">
            {/* Main Center Image */}
            <div className="absolute left-0 top-10 z-20 w-[65%] h-[75%] rounded-[32px] overflow-hidden shadow-2xl rotate-[-3deg] transition-all hover:rotate-0 hover:scale-[1.03]">
               <Image
                 src={items[0]?.image || "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb"}
                 alt="Kaman 1" fill sizes="(max-width: 1024px) 65vw, 40vw" className="object-cover" priority fetchPriority="high"
               />
            </div>
            {/* Secondary Floating Image */}
            <div className="absolute right-0 top-32 z-10 w-[55%] h-[55%] rounded-[24px] overflow-hidden shadow-2xl rotate-[5deg] transition-all hover:rotate-0 hover:scale-[1.03]">
               <Image
                 src={mainSlide?.image2 || items[1]?.image || "https://images.unsplash.com/photo-1570129477492-45c003edd2be"}
                 alt="Kaman 2" fill sizes="(max-width: 1024px) 55vw, 33vw" className="object-cover"
               />
            </div>
            {/* Stats Card Overlay */}
            <div className="absolute bottom-5 left-[25%] z-30 w-[55%] h-[180px] rounded-[24px] bg-ink p-8 flex flex-col items-center justify-center text-center shadow-3xl rotate-[-2deg] transition-all hover:rotate-0 hover:scale-105">
               <span className="font-fraunces text-6xl font-light italic text-saffron leading-none">2026</span>
               <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-wheat">Tescilli Mahsul Zamanı</span>
            </div>
            {/* Rotating Badge */}
            <div className="absolute top-0 right-[8%] z-40 h-28 w-28 md:h-32 md:w-32 animate-[spin_20s_linear_infinite] rounded-full bg-saffron shadow-2xl flex items-center justify-center p-5 text-center font-mono text-[9px] md:text-[10px] uppercase font-bold leading-tight tracking-wider text-ink">
               Kaman Cevizi · %100 Orijinal · Coğrafi İşaret · 2026
            </div>
          </div>
        </div>

        {/* Hero Stats Ribbon */}
        <div className="mt-20 lg:mt-32 pt-12 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-12">
           {[
             { num: "LXX", unit: "+", label: "Aktif İlan" },
             { num: "MD", unit: "k", label: "Aylık Ziyaret" },
             { num: "IX", unit: "/X", label: "Memnuniyet" },
             { num: "XXIV", unit: "h", label: "Destek" }
           ].map((s, idx) => (
             <div key={idx} className="flex flex-col items-start gap-3">
               <div className="font-fraunces text-4xl lg:text-5xl text-ink tracking-tight">
                 {s.num}<sup className="text-xl italic text-saffron-2 ml-1">{s.unit}</sup>
               </div>
               <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{s.label}</div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
