import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { properties, property_assets } from "@/modules/proporties/schema";

export async function getListingCreative(id: number | string) {
  const listingId = String(id);
  const [row] = await db.select().from(properties).where(eq(properties.id, listingId)).limit(1);
  if (!row) return null;

  const assets = await db
    .select({ url: property_assets.url })
    .from(property_assets)
    .where(eq(property_assets.property_id, listingId));
  const images = [row.image_url, ...assets.map((asset) => asset.url)].filter(
    (value): value is string => Boolean(value),
  );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    productName: row.sub_category_id ?? row.category_id ?? "İlan",
    citySlug: row.city,
    priceMin: row.price == null ? null : Number(row.price),
    priceMax: row.price == null ? null : Number(row.price),
    priceUnit: "ilan",
    currency: row.currency,
    images,
    status: row.is_active === 1 && row.status === "approved" ? "approved" : row.status,
    isSuspicious: false,
    validUntil: "9999-12-31",
  };
}
