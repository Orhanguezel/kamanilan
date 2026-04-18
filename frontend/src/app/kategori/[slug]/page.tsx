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
import { KAMAN_FOCUS_CITIES } from "@/lib/cities";

interface Props {
  params: Promise<{ slug: string }>;
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

async function fetchListingsForCategory(categoryId: string, limit: number): Promise<Listing[]> {
  try {
    const res = await fetchAPI<Listing[] | ListingListResponse>(
      API_ENDPOINTS.LISTINGS,
      { category_id: categoryId, is_active: "1", limit, sort: "created_at", orderDir: "desc" },
      "tr",
    );
    return Array.isArray(res) ? res : res.items ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);
  if (!category) {
    return { title: "Kategori Bulunamadi" };
  }
  const title = `${category.name} Ilanlari — Kaman & Kirsehir | Kamanilan`;
  const description =
    category.description ||
    `Kaman ve Kirsehir bolgesinde ${category.name.toLowerCase()} ilanlari. Guncel fiyatlarla yerel ilanlar ve emlakci vitrin ilanlari.`;
  return {
    title,
    description,
    alternates: { canonical: `/kategori/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/kategori/${slug}`,
    },
  };
}

export default async function CategoryLandingPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategory(slug);
  if (!category) notFound();

  const listings = await fetchListingsForCategory(category.id, LANDING_LIMIT);
  const listingCount = listings.length;

  const jsonLd = [
    buildCollectionPageJsonLd({
      name:        `${category.name} Ilanlari`,
      description: category.description ?? null,
      url:         `/kategori/${slug}`,
      itemCount:   listingCount,
    }),
    buildBreadcrumbJsonLd([
      { name: "Anasayfa", url: "/" },
      { name: "Kategoriler", url: "/kategoriler" },
      { name: category.name, url: `/kategori/${slug}` },
    ]),
    listings.length > 0
      ? buildItemListJsonLd(
          listings.map((l) => ({ name: l.title, url: `/ilan/${l.slug}` })),
        )
      : null,
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={jsonLd} id="category" />

      <header className="mb-8">
        <nav className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
          <Link href="/" className="hover:underline">Anasayfa</Link>
          <span>/</span>
          <Link href="/kategoriler" className="hover:underline">Kategoriler</Link>
          <span>/</span>
          <span>{category.name}</span>
        </nav>
        <h1 className="font-fraunces text-3xl md:text-4xl font-medium tracking-tight">
          {category.name} Ilanlari
        </h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">{category.description}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Kaman, Kirsehir ve cevre ilcelerinde {category.name.toLowerCase()} ilanlari.
          {listingCount > 0 ? ` Goruntulenen: ${listingCount} adet.` : " Ilanlar yakinda."}
        </p>
      </header>

      <section className="mb-8 border-t border-b py-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Sehir bazli {category.name.toLowerCase()}
        </h2>
        <div className="flex flex-wrap gap-2">
          {KAMAN_FOCUS_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${slug}/${c.slug}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-accent"
            >
              {c.displayName}
            </Link>
          ))}
        </div>
      </section>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Bu kategoride henuz ilan yok.</p>
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
              href={`${ROUTES.LISTINGS}?category=${encodeURIComponent(slug)}`}
              className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm hover:bg-accent"
            >
              Tum {category.name.toLowerCase()} ilanlarini gor →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
