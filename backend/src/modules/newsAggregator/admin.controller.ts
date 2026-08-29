// =============================================================
// FILE: src/modules/newsAggregator/admin.controller.ts
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListSources,
  repoGetSourceById,
  repoCreateSource,
  repoUpdateSource,
  repoDeleteSource,
  repoListSuggestions,
  repoCountSuggestions,
  repoGetSuggestionById,
  repoUpdateSuggestion,
  repoFillMissingSuggestionFields,
  repoApproveSuggestion,
  repoRejectSuggestion,
  repoDeleteSuggestion,
  repoGetBlockedFeedUrls,
  repoInsertDismissedUrl,
  repoSetSuggestionAiStatus,
  repoListImageQueue,
} from "./repository";
import {
  sourcesListQuerySchema,
  sourceCreateSchema,
  sourceUpdateSchema,
  suggestionsListQuerySchema,
  suggestionUpdateSchema,
  approveBodySchema,
  rejectBodySchema,
  dismissFeedItemSchema,
  idParamSchema,
} from "./validation";
import { fetchSource } from "./fetchService";
import { fetchRssFeed, fetchOgData, fetchArticleContent } from "./fetcher";
import { repoCreate as repoCreateArticle } from "@/modules/articles/repository";
import { rewriteSuggestionWithAi } from "./aiRewrite";
import { evaluateEditorialCandidate } from "./editorialPolicy";

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

/** Türkçe karakterleri dönüştürür ve URL-güvenli slug üretir. */
function makeSlug(title: string, suffix: string | number): string {
  return (
    title
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 240) + `-${suffix}`
  );
}

// ──────────────────────────────────────────────────────────────
// SOURCES
// ──────────────────────────────────────────────────────────────

export async function adminListSources(req: FastifyRequest, reply: FastifyReply) {
  const q = sourcesListQuerySchema.parse(req.query);
  const rows = await repoListSources(q);
  reply.header("x-total-count", String(rows.length));
  return reply.send(rows);
}

export async function adminGetSource(req: FastifyRequest, reply: FastifyReply) {
  // Guard against route conflict: static /live-feed may be captured by /:id
  // on servers that haven't been restarted after route-order fix
  const params = req.params as { id: string };
  if (params.id === "live-feed") return adminGetLiveFeed(req, reply);

  const { id } = idParamSchema.parse(req.params);
  const row = await repoGetSourceById(id);
  if (!row) return reply.code(404).send({ error: "not_found" });
  return reply.send(row);
}

export async function adminCreateSource(req: FastifyRequest, reply: FastifyReply) {
  const body = sourceCreateSchema.parse(req.body);
  const row  = await repoCreateSource(body);
  return reply.code(201).send(row);
}

export async function adminUpdateSource(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body   = sourceUpdateSchema.parse(req.body);
  const row    = await repoUpdateSource(id, body);
  if (!row) return reply.code(404).send({ error: "not_found" });
  return reply.send(row);
}

export async function adminDeleteSource(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  await repoDeleteSource(id);
  return reply.code(204).send();
}

/** Manuel fetch — tek kaynak */
export async function adminFetchSource(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const source = await repoGetSourceById(id);
  if (!source) return reply.code(404).send({ error: "not_found" });

  const result = await fetchSource(source);
  return reply.send({ ok: true, ...result });
}

/** Manuel fetch — tüm aktif kaynaklar */
export async function adminFetchAllSources(req: FastifyRequest, reply: FastifyReply) {
  const { fetchAllSources } = await import("./fetchService");
  const result = await fetchAllSources();
  return reply.send({ ok: true, ...result });
}

/** OG tag parser — URL yapıştırarak önizleme */
export async function adminPreviewUrl(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as { url?: string };
  if (!body?.url || typeof body.url !== "string") {
    return reply.code(400).send({ error: "url_required" });
  }
  try {
    const og = await fetchOgData(body.url.trim());
    return reply.send(og);
  } catch (err: unknown) {
    return reply.code(422).send({ error: "fetch_failed", message: err instanceof Error ? err.message : String(err) });
  }
}

