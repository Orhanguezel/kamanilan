"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useInfiniteListingsQuery } from "@/modules/listing/listing.service";
import { ListingCard } from "@/components/listing/listing-card";
import { SectionHeader } from "./section-header";
import type { SectionConfig } from "@/modules/theme/theme.type";

const PER_PAGE = 20;

/* ── Tailwind class lookup — JIT-safe ────────────────────────────────── */
const COLS_SM: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};
const COLS_MD: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};
const COLS_LG: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function ListingSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────────────────── */
interface Props {
  config?: SectionConfig;
}

export function InfiniteListingsSection({ config }: Props) {
  const colsLg = config?.colsLg ?? 4;
  const colsMd = config?.colsMd ?? 3;
  const colsSm = config?.colsSm ?? 2;

  const gridClass = [
    COLS_SM[colsSm] ?? "grid-cols-2",
    COLS_MD[colsMd] ?? "sm:grid-cols-3",
    COLS_LG[colsLg] ?? "lg:grid-cols-4",
  ].join(" ");

  const sentinelRef           = useRef<HTMLDivElement>(null);
  const hasNextPageRef        = useRef(false);
  const isFetchingNextPageRef = useRef(false);
  const fetchNextPageRef      = useRef<() => void>(() => {});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteListingsQuery(
    { sort: "created_at", orderDir: "desc" },
    PER_PAGE,
  );

  /* Her render'da ref'leri güncelle */
  hasNextPageRef.current        = hasNextPage ?? false;
  isFetchingNextPageRef.current = isFetchingNextPage;
  fetchNextPageRef.current      = fetchNextPage;

  /* IntersectionObserver — yalnızca bir kez mount'ta kurulur */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          fetchNextPageRef.current();
        }
      },
      { threshold: 0, rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allListings =
    data?.pages.flatMap((page) => page.items ?? []) ?? [];

  if (isError) return null;

  return (
    <section
      className="py-10 border-t"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          title={config?.label || t("home.all_listings_title")}
          subtitle={t("home.all_listings_subtitle")}
          viewAllHref={ROUTES.LISTINGS}
        />

        <div className={`grid gap-3 ${gridClass}`}>
          {allListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}

          {isLoading &&
            Array.from({ length: PER_PAGE }).map((_, i) => (
              <ListingSkeleton key={`sk-init-${i}`} />
            ))}

          {isFetchingNextPage &&
            Array.from({ length: 8 }).map((_, i) => (
              <ListingSkeleton key={`sk-next-${i}`} />
            ))}
        </div>

        {/* Sentinel: bu eleman görünürce bir sonraki sayfa tetiklenir */}
        <div
          ref={sentinelRef}
          className="mt-8 flex min-h-[48px] items-center justify-center"
        >
          {isFetchingNextPage && !isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
          {!hasNextPage && allListings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("listing.all_loaded")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
