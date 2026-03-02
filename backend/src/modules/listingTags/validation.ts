import { z } from 'zod';

const boolLike = z.union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')]);

export const listingTagListQuerySchema = z.object({
  q: z.string().trim().optional(),
  category_id: z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),
  is_active: boolLike.optional(),
  limit: z.coerce.number().int().min(1).max(300).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['name', 'display_order', 'created_at', 'updated_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const listingTagCreateSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalid_slug'),
  description: z.string().trim().max(500).nullable().optional(),
  category_id: z.string().uuid(),
  sub_category_id: z.string().uuid().nullable().optional(),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(0),
});

export const listingTagPatchSchema = listingTagCreateSchema.partial();

export type ListingTagListQuery = z.infer<typeof listingTagListQuerySchema>;
export type ListingTagCreateBody = z.infer<typeof listingTagCreateSchema>;
export type ListingTagPatchBody = z.infer<typeof listingTagPatchSchema>;
