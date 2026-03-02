import { z } from 'zod';

const boolLike = z.union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')]);

export const variantValueTypes = ['text', 'number', 'boolean', 'single_select', 'multi_select'] as const;

export const variantListQuerySchema = z.object({
  q: z.string().trim().optional(),
  category_id: z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),
  unit_id: z.string().uuid().optional(),
  value_type: z.enum(variantValueTypes).optional(),
  is_active: boolLike.optional(),
  is_filterable: boolLike.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['name', 'display_order', 'created_at', 'updated_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const variantCreateSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalid_slug'),
  description: z.string().trim().max(500).nullable().optional(),
  value_type: z.enum(variantValueTypes).default('text'),
  category_id: z.string().uuid(),
  sub_category_id: z.string().uuid().nullable().optional(),
  unit_id: z.string().uuid().nullable().optional(),
  options_json: z.array(z.string().trim().min(1).max(120)).max(200).nullable().optional(),
  is_required: boolLike.optional().default(false),
  is_filterable: boolLike.optional().default(true),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(0),
});

export const variantPatchSchema = variantCreateSchema.partial();

export type VariantListQuery = z.infer<typeof variantListQuerySchema>;
export type VariantCreateBody = z.infer<typeof variantCreateSchema>;
export type VariantPatchBody = z.infer<typeof variantPatchSchema>;

