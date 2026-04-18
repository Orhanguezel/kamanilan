import type { Metadata } from "next";
import { t } from "@/lib/t";
import { getApiBaseUrl } from "@/lib/api-url";
import { env } from "@/env.mjs";
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
      { 
        next: { revalidate: 300 },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      },
    );
    if (!res.ok) {
       console.error(`Categories fetch failed: ${res.status}`);
       return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error("fetchCategories error:", err);
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
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (err) {
    console.error("fetchSubCategories error:", err);
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, subCategories] = await Promise.all([
    fetchCategories(),
    fetchSubCategories(),
  ]);

  return (
    <div className="bg-[hsl(var(--col-paper))] min-h-screen">
      <section className="py-20 lg:py-32">
        <div className="container">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10 border-b border-border">
            <div className="max-w-2xl">
               <div className="eyebrow mb-6">Dizin</div>
               <h1 className="font-fraunces text-4xl lg:text-6xl font-medium tracking-tight text-[hsl(var(--col-ink))] leading-[1.1]">
                 {t("category.all_categories")}
               </h1>
               <p className="mt-6 text-lg text-[hsl(var(--col-text-2))] leading-relaxed">
                 Kaman ve çevresindeki tüm yerel pazar kategorilerini keşfedin. İhtiyacınız olan her şey bir tık uzağınızda.
               </p>
            </div>
          </div>

          {!categories || categories.length === 0 ? (
            <div className="py-32 text-center bg-white/50 rounded-[32px] border border-dashed border-border">
              <div className="text-4xl mb-4">📭</div>
              <h2 className="font-fraunces text-2xl font-bold text-[hsl(var(--col-ink))]">{t("common.error")}</h2>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">Kategoriler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
            </div>
          ) : (
            <CategoriesGrid
              categories={categories}
              subCategories={subCategories}
              listingsPath={ROUTES.LISTINGS}
            />
          )}
        </div>
      </section>
    </div>
  );
}
