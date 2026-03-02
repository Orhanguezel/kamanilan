// =============================================================
// FILE: src/modules/properties/admin.controller.ts (ADMIN)
// CLEAN: category_id/sub_category_id; kind-specific removed
//   - variant_values: replaceVariantValues after create/update
//   - coordinates optional + geocode fallback
// =============================================================
import type { RouteHandler } from "fastify";
import { randomUUID } from "node:crypto";

import {
  listPropertiesAdmin as listPropertiesAdminRepo,
  getPropertyByIdAdmin as getPropertyByIdAdminRepo,
  getPropertyBySlugAdmin as getPropertyBySlugAdminRepo,
  createProperty as createPropertyRepo,
  updateProperty as updatePropertyRepo,
  deleteProperty as deletePropertyRepo,
  replacePropertyAssets,
  replacePropertyTagLinks,
  replaceVariantValues,
  syncPropertyCoverFromAssets,
} from "./repository";

import {
  propertyListQuerySchema,
  upsertPropertyBodySchema,
  patchPropertyBodySchema,
  type PropertyListQuery,
  type UpsertPropertyBody,
  type PatchPropertyBody,
} from "./validation";

import { geocodeAddressNominatim } from "./geocode";

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
const toBool = (v: unknown): boolean => v === true || v === 1 || v === "1" || v === "true";

const dec6orNull = (v: number | string | null | undefined): string | null => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v.toFixed(6) : null;
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(6) : null;
};

const dec2orNull = (v: number | string | null | undefined): string | null => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v.toFixed(2) : null;
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : null;
};

const trimOrUndef = (v: unknown): string | undefined =>
  (typeof v === "string" ? v.trim() : undefined);

const trimOrNull = (v: unknown): string | null | undefined => {
  if (typeof v === "undefined") return undefined;
  if (v === null) return null;
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : null;
  }
  return null;
};

function buildGeocodeQuery(address: string, district: string, city: string) {
  const parts = [address, district, city].map((s) => String(s || "").trim()).filter(Boolean);
  return parts.join(", ");
}

function actorScope(req: any) {
  const user = req?.user ?? {};
  const userId =
    typeof user?.sub === "string"
      ? user.sub
      : typeof user?.id === "string"
        ? user.id
        : undefined;
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const role = typeof user?.role === "string" ? user.role : "";
  const isAdmin =
    user?.is_admin === true || role === "admin" || roles.includes("admin");
  return { ownerUserId: userId, isAdmin };
}

// -------------------------------------------------------------
// LIST (admin)
// -------------------------------------------------------------
export const listPropertiesAdmin: RouteHandler<{ Querystring: PropertyListQuery }> = async (req, reply) => {
  const parsed = propertyListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }
  const q = parsed.data;

  try {
    const scope = actorScope(req);
    const { items, total } = await listPropertiesAdminRepo({
      orderParam: typeof q.order === "string" ? q.order : undefined,
      sort:       q.sort,
      order:      q.orderDir,
      limit:      q.limit,
      offset:     q.offset,

      is_active: q.is_active,
      featured:  q.featured,

      q:               q.q,
      slug:            q.slug,
      district:        q.district,
      city:            q.city,
      neighborhood:    q.neighborhood,
      status:          q.status,
      brand_id:        q.brand_id,
      category_id:     q.category_id,
      sub_category_id: q.sub_category_id,
      tag_ids:         q.tag_ids,

      price_min: q.price_min,
      price_max: q.price_max,

      created_from: q.created_from,
      created_to:   q.created_to,
    }, scope);

    reply.header("x-total-count", String(total ?? 0));
    return reply.send(items);
  } catch (err) {
    req.log.error({ err }, "properties_admin_list_failed");
    return reply.code(500).send({ error: { message: "properties_admin_list_failed" } });
  }
};

// -------------------------------------------------------------
// GET BY ID (admin)
// -------------------------------------------------------------
export const getPropertyAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const row = await getPropertyByIdAdminRepo(req.params.id, actorScope(req));
    if (!row) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err) {
    req.log.error({ err }, "properties_admin_get_failed");
    return reply.code(500).send({ error: { message: "properties_admin_get_failed" } });
  }
};

