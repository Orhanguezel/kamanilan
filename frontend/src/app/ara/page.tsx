import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";

interface SearchProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchProps): Promise<Metadata> {
  const sp = await searchParams;
  const query = sp.q || "";
  return {
    title: query ? t("seo.search_title", { query }) : t("seo.listings_title"),
  };
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const query = sp.q || "";

  // Redirect to listings page with search query
  redirect(query ? `${ROUTES.LISTINGS}?q=${encodeURIComponent(query)}` : ROUTES.LISTINGS);
}
