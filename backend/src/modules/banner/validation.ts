// =============================================================
// FILE: src/modules/banner/validation.ts
// =============================================================
import { z } from "zod";

const urlOrRelative = z
  .string()
  .trim()
  .refine((v) => {
    if (!v) return false;
    if (v.startsWith("/")) return true;
    return /^https?:\/\//i.test(v);
  }, "invalid_url");

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const publicListQuerySchema = z.object({
  /** Virgülle ayrılmış banner ID'leri: "1,2" */
  ids: z.string().optional(),
  /** Ana sayfa satır numarası (1/2/3) — bu parametre gelirse sadece o satırın bannerları döner */
  desktop_row: z.coerce.number().int().min(0).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(0).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["display_order", "title", "created_at", "updated_at"]).default("display_order"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const adminListQuerySchema = publicListQuerySchema.extend({
  is_active: z.coerce.boolean().optional(),
});

const colorField = z.string().max(30).optional().nullable();

export const createSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),

  subtitle: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),

  image_url: urlOrRelative.optional().nullable(),
  image_asset_id: z.string().uuid().optional().nullable(),
  alt: z.string().max(255).optional().nullable(),

  thumbnail_url: urlOrRelative.optional().nullable(),
  thumbnail_asset_id: z.string().uuid().optional().nullable(),

  background_color: colorField,
  title_color: colorField,
  description_color: colorField,

  button_text: z.string().max(100).optional().nullable(),
  button_color: colorField,
  button_hover_color: colorField,
  button_text_color: colorField,

  link_url: z.string().max(500).optional().nullable(),
  link_target: z.enum(["_self", "_blank"]).optional().default("_self"),

  is_active: z.coerce.boolean().optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),

  desktop_row: z.coerce.number().int().min(0).max(99).optional().default(0),
  desktop_columns: z.coerce.number().int().min(1).max(3).optional().default(1),

  advertiser_name: z.string().max(255).optional().nullable(),
  contact_info: z.string().max(500).optional().nullable(),

  start_at: z.coerce.date().optional().nullable(),
  end_at: z.coerce.date().optional().nullable(),
});

export const updateSchema = createSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1),
});

export const setStatusSchema = z.object({
  is_active: z.coerce.boolean(),
});

export const setImageSchema = z.object({
  asset_id: z.string().uuid().nullable().optional(),
});

export type PublicListQuery = z.infer<typeof publicListQuerySchema>;
export type AdminListQuery  = z.infer<typeof adminListQuerySchema>;
export type CreateBody      = z.infer<typeof createSchema>;
export type UpdateBody      = z.infer<typeof updateSchema>;
export type SetImageBody    = z.infer<typeof setImageSchema>;
