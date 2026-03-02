"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import type { ListingCategory, ListingSubCategory } from "@/modules/listing/listing.types";

interface Props {
  categories: ListingCategory[];
  subCategories: ListingSubCategory[];
  listingsPath: string;
}

const FALLBACK_ICON = "📦";

function CategoryCard({
  category,
  subs,
  listingsPath,
}: {
  category: ListingCategory;
  subs: ListingSubCategory[];
  listingsPath: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_SUBS = 6;
  const visibleSubs = showAll ? subs : subs.slice(0, VISIBLE_SUBS);
  const hasMore = subs.length > VISIBLE_SUBS;
  const categoryHref = `${listingsPath}?category=${category.slug}`;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header — clickable */}
      <Link href={categoryHref} className="group block">
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-muted sm:h-36">
          {category.image_url ? (
            <>
              <Image
                src={category.image_url}
                alt={category.alt ?? category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                <p className="text-sm font-semibold text-white drop-shadow">{category.name}</p>
                {category.description && (
                  <p className="line-clamp-1 text-[11px] text-white/80">{category.description}</p>
                )}
              </div>
            </>
          ) : (
            <span className="text-5xl select-none">{category.icon ?? FALLBACK_ICON}</span>
          )}
        </div>

        {/* Text below (only when no image) */}
        {!category.image_url && (
          <div className="px-4 pb-3 pt-3">
            <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {category.name}
            </p>
            {category.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        )}
      </Link>

      {/* Subcategory chips */}
      {subs.length > 0 && (
        <div className="border-t px-3 py-2.5">
          <div className="flex flex-wrap gap-1.5">
            {visibleSubs.map((sc) => (
              <Link
                key={sc.id}
                href={`${listingsPath}?category=${category.slug}&sub_category=${sc.slug}`}
                className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {sc.icon && <span className="text-[11px]">{sc.icon}</span>}
                {sc.name}
              </Link>
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {showAll ? (
                <><ChevronUp className="h-3 w-3" /> Daha az göster</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> +{subs.length - VISIBLE_SUBS} daha</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t px-4 py-2">
        <Link
          href={categoryHref}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Tag className="h-3 w-3" />
          Tüm {category.name} ilanları
        </Link>
      </div>
    </div>
  );
}

export function CategoriesGrid({ categories, subCategories, listingsPath }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((cat) => {
        const subs = subCategories
          .filter((sc) => sc.category_id === cat.id)
          .sort((a, b) => a.display_order - b.display_order);
        return (
          <CategoryCard
            key={cat.id}
            category={cat}
            subs={subs}
            listingsPath={listingsPath}
          />
        );
      })}
    </div>
  );
}
