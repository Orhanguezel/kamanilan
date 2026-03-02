// =============================================================
// FILE: src/modules/announcements/admin.controller.ts
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListAdmin,
  repoGetById,
  repoCreate,
  repoUpdate,
  repoDelete,
  repoSetPublished,
} from "./repository";
import {
  adminListQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  setStatusSchema,
} from "./validation";
import type { AnnouncementRow } from "./schema";

function toAdminView(row: AnnouncementRow, coverUrl: string | null) {
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
    author:           row.author           ?? null,
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

export async function adminListAnnouncements(req: FastifyRequest, reply: FastifyReply) {
  const q = adminListQuerySchema.parse(req.query);
  const rows = await repoListAdmin(q);
  return reply.send(rows.map((r) => toAdminView(r.row, r.cover_url)));
}

export async function adminGetAnnouncement(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const r = await repoGetById(id);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}

export async function adminCreateAnnouncement(req: FastifyRequest, reply: FastifyReply) {
  const body = createSchema.parse(req.body);
  const r = await repoCreate(body);
  return reply.code(201).send(toAdminView(r.row, r.cover_url));
}

export async function adminUpdateAnnouncement(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body = updateSchema.parse(req.body);
  const r = await repoUpdate(id, body);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}

export async function adminDeleteAnnouncement(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  await repoDelete(id);
  return reply.code(204).send();
}

export async function adminSetPublished(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const { is_published } = setStatusSchema.parse(req.body);
  const r = await repoSetPublished(id, is_published);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.cover_url));
}
