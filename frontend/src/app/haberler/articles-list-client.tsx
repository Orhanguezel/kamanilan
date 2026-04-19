"use client";

import * as React from "react";
import { Loader2, RefreshCcw, ArrowRight } from "lucide-react";

import { useArticlesQuery } from "@/modules/articles/articles.service";
import { useThemeQuery } from "@/modules/theme/theme.service";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import type { ArticleCategory } from "@/modules/articles/articles.types";
import { ArticlesCarousel } from "@/components/articles/articles-carousel";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticlesSidebar, SidebarBannerCard } from "@/components/articles/articles-sidebar";

function FullWidthNewsBanner({ ids }: { ids?: string }) {
  const { data: banners = [], isPending } = useBannersByIdsQuery(ids, 3);
  if (isPending && ids) {
    return <div className="my-8 h-[200px] w-full animate-pulse bg-muted/20" />;
  }
  if (!ids || !banners.length) return null;
  const cols = banners.length === 1 ? "" : banners.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`my-12 grid grid-cols-1 gap-8 ${cols}`}>
      {banners.map((b) => <SidebarBannerCard key={b.id} banner={b} />)}
    </div>
  );
}

const CATEGORIES: { label: string; value: ArticleCategory | "" }[] = [
  { label: "Tümü",      value: "" },
  { label: "Gündem",    value: "gundem" },
  { label: "Spor",      value: "spor" },
  { label: "Ekonomi",   value: "ekonomi" },
  { label: "Teknoloji", value: "teknoloji" },
  { label: "Kültür",    value: "kultur" },
  { label: "Sağlık",    value: "saglik" },
  { label: "Dünya",     value: "dunya" },
  { label: "Yerel",     value: "yerel" },
];

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

