"use client";

import Link from 'next/link';
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ContentPageClientProps {
  title: string;
  content: string | any[] | null;
  breadcrumbs: Breadcrumb[];
}

export function ContentPageClient({
  title,
  content,
  breadcrumbs,
}: ContentPageClientProps) {
  const htmlContent = typeof content === "string" ? content : null;

  return (
    <div className="bg-paper min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="bg-ink py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron opacity-5 skew-x-[-15deg] translate-x-12" />
        
        <div className="container relative z-10 text-center md:text-left">
          {/* Breadcrumb (Mono style) */}
          <nav className="mb-8 flex items-center justify-center md:justify-start gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-parchment opacity-40">
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

          <h1 className="font-fraunces text-4xl lg:text-7xl font-medium tracking-tight text-white leading-tight">
            {title.includes(" ") ? (
               <>
                 {title.split(' ')[0]} <em>{title.split(' ').slice(1).join(' ')}</em>
               </>
            ) : title}
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
            <div className="border border-dashed border-black/10 p-20 text-center bg-white/50">
              <div className="text-5xl mb-6 opacity-20">📂</div>
              <h2 className="font-fraunces text-2xl font-medium text-ink mb-4">Bu sayfa hazırlanıyor.</h2>
              <p className="text-walnut opacity-50 mb-10">İçerik yakında burada yayında olacak. Lütfen daha sonra tekrar kontrol edin.</p>
              <Link href={ROUTES.HOME} className="btn-editorial inline-flex">
                 <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          )}

          {/* Footer of article */}
          <div className="mt-24 pt-12 border-t border-black/5 flex items-center justify-between">
             <Link href={ROUTES.HOME} className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-ink hover:gap-4 transition-all">
               <ArrowLeft className="h-4 w-4" /> ANA SAYFAYA DÖN
             </Link>
             <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">© 2026 Kaman İlan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
