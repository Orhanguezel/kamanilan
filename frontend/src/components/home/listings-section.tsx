"use client";

import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useListingsQuery } from "@/modules/listing/listing.service";
import { ListingCard } from "@/components/listing/listing-card";
import { SectionHeader } from "./section-header";
import type { SectionConfig } from "@/modules/theme/theme.type";

const STATUS_VARIANTS = ["satilik", "kiralik", "takas", "ihtiyac", "ucretsiz"] as const;
type StatusVariant = (typeof STATUS_VARIANTS)[number];

const STATUS_SUBTITLES: Record<StatusVariant, string> = {
  satilik:  "Satılık ilanlar",
  kiralik:  "Kiralık ilanlar",
  takas:    "Takas ilanları",
  ihtiyac:  "İhtiyaç ilanları",
  ucretsiz: "Ücretsiz ilanlar",
};

function buildViewAllUrl(variant: string): string {
  if (!variant || variant === "all") return ROUTES.LISTINGS;
  if ((STATUS_VARIANTS as readonly string[]).includes(variant))
    return `${ROUTES.LISTINGS}?status=${variant}`;
  return ROUTES.LISTINGS;
}

function getSubtitle(variant: string): string {
  if ((STATUS_VARIANTS as readonly string[]).includes(variant))
    return STATUS_SUBTITLES[variant as StatusVariant];
  return "";
}

interface Props {
  config?: SectionConfig;
}

export function ListingsSection({ config }: Props) {
  const variant = config?.variant ?? "all";
  const limit   = config?.limit   ?? 8;

  const isStatus = (STATUS_VARIANTS as readonly string[]).includes(variant);

  const { data, isPending } = useListingsQuery({
    sort:      "created_at",
    orderDir:  "desc",
    limit,
    is_active: true,
    ...(isStatus ? { status: variant } : {}),
  });
  const items = data?.items ?? [];

  return (
    <section className="py-10" style={{ background: "hsl(var(--background))" }}>
      <div className="container mx-auto px-4">
        <SectionHeader
          title={config?.label || t("listing.all_listings")}
          subtitle={getSubtitle(variant)}
          viewAllHref={buildViewAllUrl(variant)}
        />

        {isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("listing.no_listings")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
