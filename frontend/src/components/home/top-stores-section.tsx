"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, ArrowRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useCategoriesQuery, useCategoryCountsQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

const PREMIUM_PALETTE = [
  "hsl(var(--col-paper))",
  "hsl(var(--col-ivory))",
  "hsl(var(--col-cream))",
  "hsl(var(--col-parchment))",
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
    <section className="py-12 md:py-16 bg-white">
      <div className="container px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
             <div className="eyebrow mb-6">İş Ortaklarımız</div>
             <h2 className="section-title">
               Kaman'ın <em>Güvenilir</em> Mağazaları
             </h2>
          </div>
          <Link href={ROUTES.CATEGORIES} className="ghost-link">
             {t("common.view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-[32px] bg-muted/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((cat, idx) => {
              const bg = PREMIUM_PALETTE[idx % PREMIUM_PALETTE.length];
              const count = (counts as Record<string, number>)[cat.id] ?? 0;

              return (
                <Link
                  key={cat.id}
                  href={ROUTES.CATEGORY(cat.slug)}
                  className="group relative flex flex-col items-center justify-center aspect-square rounded-[32px] p-6 text-center transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 border border-black/5"
                  style={{ background: bg }}
                >
                  <div className="mb-6">
                    {cat.image_url ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-xl transition-transform duration-500 group-hover:scale-110">
                        <Image
                          src={cat.image_url}
                          alt={cat.alt ?? cat.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : cat.icon ? (
                      <div className="h-20 w-20 flex items-center justify-center text-5xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                        {cat.icon}
                      </div>
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-xl">
                        <Store className="h-8 w-8 text-walnut" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-fraunces text-base font-medium leading-tight text-ink line-clamp-2">{cat.name}</p>
                    {count > 0 && (
                      <p className="font-mono text-[9px] uppercase tracking-widest opacity-40">
                        {count} Aktif İlan
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
