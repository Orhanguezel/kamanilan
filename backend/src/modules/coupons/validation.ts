import { z } from "zod";

export const couponListQuerySchema = z.object({
  q:         z.string().optional(),
  is_active: z.preprocess((v) => v === "true" || v === "1" || v === true || v === 1, z.boolean()).optional(),
  limit:     z.coerce.number().int().min(1).max(200).default(20),
  offset:    z.coerce.number().int().min(0).default(0),
  sort:      z.enum(["created_at", "updated_at", "title", "discount_value", "end_at"]).optional(),
  orderDir:  z.enum(["asc", "desc"]).default("desc"),
});

const couponBodyBase = z.object({
  code:             z.string().min(2).max(50).toUpperCase(),
  title:            z.string().min(1).max(255),
  description:      z.string().max(2000).optional().nullable(),
  discount_type:    z.enum(["percent", "amount"]).default("percent"),
  discount_value:   z.coerce.number().positive(),
  min_order_amount: z.coerce.number().min(0).optional().nullable(),
  max_discount:     z.coerce.number().min(0).optional().nullable(),
  max_uses:         z.coerce.number().int().positive().optional().nullable(),
  start_at:         z.coerce.date().optional().nullable(),
  end_at:           z.coerce.date().optional().nullable(),
  is_active:        z.preprocess((v) => v === "true" || v === "1" || v === true || v === 1, z.boolean()).default(true),
  image_url:        z.string().url().max(500).optional().nullable(),
});

export const createCouponSchema = couponBodyBase;
export const updateCouponSchema  = couponBodyBase.partial();

export type CouponListQuery  = z.infer<typeof couponListQuerySchema>;
export type CreateCouponBody = z.infer<typeof createCouponSchema>;
export type UpdateCouponBody = z.infer<typeof updateCouponSchema>;
