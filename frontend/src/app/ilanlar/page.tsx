import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@/lib/t";
import { ListingsFilters } from "@/components/listing/listings-filters";
import { ListingsGrid } from "@/components/listing/listings-grid";
import { ListingFilterSidebar } from "@/components/listing/listing-filter-sidebar";

export const metadata: Metadata = {
  title: t("seo.listings_title"),
  description: t("seo.listings_description"),
};

export default function ListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("listing.all_listings")}</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <Suspense>
            <ListingFilterSidebar />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Topbar: mobile filter button + search + sort */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Suspense>
              <ListingFilterSidebar mobileOnly />
            </Suspense>
            <Suspense>
              <ListingsFilters />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            }
          >
            <ListingsGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
