"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Tag, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { FlashListingItem } from "@/modules/flash-sale/flash-sale.types";

function formatPrice(price: string | null, currency: string): string {
  if (!price || price === "0") return "Ücretsiz";
  const num = parseFloat(price);
  if (isNaN(num)) return "Ücretsiz";
  return `${num.toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
}

const STATUS_LABELS: Record<string, string> = {
  satilik:  "Satılık",
  kiralik:  "Kiralık",
  takas:    "Takas",
  ihtiyac:  "İhtiyaç",
  ucretsiz: "Ücretsiz",
};

interface FlashListingCardProps {
  item: FlashListingItem;
}

export function FlashListingCard({ item }: FlashListingCardProps) {
  const hasDiscount = item.flash_price !== null && item.price !== item.flash_price;

  return (
    <Link
      href={ROUTES.LISTING_DETAIL(item.slug)}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Görsel */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 480px) 50vw, 20vw"
          />
        ) : (
          <Tag className="h-8 w-8 text-white/30" />
        )}

        {/* Sol üst: durum etiketi */}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
          {STATUS_LABELS[item.status] ?? item.status}
        </span>

        {/* Sağ üst: indirim rozeti */}
        {hasDiscount && item.discount_label && (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow">
            <Zap className="h-3 w-3" />
            {item.discount_label}
          </span>
        )}
      </div>

      {/* İçerik */}
      <div className="flex flex-1 flex-col px-2.5 py-2">
        {/* Başlık */}
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-primary">
          {item.title}
        </h3>

        {/* Konum */}
        <div className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="line-clamp-1">
            {item.neighborhood
              ? `${item.neighborhood}, ${item.district}`
              : item.district}
          </span>
        </div>

        {/* Fiyat */}
        <div className="mt-auto flex items-baseline gap-1 pt-1.5">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-primary leading-tight">
                {formatPrice(item.flash_price, item.currency)}
              </span>
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(item.price, item.currency)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-primary leading-tight">
              {formatPrice(item.price, item.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}