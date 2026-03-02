"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
    <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">
        {v.variant_name}
        {v.unit_symbol ? ` (${v.unit_symbol})` : ""}
      </span>
      <span className="font-medium">
        {v.value_type === "boolean" ? (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
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
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="96px" />
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
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link href={ROUTES.LISTINGS} className="hover:text-foreground">
          {t("listing.all_listings")}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-foreground">{listing.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: gallery + details */}
        <div className="space-y-6">
          <Gallery images={images} title={listing.title} />

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {listing.featured && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                  {t("listing.featured")}
                </span>
              )}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {getStatusLabel(listing.status)}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-foreground">{listing.title}</h1>
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
        <div className="space-y-4">
          {/* Price card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(listing.price, listing.currency)}
            </div>
            {listing.is_negotiable && (
              <p className="mt-1 text-xs text-muted-foreground">Fiyat pazarlığa açık</p>
            )}

            {listing.has_cart && (
              <button
                onClick={() => {
                  addItem(listing);
                  toast.success(t("listing.added_to_cart"));
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("listing.add_to_cart")}
              </button>
            )}

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              {listing.listing_no && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span>
                    {t("listing.listing_no")}: {listing.listing_no}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {t("listing.published")}: {formatDate(listing.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{listing.district}</span>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border bg-muted px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/80"
            >
              <Share2 className="h-4 w-4" />
              {t("listing.share_listing")}
            </button>
          </div>

          {/* Back link */}
          <Link
            href={ROUTES.LISTINGS}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("listing.back_to_listings")}
          </Link>
        </div>
      </div>
    </div>
  );
}
