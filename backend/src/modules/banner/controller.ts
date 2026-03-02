// =============================================================
// FILE: src/modules/banner/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import { publicListQuerySchema, type PublicListQuery } from "./validation";
import { repoListPublic, type BannerWithAsset } from "./repository";

type BannerData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  thumbnail: string | null;
  alt: string | null;
  background_color: string | null;
  title_color: string | null;
  description_color: string | null;
  button_text: string | null;
  button_color: string | null;
  button_hover_color: string | null;
  button_text_color: string | null;
  link_url: string | null;
  link_target: string;
  order: number;
  desktop_row: number;
  desktop_columns: number;
};

const rowToPublic = (r: BannerWithAsset): BannerData => ({
  id: String(r.row.id),
  title: r.row.title,
  subtitle: r.row.subtitle ?? null,
  description: r.row.description ?? null,
  image: r.asset_url ?? r.row.image_url ?? null,
  thumbnail: r.thumb_url,
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
  order: r.row.display_order ?? 0,
  desktop_row: r.row.desktop_row ?? 0,
  desktop_columns: r.row.desktop_columns ?? 1,
});

/** GET /banners?ids=1,2 */
export const listPublicBanners: RouteHandler<{ Querystring: unknown }> = async (req, reply) => {
  const parsed = publicListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.flatten() } });
  }
  const rows = await repoListPublic(parsed.data as PublicListQuery);
  return rows.map(rowToPublic);
};
