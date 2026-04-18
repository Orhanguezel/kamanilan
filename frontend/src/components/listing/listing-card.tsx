"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Heart, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useLikedListings } from "@/hooks/use-liked-listings";
import { useCartStore } from "@/stores/cart-store";
import type { Listing } from "@/modules/listing/listing.types";

function formatPrice(price: string | null, currency: string): React.ReactNode {
  if (!price || price === "0") return t("listing.free");
  const num = parseFloat(price);
  if (isNaN(num)) return t("listing.free");
  return (
    <span className="font-fraunces text-lg md:text-xl font-medium tracking-tight">
      {num.toLocaleString("tr-TR")} <small className="text-xs italic opacity-70 ml-0.5">{currency === "TRY" ? "₺" : currency}</small>
    </span>
  );
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { isLiked, toggle } = useLikedListings();
  const addItem = useCartStore((s) => s.addItem);
  const liked = isLiked(listing.id);

  const imageUrl = listing.image_url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60";

  return (
    <article className="group relative flex flex-col bg-paper rounded-[20px] overflow-hidden border border-border transition-all duration-500 hover:shadow-2xl hover:border-saffron/30 hover:-translate-y-1">
      {/* ── Visual Frame ── */}
      <Link href={ROUTES.LISTING_DETAIL(listing.slug)} className="relative aspect-[16/11] w-full overflow-hidden block">
         <Image
            src={imageUrl}
            alt={listing.alt || listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
         />
         
         {/* Badges Overlay */}
         <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {listing.featured && (
               <span className="bg-saffron text-ink text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                 ★ Öne Çıkan
               </span>
            )}
            {listing.badge_text && (
               <span className="bg-ember text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                 {listing.badge_text}
               </span>
            )}
         </div>

         <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => toggle(listing.id, e)}
              aria-label={liked ? t("listing.unlike") : t("listing.like")}
              aria-pressed={liked}
              title={liked ? t("listing.unlike") : t("listing.like")}
              className={`h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg ${
                liked ? "bg-ember text-white" : "bg-white/80 text-ink hover:bg-white"
              }`}
            >
              <Heart aria-hidden="true" className={`h-4.5 w-4.5 ${liked ? "fill-current" : ""}`} />
            </button>

            {listing.has_cart && (
               <button
                 type="button"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(listing); toast.success(t("listing.added_to_cart")); }}
                 aria-label={t("listing.add_to_cart")}
                 title={t("listing.add_to_cart")}
                 className="h-9 w-9 flex items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur-md shadow-lg hover:bg-ink hover:text-saffron transition-all"
               >
                 <ShoppingCart aria-hidden="true" className="h-4.5 w-4.5" />
               </button>
            )}
         </div>
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-3">
           <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-saffron-2 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-current" />
              {listing.categories?.name || "Kategori"}
           </div>
           <div className="flex items-center gap-1.5 font-mono text-[9px] text-walnut opacity-70">
              <Clock className="h-3 w-3" />
              {formatDateShort(listing.created_at)}
           </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-fraunces text-lg md:text-xl font-medium leading-[1.3] text-ink group-hover:text-saffron-2 transition-colors mb-3">
          <Link href={ROUTES.LISTING_DETAIL(listing.slug)}>{listing.title}</Link>
        </h3>

        {/* Details Row */}
        <div className="mb-4 flex items-center gap-1.5 text-[13px] text-text-2 font-medium">
           <MapPin className="h-3.5 w-3.5 text-saffron" />
           <span className="truncate">
             {listing.neighborhood || listing.district || "Kaman"}, Kırşehir
           </span>
        </div>

        {/* Seller Info (Editorial Small) */}
        <div className="mt-auto pt-5 border-t border-border flex items-end justify-between">
           <div className="flex flex-col">
              <div className="text-ink">
                {formatPrice(listing.price, listing.currency)}
              </div>
           </div>
           
           <div className="flex items-center gap-2.5">
             <div className="text-right hidden sm:block">
               <div className="text-[10px] font-mono text-walnut uppercase tracking-wider">Satıcı</div>
               <div className="text-[12px] font-bold text-ink truncate max-w-[80px]">{(listing as any).user_name || "Özel Satıcı"}</div>
             </div>
             <div className="h-9 w-9 rounded-full bg-parchment border border-border flex items-center justify-center font-fraunces italic font-bold text-walnut relative">
               {((listing as any).user_name?.[0] || "K").toUpperCase()}
               <CheckCircle2 className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 text-blue-500 fill-white" />
             </div>
           </div>
        </div>
      </div>
    </article>
  );
}
