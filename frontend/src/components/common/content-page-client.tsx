"use client";

import Link from 'next/link';
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";

import { PageHeader } from "@/components/layout/page-header";

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
  // Helper to extract html from various data formats returned by API
  const getHtml = (data: any): string | null => {
    if (!data) return null;
    if (typeof data === "string") {
      // If it looks like a JSON string from the editor/Strapi/etc.
      if (data.trim().startsWith("{") && data.trim().endsWith("}")) {
        try {
          const parsed = JSON.parse(data);
          return parsed.html || parsed.content || data;
        } catch {
          return data;
        }
      }
      return data;
    }
    if (typeof data === "object") {
      return data.html || data.content || JSON.stringify(data);
    }
    return null;
  };

  const htmlContent = getHtml(content);

  return (
    <div className="bg-paper min-h-screen">
      <PageHeader 
        title={title.includes(" ") ? (
          <>
            {title.split(' ')[0]} <em>{title.split(' ').slice(1).join(' ')}</em>
          </>
        ) : title}
        breadcrumbs={breadcrumbs}
      />

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
