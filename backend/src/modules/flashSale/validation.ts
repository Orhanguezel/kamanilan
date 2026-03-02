import { z } from 'zod';

const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal('0'),
  z.literal('1'),
  z.literal('true'),
  z.literal('false'),
]);

const discountType = z.enum(['percent', 'amount']);
const scopeType = z.enum(['all', 'categories', 'subcategories', 'properties', 'sellers']);

const nullableStr = (maxLen: number) => z.string().max(maxLen).nullable().optional();

export const flashSaleListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(['created_at', 'updated_at', 'display_order', 'start_at', 'end_at', 'title']).optional(),
  orderDir: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional(),
  active_now: boolLike.optional(),
  q: z.string().optional(),
  locale: z.string().max(10).optional(),
  slug: z.string().optional(),
  ids: z.string().optional(), // virgülle ayrılmış flash sale ID'leri: "1,2,3"
});

export type FlashSaleListQuery = z.infer<typeof flashSaleListQuerySchema>;

const flashSaleBaseSchema = z.object({
  title: z.string().min(1).max(160).trim(),
  slug: z
    .string()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug sadece küçük harf, rakam ve tire içermelidir')
    .trim(),
  locale: z.string().max(10).optional(),
  description: z.string().max(10000).nullable().optional(),
  discount_type: discountType.default('percent'),
  discount_value: z.coerce.number().positive(),
  start_at: z.coerce.date(),
  end_at: z.coerce.date(),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),
  // Kapsam
  scope_type: scopeType.default('all'),
  scope_ids: z.array(z.string()).optional().default([]),
  // Görsel alanlar
  cover_image_url: nullableStr(2000),
  cover_asset_id: nullableStr(36),
  background_color: nullableStr(20),
  title_color: nullableStr(20),
  description_color: nullableStr(20),
  button_text: nullableStr(100),
  button_url: nullableStr(500),
  button_bg_color: nullableStr(20),
  button_text_color: nullableStr(20),
  timer_bg_color: nullableStr(20),
  timer_text_color: nullableStr(20),
});

export const flashSaleUpsertSchema = flashSaleBaseSchema.superRefine((v, ctx) => {
  if (v.end_at <= v.start_at) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_at'],
      message: 'end_at start_at değerinden büyük olmalıdır',
    });
  }
  if (v.discount_type === 'percent' && v.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discount_value'],
      message: 'percent indirim 100 değerini aşamaz',
    });
  }
});

export const flashSalePatchSchema = flashSaleBaseSchema.partial().superRefine((v, ctx) => {
  if (v.start_at && v.end_at && v.end_at <= v.start_at) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_at'],
      message: 'end_at start_at değerinden büyük olmalıdır',
    });
  }
  if (v.discount_type === 'percent' && typeof v.discount_value === 'number' && v.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discount_value'],
      message: 'percent indirim 100 değerini aşamaz',
    });
  }
});

export type FlashSaleUpsertBody = z.infer<typeof flashSaleUpsertSchema>;
export type FlashSalePatchBody = z.infer<typeof flashSalePatchSchema>;
