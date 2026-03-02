import { z } from 'zod';

const jsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type JsonLiteral = z.infer<typeof jsonLiteral>;

export type JsonLike = JsonLiteral | JsonLike[] | { [k: string]: JsonLike };

export const jsonLike: z.ZodType<JsonLike> = z.lazy(() =>
  z.union([jsonLiteral, z.array(jsonLike), z.record(jsonLike)]),
);

export const providerParamSchema = z.object({
  provider: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9_-]{1,48}$/, 'invalid_provider'),
});

export const upsertIntegrationSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  settings: z.record(jsonLike).default({}),
});

export const listIntegrationSettingsQuerySchema = z.object({
  provider: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9_-]{1,48}$/)
    .optional(),
  include_secrets: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === 'boolean') return v;
      if (typeof v !== 'string') return false;
      const s = v.trim().toLowerCase();
      return ['1', 'true', 'yes', 'on'].includes(s);
    }),
});

export type ProviderParamInput = z.infer<typeof providerParamSchema>;
export type UpsertIntegrationSettingsInput = z.infer<typeof upsertIntegrationSettingsSchema>;
export type ListIntegrationSettingsQueryInput = z.infer<typeof listIntegrationSettingsQuerySchema>;