// ──────────────────────────────────────────────────────────────
// LIVE FEED — RSS kaynakları anlık göster, DB'ye kaydetme
// ──────────────────────────────────────────────────────────────

export interface LiveFeedItem {
  source_id:       number;
  source_name:     string;
  source_url:      string;
  title:           string | null;
  excerpt:         string | null;
  content:         string | null;
  image_url:       string | null;
  author:          string | null;
  original_pub_at: string | null;
}

// Fallback RSS sources used when DB has no enabled sources
const FALLBACK_RSS_SOURCES = [
  { id: 0, name: "Kırşehir Haber Türk", url: "https://www.kirsehirhaberturk.com/rss.xml" },
  { id: 0, name: "Kırşehir Haber 40", url: "https://kirsehirhaber40.com/rss" },
  { id: 0, name: "Google News - Kaman", url: "https://news.google.com/rss/search?q=Kaman+K%C4%B1r%C5%9Fehir&hl=tr&gl=TR&ceid=TR:tr" },
  { id: 0, name: "Google News - Kırşehir", url: "https://news.google.com/rss/search?q=K%C4%B1r%C5%9Fehir&hl=tr&gl=TR&ceid=TR:tr" },
];

/** Tüm aktif RSS kaynaklarından canlı olarak haber listesi döner (DB'ye kaydetmez) */
export async function adminGetLiveFeed(req: FastifyRequest, reply: FastifyReply) {
  const query = req.query as { source_id?: string; q?: string; limit?: string };
  const filterSourceId = query.source_id ? Number(query.source_id) : undefined;
  const filterQ        = query.q?.trim().toLowerCase() ?? "";
  const limit          = Math.min(Number(query.limit ?? 50), 200);

  const dbSources = await repoListSources({ enabled_only: true, limit: 100, offset: 0 });
  const dbRss = filterSourceId
    ? dbSources.filter((s) => s.id === filterSourceId)
    : dbSources.filter((s) => s.source_type === "rss");

  // Use DB sources if available, otherwise fall back to hardcoded defaults
  type FeedSource = { id: number; name: string; url: string };
  const feedSources: FeedSource[] = dbRss.length > 0 ? dbRss : FALLBACK_RSS_SOURCES;

  const items: LiveFeedItem[] = [];
  const sourceErrors: string[] = [];

  // Fetch RSS feeds and blocked URLs in parallel
  const [, blockedUrls] = await Promise.all([
    Promise.allSettled(
      feedSources.map(async (source) => {
        try {
          const feed = await fetchRssFeed(source.url, 30);
          req.log.info(`[live-feed] ${source.name}: ${feed.length} items`);
          for (const item of feed) {
            items.push({
              source_id:       source.id,
              source_name:     source.name,
              source_url:      item.source_url,
              title:           item.title,
              excerpt:         item.excerpt,
              content:         item.content,
              image_url:       item.image_url,
              author:          item.author,
              original_pub_at: item.original_pub_at?.toISOString() ?? null,
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          req.log.warn(`[live-feed] ${source.name} failed: ${msg}`);
          sourceErrors.push(`${source.name}: ${msg}`);
        }
      }),
    ),
    repoGetBlockedFeedUrls(),
  ]);

  // Sort by date desc
  items.sort((a, b) => {
    const da = a.original_pub_at ? new Date(a.original_pub_at).getTime() : 0;
    const db = b.original_pub_at ? new Date(b.original_pub_at).getTime() : 0;
    return db - da;
  });

  // Deduplicate by title prefix
  const seen = new Set<string>();
  const unique: LiveFeedItem[] = [];
  for (const item of items) {
    const key = (item.title ?? "").toLowerCase().slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  // Filter out already-approved and dismissed URLs
  const notBlocked = unique.filter((i) =>
    !blockedUrls.has(i.source_url) && evaluateEditorialCandidate(i).allowed,
  );

  // Filter by keyword
  const results = filterQ
    ? notBlocked.filter((i) =>
        (i.title ?? "").toLowerCase().includes(filterQ) ||
        (i.excerpt ?? "").toLowerCase().includes(filterQ),
      )
    : notBlocked;

  const page = results.slice(0, limit);
  reply.header("x-total-count", String(results.length));
  return reply.send({
    items:        page,
    total:        results.length,
    source_count: feedSources.length,
    errors:       sourceErrors,
  });
}

/** Canlı haber öğesini kalıcı olarak gizle (dismiss) — yenileme sonrası gelmez */
export async function adminDismissFeedItem(req: FastifyRequest, reply: FastifyReply) {
  const body = dismissFeedItemSchema.parse(req.body);
  await repoInsertDismissedUrl(body.source_url, body.title ?? null);
  return reply.send({ ok: true });
}

/** Canlı haber öğesini doğrudan makaleye dönüştür (DB suggestions tablosuna kaydetmez) */
export async function adminQuickApprove(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as {
    source_url:       string;
    title:            string;
    excerpt?:         string | null;
    content?:         string | null;
    image_url?:       string | null;
    author?:          string | null;
    source_name?:     string | null;
    category?:        string;
    tags?:            string | null;
    meta_title?:      string | null;
    meta_description?: string | null;
    fetch_content?:   boolean;
    editorial_rewrite_confirmed?: boolean;
  };

  if (!body?.source_url || !body?.title) {
    return reply.code(400).send({ error: "source_url_and_title_required" });
  }
  if (body.editorial_rewrite_confirmed !== true) {
    return reply.code(422).send({ error: "editorial_rewrite_required" });
  }
  const policy = evaluateEditorialCandidate(body);
  if (!policy.allowed) {
    return reply.code(422).send({ error: "editorial_policy", reasons: policy.reasons });
  }

  let content = body.content ?? null;

  // Optionally fetch full content from source page
  if (body.fetch_content && !content) {
    try {
      content = await fetchArticleContent(body.source_url);
    } catch { /* content stays null */ }
  }

  // Strip HTML from excerpt
  const cleanExcerpt = body.excerpt
    ? body.excerpt.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 500) || undefined
    : undefined;

  const title = body.title.trim();
  const slug = makeSlug(title, Date.now());

  try {
    const created = await repoCreateArticle({
      locale:           "tr",
      title,
      slug,
      excerpt:          cleanExcerpt,
      content:          content ?? undefined,
      category:         (body.category ?? "genel") as any,
      // Kaynak görseli taşınmaz; kapak yalnız yerel görsel hattından eklenir.
      cover_image_url:  undefined,
      alt:              undefined,
      video_url:        undefined,
      author:           body.author ?? undefined,
      source:           body.source_name ?? undefined,
      source_url:       body.source_url,
      tags:             body.tags ?? undefined,
      reading_time:     0,
      meta_title:       body.meta_title ?? undefined,
      meta_description: body.meta_description ?? undefined,
      is_published:     0,
      is_featured:      0,
      display_order:    0,
      published_at:     undefined,
    } as any);

    return reply.send({ ok: true, article_id: created.row.id });
  } catch (err: unknown) {
    return reply.code(422).send({ error: "create_failed", message: err instanceof Error ? err.message : String(err) });
  }
}

// ── AI Enhance Live — DB'siz, ham veriyi AI ile geliştir ──────
export async function adminAiEnhanceLive(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as {
    title?:      string;
    excerpt?:    string;
    content?:    string;
    source_url?: string;
    category?:   string;
    tags?:       string;
  };

  const sourceUrl = (body.source_url ?? "").trim();
  const policy = evaluateEditorialCandidate(body);
  if (!policy.allowed) {
    return reply.code(422).send({ error: "editorial_policy", reasons: policy.reasons });
  }

  try {
    const rewritten = await rewriteSuggestionWithAi({
      title: body.title ?? null,
      excerpt: body.excerpt ?? null,
      content: body.content ?? null,
      source_url: sourceUrl,
      source_name: "Kaynak",
      category: body.category ?? "yerel",
    } as any);
    return reply.send({
      ok: true,
      title: rewritten.title,
      excerpt: rewritten.excerpt,
      content: rewritten.content,
      meta_title: rewritten.meta_title,
      meta_description: rewritten.meta_description,
      tags: rewritten.tags.join(", "),
      image_brief: rewritten.image_brief,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return reply.code(message === "ai_not_configured" ? 503 : 422).send({ error: message, message });
  }
}

// ──────────────────────────────────────────────────────────────
// SUGGESTIONS (mevcut kayıtlı öneriler için — yeni öneriler DB'ye kaydedilmez)
// ──────────────────────────────────────────────────────────────

export async function adminListSuggestions(req: FastifyRequest, reply: FastifyReply) {
  const q = suggestionsListQuerySchema.parse(req.query);
  const [rows, total] = await Promise.all([
    repoListSuggestions(q),
    repoCountSuggestions(q),
  ]);
  reply.header("x-total-count", String(total));
  return reply.send(rows);
}

export async function adminGetSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const row = await repoGetSuggestionById(id);
  if (!row) return reply.code(404).send({ error: "not_found" });
  return reply.send(row);
}

export async function adminUpdateSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body   = suggestionUpdateSchema.parse(req.body);
  const row    = await repoUpdateSuggestion(id, body);
  if (!row) return reply.code(404).send({ error: "not_found" });
  return reply.send(row);
}

/** Onayla → articles tablosuna taslak olarak ekle */
export async function adminApproveSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body   = approveBodySchema.parse(req.body);

  const sug = await repoGetSuggestionById(id);
  if (!sug) return reply.code(404).send({ error: "not_found" });
  if (sug.status === "approved") {
    return reply.code(409).send({ error: "already_approved", article_id: sug.article_id });
  }
  if (sug.ai_status !== "done") {
    return reply.code(422).send({ error: "local_ai_rewrite_required" });
  }
  if (sug.image_status !== "received" && sug.image_status !== "attached") {
    return reply.code(422).send({ error: "local_image_required" });
  }

  const title = (sug.ai_title ?? sug.title ?? "").trim();
  if (!title) return reply.code(422).send({ error: "title_required" });

  const slug = makeSlug(title, sug.id);

  const selectedExcerpt = sug.ai_excerpt ?? sug.excerpt;
  const cleanExcerpt = selectedExcerpt
    ? selectedExcerpt.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 500) || undefined
    : undefined;
  let articleContent = sug.ai_content ?? sug.content ?? undefined;
  if (sug.internal_links) {
    try {
      const links = JSON.parse(sug.internal_links) as Array<{ label: string; url: string }>;
      const safeLinks = links.filter((link) => link.url.startsWith("/")).slice(0, 4);
      if (safeLinks.length >= 2) articleContent = `${articleContent ?? ""}<aside aria-label="İlgili bağlantılar"><h2>İlgili bağlantılar</h2><ul>${safeLinks.map((link) => `<li><a href="${link.url}">${link.label}</a></li>`).join("")}</ul></aside>`;
    } catch { /* invalid legacy value: publish without links */ }
  }

  const created = await repoCreateArticle({
    locale:           "tr",
    title,
    slug,
    excerpt:          cleanExcerpt,
    content:          articleContent,
    category:         (body.category ?? sug.category ?? "genel") as any,
    cover_image_url:  sug.image_url  ?? undefined,
    alt:              undefined,
    video_url:        undefined,
    author:           sug.author    ?? undefined,
    source:           sug.source_name ?? undefined,
    source_url:       sug.source_url  ?? undefined,
    tags:             (body.tags ?? sug.ai_tags ?? sug.tags) ?? undefined,
    reading_time:     0,
    meta_title:       body.meta_title ?? sug.ai_meta_title ?? undefined,
    meta_description: body.meta_description ?? sug.ai_meta_description ?? undefined,
    is_published:     0,
    is_featured:      body.is_featured ?? 0,
    display_order:    0,
    published_at:     undefined,
  } as any);

  await repoApproveSuggestion(id, created.row.id);
  return reply.send({ ok: true, article_id: created.row.id });
}

/** Reddet */
export async function adminRejectSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body   = rejectBodySchema.parse(req.body);
  const sug    = await repoGetSuggestionById(id);
  if (!sug) return reply.code(404).send({ error: "not_found" });
  await repoRejectSuggestion(id, body.reason);
  return reply.send({ ok: true });
}

