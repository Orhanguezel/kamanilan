// =============================================================
// FILE: src/modules/articles/admin.controller.ts
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListAdmin,
  repoGetById,
  repoCreate,
  repoUpdate,
  repoDelete,
  repoSetPublished,
  repoListComments,
  repoApproveComment,
  repoDeleteComment,
} from "./repository";
import {
  adminListQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  setStatusSchema,
  commentIdParamSchema,
  approveCommentSchema,
} from "./validation";
import type { ArticleRow } from "./schema";
import { buildAiChain, callAi, extractJson, wrapParagraphs } from "@/modules/_shared/aiChain";

function toAdminView(row: ArticleRow, coverUrl: string | null) {
  return {
    id:               row.id,
    uuid:             row.uuid,
    locale:           row.locale,
    title:            row.title,
    slug:             row.slug,
    excerpt:          row.excerpt          ?? null,
    content:          row.content          ?? null,
    category:         row.category,
    cover_url:        coverUrl,
    cover_image_url:  row.cover_image_url  ?? null,
    cover_asset_id:   row.cover_asset_id   ?? null,
    alt:              row.alt              ?? null,
    video_url:        row.video_url        ?? null,
    author:           row.author           ?? null,
    source:           row.source           ?? null,
    source_url:       row.source_url       ?? null,
    tags:             row.tags             ?? null,
    reading_time:     row.reading_time     ?? 0,
    meta_title:       row.meta_title       ?? null,
    meta_description: row.meta_description ?? null,
    is_published:     row.is_published     === 1,
    is_featured:      row.is_featured      === 1,
    display_order:    row.display_order,
    published_at:     row.published_at     ?? null,
    created_at:       row.created_at,
    updated_at:       row.updated_at,
  };
}

export async function adminListArticles(req: FastifyRequest, reply: FastifyReply) {
  const q = adminListQuerySchema.parse(req.query);
  const rows = await repoListAdmin(q);
  return reply.send(rows.map((r) => toAdminView(r.row, r.cover_url)));
}

export async function adminGetArticle(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const r = await repoGetById(id);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}

export async function adminCreateArticle(req: FastifyRequest, reply: FastifyReply) {
  const body = createSchema.parse(req.body);
  const r = await repoCreate(body);
  return reply.code(201).send(toAdminView(r.row, r.cover_url));
}

export async function adminUpdateArticle(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body = updateSchema.parse(req.body);
  const r = await repoUpdate(id, body);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}

export async function adminDeleteArticle(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  await repoDelete(id);
  return reply.code(204).send();
}

export async function adminSetArticlePublished(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const { is_published } = setStatusSchema.parse(req.body);
  const r = await repoSetPublished(id, is_published);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}

/* ===================== ADMIN COMMENTS ===================== */

/** GET /admin/articles/:id/comments – all comments (pending + approved) */
export async function adminListArticleComments(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const rows = await repoListComments(id, false);
  return reply.send(rows.map((r) => ({
    id:          r.id,
    article_id:  r.article_id,
    user_id:     r.user_id,
    author_name: r.author_name,
    content:     r.content,
    is_approved: r.is_approved === 1,
    created_at:  r.created_at,
    updated_at:  r.updated_at,
  })));
}

/** PATCH /admin/articles/comments/:cid/approve – approve or reject */
export async function adminApproveComment(req: FastifyRequest, reply: FastifyReply) {
  const { cid } = commentIdParamSchema.parse(req.params);
  const { is_approved } = approveCommentSchema.parse(req.body);
  const row = await repoApproveComment(cid, is_approved);
  if (!row) return reply.code(404).send({ error: "not_found" });
  return reply.send({
    id:          row.id,
    article_id:  row.article_id,
    author_name: row.author_name,
    content:     row.content,
    is_approved: row.is_approved === 1,
    created_at:  row.created_at,
  });
}

/** DELETE /admin/articles/comments/:cid */
export async function adminDeleteComment(req: FastifyRequest, reply: FastifyReply) {
  const { cid } = commentIdParamSchema.parse(req.params);
  await repoDeleteComment(cid);
  return reply.code(204).send();
}

