import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Listing, ListingCategory, ListingListResponse } from "@/modules/listing/listing.types";
import { ROUTES } from "@/config/routes";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/json-ld";
import { ListingCard } from "@/components/listing/listing-card";
import { getCityBySlug, priorityCities } from "@/lib/cities";

interface Props {
  params: Promise<{ slug: string; city: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";
const LANDING_LIMIT = 12;

async function fetchCategory(slug: string): Promise<ListingCategory | null> {
  try {
    return await fetchAPI<ListingCategory>(`/categories/by-slug/${encodeURIComponent(slug)}`, {}, "tr");
  } catch {
    return null;
  }
}

async function fetchListings(categoryId: string, cityDisplayName: string, limit: number): Promise<Listing[]> {
  try {
    const res = await fetchAPI<Listing[] | ListingListResponse>(
      API_ENDPOINTS.LISTINGS,
      {
        category_id: categoryId,
        city:        cityDisplayName,
        is_active:   "1",
        limit,
        sort:        "created_at",
        orderDir:    "desc",
      },
      "tr",
    );
    return Array.isArray(res) ? res : res.items ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, city } = await params;
  const cityDef = getCityBySlug(city);
  if (!cityDef) return { title: "Sayfa Bulunamadi" };

  const category = await fetchCategory(slug);
  if (!category) return { title: "Kategori Bulunamadi" };

  const title = `${cityDef.displayName} ${category.name} Ilanlari | Kamanilan`;
  const description = `${cityDef.displayName}${cityDef.parent ? ` (${cityDef.parent})` : ""} bolgesinde ${category.name.toLowerCase()} ilanlari. Yerel satici ve emlakcilerden guncel vitrin.`;

  return {
    title,
    description,
    alternates: { canonical: `/kategori/${slug}/${city}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/kategori/${slug}/${city}`,
    },
  };
}

export default async function CategoryCityLandingPage({ params }: Props) {
  const { slug, city } = await params;

  const cityDef = getCityBySlug(city);
  if (!cityDef) notFound();

  const category = await fetchCategory(slug);
  if (!category) notFound();

  const listings = await fetchListings(category.id, cityDef.displayName, LANDING_LIMIT);
  const listingCount = listings.length;

  const pageTitle = `${cityDef.displayName} ${category.name} Ilanlari`;

  const jsonLd = [
    buildCollectionPageJsonLd({
      name:        pageTitle,
      description: `${cityDef.displayName} bolgesinde ${category.name.toLowerCase()} ilanlari.`,
      url:         `/kategori/${slug}/${city}`,
      itemCount:   listingCount,
    }),
    buildBreadcrumbJsonLd([
      { name: "Anasayfa", url: "/" },
      { name: "Kategoriler", url: "/kategoriler" },
      { name: category.name, url: `/kategori/${slug}` },
      { name: cityDef.displayName, url: `/kategori/${slug}/${city}` },
    ]),
    listings.length > 0
      ? buildItemListJsonLd(
          listings.map((l) => ({ name: l.title, url: `/ilan/${l.slug}` })),
        )
      : null,
  ];

  const otherCities = priorityCities().filter((c) => c.slug !== city).slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={jsonLd} id="category-city" />

      <header className="mb-8">
        <nav className="text-xs text-muted-foreground mb-2 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:underline">Anasayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:underline">Kategoriler</Link>
          <span>/</span>
          <Link href={`/kategori/${slug}`} className="hover:underline">{category.name}</Link>
          <span>/</span>
          <span>{cityDef.displayName}</span>
        </nav>
        <h1 className="font-fraunces text-3xl md:text-4xl font-medium tracking-tight">
          {pageTitle}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
          {cityDef.displayName}
          {cityDef.parent ? ` (${cityDef.parent})` : ""} bolgesinde {category.name.toLowerCase()}
          {" "}ilanlari.{listingCount > 0 ? ` Bu sayfada ${listingCount} aktif ilan goruntuleniyor.` : " Ilanlar yakinda."}
        </p>
      </header>

      <section className="mb-8 border-t border-b py-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Diger sehirlerde {category.name.toLowerCase()}
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherCities.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${slug}/${c.slug}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-accent"
            >
              {c.displayName}
            </Link>
          ))}
          <Link
            href={`/kategori/${slug}`}
            className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm"
          >
            Tum sehirler →
          </Link>
        </div>
      </section>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {cityDef.displayName}'da bu kategoride henuz ilan yok.
          </p>
          <Link
            href={ROUTES.POST_LISTING}
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Ilk ilani sen ver
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </section>

          <div className="mt-10 text-center">
            <Link
              href={`${ROUTES.LISTINGS}?category=${encodeURIComponent(slug)}&city=${encodeURIComponent(cityDef.displayName)}`}
              className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm hover:bg-accent"
            >
              Tum {cityDef.displayName} {category.name.toLowerCase()} ilanlarini gor →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