// -------------------------------------------------------------
// GET BY SLUG (admin)
// -------------------------------------------------------------
export const getPropertyBySlugAdmin: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  try {
    const row = await getPropertyBySlugAdminRepo(req.params.slug, actorScope(req));
    if (!row) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err) {
    req.log.error({ err }, "properties_admin_get_by_slug_failed");
    return reply.code(500).send({ error: { message: "properties_admin_get_by_slug_failed" } });
  }
};

// -------------------------------------------------------------
// CREATE (admin)
// -------------------------------------------------------------
export const createPropertyAdmin: RouteHandler<{ Body: UpsertPropertyBody }> = async (req, reply) => {
  const parsed = upsertPropertyBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  try {
    const scope = actorScope(req);
    const brand_id        = typeof (b as any).brand_id        === "string" ? (b as any).brand_id.trim()        : null;
    const category_id     = typeof (b as any).category_id     === "string" ? (b as any).category_id.trim()     : null;
    const sub_category_id = typeof (b as any).sub_category_id === "string" ? (b as any).sub_category_id.trim() : null;
    const tag_ids         = Array.isArray((b as any).tag_ids) ? (b as any).tag_ids : [];
    const variant_values  = Array.isArray((b as any).variant_values) ? (b as any).variant_values : [];

    // coordinates optional + geocode fallback
    let latNum: number | null = b.coordinates?.lat ?? null;
    let lngNum: number | null = b.coordinates?.lng ?? null;

    if (latNum == null || lngNum == null) {
      const gq    = buildGeocodeQuery(b.address, b.district, b.city);
      const point = await geocodeAddressNominatim(gq);
      if (point) { latNum = point.lat; lngNum = point.lng; }
    }

    const lat = dec6orNull(latNum);
    const lng = dec6orNull(lngNum);
    const hasMap =
      typeof b.has_map !== "undefined" ? (toBool(b.has_map) ? 1 : 0) : (lat && lng ? 1 : 0);

    const created = await createPropertyRepo({
      id: randomUUID(),
      user_id: scope.ownerUserId ?? null,

      title:  b.title.trim(),
      slug:   b.slug.trim(),
      excerpt: typeof b.excerpt === "string" ? b.excerpt.trim() : (b.excerpt ?? null),

      category_id,
      sub_category_id,
      brand_id,

      status:  b.status.trim(),
      address: b.address.trim(),
      district: b.district.trim(),
      city:    b.city.trim(),
      neighborhood: typeof b.neighborhood === "string" ? b.neighborhood.trim() : null,

      lat,
      lng,

      description: typeof b.description === "string" ? b.description.trim() : (b.description ?? null),

      price:           typeof b.price === "number" ? dec2orNull(b.price) : null,
      currency:        (b.currency ?? "TRY").trim(),
      is_negotiable:   toBool(b.is_negotiable) ? 1 : 0,
      min_price_admin: typeof b.min_price_admin === "number" ? dec2orNull(b.min_price_admin) : null,

      listing_no: typeof b.listing_no === "string" ? b.listing_no.trim() : null,
      badge_text: typeof b.badge_text === "string" ? b.badge_text.trim() : null,
      featured:   toBool(b.featured) ? 1 : 0,

      meta_title:       typeof b.meta_title       === "string" ? b.meta_title.trim()       : null,
      meta_description: typeof b.meta_description === "string" ? b.meta_description.trim() : null,

      has_video:        toBool(b.has_video)        ? 1 : 0,
      has_clip:         toBool(b.has_clip)         ? 1 : 0,
      has_virtual_tour: toBool(b.has_virtual_tour) ? 1 : 0,
      has_map:          hasMap,

      image_url:      typeof b.image_url      === "string" ? b.image_url.trim()      : null,
      image_asset_id: typeof b.image_asset_id === "string" ? b.image_asset_id.trim() : null,
      alt:            typeof b.alt            === "string" ? b.alt.trim()            : null,

      is_active:     toBool(b.is_active)     ? 1 : 0,
      display_order: typeof b.display_order === "number" ? Math.trunc(b.display_order) : 0,

      created_at: new Date(),
      updated_at: new Date(),
    } as any, scope);

    if (!created) {
      return reply.code(500).send({ error: { message: "properties_admin_create_failed" } });
    }

    if (Array.isArray(b.assets)) {
      await replacePropertyAssets(created.id, b.assets);
      await syncPropertyCoverFromAssets(created.id);
    }
    await replacePropertyTagLinks(created.id, tag_ids);
    if (variant_values.length) {
      await replaceVariantValues(created.id, variant_values);
    }

    const fresh = await getPropertyByIdAdminRepo(created.id, scope);
    return reply.code(201).send(fresh);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e?.code === "ER_DUP_ENTRY")          return reply.code(409).send({ error: { message: "slug_already_exists" } });
    if (e?.code === "ER_NO_REFERENCED_ROW_2") return reply.code(400).send({ error: { message: "invalid_relation_id" } });
    if (e?.message === "invalid_asset_ids")    return reply.code(400).send({ error: { message: "invalid_asset_ids" } });
    if (e?.message === "asset_id_or_url_required") return reply.code(400).send({ error: { message: "asset_id_or_url_required" } });
    req.log.error({ err }, "properties_admin_create_failed");
    return reply.code(500).send({ error: { message: "properties_admin_create_failed" } });
  }
};

