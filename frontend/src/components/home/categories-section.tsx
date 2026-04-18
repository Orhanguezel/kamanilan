"use client";

import Link from "next/link";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useCategoriesQuery, useCategoryCountsQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

export function CategoriesSection({ config }: Props) {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: counts = {} } = useCategoryCountsQuery();

  const activeCategories = (categories as CategoryItem[]).filter((c) => c.is_active);
  const sectionTitle = config?.label || t("home.categories_title");

  if (!activeCategories.length) return null;

  return (
    <section className="py-24 lg:py-32 bg-paper relative">
      <div className="container">
        {/* Editorial Section Header */}
        <div className="section-header">
          <div className="flex flex-col gap-2">
            <div className="eyebrow">Keşfet</div>
            <h2 className="section-title">
              {sectionTitle.includes("Ceviz") ? (
                <>Yerel <em>Mahsuller</em> & Kataloglar</>
              ) : (
                sectionTitle
              )}
            </h2>
          </div>
          <Link href={ROUTES.CATEGORIES} className="ghost-link">
            {t("common.view_all")} <ChevronRight className="h-4 w-4 arrow" />
          </Link>
        </div>

        {/* Categories Grid (HTML Pattern Alignment) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[24px] overflow-hidden shadow-2xl">
          {activeCategories.slice(0, 7).map((cat, idx) => {
            const isFeatured = cat.is_featured || idx === 0; // First one is featured editorial style
            
            if (isFeatured) {
              return (
                <Link
                  key={cat.id}
                  href={`${ROUTES.LISTINGS}?category=${cat.slug}`}
                  className="group relative lg:col-span-2 min-h-[300px] p-10 flex flex-col justify-between bg-[linear-gradient(135deg,hsl(var(--col-ink)),hsl(var(--col-espresso)))] text-cream transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                    <span className="text-[200px] font-fraunces italic select-none pointer-events-none">C</span>
                  </div>
                  
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-ink text-3xl shadow-xl transition-all group-hover:rotate-[-8deg] group-hover:scale-110">
                    {cat.icon || "🌰"}
                  </div>

                  <div className="relative z-10 flex flex-col gap-3">
                    <h3 className="font-fraunces text-4xl font-medium tracking-tight font-variation-soft-80 text-white">
                       {cat.name} <em>Pazarı</em>
                    </h3>
                    <div className="flex items-center gap-4 text-wheat font-mono text-[11px] uppercase tracking-widest">
                       <span className="h-px w-10 bg-current" />
                       {counts[cat.id] || 0} Aktif İlan
                    </div>
                  </div>
                  
                  <ArrowUpRight className="absolute top-10 right-10 opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 text-saffron" />
                </Link>
              );
            }

            return (
              <Link
                key={cat.id}
                href={`${ROUTES.LISTINGS}?category=${cat.slug}`}
                className="group relative p-8 flex flex-col justify-between bg-paper transition-all duration-500 hover:bg-ink hover:text-white"
              >
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-ivory text-2xl transition-all duration-500 group-hover:bg-saffron group-hover:rotate-[-8deg] group-hover:scale-110">
                  {cat.icon || "📦"}
                </div>

                <div className="mt-8">
                   <h3 className="font-fraunces text-2xl font-medium tracking-tight mb-2">
                     {cat.name}
                   </h3>
                   <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))] font-mono text-[10px] uppercase tracking-[0.15em] transition-colors group-hover:text-saffron">
                      <span className="h-px w-5 bg-current" />
                      {counts[cat.id] || 0} İlan
                   </div>
                </div>

                <ArrowUpRight className="absolute top-8 right-8 opacity-0 -translate-x-3 translate-y-3 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 text-saffron" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
