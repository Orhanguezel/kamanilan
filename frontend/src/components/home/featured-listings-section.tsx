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

export function FeaturedListingsSection({ config }: Props) {
  const limit  = config?.limit  ?? 8;
  const colsLg = config?.colsLg ?? 4;
  const gridCls = `grid grid-cols-2 gap-3 sm:grid-cols-3 ${LG_COLS[colsLg] ?? "lg:grid-cols-4"}`;

  const { data, isPending } = useFeaturedListingsQuery(limit);
  const items = data?.items ?? [];

  return (
    <section className="py-12 md:py-16 bg-paper">
      <div className="container">
        <SectionHeader
          title={config?.label || t("home.featured_title")}
          subtitle={t("home.featured_subtitle")}
          viewAllHref={`${ROUTES.LISTINGS}?featured=1`}
        />

        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-parchment/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">{t("listing.no_listings")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
