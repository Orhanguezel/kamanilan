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

import { PageHeader } from "@/components/layout/page-header";

export function AnnouncementsClient() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  
  const breadcrumbs = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Duyurular" }
  ];

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
      <PageHeader 
        title={<>Güncel Duyuru ve <em>Gelişmeler</em></>}
        label="KAMAN İLAN DUYURULAR"
        description="Platformdaki yeni özellikler, bölgesel düzenlemeler ve hasat dönemi güncellemelerine dair kurumsal bildirim merkezi."
        breadcrumbs={breadcrumbs}
      />

      <div className="container py-12 lg:py-20">
        {/* Kategori filtresi - Editorial Style */}
        <div className="flex flex-wrap gap-2 mb-20 items-center justify-center border-b border-ink/5 pb-10">
          <button
            onClick={() => handleCategory("")}
            className={`px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
              activeCategory === ""
                ? "bg-ink text-saffron shadow-xl"
                : "text-ink opacity-40 hover:opacity-100"
            }`}
          >
            TÜMÜ
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "bg-ink text-saffron shadow-xl"
                  : "text-ink opacity-40 hover:opacity-100"
              }`}
            >
              {CATEGORY_LABELS[cat as AnnouncementCategory]}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-6">
                 <div className="aspect-[16/10] bg-muted/20" />
                 <div className="h-4 w-1/4 bg-muted/20" />
                 <div className="h-8 w-3/4 bg-muted/20" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-ink/5">
            <Megaphone className="h-16 w-16 mx-auto mb-8 opacity-10 text-ink" />
            <p className="font-fraunces text-2xl text-ink opacity-30 italic">Henüz bu kategoride duyuru bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">
            {items.map((item) => (
              <Link
                key={item.id}
                href={ROUTES.ANNOUNCEMENT_DETAIL(item.slug)}
                className="group flex flex-col h-full transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden mb-8 bg-ink border border-border">
                  {item.cover_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.cover_image_url}
                      alt={item.alt ?? item.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-ink">
                       <Megaphone className="h-16 w-16 text-white/5" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-saffron text-ink font-mono text-[9px] font-bold uppercase tracking-widest px-5 py-2">
                      {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-5 font-mono text-[10px] uppercase tracking-widest opacity-40">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.published_at ?? item.created_at)}
                    {item.is_featured && <span className="text-saffron-2 font-bold">· ÖNE ÇIKAN</span>}
                  </div>

                  <h2 className="font-fraunces text-2xl lg:text-3xl font-medium leading-[1.1] text-ink mb-6 group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </h2>

                  {item.excerpt && (
                    <p className="text-sm text-walnut opacity-60 leading-relaxed line-clamp-2 mb-8 font-manrope">
                      {item.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-8 border-t border-black/5 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-ink group-hover:gap-4 transition-all">
                    DOKÜMANI İNCELE <ArrowRight className="h-3 w-3 -rotate-45" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-8 mt-32 pt-16 border-t border-black/5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-widest bg-white border border-black/5 text-ink disabled:opacity-20 transition-all hover:bg-ink hover:text-white"
            >
              <span>GERİ</span>
            </button>
            <div className="flex flex-col items-center">
               <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-20 leading-none mb-1">ARŞİV</span>
               <span className="font-fraunces text-lg font-medium">{page} / {totalPages}</span>
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-widest bg-ink text-white disabled:opacity-20 transition-all hover:bg-saffron hover:text-ink"
            >
              <span>İLERİ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
