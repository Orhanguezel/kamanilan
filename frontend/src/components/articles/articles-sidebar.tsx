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
  /** Sidebar bölümleri — order'a göre sıralı, sadece enabled olanlar */
  sidebarSections: NewsSection[];
}

/** Tek bir sidebar banner kartı — görsel varsa gösterir, yoksa renkli kart */
export function SidebarBannerCard({ banner }: { banner: BannerItem }) {
  const bg     = banner.background_color   || "hsl(var(--muted))";
  const titleC = banner.title_color        || "hsl(var(--foreground))";
  const descC  = banner.description_color  || "hsl(var(--muted-foreground))";
  const btn    = banner.button_color       || "hsl(var(--accent))";
  const btnHov = banner.button_hover_color || banner.button_color || "hsl(var(--accent))";
  const btnTxt = banner.button_text_color  || "#ffffff";
  const bgImage = banner.image;
  const thumbImage = banner.thumbnail && banner.thumbnail !== banner.image ? banner.thumbnail : null;

  const inner = (
    <div
      className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ backgroundColor: bg }}
    >
      {bgImage && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={bgImage}
            alt={banner.alt ?? banner.title}
            fill
            className="object-cover opacity-[0.2] transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 360px"
            unoptimized
          />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/15" />
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ backgroundColor: btn }} />

      <div className="relative flex min-h-[140px] items-center">
        <div className="flex flex-1 flex-col justify-center py-4 pl-5 pr-4">
          {banner.subtitle && (
            <span className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: btn }}>
              {banner.subtitle}
            </span>
          )}
          <h4 className="text-sm font-bold leading-snug" style={{ color: titleC }}>
            {banner.title}
          </h4>
          {banner.description && (
            <p className="mt-1 mb-3 line-clamp-2 text-xs leading-relaxed opacity-80" style={{ color: descC }}>
              {banner.description}
            </p>
          )}
          {banner.button_text && (
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-150 hover:shadow active:scale-95"
              style={{ backgroundColor: btn, color: btnTxt }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = btnHov)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = btn)}
            >
              {banner.button_text}
              <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>

        {thumbImage && (
          <div className="relative hidden shrink-0 sm:block" style={{ height: 120, width: 90 }}>
            <Image
              src={thumbImage}
              alt={banner.alt ?? banner.title}
              fill
              className="object-contain object-right-bottom"
              sizes="90px"
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
    return <div className="h-[140px] animate-pulse rounded-lg bg-muted" />;
  }

  if (!id || !banners.length) return null;

  return <SidebarBannerCard banner={banners[0]} />;
}

export function ArticlesSidebar({ latestArticles, sidebarSections }: ArticlesSidebarProps) {
  return (
    <aside className="flex flex-col gap-5">
      {sidebarSections.map((sec) => {
        if (sec.key === "sidebar") {
          return latestArticles.length > 0 ? (
            <div key={sec.key} className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 border-b border-border pb-2 text-sm font-bold text-foreground">
                {sec.label || "Son Haberler"}
              </h3>
              <div className="divide-y divide-border">
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
