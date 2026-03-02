import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Geçerli bir hex renk girin (örn: #2563eb)');

const colorTokensSchema = z.object({
  primary:     hexColor.optional(),
  secondary:   hexColor.optional(),
  accent:      hexColor.optional(),
  background:  hexColor.optional(),
  foreground:  hexColor.optional(),
  muted:       hexColor.optional(),
  mutedFg:     hexColor.optional(),
  border:      hexColor.optional(),
  destructive: hexColor.optional(),
  success:     hexColor.optional(),
  navBg:       hexColor.optional(),
  navFg:       hexColor.optional(),
  footerBg:    hexColor.optional(),
  footerFg:    hexColor.optional(),
}).strict();

const sectionConfigSchema = z.object({
  key:     z.string().min(1).max(50),
  enabled: z.boolean(),
  order:   z.number().min(0).max(99),          // float sıra numarası izni (ör: 5.5, 7.5)
  label:   z.string().max(100),
  colsLg:  z.number().int().min(1).max(12),
  colsMd:  z.number().int().min(1).max(12),
  colsSm:  z.number().int().min(1).max(12),
  limit:   z.number().int().min(1).max(100).nullable(),
  variant: z.string().max(50).optional(),
}).passthrough();                               // rowId, span, adBannerPos gibi extra alanları koru

const pageConfigSchema = z.object({
  variant:      z.string().max(50).optional(),
  heroStyle:    z.string().max(50).optional(),
  defaultView:  z.string().max(50).optional(),
  filtersStyle: z.string().max(50).optional(),
}).passthrough();

const newsSectionSchema = z.object({
  key:       z.string().min(1).max(50),
  enabled:   z.boolean(),
  order:     z.number().int().min(0).max(99),
  label:     z.string().max(100),
  count:     z.number().int().min(1).max(200).nullable().optional(),
  cols:      z.number().int().min(1).max(4).optional(),
  bannerIds: z.string().max(200).optional(),
});

const layoutBlockConfigSchema = z.object({
  banner_span:     z.union([z.literal(4), z.literal(6), z.literal(12)]).optional(),
  flash_sale_span: z.union([z.literal(4), z.literal(6), z.literal(12)]).optional(),
}).passthrough();

const layoutBlockSchema = z.object({
  id:               z.string().min(1).max(100),
  type:             z.string().min(1).max(60),
  // Admin UI allows 1..99 instance values (e.g. banner_section__40).
  instance:         z.number().int().min(1).max(99),
  enabled_disabled: z.enum(['on', 'off']),
  config:           layoutBlockConfigSchema.optional(),
});

export const themeUpdateSchema = z.object({
  colors:             colorTokensSchema.optional(),
  radius:             z.enum(['0rem', '0.3rem', '0.375rem', '0.5rem', '0.75rem', '1rem', '1.5rem']).optional(),
  fontFamily:         z.string().max(100).nullable().optional(),
  darkMode:           z.enum(['light', 'dark', 'system']).optional(),
  sections:           z.array(sectionConfigSchema).min(0).max(20).optional(),
  pages:              z.record(z.string(), pageConfigSchema).optional(),
  newsListSections:   z.array(newsSectionSchema).min(0).max(20).optional(),
  newsDetailSections: z.array(newsSectionSchema).min(0).max(20).optional(),
  layout_blocks:      z.array(layoutBlockSchema).min(0).max(30).optional(),
});

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;
