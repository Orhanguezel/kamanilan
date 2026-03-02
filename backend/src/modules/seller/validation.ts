import { z } from "zod";

const scopeType = z.enum(["listing", "store", "category", "subcategory", "seller"]);

export const createStoreBody = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().nullable(),
  logo_url: z.string().trim().url().max(500).optional().nullable(),
  banner_url: z.string().trim().url().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const updateStoreBody = createStoreBody.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "empty_body" },
);

export const campaignScopeInput = z.object({
  scope_type: scopeType,
  target_id: z.string().uuid(),
});

const campaignBaseBody = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().nullable(),
  discount_type: z.enum(["percent", "amount"]).default("percent"),
  discount_value: z.coerce.number().positive(),
  start_at: z.coerce.date(),
  end_at: z.coerce.date(),
  is_active: z.boolean().optional(),
  scopes: z.array(campaignScopeInput).min(1),
});

export const createCampaignBody = campaignBaseBody.refine(
  (v) => v.end_at.getTime() > v.start_at.getTime(),
  {
    message: "invalid_date_range",
    path: ["end_at"],
  },
);

export const updateCampaignBody = campaignBaseBody
  .omit({ scopes: true })
  .partial()
  .extend({
    scopes: z.array(campaignScopeInput).min(1).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "empty_body" })
  .refine(
    (v) => {
      if (!v.start_at || !v.end_at) return true;
      return v.end_at.getTime() > v.start_at.getTime();
    },
    {
      message: "invalid_date_range",
      path: ["end_at"],
    },
  );
