"use client";

import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import type { ListingCategory, ListingSubCategory } from "@/modules/listing/listing.types";
import { ROUTES } from "@/config/routes";

interface Props {
  categories: ListingCategory[];
  subCategories: ListingSubCategory[];
  listingsPath: string;
}

export function CategoriesGrid({ categories, subCategories, listingsPath }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border border border-border rounded-[24px] overflow-hidden shadow-2xl">
      {categories.map((cat) => {
        const subs = subCategories
          .filter((sc) => sc.category_id === cat.id)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        
        return (
          <div key={cat.id} className="group relative flex flex-col bg-paper transition-all duration-500 hover:bg-ink hover:text-white">
            {/* Header Area */}
            <div className="p-8 pb-4">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-ivory overflow-hidden border-2 border-white shadow-lg transition-all duration-500 group-hover:bg-saffron group-hover:rotate-[-8deg] group-hover:scale-110 mb-6">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">{cat.icon || "📦"}</span>
                )}
              </div>
              <h3 className="font-fraunces text-2xl font-medium tracking-tight mb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] group-hover:text-wheat transition-colors line-clamp-2 leading-relaxed">
                {cat.description || `${cat.name} kategorisindeki tüm ilanları keşfedin.`}
              </p>
            </div>

            {/* Subcategories (Editorial List) */}
            <div className="flex-1 px-8 py-4">
               <div className="flex flex-col gap-2.5">
                  {subs.slice(0, 6).map(sub => (
                    <Link 
                      key={sub.id} 
                      href={`${listingsPath}?category=${cat.slug}&sub_category=${sub.slug}`}
                      className="text-[13px] font-medium text-text-2 group-hover:text-white/80 hover:!text-saffron transition-colors flex items-center gap-2 group/sub"
                    >
                      <span className="h-1 w-1 rounded-full bg-saffron opacity-40 group-hover/sub:opacity-100 transition-opacity" />
                      {sub.name}
                    </Link>
                  ))}
                  {subs.length > 6 && (
                    <Link href={`${listingsPath}?category=${cat.slug}`} className="text-[11px] font-mono uppercase tracking-widest text-saffron-2 mt-2 hover:underline">
                      +{subs.length - 6} Diğer Alt Kategori
                    </Link>
                  )}
               </div>
            </div>

            {/* Footer Action */}
            <div className="p-8 pt-4">
               <Link 
                 href={`${listingsPath}?category=${cat.slug}`}
                 className="ghost-link w-full justify-between"
               >
                 Tümünü Gör <ChevronRight className="h-4 w-4 arrow" />
               </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