// -------------------------------------------------------------
// UPDATE (admin)
// -------------------------------------------------------------
export const updatePropertyAdmin: RouteHandler<{
  Params: { id: string };
  Body: PatchPropertyBody;
}> = async (req, reply) => {
  const parsed = patchPropertyBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  try {
    const scope = actorScope(req);
    const patch: Record<string, any> = {};

    const title = trimOrUndef(b.title);
    if (typeof title !== "undefined") patch.title = title;

    const slug = trimOrUndef(b.slug);
    if (typeof slug !== "undefined") patch.slug = slug;

    const status = trimOrUndef(b.status);
    if (typeof status !== "undefined") patch.status = status;

    const address  = trimOrUndef(b.address);
    const district = trimOrUndef(b.district);
    const city     = trimOrUndef(b.city);

    if (typeof address  !== "undefined") patch.address  = address;
    if (typeof district !== "undefined") patch.district = district;
    if (typeof city     !== "undefined") patch.city     = city;

    const neighborhood = trimOrNull(b.neighborhood);
    if (typeof neighborhood !== "undefined") patch.neighborhood = neighborhood;

    if (typeof b.description !== "undefined") {
      patch.description = typeof b.description === "string" ? b.description.trim() : (b.description ?? null);
    }
    if (typeof b.excerpt !== "undefined") {
      patch.excerpt = typeof b.excerpt === "string" ? b.excerpt.trim() : (b.excerpt ?? null);
    }

    // taxonomy
    if (typeof (b as any).brand_id !== "undefined") {
      patch.brand_id = typeof (b as any).brand_id === "string" ? (b as any).brand_id.trim() : null;
    }
    if (typeof (b as any).category_id !== "undefined") {
      patch.category_id = typeof (b as any).category_id === "string" ? (b as any).category_id.trim() : null;
    }
    if (typeof (b as any).sub_category_id !== "undefined") {
      patch.sub_category_id = typeof (b as any).sub_category_id === "string" ? (b as any).sub_category_id.trim() : null;
    }

    // coordinates partial patch
    if (typeof b.coordinates?.lat !== "undefined") patch.lat = dec6orNull(b.coordinates.lat);
    if (typeof b.coordinates?.lng !== "undefined") patch.lng = dec6orNull(b.coordinates.lng);

    // geocode if address changed and coords not explicitly set
    const addressChanged  = typeof address !== "undefined" || typeof district !== "undefined" || typeof city !== "undefined";
    const coordsTouched   = typeof b.coordinates?.lat !== "undefined" || typeof b.coordinates?.lng !== "undefined";

    if (addressChanged && !coordsTouched) {
      const current = await getPropertyByIdAdminRepo(req.params.id, scope);
      if (current) {
        const gq    = buildGeocodeQuery(
          typeof address  !== "undefined" ? address  : current.address,
          typeof district !== "undefined" ? district! : current.district,
          typeof city     !== "undefined" ? city!     : current.city,
        );
        const point = await geocodeAddressNominatim(gq);
        if (point) {
          patch.lat = dec6orNull(point.lat);
          patch.lng = dec6orNull(point.lng);
          if (typeof b.has_map === "undefined") patch.has_map = 1;
        }
      }
    }

    if (typeof b.price !== "undefined")           patch.price           = b.price           === null ? null : dec2orNull(b.price);
    if (typeof b.currency !== "undefined")        patch.currency        = (b.currency ?? "TRY").trim();
    if (typeof b.is_negotiable !== "undefined")   patch.is_negotiable   = toBool(b.is_negotiable) ? 1 : 0;
    if (typeof b.min_price_admin !== "undefined") patch.min_price_admin = b.min_price_admin === null ? null : dec2orNull(b.min_price_admin);

    if (typeof b.listing_no !== "undefined") patch.listing_no = b.listing_no ?? null;
    if (typeof b.badge_text !== "undefined") patch.badge_text = b.badge_text ?? null;
    if (typeof b.featured   !== "undefined") patch.featured   = toBool(b.featured)   ? 1 : 0;

    if (typeof b.meta_title       !== "undefined") patch.meta_title       = b.meta_title       ?? null;
    if (typeof b.meta_description !== "undefined") patch.meta_description = b.meta_description ?? null;

    if (typeof b.has_video        !== "undefined") patch.has_video        = toBool(b.has_video)        ? 1 : 0;
    if (typeof b.has_clip         !== "undefined") patch.has_clip         = toBool(b.has_clip)         ? 1 : 0;
    if (typeof b.has_virtual_tour !== "undefined") patch.has_virtual_tour = toBool(b.has_virtual_tour) ? 1 : 0;
    if (typeof b.has_map          !== "undefined") patch.has_map          = toBool(b.has_map)          ? 1 : 0;

    if (typeof b.image_url      !== "undefined") patch.image_url      = b.image_url      ?? null;
    if (typeof b.image_asset_id !== "undefined") patch.image_asset_id = b.image_asset_id ?? null;
    if (typeof b.alt            !== "undefined") patch.alt            = b.alt            ?? null;

    if (typeof b.is_active     !== "undefined") patch.is_active     = toBool(b.is_active)     ? 1 : 0;
    if (typeof b.display_order !== "undefined") {
      patch.display_order = typeof b.display_order === "number" ? Math.trunc(b.display_order) : 0;
    }

    const updated = await updatePropertyRepo(req.params.id, patch, scope);
    if (!updated) return reply.code(404).send({ error: { message: "not_found" } });

    if (Array.isArray(b.assets)) {
      await replacePropertyAssets(req.params.id, b.assets);
      await syncPropertyCoverFromAssets(req.params.id);
    }
    if (Array.isArray((b as any).tag_ids)) {
      await replacePropertyTagLinks(req.params.id, (b as any).tag_ids);
    } else if ((b as any).tag_ids === null) {
      await replacePropertyTagLinks(req.params.id, []);
    }
    if (Array.isArray((b as any).variant_values)) {
      await replaceVariantValues(req.params.id, (b as any).variant_values);
    }

    const fresh = await getPropertyByIdAdminRepo(req.params.id, scope);
    return reply.send(fresh);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e?.code === "ER_DUP_ENTRY")           return reply.code(409).send({ error: { message: "slug_already_exists" } });
    if (e?.code === "ER_NO_REFERENCED_ROW_2")  return reply.code(400).send({ error: { message: "invalid_relation_id" } });
    if (e?.message === "invalid_asset_ids")     return reply.code(400).send({ error: { message: "invalid_asset_ids" } });
    if (e?.message === "asset_id_or_url_required") return reply.code(400).send({ error: { message: "asset_id_or_url_required" } });
    req.log.error({ err }, "properties_admin_update_failed");
    return reply.code(500).send({ error: { message: "properties_admin_update_failed" } });
  }
};

// -------------------------------------------------------------
// DELETE (admin)
// -------------------------------------------------------------
export const removePropertyAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  try {
    const affected = await deletePropertyRepo(req.params.id, actorScope(req));
    if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.code(204).send();
  } catch (err) {
    req.log.error({ err }, "properties_admin_delete_failed");
    return reply.code(500).send({ error: { message: "properties_admin_delete_failed" } });
  }
};
