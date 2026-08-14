"use client";

import type { ReactNode } from "react";
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

function SectionHeading({
  id,
  title,
  href,
  action,
}: {
  id: string;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-4">
      <h2
        id={id}
        className="font-fraunces text-[26px] font-medium leading-tight tracking-[-0.035em] text-ink"
      >
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-2 text-[10px] font-bold text-ink transition-colors hover:text-saffron"
      >
        {action} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
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
          sizes="(max-width: 640px) 80vw, (max-width: 1279px) 33vw, 13vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {listing.featured ? (
          <span className="absolute left-3 top-3 bg-saffron px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-ink">
            Öne çıkan
          </span>
        ) : null}
      </Link>
      <div className="p-1.5">
        <div className="flex items-center justify-between gap-3 font-mono text-[7px] uppercase tracking-[0.13em] text-walnut/55">
          <span className="truncate text-saffron">{categoryName || "İlan"}</span>
          <span>{dateLabel(listing.created_at)}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-[30px] font-fraunces text-[13px] font-medium leading-[1.15] text-ink group-hover:text-saffron">
          <Link href={ROUTES.LISTING_DETAIL(listing.slug)}>{listing.title}</Link>
        </h3>
        <div className="mt-1.5 flex items-end justify-between gap-2 border-t border-black/10 pt-1.5">
          <strong className="text-[10px] text-ink">
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
    <Link
      href={ROUTES.NEWS_DETAIL(article.slug)}
      className="group grid min-h-[142px] overflow-hidden border border-black/10 bg-paper sm:grid-cols-[1.3fr_0.9fr] xl:grid-cols-[1.3fr_0.9fr]"
    >
      <span className="relative block min-h-[142px] overflow-hidden bg-ink">
        {cover ? (
          <Image
            src={cover}
            alt={article.alt || article.title}
            fill
            sizes="(max-width: 1279px) 100vw, 32vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <Newspaper className="absolute left-6 top-6 h-8 w-8 text-saffron" />
        )}
      </span>
      <span className="flex flex-col justify-center p-4">
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-saffron">
          {article.category} · {dateLabel(article.published_at || article.created_at)}
        </span>
        <strong className="mt-2 block font-fraunces text-[18px] font-medium leading-tight text-ink group-hover:text-saffron">
          {article.title}
        </strong>
        {article.excerpt ? (
          <span className="mt-2 line-clamp-3 block text-[10px] leading-4 text-walnut/65">
            {article.excerpt}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function NewsRow({ article }: { article: Article }) {
  const cover = article.cover_url || article.cover_image_url;

  return (
    <Link
      href={ROUTES.NEWS_DETAIL(article.slug)}
      className="group grid min-h-[58px] grid-cols-[58px_1fr] items-center gap-3 border-b border-black/10 py-2 last:border-b-0"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-parchment">
        {cover ? (
          <Image
            src={cover}
            alt={article.alt || article.title}
            fill
            sizes="58px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Newspaper className="absolute inset-0 m-auto h-4 w-4 text-saffron" />
        )}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-mono text-[7px] uppercase tracking-[0.15em] text-walnut/55">
          <Clock3 className="h-2.5 w-2.5" /> {dateLabel(article.published_at || article.created_at)}
        </span>
        <span className="mt-1 line-clamp-2 block font-fraunces text-[14px] leading-tight text-ink group-hover:text-saffron">
          {article.title}
        </span>
      </span>
    </Link>
  );
}

export function MarketplaceHome({ sponsorSection }: { sponsorSection?: ReactNode }) {
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
    <main className="bg-ivory py-6 md:py-4 xl:py-1">
      <div className="container px-6 lg:px-12 xl:px-16">
        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_475px]">
          <div className="min-w-0 xl:border-r xl:border-black/10 xl:pr-8">
            <section aria-labelledby="latest-listings-title">
              <SectionHeading
                id="latest-listings-title"
                title="Yeni İlanlar"
                href={ROUTES.LISTINGS}
                action="Tümünü Gör"
              />

              {listingsPending ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="aspect-[3/4] animate-pulse bg-parchment" />
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {listings.map((listing, index) => (
                    <ListingTile
                      key={listing.id}
                      listing={listing}
                      categoryName={
                        listing.category_id ? categoryNames.get(listing.category_id) : undefined
                      }
                      priority={index < 2}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-black/10 bg-paper px-6 py-10 text-center">
                  <p className="font-fraunces text-xl text-ink">Henüz yayınlanmış ilan yok.</p>
                  <Link
                    href={ROUTES.POST_LISTING}
                    className="mt-3 inline-flex text-[11px] font-bold text-saffron"
                  >
                    İlk ilanı sen ver
                  </Link>
                </div>
              )}
            </section>

            {sponsorSection ? <div className="mt-3">{sponsorSection}</div> : null}
          </div>

          {!articlesPending && leadArticle ? (
            <section aria-labelledby="news-title" className="min-w-0">
              <SectionHeading
                id="news-title"
                title="Gündem"
                href={ROUTES.NEWS}
                action="Tüm Haberler"
              />
              <NewsLead article={leadArticle} />
              <div className="mt-1 bg-paper px-3">
                {sideArticles.map((article) => (
                  <NewsRow key={article.id} article={article} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
