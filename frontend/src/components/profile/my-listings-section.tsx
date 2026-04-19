"use client";

import Link from "next/link";
import { Loader2, Plus, ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useMyListingsQuery } from "@/modules/listing/my-listing.service";
import { ROUTES } from "@/config/routes";
import type { Listing } from "@/modules/listing/listing.types";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatPrice(price: string | null, currency: string) {
  if (!price) return "";
  const n = Number(price);
  if (!Number.isFinite(n)) return "";
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 0,
  });
  return formatter.format(n);
}

function StatusBadge({ listing }: { listing: Listing }) {
  // is_active true → yayında, false → onay bekliyor / pasif
  if (listing.is_active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Yayında
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
      <Clock className="h-3 w-3" />
      Onay Bekliyor
    </span>
  );
}

export function MyListingsSection() {
  const { data, isPending, isError, refetch } = useMyListingsQuery({
    limit: 6,
    sort: "created_at",
    orderDir: "desc",
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">İlanlarım</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {total > 0
              ? `Toplam ${total} ilan${total > 6 ? ` · son 6 tanesi gösteriliyor` : ""}`
              : "Henüz ilan vermedin"}
          </p>
        </div>
        <Link
          href={ROUTES.POST_LISTING}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni İlan
        </Link>
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-md bg-destructive/10 p-3 text-sm">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            İlanlar yüklenemedi.
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-destructive underline"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {!isPending && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">Henüz ilan vermedin.</p>
          <Link
            href={ROUTES.POST_LISTING}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            İlk İlanını Ver
          </Link>
        </div>
      )}

      {!isPending && !isError && items.length > 0 && (
        <div className="space-y-3">
          {items.map((listing) => {
            const image = listing.image_url ?? null;
            const price = formatPrice(listing.price, listing.currency);
            const detailHref = ROUTES.LISTING_DETAIL(listing.slug);

            return (
              <Link
                key={listing.id}
                href={detailHref}
                className="group flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      Görsel Yok
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                      {listing.title}
                    </h3>
                    <StatusBadge listing={listing} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {listing.city && <span>{listing.city}</span>}
                    {price && <span className="font-semibold text-foreground">{price}</span>}
                    {listing.created_at && <span>{formatDate(listing.created_at)}</span>}
                    <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider">
                      #{listing.listing_no ?? listing.id.slice(0, 6)}
                    </span>
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}

          {total > items.length && (
            <Link
              href={ROUTES.MY_LISTINGS}
              className="mt-4 block rounded-md border border-dashed py-3 text-center text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Tümünü Gör ({total}) →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
