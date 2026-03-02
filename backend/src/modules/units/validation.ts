import { z } from 'zod';

export const unitListQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.string().trim().optional(),
  is_active: z.union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['name', 'type', 'display_order', 'created_at', 'updated_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const unitCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalid_slug'),
  symbol: z.string().trim().min(1).max(20),
  type: z.string().trim().min(2).max(24).default('custom'),
  precision: z.coerce.number().int().min(0).max(8).optional().default(0),
  is_active: z.union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')]).optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(0),
});

export const unitPatchSchema = unitCreateSchema.partial();

export type UnitListQuery = z.infer<typeof unitListQuerySchema>;
export type UnitCreateBody = z.infer<typeof unitCreateSchema>;
export type UnitPatchBody = z.infer<typeof unitPatchSchema>;

