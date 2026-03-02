// =============================================================
// FILE: src/modules/announcements/validation.ts
// =============================================================
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const publicListQuerySchema = z.object({
  locale:   z.string().optional().default("tr"),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  q:        z.string().optional(),
  limit:    z.coerce.number().int().min(0).max(100).default(10),
  offset:   z.coerce.number().int().min(0).default(0),
  sort:     z.enum(["published_at", "created_at", "display_order"]).default("published_at"),
  order:    z.enum(["asc", "desc"]).default("desc"),
});

export const adminListQuerySchema = publicListQuerySchema.extend({
  is_published: z.coerce.boolean().optional(),
  is_featured:  z.coerce.boolean().optional(),
});

export const createSchema = z.object({
  locale:   z.string().max(10).optional().default("tr"),
  title:    z.string().min(1).max(255),
  slug:     z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt:  z.string().max(500).optional().nullable(),
  content:  z.string().optional().nullable(),
  category: z.enum(["duyuru", "haber", "kampanya", "etkinlik", "guncelleme"]).optional().default("duyuru"),

  cover_image_url: z.string().url().optional().nullable(),
  cover_asset_id:  z.string().uuid().optional().nullable(),
  alt:             z.string().max(255).optional().nullable(),

  author: z.string().max(255).optional().nullable(),

  meta_title:       z.string().max(255).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),

  is_published: z.coerce.boolean().optional().default(false),
  is_featured:  z.coerce.boolean().optional().default(false),
  display_order: z.coerce.number().int().min(0).optional(),

  published_at: z.coerce.date().optional().nullable(),
});

export const updateSchema = createSchema.partial();

export const setStatusSchema = z.object({
  is_published: z.coerce.boolean(),
});

export type PublicListQuery = z.infer<typeof publicListQuerySchema>;
export type AdminListQuery  = z.infer<typeof adminListQuerySchema>;
export type CreateBody      = z.infer<typeof createSchema>;
export type UpdateBody      = z.infer<typeof updateSchema>;
