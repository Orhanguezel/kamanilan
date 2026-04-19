"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/modules/articles/articles.types";
import type { BannerItem } from "@/modules/banner/banner.type";
import type { NewsSection } from "@/modules/theme/theme.type";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import { ArticleCard } from "./article-card";

interface ArticlesSidebarProps {
  latestArticles: Article[];
  sidebarSections: NewsSection[];
}

/** Tek bir sidebar banner kartı — görsel varsa gösterir, yoksa renkli kart */
export function SidebarBannerCard({ banner }: { banner: BannerItem }) {
  // Regex to catch old green colors (from common turn)
  const isOldGreen = (color: string) => {
    if (!color) return false;
    const greenRegex = /(#10[bB]981|#059669|#06[dD]17[bB]|emerald|teal|#14[bB]58[eE]|green)/i;
    return greenRegex.test(color);
  };

  const dbBg = banner.background_color;
  const bg = isOldGreen(dbBg || "") ? "hsl(var(--col-ink))" : (dbBg || "hsl(var(--col-paper))");
  const titleC = isOldGreen(dbBg || "") ? "hsl(var(--col-saffron))" : (banner.title_color || "hsl(var(--col-ink))");
  const descC = isOldGreen(dbBg || "") ? "hsl(var(--col-parchment) / 0.7)" : (banner.description_color || "hsl(var(--col-text-2))");
  const btn = isOldGreen(dbBg || "") ? "hsl(var(--col-saffron))" : (banner.button_color || "hsl(var(--col-saffron))");

  const bgImage = banner.image;
  const thumbImage = banner.thumbnail && banner.thumbnail !== banner.image ? banner.thumbnail : null;

  const inner = (
    <div
      className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-black/5"
      style={{ backgroundColor: bg }}
    >
      {bgImage && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={bgImage}
            alt={banner.alt ?? banner.title}
            fill
            className="object-cover opacity-[0.15] transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 360px"
            unoptimized
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

      <div className="relative flex items-center">
        <div className="flex flex-1 flex-col justify-center py-4 px-4">
          {banner.subtitle && (
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: btn }}>
              {banner.subtitle}
            </span>
          )}
          <h4 className="font-fraunces text-sm font-medium leading-tight mb-2" style={{ color: titleC }}>
            {banner.title}
          </h4>
          {banner.description && (
            <p className="line-clamp-2 text-[11px] leading-snug opacity-70 mb-2.5 font-manrope" style={{ color: descC }}>
              {banner.description}
            </p>
          )}
          {banner.button_text && (
            <span
              className="btn-editorial py-1.5 px-4 text-[10px] w-fit"
              style={{ backgroundColor: btn, color: "hsl(var(--col-ink))", borderColor: "transparent" }}
            >
              <span>
                {banner.button_text}
                <ArrowRight className="h-3 w-3" />
              </span>
            </span>
          )}
        </div>

        {thumbImage && (
          <div className="relative hidden shrink-0 sm:block pr-3" style={{ height: 90, width: 70 }}>
            <Image
              src={thumbImage}
              alt={banner.alt ?? banner.title}
              fill
              className="object-contain object-right-bottom drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
              sizes="70px"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );

  if (banner.link_url) {
    return (
      <Link
        href={banner.link_url}
        target={banner.link_target ?? "_self"}
        rel={banner.link_target === "_blank" ? "noopener noreferrer" : undefined}
        className="block"
      >
        {inner}
      </Link>
    );
  }
  return inner;
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
