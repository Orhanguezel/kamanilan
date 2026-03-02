// =============================================================
// FILE: src/modules/banner/admin.controller.ts
// =============================================================
import type { RouteHandler } from "fastify";
import {
  adminListQuerySchema,
  idParamSchema,
  createSchema,
  updateSchema,
  reorderSchema,
  setStatusSchema,
  setImageSchema,
  type AdminListQuery,
  type CreateBody,
  type UpdateBody,
  type SetImageBody,
} from "./validation";
import {
  repoListAdmin,
  repoGetById,
  repoCreate,
  repoUpdate,
  repoDelete,
  repoReorder,
  repoSetStatus,
  repoSetImage,
  type BannerWithAsset,
} from "./repository";

const toAdminView = (r: BannerWithAsset) => ({
  id: r.row.id,
  uuid: r.row.uuid,
  title: r.row.title,
  slug: r.row.slug,
  subtitle: r.row.subtitle ?? null,
  description: r.row.description ?? null,
  image_url: r.row.image_url ?? null,
  image_asset_id: r.row.image_asset_id ?? null,
  image_effective_url: r.asset_url ?? r.row.image_url ?? null,
  thumbnail_url: r.row.thumbnail_url ?? null,
  thumbnail_asset_id: r.row.thumbnail_asset_id ?? null,
  alt: r.row.alt ?? null,
  background_color: r.row.background_color ?? null,
  title_color: r.row.title_color ?? null,
  description_color: r.row.description_color ?? null,
  button_text: r.row.button_text ?? null,
  button_color: r.row.button_color ?? null,
  button_hover_color: r.row.button_hover_color ?? null,
  button_text_color: r.row.button_text_color ?? null,
  link_url: r.row.link_url ?? null,
  link_target: r.row.link_target ?? "_self",
  is_active: !!r.row.is_active,
  display_order: r.row.display_order,
  advertiser_name: (r.row as any).advertiser_name ?? null,
  contact_info: (r.row as any).contact_info ?? null,
  start_at: r.row.start_at ?? null,
  end_at: r.row.end_at ?? null,
  created_at: r.row.created_at,
  updated_at: r.row.updated_at,
});

/** GET /admin/banners */
export const adminListBanners: RouteHandler<{ Querystring: unknown }> = async (req, reply) => {
  const parsed = adminListQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.flatten() } });
  const rows = await repoListAdmin(parsed.data as AdminListQuery);
  return rows.map(toAdminView);
};

/** GET /admin/banners/:id */
export const adminGetBanner: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const v = idParamSchema.safeParse(req.params);
  if (!v.success) return reply.code(400).send({ error: { message: "invalid_params" } });
  const row = await repoGetById(v.data.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return toAdminView(row);
};

/** POST /admin/banners */
export const adminCreateBanner: RouteHandler<{ Body: unknown }> = async (req, reply) => {
  const b = createSchema.safeParse(req.body);
  if (!b.success) return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });
  const created = await repoCreate(b.data as CreateBody);
  return reply.code(201).send(toAdminView(created));
};

/** PATCH /admin/banners/:id */
export const adminUpdateBanner: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });
  const b = updateSchema.safeParse(req.body);
  if (!b.success) return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });
  const updated = await repoUpdate(p.data.id, b.data as UpdateBody);
  if (!updated) return reply.code(404).send({ error: { message: "not_found" } });
  return toAdminView(updated);
};

/** DELETE /admin/banners/:id */
export const adminDeleteBanner: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });
  await repoDelete(p.data.id);
  return { ok: true };
};

/** POST /admin/banners/reorder */
export const adminReorderBanners: RouteHandler<{ Body: unknown }> = async (req, reply) => {
  const b = reorderSchema.safeParse(req.body);
  if (!b.success) return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });
  await repoReorder(b.data.ids);
  return { ok: true };
};

/** POST /admin/banners/:id/status */
export const adminSetBannerStatus: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });
  const b = setStatusSchema.safeParse(req.body);
  if (!b.success) return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });
  const updated = await repoSetStatus(p.data.id, b.data.is_active);
  if (!updated) return reply.code(404).send({ error: { message: "not_found" } });
  return toAdminView(updated);
};

/** PATCH /admin/banners/:id/image */
export const adminSetBannerImage: RouteHandler<{ Params: { id: string }; Body: unknown }> = async (req, reply) => {
  const p = idParamSchema.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ error: { message: "invalid_params" } });
  const b = setImageSchema.safeParse(req.body);
  if (!b.success) return reply.code(400).send({ error: { message: "invalid_body", issues: b.error.flatten() } });
  const updated = await repoSetImage(p.data.id, b.data as SetImageBody);
  if (!updated) return reply.code(404).send({ error: { message: "not_found_or_asset_missing" } });
  return toAdminView(updated);
};
