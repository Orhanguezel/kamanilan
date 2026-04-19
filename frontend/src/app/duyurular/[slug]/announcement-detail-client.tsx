"use client";

import Link from "next/link";
import { Calendar, Tag, User, ChevronRight, ArrowLeft, Megaphone, Rss } from "lucide-react";
import { useAnnouncementBySlugQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type AnnouncementCategory,
} from "@/modules/announcement/announcement.type";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  slug: string;
}

export function AnnouncementDetailClient({ slug }: Props) {
  const { data: item, isPending, isError } = useAnnouncementBySlugQuery(slug);

  if (isPending) {
    return (
      <div className="min-h-screen bg-paper animate-pulse">
        <div className="h-[40vh] bg-ink/10" />
        <div className="container py-20 lg:py-32">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="h-20 bg-muted/20 w-3/4" />
            <div className="h-[400px] bg-muted/10 w-full" />
            <div className="space-y-4">
              <div className="h-4 bg-muted/20 w-full" />
              <div className="h-4 bg-muted/20 w-5/6" />
              <div className="h-4 bg-muted/20 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-8xl mb-8 opacity-10">📄</div>
        <p className="font-fraunces text-2xl text-ink mb-12 opacity-40">Aradığınız duyuru arşivde bulunamadı.</p>
        <Link
          href={ROUTES.ANNOUNCEMENTS}
          className="btn-editorial"
        >
          <span><ArrowLeft className="h-4 w-4" /> DUYURULARA DÖN</span>
        </Link>
      </div>
    );
  }

  const rssUrl = `${getApiBaseUrl()}${API_ENDPOINTS.ANNOUNCEMENTS_RSS}`;

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Editorial Header ── */}
      <div className="bg-ink relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
         {/* Decorative News Stripes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron opacity-5 skew-x-[-15deg] translate-x-24" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-white opacity-5 skew-x-[-15deg] translate-x-32" />
        
        <div className="container relative z-10">
          <nav className="mb-10 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white opacity-40">
            <Link href={ROUTES.HOME} className="hover:text-saffron transition-colors">ANA SAYFA</Link>
            <span className="opacity-20">/</span>
            <Link href={ROUTES.ANNOUNCEMENTS} className="hover:text-saffron transition-colors">DUYURULAR</Link>
            <span className="opacity-20">/</span>
            <span className="text-white tracking-widest truncate max-w-[200px] md:max-w-md">{item.title}</span>
          </nav>

          <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center justify-center w-12 h-12 border border-white/10 bg-white/5">
                  <Megaphone className="h-5 w-5 text-saffron" />
               </div>
               <div className="h-px w-20 bg-saffron" />
               <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                 {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
               </span>
            </div>

            <h1 className="font-fraunces text-4xl lg:text-7xl font-medium tracking-tight text-white mb-12 leading-[1] lg:leading-[0.95]">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-parchment/40">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(item.published_at ?? item.created_at)}
              </div>
              {item.author && (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  {item.author}
                </div>
              )}
              {item.is_featured && (
                <div className="flex items-center gap-2 text-saffron">
                  <div className="h-1.5 w-1.5 rounded-full bg-saffron" />
                  ÖNE ÇIKAN BİLDİRİM
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-20 lg:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Cover image */}
          {item.cover_image_url && (
            <div className="mb-16 lg:mb-24 shadow-3xl overflow-hidden border border-border bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.cover_image_url}
                alt={item.alt ?? item.title}
                className="w-full max-h-[600px] object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-16">
             <div
               className="editorial-content"
               dangerouslySetInnerHTML={{ __html: item.content ?? "<p>İçerik bulunamadı.</p>" }}
             />

             {/* Footer Actions */}
             <div className="pt-16 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-10">
                <Link
                  href={ROUTES.ANNOUNCEMENTS}
                  className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest text-ink hover:gap-6 transition-all group"
                >
                  <ArrowLeft className="h-4 w-4" /> ARŞİVE GERİ DÖN
                </Link>

                <div className="flex items-center gap-8">
                   <a
                    href={rssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-walnut opacity-40 hover:opacity-100 transition-all"
                  >
                    <Rss className="h-3.5 w-3.5" /> RSS TAKİP
                  </a>
                  <div className="h-1 w-1 rounded-full bg-saffron" />
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">PLATFORM BİLDİRİMİ</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
