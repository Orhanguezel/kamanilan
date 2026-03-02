import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-url";
import { ROUTES } from "@/config/routes";
import type { ListingCategory } from "@/modules/listing/listing.types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchCategoryBySlug(slug: string): Promise<ListingCategory | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/categories/by-slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  const name = category?.name ?? slug;
  return {
    title: `${name} İlanları`,
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`${ROUTES.LISTINGS}?category=${encodeURIComponent(slug)}`);
}
