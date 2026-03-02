"use client";

import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useFeaturedListingsQuery } from "@/modules/listing/listing.service";
import { ListingCard } from "@/components/listing/listing-card";
import { SectionHeader } from "./section-header";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

const LG_COLS: Record<number, string> = {
  2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5",
};

export function ProductFeaturedSection({ config }: Props) {
  const limit  = config?.limit  ?? 8;
  const colsLg = config?.colsLg ?? 4;
  const inGrid = !!(config?.span && config.span < 12);
  const gridCls = `grid grid-cols-2 gap-3 sm:grid-cols-3 ${LG_COLS[colsLg] ?? "lg:grid-cols-4"}`;

  const { data, isPending } = useFeaturedListingsQuery(limit);
  const items = data?.items ?? [];

  return (
    <section
      className={inGrid ? "py-6 flex-1" : "py-10"}
      style={{ background: "hsl(var(--background))" }}
    >
      <div className={inGrid ? "px-4" : "container mx-auto px-4"}>
        <SectionHeader
          title={config?.label || t("home.featured_title")}
          subtitle={t("home.featured_subtitle")}
          viewAllHref={`${ROUTES.LISTINGS}?featured=1`}
        />

        {isPending ? (
          <div className={gridCls}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t("listing.no_listings")}</p>
        ) : (
          <div className={gridCls}>
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
