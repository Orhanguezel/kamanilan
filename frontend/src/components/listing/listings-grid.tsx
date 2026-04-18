"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useListingsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
  useListingBrandsQuery,
  useListingTagsQuery,
} from "@/modules/listing/listing.service";
import { ListingCard } from "./listing-card";
import { t } from "@/lib/t";
import type { ListingFilters } from "@/modules/listing/listing.types";

const PAGE_SIZE = 12;

export function ListingsGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Slug params from URL ──────────────────────────────────
  const categorySlug    = searchParams.get("category")     ?? "";
  const subCatSlug      = searchParams.get("sub_category") ?? "";
  const brandSlug       = searchParams.get("brand")        ?? "";
  const tagSlugs        = (searchParams.get("tags") ?? "").split(",").filter(Boolean);

  // Non-slug params
  const q        = searchParams.get("q")        ?? "";
  const status   = searchParams.get("status")   ?? "";
  const city     = searchParams.get("city")     ?? "";
  const district = searchParams.get("district") ?? "";
  const priceMin = searchParams.get("price_min") ?? "";
  const priceMax = searchParams.get("price_max") ?? "";
  const sort     = (searchParams.get("sort")     ?? "") as ListingFilters["sort"];
  const orderDir = (searchParams.get("orderDir") ?? "") as ListingFilters["orderDir"];
  const offset   = parseInt(searchParams.get("offset") ?? "0", 10);

  // ── Resolve slugs → IDs ───────────────────────────────────
  const { data: categories, isLoading: catsLoading } = useCategoriesQuery();
  const category   = categorySlug ? categories?.find((c) => c.slug === categorySlug) : undefined;
  const categoryId = category?.id;

  // Sub-categories: only enabled when we need them (categoryId resolved)
  const { data: subCategories, isLoading: subCatsLoading } = useSubCategoriesQuery(categoryId);
  const subCategory   = subCatSlug ? subCategories?.find((sc) => sc.slug === subCatSlug) : undefined;
  const subCategoryId = subCategory?.id;

  // Brands & tags: only needed when brandSlug / tagSlugs are present
  const { data: brands } = useListingBrandsQuery(
    brandSlug ? categoryId : undefined,
    brandSlug ? subCategoryId : undefined,
  );
  const brandId = brandSlug ? brands?.find((b) => b.slug === brandSlug)?.id : undefined;

  const { data: tags } = useListingTagsQuery(
    tagSlugs.length ? categoryId : undefined,
    tagSlugs.length ? subCategoryId : undefined,
  );
  const resolvedTagIds = tagSlugs.length
    ? (tags?.filter((tg) => tagSlugs.includes(tg.slug)).map((tg) => tg.id) ?? [])
    : [];

  // ── Determine whether slug resolution is still pending ───
  // If a slug is in the URL but we haven't resolved it yet, wait.
  const resolvingCategory = !!categorySlug && catsLoading;
  const resolvingSubCat   = !!subCatSlug && categoryId !== undefined && subCatsLoading;
  const slugsPending = resolvingCategory || resolvingSubCat;

  // ── Build filter object with resolved IDs ─────────────────
  const filters: ListingFilters = { limit: PAGE_SIZE };
  if (q)               filters.q              = q;
  if (categoryId)      filters.category_id    = categoryId;
  if (subCategoryId)   filters.sub_category_id = subCategoryId;
  if (brandId)         filters.brand_id       = brandId;
  if (resolvedTagIds.length) filters.tag_ids  = resolvedTagIds;
  if (status)          filters.status         = status;
  if (city)            filters.city           = city;
  if (district)        filters.district       = district;
  if (priceMin)        filters.price_min      = parseFloat(priceMin);
  if (priceMax)        filters.price_max      = parseFloat(priceMax);
  if (sort)            filters.sort           = sort;
  if (orderDir)        filters.orderDir       = orderDir;
  if (offset)          filters.offset         = offset;

  const { data, isPending: listingsPending, isError } = useListingsQuery(
    filters,
    !slugsPending, // don't fire until slugs are resolved
  );

  const isPending = slugsPending || listingsPending;
  const items  = data?.items ?? [];
  const total  = data?.total ?? 0;
  const from   = total === 0 ? 0 : offset + 1;
  const to     = Math.min(offset + PAGE_SIZE, total);
  const hasNext = to < total;
  const hasPrev = offset > 0;

  const goPage = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset > 0) {
      params.set("offset", String(newOffset));
    } else {
      params.delete("offset");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("common.error")}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-foreground">{t("listing.no_listings")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("search.try_different")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("listing.showing", { from, to, total })}
      </p>

      <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-center gap-6 pt-12">
          <button
            onClick={() => goPage(Math.max(0, offset - PAGE_SIZE))}
            disabled={!hasPrev}
            className="rounded-full border border-border bg-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-ink transition-all hover:bg-paper disabled:opacity-30 disabled:pointer-events-none"
          >
            {t("common.previous")}
          </button>
          <span className="font-mono text-xs uppercase tracking-widest opacity-50">
            {Math.floor(offset / PAGE_SIZE) + 1} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button
            onClick={() => goPage(offset + PAGE_SIZE)}
            disabled={!hasNext}
            className="btn-editorial"
          >
            <span>{t("common.next")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
