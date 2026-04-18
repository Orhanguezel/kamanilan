// =============================================================
// FILE: src/modules/imports/validator.ts
// Row-level validation + normalizasyon
// Input : { rawRow, mapping, taxonomy (cached) }
// Output: { normalized | null, errors: string[] }
// =============================================================
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { categoryI18n } from "@/modules/categories/schema";
import { subCategories, subCategoryI18n } from "@/modules/subcategories/schema";
import { listingBrands } from "@/modules/listingBrands/schema";

// -------------------------------------------------------------
// Mapping contract
// -------------------------------------------------------------
export const importMappingSchema = z.object({
  // Zorunlu alanlar
  title:       z.string().min(1),       // kolon adi
  city:        z.string().min(1),
  district:    z.string().min(1),

  // Opsiyonel alanlar — ya kolon adi ya da literal "@literal:<deger>" pattern'i
  slug:              z.string().optional(),
  address:           z.string().optional(),
  neighborhood:      z.string().optional(),
  description:       z.string().optional(),
  excerpt:           z.string().optional(),
  price:             z.string().optional(),
  currency:          z.string().optional(),
  status:            z.string().optional(),
  category_slug:     z.string().optional(),
  sub_category_slug: z.string().optional(),
  brand_slug:        z.string().optional(),
  external_id:       z.string().optional(),
  photos:            z.string().optional(),  // virgul/line-separated URL'ler
});

export type ImportMapping = z.infer<typeof importMappingSchema>;

// -------------------------------------------------------------
// Taxonomy cache — bir import job'inda tekrar tekrar DB query atmayalim
// -------------------------------------------------------------
export type TaxonomyCache = {
  categoryIdBySlug:    Map<string, string>;
  subCategoryIdBySlug: Map<string, { id: string; categoryId: string | null }>;
  brandIdBySlug:       Map<string, string>;
};

export async function loadTaxonomyCache(locale: string = "tr"): Promise<TaxonomyCache> {
  const catRows = await db
    .select({ category_id: categoryI18n.category_id, slug: categoryI18n.slug })
    .from(categoryI18n)
    .where(eq(categoryI18n.locale, locale));

  const subRows = await db
    .select({
      id:          subCategoryI18n.sub_category_id,
      slug:        subCategoryI18n.slug,
      categoryId:  subCategories.category_id,
    })
    .from(subCategoryI18n)
    .leftJoin(subCategories, eq(subCategories.id, subCategoryI18n.sub_category_id))
    .where(eq(subCategoryI18n.locale, locale));

  const brandRows = await db
    .select({ id: listingBrands.id, slug: listingBrands.slug })
    .from(listingBrands);

  const categoryIdBySlug = new Map<string, string>();
  for (const r of catRows) {
    if (r.slug && r.category_id) categoryIdBySlug.set(r.slug.toLowerCase(), r.category_id);
  }

  const subCategoryIdBySlug = new Map<string, { id: string; categoryId: string | null }>();
  for (const r of subRows) {
    if (r.slug && r.id) {
      subCategoryIdBySlug.set(r.slug.toLowerCase(), {
        id:         r.id,
        categoryId: r.categoryId ?? null,
      });
    }
  }

  const brandIdBySlug = new Map<string, string>();
  for (const r of brandRows) {
    if (r.slug && r.id) brandIdBySlug.set(r.slug.toLowerCase(), r.id);
  }

  return { categoryIdBySlug, subCategoryIdBySlug, brandIdBySlug };
}

// -------------------------------------------------------------
// Slug generator — TR karakter → ascii
// -------------------------------------------------------------
const TR_MAP: Record<string, string> = {
  "ç": "c", "Ç": "c",
  "ğ": "g", "Ğ": "g",
  "ı": "i", "İ": "i", "I": "i",
  "ö": "o", "Ö": "o",
  "ş": "s", "Ş": "s",
  "ü": "u", "Ü": "u",
};

export function generateSlug(input: string): string {
  const lower = input
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    .toLowerCase();
  return lower
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * Ayni slug'in bu import job'inda daha once kullanilip kullanilmadigini kontrol et;
 * kullanilmissa -2, -3 suffix ekle. DB collision ayri kontrolde kalir (commit sirasinda).
 */
export function uniquifySlug(base: string, used: Set<string>): string {
  let slug = base || "ilan";
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  slug = `${base}-${i}`;
  used.add(slug);
  return slug;
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function pickValue(row: Record<string, string>, mapping: ImportMapping, key: keyof ImportMapping): string | undefined {
  const col = mapping[key];
  if (!col) return undefined;
  // "@literal:foo" pattern'i → sabit deger
  if (col.startsWith("@literal:")) return col.slice("@literal:".length);
  const v = row[col];
  return v != null && v !== "" ? v : undefined;
}

function parsePrice(raw: string | undefined): { value: number | null; error?: string } {
  if (!raw) return { value: null };
  // TR format: "1.250.000,50" → 1250000.50
  // EN format: "1,250,000.50" → 1250000.50
  const s = raw.trim().replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!s) return { value: null };

  let normalized = s;
  if (s.includes(",") && s.includes(".")) {
    // Hangisi decimal? Son karakter decimal
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      normalized = s.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    // Tek bir virgul varsa ve rakam sayisi kucukse decimal, buyukse binlik
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length <= 2) normalized = s.replace(",", ".");
    else normalized = s.replace(/,/g, "");
  }

  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return { value: null, error: "invalid_price" };
  return { value: n };
}