/** AI ile makale içeriğini geliştir */
export async function adminAiEnhanceArticle(req: FastifyRequest, reply: FastifyReply) {
  // 1) Provider zinciri
  const chain = await buildAiChain();
  if (!chain.length) return reply.code(503).send({ error: "ai_not_configured" });

  // 2) Makale verisini hazırla
  const { id } = idParamSchema.parse(req.params);
  const r = await repoGetById(id);
  if (!r) return reply.code(404).send({ error: "not_found" });
  const art = r.row;

  const title    = (art.title    ?? "").trim();
  const category = (art.category ?? "genel").trim();
  const excerpt  = (art.excerpt  ?? "").slice(0, 500).trim();
  const content  = (art.content  ?? "").slice(0, 3000).trim();
  const tags     = (art.tags     ?? "").trim();

  const systemPrompt = `Sen bir profesyonel Türkçe haber editörüsün.
Kullanıcı sana ham makale verisi verecek.
Sen bu veriyi kullanarak SEO uyumlu, okunması kolay, kapsamlı bir haber makalesi yazacaksın.
SADECE JSON formatında yanıt ver, başka hiçbir metin ekleme.`;

  const userPrompt = `Aşağıdaki makale verisini kullanarak SEO uyumlu bir haber makalesi yaz.

MEVCUT VERİ:
Başlık: ${title || "(yok)"}
Kategori: ${category}
Özet: ${excerpt || "(yok)"}
İçerik: ${content || "(yok)"}
Mevcut etiketler: ${tags || "(yok)"}

GÖREVLER:
1. title: Dikkat çekici, SEO uyumlu başlık yaz (60-70 karakter arası)
2. excerpt: Kısa özet (150-160 karakter, makale ne hakkında olduğunu açıkça belirt)
3. content: Makaleyi genişlet ve detaylandır. Minimum 500 kelime. SADECE DÜZ METİN yaz (HTML etiketi kullanma). Paragrafları iki boş satırla (\\n\\n) ayır. Giriş, gelişme ve sonuç bölümleri olsun.
4. meta_title: Arama motoru başlık etiketi (50-60 karakter, anahtar kelime içermeli)
5. meta_description: Arama motoru meta açıklaması (150-160 karakter)
6. tags: Virgülle ayrılmış 5-7 adet SEO etiketi (küçük harf, Türkçe)

ÇIKTI (sadece bu JSON, başka metin yok):
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "meta_title": "...",
  "meta_description": "...",
  "tags": "..."
}`;

  // 3) Provider zincirini dene
  let lastErr: Error | null = null;
  for (const { provider, apiKey, apiBase, model } of chain) {
    try {
      req.log.info(`[AI article enhance] trying ${provider} (${model})`);
      const raw    = await callAi(apiBase, apiKey, model, provider, systemPrompt, userPrompt);
      const parsed = extractJson(raw);
      return reply.send({
        ok:               true,
        title:            typeof parsed.title            === "string" ? parsed.title.slice(0, 500)           : undefined,
        excerpt:          typeof parsed.excerpt          === "string" ? parsed.excerpt.slice(0, 2000)         : undefined,
        content:          typeof parsed.content          === "string" ? wrapParagraphs(parsed.content)        : undefined,
        meta_title:       typeof parsed.meta_title       === "string" ? parsed.meta_title.slice(0, 500)       : undefined,
        meta_description: typeof parsed.meta_description === "string" ? parsed.meta_description.slice(0, 500) : undefined,
        tags:             typeof parsed.tags             === "string" ? parsed.tags.slice(0, 500)             : undefined,
      });
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      req.log.warn(`[AI article enhance] ${provider} failed: ${lastErr.message}`);
    }
  }

  return reply.code(422).send({ error: "ai_parse_failed", message: lastErr?.message ?? "Tüm AI sağlayıcıları başarısız oldu." });
}
