// =============================================================
// FILE: src/modules/newsAggregator/validation.ts
// =============================================================
import { z } from "zod";

// ──────────────────────────────────────────────────────────────
// news_sources
// ──────────────────────────────────────────────────────────────
export const sourceCreateSchema = z.object({
  name:               z.string().min(1).max(255),
  url:                z.string().url().max(1000),
  source_type:        z.enum(["rss", "og", "scrape"]).default("rss"),
  is_enabled:         z.coerce.number().int().min(0).max(1).default(1),
  fetch_interval_min: z.coerce.number().int().min(5).max(1440).default(30),
  notes:              z.string().max(1000).optional(),
  display_order:      z.coerce.number().int().min(0).default(0),
});

export const sourceUpdateSchema = sourceCreateSchema.partial();

export const sourcesListQuerySchema = z.object({
  enabled_only: z.coerce.boolean().optional(),
  limit:        z.coerce.number().int().min(1).max(200).default(200),
  offset:       z.coerce.number().int().min(0).default(0),
});

// ──────────────────────────────────────────────────────────────
// news_suggestions
// ──────────────────────────────────────────────────────────────
export const suggestionsListQuerySchema = z.object({
  status:    z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
  source_id: z.coerce.number().int().positive().optional(),
  q:         z.string().max(255).optional(),
  limit:     z.coerce.number().int().min(1).max(200).default(50),
  offset:    z.coerce.number().int().min(0).default(0),
});

export const suggestionUpdateSchema = z.object({
  title:           z.string().max(500).optional(),
  excerpt:         z.string().max(2000).optional(),
  content:         z.string().optional(),
  image_url:       z.string().url().max(1000).optional().nullable(),
  author:          z.string().max(255).optional(),
  category:        z.string().max(100).optional(),
  tags:            z.string().max(500).optional(),
  original_pub_at: z.string().datetime({ offset: true }).optional().nullable(),
});

export const approveBodySchema = z.object({
  category:         z.string().max(100).optional(),
  tags:             z.string().max(500).optional(),
  is_featured:      z.coerce.number().int().min(0).max(1).default(0),
  meta_title:       z.string().max(255).optional().nullable(),
  meta_description: z.string().max(500).optional().nullable(),
});

export const rejectBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export const dismissFeedItemSchema = z.object({
  source_url: z.string().url().max(2048),
  title:      z.string().max(500).nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type SourceCreateBody       = z.infer<typeof sourceCreateSchema>;
export type SourceUpdateBody       = z.infer<typeof sourceUpdateSchema>;
export type SourcesListQuery       = z.infer<typeof sourcesListQuerySchema>;
export type SuggestionsListQuery   = z.infer<typeof suggestionsListQuerySchema>;
export type SuggestionUpdateBody   = z.infer<typeof suggestionUpdateSchema>;
export type ApproveBody            = z.infer<typeof approveBodySchema>;
export type RejectBody             = z.infer<typeof rejectBodySchema>;
export type DismissFeedItemBody    = z.infer<typeof dismissFeedItemSchema>;
