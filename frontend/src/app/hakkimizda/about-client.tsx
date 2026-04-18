"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface CustomPageClientProps {
  title: string;
  htmlContent: string | null;
  imageUrl?: string | null;
  breadcrumbs: Breadcrumb[];
}

export function CustomPageClient({ title, htmlContent, imageUrl, breadcrumbs }: CustomPageClientProps) {
  return (
    <div className="min-h-screen bg-paper">
      {/* ── Editorial Hero ── */}
      <div className={`relative overflow-hidden ${imageUrl ? 'h-[60vh] md:h-[70vh] min-h-[500px]' : 'bg-ink py-24 lg:py-32'}`}>
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt={title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          </>
        ) : (
          <div className="absolute top-0 right-0 w-1/4 h-full bg-saffron opacity-5 skew-x-[-20deg] translate-x-12" />
        )}
        
        <div className="container relative h-full flex flex-col justify-end pb-12 lg:pb-24">
          <nav className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white opacity-40">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="opacity-20">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-saffron transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <h1 className="font-fraunces text-4xl lg:text-8xl font-medium tracking-tight text-white leading-[0.9] max-w-4xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="container py-20 lg:py-32">
        <div className="max-w-4xl mx-auto">
          {htmlContent ? (
            <div
              className="editorial-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="rounded-[40px] border border-dashed border-black/10 p-20 text-center bg-white/50">
              <div className="text-5xl mb-6 opacity-20">📄</div>
              <h2 className="font-fraunces text-2xl font-medium text-ink mb-4">Bu sayfa henüz hazır değil.</h2>
              <p className="text-walnut opacity-50 mb-10">Kaman İlan ekibi bu bölümü sizin için hazırlıyor.</p>
              <Link href={ROUTES.HOME} className="btn-editorial inline-flex">
                 <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          )}

          <div className="mt-24 pt-12 border-t border-black/5 flex items-center justify-between">
             <Link href={ROUTES.HOME} className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-ink hover:gap-4 transition-all">
               <ArrowLeft className="h-4 w-4" /> ANA SAYFAYA DÖN
             </Link>
             <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">HASAT ZAMANI 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
