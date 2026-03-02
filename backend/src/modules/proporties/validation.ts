// =============================================================
// FILE: src/modules/properties/validation.ts
// CLEAN: category_id/sub_category_id; kind enums removed
// =============================================================
import { z } from "zod";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

export const currencySchema = z.string().trim().min(1).max(8).default("TRY");

const num = z.coerce.number();

// "" -> undefined; null preserved; string->number coerce
const coerceNullableNonNegNumber = z.preprocess((v) => {
  if (v === "" || typeof v === "undefined") return undefined;
  if (v === null) return null;
  return v;
}, z.coerce.number().finite().nonnegative().nullable());

// =============================================================
// Helpers: query array normalize
// =============================================================
const toArrayFromQuery = (v: unknown): string[] | undefined => {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return undefined;
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  return undefined;
};

// =============================================================
// Variant value schema
// =============================================================
export const variantValueSchema = z.object({
  variant_id: z.string().uuid(),
  value:      z.string().max(500),
});

export type VariantValueInput = z.infer<typeof variantValueSchema>;

// =============================================================
// LIST QUERY
// =============================================================
const SELECT_KEYS = ["items", "total", "meta"] as const;

export const propertyListQuerySchema = z.object({
  order:    z.string().optional(),
  sort:     z.enum(["created_at", "updated_at", "price"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),

  limit:  z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  is_active: boolLike.optional(),
  featured:  boolLike.optional(),

  q:            z.string().trim().optional(),
  slug:         z.string().trim().optional(),
  district:     z.string().trim().optional(),
  city:         z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),

  status:         z.string().trim().optional(),
  brand_id:       z.string().uuid().optional(),
  category_id:    z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),

  tag_ids: z.preprocess(toArrayFromQuery, z.array(z.string().uuid()).max(100)).optional(),

  price_min: num.nonnegative().optional(),
  price_max: num.nonnegative().optional(),

  created_from: z.string().datetime().optional(),
  created_to:   z.string().datetime().optional(),

  select: z.preprocess(toArrayFromQuery, z.array(z.enum(SELECT_KEYS)).max(10)).optional(),
});

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;

// =============================================================
// Common detail fields (create/update body)
// =============================================================
const propertyDetailsSchema = z.object({
  price:           coerceNullableNonNegNumber.optional(),
  currency:        currencySchema.optional(),
  is_negotiable:   boolLike.optional(),
  min_price_admin: coerceNullableNonNegNumber.optional(),

  listing_no: z.string().trim().max(32).nullable().optional(),
  badge_text: z.string().trim().max(40).nullable().optional(),
  featured:   boolLike.optional(),

  meta_title:       z.string().trim().max(255).nullable().optional(),
  meta_description: z.string().trim().max(500).nullable().optional(),

  has_video:        boolLike.optional(),
  has_clip:         boolLike.optional(),
  has_virtual_tour: boolLike.optional(),
  has_map:          boolLike.optional(),

  image_url:      z.string().url().nullable().optional(),
  image_asset_id: z.string().trim().length(36).nullable().optional(),
  alt:            z.string().trim().max(255).nullable().optional(),

  neighborhood:    z.string().trim().max(255).nullable().optional(),
  brand_id:        z.string().uuid().nullable().optional(),
  category_id:     z.string().uuid().nullable().optional(),
  sub_category_id: z.string().uuid().nullable().optional(),

  tag_ids:        z.array(z.string().uuid()).max(100).nullable().optional(),
  variant_values: z.array(variantValueSchema).optional(),
});

// =============================================================
// Assets item schema
// =============================================================
const uuid36          = z.string().trim().length(36);
const assetClientIdSchema = z.string().trim().min(1).max(80).optional();

const assetItemSchema = z
  .object({
    id:            assetClientIdSchema,
    asset_id:      uuid36.nullable().optional(),
    url:           z.string().trim().min(1).nullable().optional(),
    alt:           z.string().trim().max(255).nullable().optional(),
    kind:          z.enum(["image", "video", "plan"]).optional().default("image"),
    mime:          z.string().trim().max(100).nullable().optional(),
    is_cover:      boolLike.optional(),
    display_order: z.coerce.number().int().min(0).optional().default(0),
  })
  .refine(
    (v) =>
      (typeof v.asset_id === "string" && v.asset_id.length === 36) ||
      (typeof v.url === "string" && v.url.trim().length > 0),
    { message: "asset_id_or_url_required" },
  );

// =============================================================
// CREATE / UPSERT body
// =============================================================
const coordinatesSchema = z
  .object({
    lat: z.coerce.number().finite(),
    lng: z.coerce.number().finite(),
  })
  .strict();

export const upsertPropertyBodySchema = z
  .object({
    title: z.string().min(2).max(255).trim(),
    slug: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
      .trim(),

    status: z.string().min(1).max(64).trim(),

    address:  z.string().min(2).max(500).trim(),
    district: z.string().min(1).max(255).trim(),
    city:     z.string().min(1).max(255).trim(),

    // coordinates optional
    coordinates: coordinatesSchema.nullable().optional(),

    excerpt:     z.string().max(500).nullable().optional(),
    description: z.string().max(5000).nullable().optional(),

    is_active:     boolLike.optional().default(true),
    display_order: z.coerce.number().int().min(0).optional().default(0),

    assets: z.array(assetItemSchema).optional(),
  })
  .merge(propertyDetailsSchema);

export type UpsertPropertyBody = z.infer<typeof upsertPropertyBodySchema>;

// =============================================================
// PATCH body (all optional)
// =============================================================
export const patchPropertyBodySchema = z
  .object({
    title: upsertPropertyBodySchema.shape.title.optional(),
    slug:  upsertPropertyBodySchema.shape.slug.optional(),

    status: upsertPropertyBodySchema.shape.status.optional(),

    address:  upsertPropertyBodySchema.shape.address.optional(),
    district: upsertPropertyBodySchema.shape.district.optional(),
    city:     upsertPropertyBodySchema.shape.city.optional(),

    coordinates: z
      .object({
        lat: z.coerce.number().finite().optional(),
        lng: z.coerce.number().finite().optional(),
      })
      .optional(),

    excerpt:     upsertPropertyBodySchema.shape.excerpt.optional(),
    description: upsertPropertyBodySchema.shape.description.optional(),

    is_active:     upsertPropertyBodySchema.shape.is_active.optional(),
    display_order: upsertPropertyBodySchema.shape.display_order.optional(),

    assets: z.array(assetItemSchema).optional(),
  })
  .merge(propertyDetailsSchema.partial());

export type PatchPropertyBody = z.infer<typeof patchPropertyBodySchema>;
