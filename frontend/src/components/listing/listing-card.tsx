"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Tag, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useLikedListings } from "@/hooks/use-liked-listings";
import { useCartStore } from "@/stores/cart-store";
import type { Listing } from "@/modules/listing/listing.types";

function formatPrice(price: string | null, currency: string): string {
  if (!price || price === "0") return t("listing.free");
  const num = parseFloat(price);
  if (isNaN(num)) return t("listing.free");
  return `${num.toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    satilik: "Satılık",
    kiralik: "Kiralık",
    takas: "Takas",
    ihtiyac: "İhtiyaç",
    ucretsiz: "Ücretsiz",
    tukendi: "Tükendi",
  };
  return map[status] ?? status;
}

const STATUS_COLORS: Record<string, string> = {
  satilik: "bg-blue-600",
  kiralik: "bg-emerald-600",
  takas: "bg-violet-600",
  ihtiyac: "bg-orange-600",
  ucretsiz: "bg-gray-600",
  tukendi: "bg-red-600",
};

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { isLiked, toggle } = useLikedListings();
  const addItem = useCartStore((s) => s.addItem);
  const liked = isLiked(listing.id);

  const imageUrl = listing.image_url ?? null;
  const m2    = listing.variant_values?.find((v) => v.variant_slug === "net-metrekare");
  const rooms = listing.variant_values?.find((v) => v.variant_slug === "oda-sayisi");

  const statusColor = STATUS_COLORS[listing.status] ?? "bg-gray-600";

  return (
    <Link
      href={ROUTES.LISTING_DETAIL(listing.slug)}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.alt ?? listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Tag className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Top-left: featured / badge */}
        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
          {listing.featured && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow">
              {t("listing.featured")}
            </span>
          )}
          {listing.badge_text && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow">
              {listing.badge_text}
            </span>
          )}
        </div>

        {/* Top-right: status + like + cart */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white shadow ${statusColor}`}>
            {getStatusLabel(listing.status)}
          </span>

          {/* Cart button */}
          {listing.has_cart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(listing);
                toast.success(t("listing.added_to_cart"));
              }}
              aria-label="Sepete ekle"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-primary shadow transition-colors hover:bg-white backdrop-blur-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Like button */}
          <button
            onClick={(e) => toggle(listing.id, e)}
            aria-label={liked ? "Beğeniyi kaldır" : "Beğen"}
            className={`flex h-6 w-6 items-center justify-center rounded-full shadow transition-colors ${
              liked
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-400 backdrop-blur-sm"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-2.5 py-2">
        {/* Title */}
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-primary">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="line-clamp-1">
            {listing.neighborhood
              ? `${listing.neighborhood}, ${listing.district}`
              : listing.district}
          </span>
        </div>

        {/* Variant chips: rooms + m2 */}
        {(rooms || m2) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {rooms && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {rooms.value}
              </span>
            )}
            {m2 && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {m2.value} m²
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-1.5">
          <span className="text-sm font-bold text-primary leading-tight">
            {formatPrice(listing.price, listing.currency)}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {formatDateShort(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
