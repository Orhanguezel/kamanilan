// =============================================================
// FILE: src/modules/newsAggregator/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@vps/shared-backend/middleware/auth";
import { requireAdmin } from "@vps/shared-backend/middleware/roles";
import {
  adminListSources,
  adminGetSource,
  adminCreateSource,
  adminUpdateSource,
  adminDeleteSource,
  adminFetchSource,
  adminFetchAllSources,
  adminPreviewUrl,
  adminGetLiveFeed,
  adminQuickApprove,
  adminAiEnhanceLive,
  adminDismissFeedItem,
  adminListSuggestions,
  adminGetSuggestion,
  adminUpdateSuggestion,
  adminApproveSuggestion,
  adminRejectSuggestion,
  adminDeleteSuggestion,
  adminFetchSuggestionFromSource,
  adminAiEnhanceSuggestion,
} from "./admin.controller";

export async function registerNewsAggregatorAdmin(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireAdmin] };

  // ── News Sources ──────────────────────────────────────────
  // Static routes MUST be registered before parametric :id routes
  app.get<{ Querystring: unknown }>(
    "/news-sources",
    guard,
    adminListSources
  );
  /** Canlı RSS feed — DB'ye kaydetmez */
  app.get<{ Querystring: unknown }>(
    "/news-sources/live-feed",
    guard,
    adminGetLiveFeed
  );
  app.get<{ Params: { id: string } }>(
    "/news-sources/:id",
    guard,
    adminGetSource
  );
  app.post<{ Body: unknown }>(
    "/news-sources",
    guard,
    adminCreateSource
  );
  /** Manuel fetch — tümü */
  app.post(
    "/news-sources/fetch-all",
    guard,
    adminFetchAllSources
  );
  /** OG önizleme */
  app.post<{ Body: unknown }>(
    "/news-sources/preview-url",
    guard,
    adminPreviewUrl
  );
  /** Canlı haber öğesini doğrudan makaleye dönüştür */
  app.post<{ Body: unknown }>(
    "/news-sources/quick-approve",
    guard,
    adminQuickApprove
  );
  /** Ham canlı haber verisini AI ile geliştir */
  app.post<{ Body: unknown }>(
    "/news-sources/ai-enhance-live",
    guard,
    adminAiEnhanceLive
  );
  /** Canlı haber öğesini kalıcı olarak gizle */
  app.post<{ Body: unknown }>(
    "/news-sources/dismiss-feed-item",
    guard,
    adminDismissFeedItem
  );
  app.patch<{ Params: { id: string }; Body: unknown }>(
    "/news-sources/:id",
    guard,
    adminUpdateSource
  );
  app.delete<{ Params: { id: string } }>(
    "/news-sources/:id",
    guard,
    adminDeleteSource
  );
  /** Manuel fetch — tek kaynak */
  app.post<{ Params: { id: string } }>(
    "/news-sources/:id/fetch",
    guard,
    adminFetchSource
  );

  // ── News Suggestions ──────────────────────────────────────
  app.get<{ Querystring: unknown }>(
    "/news-suggestions",
    guard,
    adminListSuggestions
  );
  app.get<{ Params: { id: string } }>(
    "/news-suggestions/:id",
    guard,
    adminGetSuggestion
  );
  app.patch<{ Params: { id: string }; Body: unknown }>(
    "/news-suggestions/:id",
    guard,
    adminUpdateSuggestion
  );
  app.post<{ Params: { id: string }; Body: unknown }>(
    "/news-suggestions/:id/approve",
    guard,
    adminApproveSuggestion
  );
  app.post<{ Params: { id: string }; Body: unknown }>(
    "/news-suggestions/:id/reject",
    guard,
    adminRejectSuggestion
  );
  app.delete<{ Params: { id: string } }>(
    "/news-suggestions/:id",
    guard,
    adminDeleteSuggestion
  );
  /** Kaynak URL'den içerik çek */
  app.post<{ Params: { id: string } }>(
    "/news-suggestions/:id/fetch-source",
    guard,
    adminFetchSuggestionFromSource
  );
  /** AI ile içerik geliştir */
  app.post<{ Params: { id: string } }>(
    "/news-suggestions/:id/ai-enhance",
    guard,
    adminAiEnhanceSuggestion
  );
}