export function ArticlesListClient() {
  const [category, setCategory] = React.useState<ArticleCategory | "">("");
  const { data: theme } = useThemeQuery();

  /* ── tema ayarları ── */
  const listSections = theme?.newsListSections ?? [];

  const carouselSection = listSections.find((s) => s.key === "carousel");
  const gridSection     = listSections.find((s) => s.key === "grid");
  const sidebarSection  = listSections.find((s) => s.key === "sidebar");

  const enabledList = [...listSections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const carouselEnabled = carouselSection?.enabled !== false;
  const gridEnabled     = gridSection?.enabled     !== false;

  const carouselCount = carouselSection?.count ?? 6;
  const gridCols      = gridSection?.cols      ?? 3;
  const sidebarCount  = sidebarSection?.count  ?? 8;
  const perPage       = Number(theme?.pages?.haberler?.perPage ?? "60");

  const sidebarSections = enabledList.filter(
    (s) => s.key === "sidebar" || s.key.startsWith("banner_sidebar_"),
  );
  const sidebarEnabled = sidebarSections.length > 0;

  const fullWidthSections = enabledList.filter((s) => s.key.startsWith("banner_full_"));
  const mainMinOrder = Math.min(
    carouselSection?.enabled ? (carouselSection.order ?? 99) : 99,
    gridSection?.enabled     ? (gridSection.order     ?? 99) : 99,
  );
  const fullWidthTop    = fullWidthSections.filter((s) => s.order < mainMinOrder);
  const fullWidthBottom = fullWidthSections.filter((s) => s.order >= mainMinOrder);

  /* ── veriler ── */
  const { data, isLoading, isError, refetch } = useArticlesQuery({
    limit: perPage,
    offset: 0,
    sort: "published_at",
    order: "desc",
    ...(category ? { category } : {}),
  });

  const { data: latest } = useArticlesQuery({
    limit: sidebarCount,
    sort: "published_at",
    order: "desc",
  });

  const articles        = data ?? [];
  const carouselArticles = carouselEnabled ? articles.slice(0, carouselCount) : [];
  const gridArticles     = gridEnabled     ? articles.slice(carouselEnabled ? carouselCount : 0) : [];

  const gridColsClass = GRID_COLS[Math.min(Math.max(gridCols, 1), 4)] ?? GRID_COLS[3];
  const showCarouselFirst = !mainBlocks.length || mainBlocks[0]?.key === "carousel";

  return (
    <div className="bg-paper min-h-screen">
      {/* ── Page Header (Clean & Newspaper style) ── */}
      <div className="bg-ink py-8 lg:py-12 border-b-4 border-saffron">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-saffron" />
                 <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-saffron/80 font-bold">KAMAN'IN SESİ</span>
              </div>
              <h1 className="font-fraunces text-3xl lg:text-5xl font-medium tracking-tight text-white leading-none">
                Haber <em>Dosyası</em>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void refetch()}
                className="h-10 px-6 rounded-full border border-white/10 hover:border-saffron text-[10px] font-mono font-bold uppercase tracking-widest text-parchment/60 hover:text-saffron transition-all inline-flex items-center gap-2"
              >
                <RefreshCcw className="size-3" /> YENİLE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        {/* Category tabs (Subtle & Clean) */}
        <div className="mb-12 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-5 py-2.5 border ${
                category === c.value
                  ? "bg-ink text-white border-ink shadow-lg"
                  : "text-ink border-black/5 hover:bg-black/5"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="size-10 animate-spin text-saffron" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center max-w-sm mx-auto">
            <p className="font-fraunces text-xl mb-6 opacity-60">Maalesef haberler yüklenirken bir sorun oluştu.</p>
            <button type="button" onClick={() => void refetch()} className="btn-editorial">
              <span>Tekrar Dene</span>
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-fraunces text-2xl opacity-30 italic">Bu kategoride yayında olan bir haber bulunamadı.</p>
          </div>
        ) : (
          <>
            {/* Tam genişlik bannerlar — üst */}
            {fullWidthTop.map((sec) => (
              <div key={sec.key} className="my-6">
                <FullWidthNewsBanner ids={sec.bannerIds} />
              </div>
            ))}

            <div className={`grid grid-cols-1 gap-12 lg:gap-20 ${sidebarEnabled ? "lg:grid-cols-4" : ""}`}>
              {/* Main content */}
              <div className={`space-y-16 ${sidebarEnabled ? "lg:col-span-3" : ""}`}>

                {/* Carousel */}
                {carouselEnabled && showCarouselFirst && carouselArticles.length > 0 && (
                  <ArticlesCarousel articles={carouselArticles} />
                )}

                {/* Grid */}
                {gridEnabled && gridArticles.length > 0 && (
                  <div>
                    <div className="mb-10 flex items-center gap-4">
                       <div className="h-px w-8 bg-saffron" />
                       <h2 className="font-fraunces text-3xl font-medium tracking-tight text-ink">Son Haberler</h2>
                       <div className="h-px flex-1 bg-black/5" />
                       <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">{articles.length} HABER</span>
                    </div>
                    
                    <div className={`grid gap-10 md:gap-16 ${gridColsClass}`}>
                      {gridArticles.map((a) => (
                        <ArticleCard key={a.id} article={a} variant="vertical" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Carousel after grid (if reordered) */}
                {carouselEnabled && !showCarouselFirst && carouselArticles.length > 0 && (
                  <ArticlesCarousel articles={carouselArticles} />
                )}
              </div>

              {/* Sidebar */}
              {sidebarEnabled && (
                <div className="lg:col-span-1">
                  <ArticlesSidebar latestArticles={latest ?? []} sidebarSections={sidebarSections} />
                </div>
              )}
            </div>

            {/* Tam genişlik bannerlar — alt */}
            {fullWidthBottom.map((sec) => (
              <div key={sec.key} className="my-6">
                <FullWidthNewsBanner ids={sec.bannerIds} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Main layout blocks — bos, tipli const (eski refactor izi)
type MainBlock = { key: string; bannerIds?: string[] };
const mainBlocks: MainBlock[] = [];
