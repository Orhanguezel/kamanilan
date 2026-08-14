"use client";

import { PremiumBannerCard } from "@/components/ads/PremiumBannerCard";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import type { SectionConfig } from "@/modules/theme/theme.type";

type BannerSectionConfig = SectionConfig & {
  instance?: number;
  stack_count?: number;
};

interface Props {
  config?: BannerSectionConfig;
}

/* ─────────────────────────────────────────────────
   Ana bölüm
   Her banner_section__N bloğu, instance=N olan banner ID'sini
   getirir ve dikey olarak listeler.
   Yan yana düzen = dış 12-sütun grid ile yönetilir,
   BannerRowSection içinde yatay grid YOKTUR.
───────────────────────────────────────────────── */
export function BannerRowSection({ config }: Props) {
  const instance   = config?.instance;
  const rowFromKey = Number(
    config?.key?.replace("banner_row_", "").replace(/banner_section__/, "") || 0,
  );
  const bannerId   = instance ?? rowFromKey;
  const ids        = bannerId > 0 ? String(bannerId) : "";
  const stackCount = Math.max(1, Number(config?.stack_count ?? 1));
  const isSolo     = !config?.span || config.span >= 12;

  const { data: banners = [], isFetching } = useBannersByIdsQuery(ids, Math.max(1, stackCount));

  if (!ids) return null;

  if (isFetching && !banners.length) {
    return (
      <section className={isSolo ? "py-4" : "py-2 h-full"}>
        <div className={isSolo ? "container mx-auto px-4 flex flex-col gap-3" : "px-2 md:px-3 h-full flex flex-col gap-3"}>
          {Array.from({ length: stackCount }).map((_, i) => (
            <div key={i} className="flex-1 min-h-[200px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  const visible = banners.slice(0, stackCount);
  if (!visible.length) return null;

  return (
    <section className={isSolo ? "py-12 md:py-16" : "py-2 h-full"}>
      <div className={isSolo ? "container flex flex-col gap-8" : "px-2 md:px-3 flex flex-col gap-8 h-full"}>
        {visible.map((banner) => (
          <div key={banner.id} className={isSolo ? undefined : "flex-1"}>
            <PremiumBannerCard banner={banner} variant={isSolo ? "wide" : "sidebar"} />
          </div>
        ))}
      </div>
    </section>
  );
}
