// =============================================================
// FILE: src/modules/myListings/validation.ts
// İlan verme / kullanıcıya ait ilanlar — doğrulama şemaları
// =============================================================
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["created_at", "updated_at", "price", "display_order"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const coerceNullableNum = z.preprocess((v) => {
  if (v === "" || v === undefined) return undefined;
  if (v === null) return null;
  return v;
}, z.coerce.number().finite().nonnegative().nullable());

export const createListingSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),

  // Kategori / alt kategori
  category_id:     z.string().uuid().optional().nullable(),
  sub_category_id: z.string().uuid().optional().nullable(),

  type: z.string().min(1).max(255),
  status: z.string().min(1).max(64),
  sub_type: z.string().max(64).optional().nullable(),

  address: z.string().min(1).max(500),
  district: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  neighborhood: z.string().max(255).optional().nullable(),

  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),

  description: z.string().optional().nullable(),
  specs_json: z.record(z.unknown()).optional().nullable(),

  price: coerceNullableNum,
  currency: z.string().min(1).max(8).default("TRY"),

  badge_text: z.string().max(40).optional().nullable(),
  featured: z.coerce.boolean().optional().default(false),

  gross_m2: z.coerce.number().int().nonnegative().optional().nullable(),
  net_m2: z.coerce.number().int().nonnegative().optional().nullable(),

  rooms: z.string().max(16).optional().nullable(),
  bedrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  building_age: z.string().max(32).optional().nullable(),

  floor: z.string().max(32).optional().nullable(),
  floor_no: z.coerce.number().int().optional().nullable(),
  total_floors: z.coerce.number().int().nonnegative().optional().nullable(),

  heating: z.string().max(64).optional().nullable(),
  usage_status: z.string().max(32).optional().nullable(),

  furnished: z.coerce.boolean().optional().default(false),
  in_site: z.coerce.boolean().optional().default(false),
  has_elevator: z.coerce.boolean().optional().default(false),
  has_parking: z.coerce.boolean().optional().default(false),
  has_balcony: z.coerce.boolean().optional().default(false),
  has_garden: z.coerce.boolean().optional().default(false),
  has_terrace: z.coerce.boolean().optional().default(false),
  credit_eligible: z.coerce.boolean().optional().default(false),
  swap: z.coerce.boolean().optional().default(false),

  image_url: z.string().url().optional().nullable(),
  image_asset_id: z.string().uuid().optional().nullable(),
  alt: z.string().max(255).optional().nullable(),

  is_active: z.coerce.boolean().optional().default(false), // pasif → admin onayı
  display_order: z.coerce.number().int().min(0).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const toggleSchema = z.object({
  is_active: z.coerce.boolean(),
});

export type ListQuery       = z.infer<typeof listQuerySchema>;
export type CreateListing   = z.infer<typeof createListingSchema>;
export type UpdateListing   = z.infer<typeof updateListingSchema>;
