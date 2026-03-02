"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useListingsQuery } from "@/modules/listing/listing.service";
import { ListingCard } from "@/components/listing/listing-card";
import { SectionHeader } from "./section-header";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

export function ProductTopSellingSection({ config }: Props) {
  const limit = config?.limit ?? 10;
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isPending } = useListingsQuery({
    sort: "updated_at",
    orderDir: "desc",
    limit,
  });
  const items = data?.items ?? [];

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const inGrid = !!(config?.span && config.span < 12);

  return (
    <section
      className={inGrid ? "py-6 flex-1" : "py-10"}
      style={{ background: "hsl(var(--muted) / 0.3)" }}
    >
      <div className={inGrid ? "px-4" : "container mx-auto px-4"}>
        <SectionHeader
          title={config?.label || t("home.top_selling_title")}
          subtitle={t("home.top_selling_subtitle")}
          viewAllHref={`${ROUTES.LISTINGS}?sort=view_count&orderDir=desc`}
        />

        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-all hover:scale-105 lg:-left-5"
            aria-label="Sol"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {isPending ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] w-52 flex-shrink-0 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t("listing.no_listings")}</p>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {items.map((listing) => (
                <div key={listing.id} className="w-52 flex-shrink-0 sm:w-60" style={{ scrollSnapAlign: "start" }}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-all hover:scale-105 lg:-right-5"
            aria-label="Sağ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
