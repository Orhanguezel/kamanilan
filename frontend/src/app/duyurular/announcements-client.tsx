"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Megaphone, ArrowRight } from "lucide-react";
import { useAnnouncementsQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  type AnnouncementCategory,
} from "@/modules/announcement/announcement.type";
import { ROUTES } from "@/config/routes";

const ALL_CATEGORIES = ["duyuru", "haber", "kampanya", "etkinlik", "guncelleme"] as const;

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AnnouncementsClient() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isPending } = useAnnouncementsQuery({
    page,
    limit: 12,
    category: activeCategory || undefined,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Hero ── */}
      <div className="bg-ink py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-saffron opacity-5 skew-x-[-20deg] translate-x-12" />
        
        <div className="container relative z-10">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="h-5 w-5 text-saffron" />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-saffron">Günde/M</span>
            </div>
            
            <h1 className="font-fraunces text-4xl lg:text-7xl font-medium tracking-tight text-white mb-6">
              Platform <em>Duyuruları</em>
            </h1>
            
            <p className="text-parchment opacity-50 text-sm md:text-base max-w-xl leading-relaxed">
              Kaman İlan platformuna dair güncellemeler, yeni özellikler, özel hasat kampanyaları ve bölgesel önemli haberlerin merkezi.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-3 mb-16 items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 mr-4">Filtrele:</span>
          <button
            onClick={() => handleCategory("")}
            className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              activeCategory === ""
                ? "bg-ink text-white shadow-xl"
                : "bg-white text-ink border border-black/5 hover:border-black/20"
            }`}
          >
            Tümü
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "bg-ink text-white shadow-xl"
                  : "bg-white text-ink border border-black/5 hover:border-black/20"
              }`}
            >
              {CATEGORY_LABELS[cat as AnnouncementCategory]}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse aspect-video rounded-[32px] bg-muted/20" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32">
            <Megaphone className="h-16 w-16 mx-auto mb-6 opacity-10 text-ink" />
            <p className="font-fraunces text-2xl text-ink opacity-30 italic">Henüz bu kategoride duyuru bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
            {items.map((item) => (
              <Link
                key={item.id}
                href={ROUTES.ANNOUNCEMENT_DETAIL(item.slug)}
                className="group flex flex-col h-full transition-all duration-500 hover:-translate-y-2"
              >
                {item.cover_image_url ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[40px] mb-8 bg-muted shadow-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.cover_image_url}
                      alt={item.alt ?? item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                       <span className="bg-saffron text-ink font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">
                          {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
                       </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[40px] mb-8 bg-paper flex items-center justify-center border border-dashed border-black/10 group-hover:border-saffron transition-colors">
                     <Megaphone className="h-12 w-12 opacity-10 text-ink" />
                  </div>
                )}

                <div className="flex flex-col flex-1 px-2">
                  <div className="flex items-center gap-3 mb-4 font-mono text-[10px] uppercase tracking-widest opacity-40">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.published_at ?? item.created_at)}
                    {item.is_featured && (
                      <span className="text-saffron-2">· ÖNE ÇIKAN</span>
                    )}
                  </div>

                  <h2 className="font-fraunces text-2xl font-medium leading-[1.2] text-ink mb-4 group-hover:text-saffron-2 transition-colors">
                    {item.title}
                  </h2>

                  {item.excerpt && (
                    <p className="text-sm text-walnut opacity-60 leading-relaxed line-clamp-2 mb-6 font-manrope">
                      {item.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-6 border-t border-black/5 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-ink group-hover:gap-4 transition-all">
                    DEVAMINI OKU <ArrowRight className="h-3 w-3 -rotate-45" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-24 pt-12 border-t border-black/5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-editorial bg-white border border-border text-ink disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>Geri</span>
            </button>
            <span className="font-mono text-xs uppercase tracking-widest opacity-50">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-editorial"
            >
              <span>İleri</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