function parsePhotos(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^https?:\/\//i.test(s));
}

// -------------------------------------------------------------
// Normalized output
// -------------------------------------------------------------
export type NormalizedProperty = {
  id: string;                  // pre-generated UUID (commit'te kullanilacak)
  external_id: string | null;
  title: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  neighborhood: string | null;
  description: string | null;
  excerpt: string | null;
  price: number | null;
  currency: string;
  status: string;
  category_id: string | null;
  sub_category_id: string | null;
  brand_id: string | null;
  photos: string[];
};

export type ValidationResult = {
  ok: boolean;
  normalized: NormalizedProperty | null;
  errors: string[];
};

// -------------------------------------------------------------
// validateRow
// -------------------------------------------------------------
export function validateRow(
  rawRow: Record<string, string>,
  mapping: ImportMapping,
  taxonomy: TaxonomyCache,
  usedSlugs: Set<string>,
): ValidationResult {
  const errors: string[] = [];

  const title = pickValue(rawRow, mapping, "title");
  const city = pickValue(rawRow, mapping, "city");
  const district = pickValue(rawRow, mapping, "district");

  if (!title || title.length < 2) errors.push("missing_title");
  if (!city) errors.push("missing_city");
  if (!district) errors.push("missing_district");

  const rawSlug = pickValue(rawRow, mapping, "slug");
  const slugBase = rawSlug ? generateSlug(rawSlug) : generateSlug(title ?? "");
  const slug = title || rawSlug ? uniquifySlug(slugBase, usedSlugs) : "";
  if (!slug) errors.push("invalid_slug");

  const addressRaw = pickValue(rawRow, mapping, "address");
  const address = addressRaw && addressRaw.length >= 2 ? addressRaw : [district, city].filter(Boolean).join(", ");

  const priceRaw = pickValue(rawRow, mapping, "price");
  const parsedPrice = parsePrice(priceRaw);
  if (priceRaw && parsedPrice.error) errors.push(parsedPrice.error);

  const currencyRaw = pickValue(rawRow, mapping, "currency");
  const currency = (currencyRaw || "TRY").toUpperCase().slice(0, 8);

  const statusRaw = pickValue(rawRow, mapping, "status");
  const status = (statusRaw || "active").toLowerCase().slice(0, 64);

  // Taxonomy lookup (opsiyonel)
  let category_id: string | null = null;
  let sub_category_id: string | null = null;
  let brand_id: string | null = null;

  const catSlug = pickValue(rawRow, mapping, "category_slug")?.toLowerCase();
  if (catSlug) {
    const found = taxonomy.categoryIdBySlug.get(catSlug);
    if (found) category_id = found;
    else errors.push(`unknown_category:${catSlug}`);
  }

  const subSlug = pickValue(rawRow, mapping, "sub_category_slug")?.toLowerCase();
  if (subSlug) {
    const found = taxonomy.subCategoryIdBySlug.get(subSlug);
    if (found) {
      sub_category_id = found.id;
      if (!category_id && found.categoryId) category_id = found.categoryId;
    } else {
      errors.push(`unknown_subcategory:${subSlug}`);
    }
  }

  const brandSlug = pickValue(rawRow, mapping, "brand_slug")?.toLowerCase();
  if (brandSlug) {
    const found = taxonomy.brandIdBySlug.get(brandSlug);
    if (found) brand_id = found;
    else errors.push(`unknown_brand:${brandSlug}`);
  }

  const photos = parsePhotos(pickValue(rawRow, mapping, "photos"));

  const normalized: NormalizedProperty = {
    id:              randomUUID(),
    external_id:     pickValue(rawRow, mapping, "external_id") ?? null,
    title:           (title ?? "").slice(0, 255),
    slug,
    address:         address.slice(0, 500),
    district:        (district ?? "").slice(0, 255),
    city:            (city ?? "").slice(0, 255),
    neighborhood:    pickValue(rawRow, mapping, "neighborhood") ?? null,
    description:     pickValue(rawRow, mapping, "description") ?? null,
    excerpt:         pickValue(rawRow, mapping, "excerpt") ?? null,
    price:           parsedPrice.value,
    currency,
    status,
    category_id,
    sub_category_id,
    brand_id,
    photos,
  };

  return {
    ok: errors.length === 0,
    normalized: errors.length === 0 ? normalized : null,
    errors,
  };
}
