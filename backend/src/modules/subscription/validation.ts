// =============================================================
// FILE: src/modules/subscription/validation.ts
// =============================================================
import { z } from "zod";

const emptyToNull = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === "" ? null : v), s);

// ------------------------------------------------------------------
// Plan CRUD
// ------------------------------------------------------------------
export const planCreateSchema = z.object({
  slug:          z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  name:          z.string().min(1).max(100),
  description:   emptyToNull(z.string().optional().nullable()),
  price_monthly: z.coerce.number().min(0).default(0),
  price_yearly:  z.coerce.number().min(0).optional().nullable(),
  is_active:     z.boolean().optional().default(true),
  is_default:    z.boolean().optional().default(false),
  display_order: z.coerce.number().int().min(0).optional().default(0),
});

export const planUpdateSchema = planCreateSchema.partial().superRefine((d, ctx) => {
  if (Object.keys(d).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "no_fields_to_update" });
  }
});

// ------------------------------------------------------------------
// Bulk feature upsert  (PUT /admin/subscription/plans/:id/features)
// ------------------------------------------------------------------
export const featureItemSchema = z.object({
  key:        z.string().min(1).max(100),
  value:      z.string().min(1).max(255),  // "-1", "30", "true" vs.
  is_enabled: z.boolean().optional().default(true),
});

export const featuresBulkSchema = z.object({
  features: z.array(featureItemSchema).min(1),
});

// ------------------------------------------------------------------
// Admin: kullanıcıya plan ata
// ------------------------------------------------------------------
export const assignPlanSchema = z.object({
  plan_id:    z.number().int().positive(),
  expires_at: emptyToNull(z.string().datetime().optional().nullable()),
});

export type PlanCreateInput    = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput    = z.infer<typeof planUpdateSchema>;
export type FeaturesBulkInput  = z.infer<typeof featuresBulkSchema>;
export type AssignPlanInput    = z.infer<typeof assignPlanSchema>;
