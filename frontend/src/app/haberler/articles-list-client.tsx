"use client";

import * as React from "react";
import { Loader2, RefreshCcw } from "lucide-react";

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
    return <div className="my-4 h-[120px] w-full animate-pulse rounded-lg bg-muted" />;
  }
  if (!ids || !banners.length) return null;
  const cols = banners.length === 1 ? "" : banners.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`my-4 grid grid-cols-1 gap-3 ${cols}`}>
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
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function ArticlesListClient() {
  const [category, setCategory] = React.useState<ArticleCategory | "">("");
  const { data: theme } = useThemeQuery();

  /* ── tema ayarları ── */
  const listSections = theme?.newsListSections ?? [];

  const carouselSection = listSections.find((s) => s.key === "carousel");
  const gridSection     = listSections.find((s) => s.key === "grid");
  const sidebarSection  = listSections.find((s) => s.key === "sidebar");

  // Sıralı, aktif bloklar
  const enabledList = [...listSections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const carouselEnabled = carouselSection?.enabled !== false;
  const gridEnabled     = gridSection?.enabled     !== false;

  const carouselCount = carouselSection?.count ?? 6;
  const gridCols      = gridSection?.cols      ?? 3;
  const sidebarCount  = sidebarSection?.count  ?? 8;
  const perPage       = Number(theme?.pages?.haberler?.perPage ?? "60");

  // Sidebar bölümleri: "sidebar" + banner_sidebar_* (banner_full_* hariç)
  const sidebarSections = enabledList.filter(
    (s) => s.key === "sidebar" || s.key.startsWith("banner_sidebar_"),
  );
  const sidebarEnabled = sidebarSections.length > 0;

  // Tam genişlik bannerlar: banner_full_*
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

  /* ── layout: carousel → grid → sidebar sırasına göre ── */
  const mainBlocks = enabledList.filter((s) => s.key === "carousel" || s.key === "grid");
  const showCarouselFirst = !mainBlocks.length || mainBlocks[0]?.key === "carousel";

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Haberler</h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCcw className="size-3.5" />
          Yenile
        </button>
      </div>

      {/* Category tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === c.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Haberler yüklenemedi.{" "}
          <button type="button" onClick={() => void refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Bu kategoride haber bulunamadı.</div>
      ) : (
        <>
          {/* Tam genişlik bannerlar — üst */}
          {fullWidthTop.map((sec) => (
            <FullWidthNewsBanner key={sec.key} ids={sec.bannerIds} />
          ))}

          <div className={`grid grid-cols-1 gap-6 ${sidebarEnabled ? "lg:grid-cols-4" : ""}`}>
            {/* Main content */}
            <div className={`space-y-6 ${sidebarEnabled ? "lg:col-span-3" : ""}`}>

              {/* Carousel */}
              {carouselEnabled && showCarouselFirst && carouselArticles.length > 0 && (
                <ArticlesCarousel articles={carouselArticles} />
              )}

              {/* Grid */}
              {gridEnabled && gridArticles.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">Son Haberler</span>
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">{articles.length} haber</span>
                  </div>
                  <div className={`grid gap-4 ${gridColsClass}`}>
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
            <FullWidthNewsBanner key={sec.key} ids={sec.bannerIds} />
          ))}
        </>
      )}
    </div>
  );
}
