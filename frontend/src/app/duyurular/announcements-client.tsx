"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Tag, ChevronRight, Megaphone } from "lucide-react";
import { useAnnouncementsQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="py-12"
        style={{ backgroundColor: "hsl(var(--primary))" }}
      >
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-7 w-7 text-white/80" />
            <h1 className="text-3xl font-bold text-white">Duyurular</h1>
          </div>
          <p className="text-white/70 text-sm">
            Platform haberleri, kampanyalar ve güncellemeler
          </p>
          {/* Breadcrumb */}
          <nav className="mt-4 flex items-center gap-1.5 text-xs text-white/60">
            <Link href={ROUTES.HOME} className="hover:text-white/90 transition-colors">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Duyurular</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategory("")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
              activeCategory === ""
                ? "border-transparent text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"
            }`}
            style={activeCategory === "" ? { backgroundColor: "hsl(var(--primary))" } : {}}
          >
            Tümü
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? "border-transparent text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"
              }`}
              style={activeCategory === cat ? { backgroundColor: "hsl(var(--primary))" } : {}}
            >
              {CATEGORY_LABELS[cat as AnnouncementCategory]}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white h-52 shadow-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Henüz duyuru yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={ROUTES.ANNOUNCEMENT_DETAIL(item.slug)}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                {item.cover_image_url && (
                  <div className="h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.cover_image_url}
                      alt={item.alt ?? item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[item.category as AnnouncementCategory] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Tag className="h-3 w-3" />
                      {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
                    </span>
                    {item.is_featured && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
                        Öne Çıkan
                      </span>
                    )}
                  </div>

                  <h2 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {item.title}
                  </h2>

                  {item.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                    <span className="flex items-center gap-0.5 font-medium text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                      Devamını Oku <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Önceki
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
