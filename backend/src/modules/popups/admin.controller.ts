// =============================================================
// FILE: src/modules/popups/admin.controller.ts
// =============================================================
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  repoListAdmin,
  repoGetById,
  repoCreate,
  repoUpdate,
  repoDelete,
  repoReorder,
  repoSetStatus,
} from "./repository";
import {
  adminListQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  reorderSchema,
  setStatusSchema,
} from "./validation";
import type { PopupRow } from "./schema";

function toAdminView(row: PopupRow, imageUrl: string | null) {
  return {
    id:                 row.id,
    uuid:               row.uuid,
    type:               row.type,
    title:              row.title,
    content:            row.content ?? null,
    image_url:          imageUrl,
    image_asset_id:     row.image_asset_id ?? null,
    alt:                row.alt ?? null,
    background_color:   row.background_color ?? null,
    text_color:         row.text_color ?? null,
    button_text:        row.button_text ?? null,
    button_color:       row.button_color ?? null,
    button_hover_color: row.button_hover_color ?? null,
    button_text_color:  row.button_text_color ?? null,
    link_url:           row.link_url ?? null,
    link_target:        row.link_target,
    text_behavior:      row.text_behavior,
    scroll_speed:       row.scroll_speed,
    closeable:          row.closeable === 1,
    delay_seconds:      row.delay_seconds,
    display_frequency:  row.display_frequency,
    is_active:          row.is_active === 1,
    display_order:      row.display_order,
    start_at:           row.start_at ?? null,
    end_at:             row.end_at   ?? null,
    created_at:         row.created_at,
    updated_at:         row.updated_at,
  };
}

export async function adminListPopups(req: FastifyRequest, reply: FastifyReply) {
  const q = adminListQuerySchema.parse(req.query);
  const rows = await repoListAdmin(q);
  return reply.send(rows.map((r) => toAdminView(r.row, r.image_url)));
}

export async function adminGetPopup(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const r = await repoGetById(id);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.image_url));
}

export async function adminCreatePopup(req: FastifyRequest, reply: FastifyReply) {
  const body = createSchema.parse(req.body);
  const r = await repoCreate(body);
  return reply.code(201).send(toAdminView(r.row, r.image_url));
}

export async function adminUpdatePopup(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const body = updateSchema.parse(req.body);
  const r = await repoUpdate(id, body);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.image_url));
}

export async function adminDeletePopup(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  await repoDelete(id);
  return reply.code(204).send();
}

export async function adminReorderPopups(req: FastifyRequest, reply: FastifyReply) {
  const { ids } = reorderSchema.parse(req.body);
  await repoReorder(ids);
  return reply.send({ ok: true });
}

export async function adminSetPopupStatus(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(req.params);
  const { is_active } = setStatusSchema.parse(req.body);
  const r = await repoSetStatus(id, is_active);
  if (!r) return reply.code(404).send({ error: "not_found" });
  return reply.send(toAdminView(r.row, r.image_url));
}
