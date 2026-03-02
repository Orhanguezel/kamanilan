import type { Metadata } from "next";
import { t } from "@/lib/t";
import { getApiBaseUrl } from "@/lib/api-url";
import { ROUTES } from "@/config/routes";
import type { ListingCategory, ListingSubCategory } from "@/modules/listing/listing.types";
import { CategoriesGrid } from "./categories-client";

export const metadata: Metadata = {
  title: t("category.all_categories"),
  description: t("seo.categories_description"),
};

async function fetchCategories(): Promise<ListingCategory[]> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(
      `${base}/categories?is_active=1&limit=100&sort=display_order&order=asc`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchSubCategories(): Promise<ListingSubCategory[]> {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(
      `${base}/sub-categories?is_active=1&limit=200&sort=display_order&order=asc`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, subCategories] = await Promise.all([
    fetchCategories(),
    fetchSubCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t("category.all_categories")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("category.browse_categories")}</p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">{t("common.error")}</p>
        </div>
      ) : (
        <CategoriesGrid
          categories={categories}
          subCategories={subCategories}
          listingsPath={ROUTES.LISTINGS}
        />
      )}
    </div>
  );
}
