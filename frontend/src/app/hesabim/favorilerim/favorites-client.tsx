"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useLikedListings } from "@/hooks/use-liked-listings";
import { useFavoriteListingsQuery } from "@/modules/favorites/favorites.service";
import { ListingCard } from "@/components/listing/listing-card";

interface Props {
  translations: {
    favorites: string;
    favorites_empty: string;
    favorites_empty_desc: string;
    favorites_count: string;
    browse_listings: string;
    loading: string;
  };
}

export function FavoriteListingsClient({ translations: tr }: Props) {
  const { liked } = useLikedListings();
  const ids = Array.from(liked);

  const { data, isLoading } = useFavoriteListingsQuery(ids);

  // Filter locally so de-liked items disappear immediately on toggle
  const listings = (data?.items ?? []).filter((l) => liked.has(l.id));

  if (isLoading && ids.length > 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        {tr.loading}
      </div>
    );
  }

  if (ids.length === 0 || listings.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{tr.favorites}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr.favorites_empty}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{tr.favorites_empty_desc}</p>
        </div>
        <Link
          href={ROUTES.LISTINGS}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {tr.browse_listings}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{tr.favorites}</h1>
        <span className="text-sm text-muted-foreground">
          {listings.length} {tr.favorites_count}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
