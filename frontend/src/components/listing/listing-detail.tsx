"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Hash,
  Tag,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useListingBySlugQuery } from "@/modules/listing/listing.service";
import { useCartStore } from "@/stores/cart-store";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import type { ListingVariantValue } from "@/modules/listing/listing.types";

function formatPrice(price: string | null, currency: string): string {
  if (!price || price === "0") return t("listing.free");
  const num = parseFloat(price);
  if (isNaN(num)) return t("listing.free");
  return `${num.toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: string): string {
  const key = `listing.status_${status}` as Parameters<typeof t>[0];
  const val = t(key);
  return val === (key as string) ? status : val;
}

function VariantValueDisplay({ v }: { v: ListingVariantValue }) {
  const displayValue =
    v.value_type === "boolean"
      ? v.value === "1" || v.value === "true"
        ? "Evet"
        : "Hayır"
      : v.value;

  if (v.value_type === "boolean" && (v.value === "0" || v.value === "false")) return null;

  return (
    <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">
        {v.variant_name}
        {v.unit_symbol ? ` (${v.unit_symbol})` : ""}
      </span>
      <span className="font-medium text-ink">
        {v.value_type === "boolean" ? (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {displayValue}
          </span>
        ) : (
          `${displayValue}${v.unit_symbol ? " " + v.unit_symbol : ""}`
        )}
      </span>
    </div>
  );
}

interface GalleryProps {
  images: string[];
  title: string;
}

function Gallery({ images, title }: GalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
        <Tag className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-muted shadow-2xl border border-border">
        <Image
          src={images[active]}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-ink backdrop-blur-md transition-all hover:bg-white shadow-xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-ink backdrop-blur-md transition-all hover:bg-white shadow-xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <span className="absolute bottom-6 right-6 rounded-full bg-black/60 px-4 py-1.5 text-[10px] font-mono text-white backdrop-blur-md tracking-widest">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                i === active ? "border-saffron opacity-100" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="128px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingDetailProps {
  slug: string;
}

export function ListingDetail({ slug }: ListingDetailProps) {
  const { data: listing, isPending, isError } = useListingBySlugQuery(slug);
  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem);

  useEffect(() => {
    if (!listing) return;
    addRecentlyViewed({
      slug: listing.slug,
      title: listing.title,
      image: listing.image_url ?? undefined,
      price: listing.price ? parseFloat(listing.price) : undefined,
      currency: listing.currency,
      category: listing.categories?.name ?? undefined,
    });
  }, [listing, addRecentlyViewed]);

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium">{t("listing.listing_not_found")}</p>
        <Link href={ROUTES.LISTINGS} className="mt-4 inline-block text-sm text-primary hover:underline">
          {t("listing.back_to_listings")}
        </Link>
      </div>
    );
  }

  // Backend provides pre-built images array; fall back to cover image
  const images: string[] = listing.images?.length
    ? listing.images
    : listing.image_url
    ? [listing.image_url]
    : [];

  const variantValues = listing.variant_values ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
        <Link href={ROUTES.HOME} className="hover:text-saffron transition-colors">
          {t("common.home")}
        </Link>
        <span className="opacity-20">/</span>
        <Link href={ROUTES.LISTINGS} className="hover:text-saffron transition-colors">
          {t("listing.all_listings")}
        </Link>
        <span className="opacity-20">/</span>
        <span className="line-clamp-1">{listing.title}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Left: gallery + details */}
        <div className="space-y-12">
          <Gallery images={images} title={listing.title} />

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {listing.featured && (
                <span className="bg-saffron text-ink text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  ★ {t("listing.featured")}
                </span>
              )}
              <span className="bg-paper border border-border text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {getStatusLabel(listing.status)}
              </span>
            </div>
            <h1 className="font-fraunces text-3xl md:text-5xl font-medium tracking-tight text-ink leading-tight">{listing.title}</h1>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {[listing.neighborhood, listing.district, listing.city].filter(Boolean).join(", ")}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="mb-2 text-base font-semibold">{t("listing.description")}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          )}

          {/* Variant values (dynamic specs) */}
          {variantValues.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold">{t("listing.details")}</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                {variantValues.map((v, i) => (
                  <VariantValueDisplay key={`${v.variant_id}-${i}`} v={v} />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                  style={tag.color ? { backgroundColor: tag.color + "22", color: tag.color } : undefined}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: price card + meta */}
        <div className="space-y-6">
          {/* Price card */}
          <div className="rounded-[32px] bg-ink p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-saffron opacity-10 blur-3xl rounded-full" />
            
            <div className="font-fraunces text-4xl font-bold text-saffron mb-2 tabular-nums">
              {formatPrice(listing.price, listing.currency)}
            </div>
            
            {listing.is_negotiable && (
              <div className="flex items-center gap-2 mb-8">
                 <div className="h-1 w-1 rounded-full bg-saffron" />
                 <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">Fiyat pazarlığa açık</p>
              </div>
            )}

            {listing.has_cart && (
              <button
                onClick={() => {
                  addItem(listing);
                  toast.success(t("listing.added_to_cart"));
                }}
                className="w-full h-14 bg-saffron text-ink rounded-full flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/30"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("listing.add_to_cart")}
              </button>
            )}

            <div className="mt-10 space-y-4 pt-8 border-t border-white/5">
              {listing.listing_no && (
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest">
                  <span className="opacity-40">{t("listing.listing_no")}</span>
                  <span className="text-white/80 font-bold">{listing.listing_no}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest">
                <span className="opacity-40">{t("listing.published")}</span>
                <span className="text-white/80">{formatDate(listing.created_at)}</span>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link kopyalandı!");
                }
              }}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-4 text-[10px] font-mono uppercase tracking-widest text-white/70 transition-all hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" />
              {t("listing.share_listing")}
            </button>
          </div>

          {/* Back link */}
          <Link
            href={ROUTES.LISTINGS}
            className="flex items-center justify-center gap-2 py-4 rounded-full border border-black/5 text-[10px] font-mono uppercase tracking-widest text-ink opacity-50 hover:opacity-100 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("listing.back_to_listings")}
          </Link>
        </div>
      </div>
    </div>
  );
}
