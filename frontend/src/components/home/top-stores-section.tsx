"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useCategoriesQuery, useCategoryCountsQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import { SectionHeader } from "./section-header";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

// 6 pastel renk döngüsü (quickecommerce stili)
const PASTEL_COLORS = [
  "hsl(210 80% 94%)",
  "hsl(340 80% 94%)",
  "hsl(120 60% 91%)",
  "hsl(40 90% 92%)",
  "hsl(270 70% 93%)",
  "hsl(180 60% 91%)",
];

export function TopStoresSection({ config }: Props) {
  const limit = config?.limit ?? 12;
  const { data: categoriesData, isPending } = useCategoriesQuery();
  const { data: countsData } = useCategoryCountsQuery();

  const categories = ((categoriesData as CategoryItem[] | undefined) ?? [])
    .filter((c: CategoryItem) => c.is_active)
    .slice(0, limit);

  const counts = countsData ?? {};

  if (!isPending && categories.length === 0) return null;

  return (
    <section className="py-10" style={{ background: "hsl(var(--muted) / 0.3)" }}>
      <div className="container mx-auto px-4">
        <SectionHeader
          title={config?.label || t("home.top_stores_title")}
          subtitle={t("home.top_stores_subtitle")}
          viewAllHref={ROUTES.CATEGORIES}
        />

        {isPending ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat, idx) => {
              const bg = PASTEL_COLORS[idx % PASTEL_COLORS.length];
              const count = (counts as Record<string, number>)[cat.id] ?? 0;

              return (
                <Link
                  key={cat.id}
                  href={ROUTES.CATEGORY(cat.slug)}
                  className="group flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all hover:scale-[1.03] hover:shadow-md"
                  style={{ background: bg }}
                >
                  {cat.image_url ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/60">
                      <Image
                        src={cat.image_url}
                        alt={cat.alt ?? cat.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : cat.icon ? (
                    <span className="text-3xl">{cat.icon}</span>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/50">
                      <Store className="h-6 w-6 text-foreground/60" />
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold leading-tight text-foreground line-clamp-2">{cat.name}</p>
                    {count > 0 && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {count} {t("category.listing_count_suffix")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
