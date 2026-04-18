import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Listing } from "@/modules/listing/listing.types";
import { ListingDetail } from "@/components/listing/listing-detail";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildPropertyJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";

async function fetchListing(slug: string): Promise<Listing | null> {
  try {
    return await fetchAPI<Listing>(`${API_ENDPOINTS.LISTING_BY_SLUG}/${slug}`, {}, "tr");
  } catch {
    return null;
  }
}

function extractImageUrls(listing: Listing): string[] {
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    return listing.images.filter((u): u is string => !!u);
  }
  if (Array.isArray(listing.assets)) {
    return listing.assets
      .map((a) => a.url)
      .filter((u): u is string => !!u);
  }
  if (listing.image_url) return [listing.image_url];
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await fetchListing(slug);
  if (!listing) {
    return {
      title: t("seo.listing_detail_title", { title: slug }),
      description: t("seo.listings_description"),
    };
  }

  const title = listing.meta_title || `${listing.title} — ${listing.district}, ${listing.city}`;
  const description =
    listing.meta_description ||
    listing.excerpt ||
    (listing.description ? listing.description.slice(0, 180) : t("seo.listings_description"));
  const images = extractImageUrls(listing);

  return {
    title,
    description,
    alternates: { canonical: `/ilan/${listing.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/ilan/${listing.slug}`,
      images: images.length > 0 ? images.slice(0, 4) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? images.slice(0, 1) : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const listing = await fetchListing(slug);

  // Listing yoksa client component yine 404/hata gosterir, ama JSON-LD'yi atla
  const jsonLd = listing
    ? [
        buildPropertyJsonLd({
          id:           listing.id,
          slug:         listing.slug,
          title:        listing.title,
          description:  listing.description ?? listing.excerpt ?? null,
          price:        listing.price,
          currency:     listing.currency,
          images:       extractImageUrls(listing),
          city:         listing.city,
          district:     listing.district,
          neighborhood: listing.neighborhood ?? null,
          address:      listing.address,
          updatedAt:    listing.updated_at,
          createdAt:    listing.created_at,
          categoryName: listing.categories?.name ?? null,
        }),
        buildBreadcrumbJsonLd([
          { name: "Anasayfa", url: "/" },
          { name: "Ilanlar", url: "/ilanlar" },
          ...(listing.categories?.name
            ? [{ name: listing.categories.name, url: `/kategori/${listing.category_id ?? ""}` }]
            : []),
          { name: listing.title, url: `/ilan/${listing.slug}` },
        ]),
      ]
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={jsonLd} id="listing" />
      <ListingDetail slug={slug} initialListing={listing} />
    </div>
  );
}
