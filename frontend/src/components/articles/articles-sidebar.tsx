"use client";

import type { Article } from "@/modules/articles/articles.types";
import type { BannerItem } from "@/modules/banner/banner.type";
import type { NewsSection } from "@/modules/theme/theme.type";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import { PremiumBannerCard } from "@/components/ads/PremiumBannerCard";
import { ArticleCard } from "./article-card";

interface ArticlesSidebarProps {
  latestArticles: Article[];
  sidebarSections: NewsSection[];
}

/** Haber yerleşimlerinde kullanılan premium reklam kreatifi. */
export function SidebarBannerCard({ banner, variant = "sidebar" }: { banner: BannerItem; variant?: "wide" | "sidebar" }) {
  return <PremiumBannerCard banner={banner} variant={variant} />;
}

/** Tek bir banner slotu — ID verilmemişse hiç render etmez */
function BannerSlot({ id }: { id?: string }) {
  const { data: banners = [], isPending } = useBannersByIdsQuery(id, 1);

  if (isPending && id) {
    return <div className="h-[160px] animate-pulse rounded-[32px] bg-muted/20" />;
  }

  if (!id || !banners.length) return null;

  return <SidebarBannerCard banner={banners[0]} />;
}

export function ArticlesSidebar({ latestArticles, sidebarSections }: ArticlesSidebarProps) {
  return (
    <aside className="flex flex-col gap-8">
      {sidebarSections.map((sec) => {
        if (sec.key === "sidebar") {
          return latestArticles.length > 0 ? (
            <div key={sec.key} className="relative">
              <div className="mb-6 flex items-center gap-2">
                 <div className="h-4 w-1 bg-saffron rounded-full" />
                 <h3 className="font-fraunces text-xl font-medium text-ink">
                    {sec.label || "Son Haberler"}
                 </h3>
              </div>
              <div className="flex flex-col">
                {latestArticles.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </div>
          ) : null;
        }
        if (sec.key.startsWith("banner_") || sec.key.startsWith("banners_")) {
          return <BannerSlot key={sec.key} id={sec.bannerIds} />;
        }
        return null;
      })}
    </aside>
  );
}
