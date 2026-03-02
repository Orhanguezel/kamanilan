"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, X } from "lucide-react";
import { ROUTES } from "@/config/routes";

interface Props {
  translations: Record<string, string>;
}

export function SonGoruntulenenlerClient({ translations: tr }: Props) {
  const items = useRecentlyViewedStore((s) => s.items);
  const removeItem = useRecentlyViewedStore((s) => s.removeItem);
  const clearAll = useRecentlyViewedStore((s) => s.clearAll);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{tr.recently_viewed}</h2>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {tr.clear_history}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Clock className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">{tr.no_recently_viewed}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.slug}
              className="group relative rounded-lg border p-3 hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => removeItem(item.slug)}
                className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                aria-label="Kaldır"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <Link href={ROUTES.LISTING_DETAIL(item.slug)} className="flex gap-3">
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded bg-muted" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  {item.category && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                  )}
                  {item.price != null && (
                    <p className="text-sm font-semibold mt-1">
                      {Number(item.price).toLocaleString("tr-TR")}{" "}
                      {item.currency ?? "TL"}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
