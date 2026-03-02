"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useCategoriesQuery, useCategoryCountsQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

const CARD_STYLE: React.CSSProperties = {
  width: "110px",
  background: "hsl(var(--background))",
  border: "1.5px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  padding: "1.2rem 0.5rem 0.9rem",
  boxShadow: "0 4px 24px hsl(var(--foreground) / 0.06)",
};

const ICON_WRAP: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden",
};

/**
 * Kategori resmi: image_url varsa <img> gösterir, yüklenemezse veya yoksa
 * emoji icon'a düşer.
 */
function CategoryIcon({ cat }: { cat: CategoryItem }) {
  const [imgError, setImgError] = useState(false);

  if (cat.image_url && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cat.image_url}
        alt={cat.alt ?? cat.name}
        width={52}
        height={52}
        style={{ ...ICON_WRAP, objectFit: "cover" }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      style={{
        ...ICON_WRAP,
        fontSize: "1.6rem",
        background: "hsl(var(--muted))",
      }}
    >
      {cat.icon ?? "📦"}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 animate-pulse flex flex-col items-center gap-2"
      style={CARD_STYLE}
    >
      <div style={{ ...ICON_WRAP, background: "hsl(var(--muted))" }} />
      <div style={{ height: 10, width: 64, borderRadius: 4, background: "hsl(var(--muted))" }} />
      <div style={{ height: 8, width: 40, borderRadius: 4, background: "hsl(var(--muted))" }} />
    </div>
  );
}

export function CategoriesSection({ config }: Props) {
  const { data: categories = [] as CategoryItem[], isPending } = useCategoriesQuery();
  const { data: counts = {} } = useCategoryCountsQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const animRef = useRef<number>(0);

  const activeCategories = categories.filter((c: CategoryItem) => c.is_active);
  const limit = config?.limit ?? null;
  const visibleCategories = limit ? activeCategories.slice(0, limit) : activeCategories;
  const sectionTitle = config?.label || t("home.categories_title");

  // RAF infinite auto-scroll
  useEffect(() => {
    if (isPending || visibleCategories.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    let running = true;

    function step() {
      if (!running || !el) return;
      if (!isHovering.current) {
        el.scrollLeft += 0.8;
        // Reset when scrolled past the first copy (items are doubled)
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, visibleCategories.length]);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section className="py-8" style={{ background: "hsl(var(--muted))" }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="font-playfair text-xl font-bold flex items-center gap-2"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <span
              className="flex-shrink-0 rounded-full"
              style={{ width: 4, height: "1.2em", background: "hsl(var(--accent))" }}
            />
            {sectionTitle}
          </h2>
          <Link
            href={ROUTES.CATEGORIES}
            className="flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
            style={{ color: "hsl(var(--accent))" }}
          >
            {t("common.view_all")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Scroll container */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scrollBy(-1)}
            className="absolute z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200"
            style={{
              left: -16,
              top: "45%",
              background: "hsl(var(--background))",
              border: "2px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--accent))";
              e.currentTarget.style.borderColor = "hsl(var(--accent))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(var(--background))";
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
            aria-label="Önceki"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-3 pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ overflowX: "auto", scrollbarWidth: "none" }}
            onMouseEnter={() => { isHovering.current = true; }}
            onMouseLeave={() => { isHovering.current = false; }}
          >
            {isPending
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              : [...visibleCategories, ...visibleCategories].map((cat: CategoryItem, i: number) => (
                  <Link
                    key={`${cat.id}-${i}`}
                    href={`${ROUTES.LISTINGS}?category=${cat.slug}`}
                    className="group flex-shrink-0 flex flex-col items-center gap-1.5 transition-all transition-duration-[250ms] hover:-translate-y-[3px]"
                    style={CARD_STYLE}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--accent))";
                      e.currentTarget.style.boxShadow =
                        "0 8px 28px hsl(var(--accent) / 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--border))";
                      e.currentTarget.style.boxShadow =
                        "0 4px 24px hsl(var(--foreground) / 0.06)";
                    }}
                  >
                    <CategoryIcon cat={cat} />

                    <span
                      className="text-center font-bold leading-snug line-clamp-2"
                      style={{
                        fontSize: "0.68rem",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      {cat.name}
                    </span>

                    {(counts[cat.id] ?? 0) > 0 ? (
                      <span
                        className="rounded-full font-bold leading-none"
                        style={{
                          fontSize: "0.55rem",
                          padding: "0.15rem 0.5rem",
                          background: "hsl(var(--accent) / 0.13)",
                          color: "hsl(var(--accent))",
                        }}
                      >
                        {counts[cat.id]} ilan
                      </span>
                    ) : cat.is_featured ? (
                      <span
                        className="rounded-full font-bold leading-none"
                        style={{
                          fontSize: "0.55rem",
                          padding: "0.15rem 0.5rem",
                          background: "hsl(var(--accent) / 0.13)",
                          color: "hsl(var(--accent))",
                        }}
                      >
                        Öne Çıkan
                      </span>
                    ) : null}
                  </Link>
                ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollBy(1)}
            className="absolute z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200"
            style={{
              right: -16,
              top: "45%",
              background: "hsl(var(--background))",
              border: "2px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(var(--accent))";
              e.currentTarget.style.borderColor = "hsl(var(--accent))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(var(--background))";
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
            aria-label="Sonraki"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
