"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useCategoriesQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";

export function SpotlightSection() {
  const { data: categories = [] } = useCategoriesQuery();
  const cevizCat = (categories as CategoryItem[]).find(c => c.slug.includes("ceviz"));

  return (
    <section className="py-12 md:py-16 bg-cream relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-[40%] h-full bg-ivory pointer-events-none hidden lg:block" />
       
       <div className="container relative z-10">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            
            {/* Left: Image & Captions */}
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[40px] overflow-hidden shadow-3xl">
               <Image 
                 src="/uploads/media/ceviz/kamancevizi24.png" 
                 alt="Kaman Cevizi Spotlight"
                 fill
                 className="object-cover transition-transform duration-1000 hover:scale-105"
               />
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-10 translate-y-0 opacity-100">
                  <div className="bg-saffron text-ink font-mono text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 shadow-xl">
                    Bölgesel Ürün · Coğrafi İşaret
                  </div>
                  <p className="text-white font-fraunces italic text-lg leading-relaxed opacity-90">
                    "Kaman'ın toprağı, dünyanın en iyi cevizini verir. Bu bir miras değil, toprağın bize fısıldadığı bir sırdır."
                  </p>
                  <div className="mt-4 text-wheat font-mono text-[9px] uppercase tracking-widest">— Yerel Üretici, 2026</div>
               </div>
            </div>

            {/* Right: Copy */}
            <div className="flex flex-col items-start">
               <div className="eyebrow mb-8">Kaman'ın Hazinesi</div>
               <h2 className="section-title mb-8">
                  <em>Kaman Cevizi,</em><br />doğrudan üreticiden.
               </h2>
               <p className="text-lg md:text-xl text-text-2 leading-relaxed mb-12 max-w-[540px]">
                  Türkiye'nin tescilli coğrafi işaretli ürünü Kaman Cevizi — bereketli toprakların, sabırlı ellerin ve nesiller boyu aktarılan bilginin ürünü. Aracısız, tazeliği bozulmadan.
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 w-full mb-16">
                  {[
                    { t: "Coğrafi İşaretli", d: "T.C. resmi tescilli bölgesel ürün." },
                    { t: "Üreticiden Doğrudan", d: "Aracısız, tarladan sofraya." },
                    { t: "Taze Sezon", d: "Ekim-Kasım hasadı, tazelik garantili." },
                    { t: "Güvenli Ödeme", d: "Kapıda ödeme ve banka transferi." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="h-5 w-5 rounded-full bg-saffron flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-yellow-500/20">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                       </div>
                       <div>
                          <h3 className="font-fraunces text-xl font-medium mb-1">{f.t}</h3>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{f.d}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <Link href={cevizCat ? ROUTES.CATEGORY(cevizCat.slug) : ROUTES.LISTINGS} className="btn-editorial px-10 py-5">
                  <span>
                    Ceviz İlanlarını Keşfet
                    <ArrowRight className="h-4 w-4" />
                  </span>
               </Link>
            </div>

         </div>
       </div>
    </section>
  );
}
