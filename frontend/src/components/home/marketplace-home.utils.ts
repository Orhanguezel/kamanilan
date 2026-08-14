import type { CategoryItem } from "@/modules/site/site.type";

export const HOME_CATEGORY_SLUGS = [
  "emlak-kira",
  "arac-motosiklet",
  "hayvan-tarim",
  "usta-hizmet",
  "ikinci-el",
] as const;

export function pickHomeCategories(categories: CategoryItem[], limit = 5): CategoryItem[] {
  const active = categories.filter((category) => category.is_active);
  const bySlug = new Map(active.map((category) => [category.slug, category]));
  const preferred = HOME_CATEGORY_SLUGS.flatMap((slug) => {
    const category = bySlug.get(slug);
    return category ? [category] : [];
  });
  const preferredIds = new Set(preferred.map((category) => category.id));
  const fallback = active
    .filter((category) => !preferredIds.has(category.id))
    .sort((a, b) => a.display_order - b.display_order);
  return [...preferred, ...fallback].slice(0, limit);
}

export function formatListingPrice(price: string | null, currency: string): string {
  if (!price) return "Fiyat için iletişime geçin";
  const amount = Number(price);
  if (!Number.isFinite(amount)) return price;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}
