"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Newspaper } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useArticlesQuery } from "@/modules/articles/articles.service";
import type { Article } from "@/modules/articles/articles.types";
import { useListingsQuery } from "@/modules/listing/listing.service";
import type { Listing } from "@/modules/listing/listing.types";
import { useCategoriesQuery } from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import { formatListingPrice } from "./marketplace-home.utils";

const LISTING_FALLBACK =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=78";

function dateLabel(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(
    new Date(value),
  );
}

function ListingTile({
  listing,
  categoryName,
  priority,
}: {
  listing: Listing;
  categoryName?: string;
  priority?: boolean;
}) {
  return (
    <article className="group min-w-0 border border-black/10 bg-paper">
      <Link
        href={ROUTES.LISTING_DETAIL(listing.slug)}
        className="relative block aspect-[4/3] overflow-hidden bg-parchment"
      >
        <Image
          src={listing.image_url || LISTING_FALLBACK}
          alt={listing.alt || listing.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {listing.featured && (
          <span className="absolute left-3 top-3 bg-saffron px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-ink">
            Öne çıkan
          </span>
        )}
      </Link>
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3 font-mono text-[7px] uppercase tracking-[0.13em] text-walnut/55">
          <span className="truncate text-saffron">{categoryName || "İlan"}</span>
          <span>{dateLabel(listing.created_at)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[38px] font-fraunces text-[15px] font-medium leading-[1.25] text-ink group-hover:text-saffron">
          <Link href={ROUTES.LISTING_DETAIL(listing.slug)}>{listing.title}</Link>
        </h3>
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-black/10 pt-3">
          <strong className="text-[11px] text-ink">
            {formatListingPrice(listing.price, listing.currency)}
          </strong>
          <span className="flex min-w-0 items-center gap-1 text-[8px] text-walnut/65">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-saffron" />
            <span className="truncate">{listing.district || "Kaman"}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function NewsLead({ article }: { article: Article }) {
  const cover = article.cover_url || article.cover_image_url;
  return (
    <Link href={ROUTES.NEWS_DETAIL(article.slug)} className="group relative block min-h-[250px] overflow-hidden bg-ink">
      {cover ? (
        <Image
          src={cover}
          alt={article.alt || article.title}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <Newspaper className="absolute left-6 top-6 h-8 w-8 text-saffron" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-saffron">
          {article.category} · {dateLabel(article.published_at || article.created_at)}
        </span>
        <h3 className="mt-2 max-w-[520px] font-fraunces text-[24px] font-medium leading-tight">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

export function MarketplaceHome() {
  const { data: listingsData, isPending: listingsPending } = useListingsQuery({
    sort: "created_at",
    orderDir: "desc",
    limit: 5,
  });
  const categoriesQuery = useCategoriesQuery();
  const categories: CategoryItem[] = categoriesQuery.data ?? [];
  const { data: articles = [], isPending: articlesPending } = useArticlesQuery({
    limit: 5,
    sort: "published_at",
    order: "desc",
  });
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const listings = listingsData?.items ?? [];
  const leadArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <main className="bg-ivory py-9 md:py-12">
      <div className="container">
        <section aria-labelledby="latest-listings-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-saffron">Yeni eklenenler</p>
              <h2 id="latest-listings-title" className="mt-1 font-fraunces text-[30px] font-medium tracking-[-0.035em] text-ink">
                Yeni İlanlar
              </h2>
            </div>
            <Link href={ROUTES.LISTINGS} className="flex items-center gap-2 text-[10px] font-bold text-ink hover:text-saffron">
              Tümünü Gör <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {listingsPending ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse bg-parchment" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {listings.map((listing, index) => (
                <ListingTile
                  key={listing.id}
                  listing={listing}
                  categoryName={listing.category_id ? categoryNames.get(listing.category_id) : undefined}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="border border-black/10 bg-paper px-6 py-10 text-center">
              <p className="font-fraunces text-xl text-ink">Henüz yayınlanmış ilan yok.</p>
              <Link href={ROUTES.POST_LISTING} className="mt-3 inline-flex text-[11px] font-bold text-saffron">
                İlk ilanı sen ver
              </Link>
            </div>
          )}
        </section>

        {!articlesPending && leadArticle && (
          <section aria-labelledby="news-title" className="mt-11 border-t border-black/10 pt-9">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-saffron">Kaman&apos;dan haberler</p>
                <h2 id="news-title" className="mt-1 font-fraunces text-[30px] font-medium tracking-[-0.035em] text-ink">
                  Gündem
                </h2>
              </div>
              <Link href={ROUTES.NEWS} className="flex items-center gap-2 text-[10px] font-bold text-ink hover:text-saffron">
                Tüm Haberler <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid gap-px bg-black/10 md:grid-cols-[1.55fr_1fr]">
              <NewsLead article={leadArticle} />
              <div className="divide-y divide-black/10 bg-paper">
                {sideArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={ROUTES.NEWS_DETAIL(article.slug)}
                    className="group flex min-h-[83px] items-center gap-4 p-4 hover:bg-parchment/45"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-saffron/35 text-saffron">
                      <Newspaper className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 font-mono text-[7px] uppercase tracking-[0.15em] text-walnut/55">
                        <Clock3 className="h-2.5 w-2.5" /> {dateLabel(article.published_at || article.created_at)}
                      </span>
                      <span className="mt-1 line-clamp-2 block font-fraunces text-[15px] leading-tight text-ink group-hover:text-saffron">
                        {article.title}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