/** Sil */
export async function adminDeleteSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  await repoDeleteSuggestion(id);
  return reply.code(204).send();
}

/** Kaynak URL'den içerik çek → eksik alanları doldur */
export async function adminFetchSuggestionFromSource(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const sug = await repoGetSuggestionById(id);
  if (!sug) return reply.code(404).send({ error: "not_found" });

  try {
    const og = await fetchOgData(sug.source_url);
    const updated = await repoFillMissingSuggestionFields(id, {
      title:     og.title,
      excerpt:   og.excerpt,
      content:   og.content,
      image_url: og.image_url,
    });
    return reply.send({
      suggestion:      updated,
      fetched_title:   og.title,
      fetched_excerpt: og.excerpt,
      fetched_content: og.content,
      fetched_image:   og.image_url,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return reply.code(422).send({ error: "fetch_failed", message: msg });
  }
}

// ── AI ──────────────────────────────────────────────────────

/** AI ile haber içeriğini geliştir → provider zinciri ile fallback */
export async function adminAiEnhanceSuggestion(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const sug    = await repoGetSuggestionById(id);
  if (!sug) return reply.code(404).send({ error: "not_found" });
  await repoSetSuggestionAiStatus(id, "queued");
  try {
    const result = await rewriteSuggestionWithAi(sug);
    const updated = await repoSetSuggestionAiStatus(id, "done", {
      ai_title: result.title, ai_excerpt: result.excerpt, ai_content: result.content,
      ai_meta_title: result.meta_title, ai_meta_description: result.meta_description,
      ai_tags: result.tags.join(", "), image_brief: result.image_brief,
      internal_links: JSON.stringify(result.internal_links), image_url: null, image_status: "waiting",
    });
    return reply.send({ ok: true, suggestion: updated });
  } catch (error) {
    await repoSetSuggestionAiStatus(id, "failed");
    const message = error instanceof Error ? error.message : String(error);
    return reply.code(message === "ai_not_configured" ? 503 : 422).send({ error: message });
  }
}

export async function adminBulkAiRewrite(req: FastifyRequest, reply: FastifyReply) {
  const body = req.body as { ids?: number[] };
  const ids = Array.from(new Set(body.ids ?? [])).filter(Number.isInteger).slice(0, 25);
  const results = [];
  for (const id of ids) {
    const sug = await repoGetSuggestionById(id);
    if (!sug) { results.push({ id, ok: false, error: "not_found" }); continue; }
    await repoSetSuggestionAiStatus(id, "queued");
    try {
      const value = await rewriteSuggestionWithAi(sug);
      await repoSetSuggestionAiStatus(id, "done", { ai_title: value.title, ai_excerpt: value.excerpt, ai_content: value.content, ai_meta_title: value.meta_title, ai_meta_description: value.meta_description, ai_tags: value.tags.join(", "), image_brief: value.image_brief, internal_links: JSON.stringify(value.internal_links), image_url: null, image_status: "waiting" });
      results.push({ id, ok: true });
    } catch (error) {
      await repoSetSuggestionAiStatus(id, "failed");
      results.push({ id, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return reply.send({ results });
}

export async function adminListImageQueue(_req: FastifyRequest, reply: FastifyReply) {
  return reply.send(await repoListImageQueue());
}
