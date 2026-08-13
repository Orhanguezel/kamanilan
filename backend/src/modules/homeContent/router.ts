import type { FastifyInstance } from 'fastify';
import type { RowDataPacket } from 'mysql2';

import { pool } from '@/db/client';

type SliderRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  image2_url: string | null;
  alt: string | null;
  badge_text: string | null;
  badge_color: string | null;
  gradient: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: number;
  display_order: number;
};

type PopupRow = RowDataPacket & {
  id: number;
  type: 'topbar' | 'sidebar_top' | 'sidebar_center' | 'sidebar_bottom' | 'modal';
  title: string;
  content: string | null;
  image_url: string | null;
  alt: string | null;
  background_color: string | null;
  text_color: string | null;
  button_text: string | null;
  button_color: string | null;
  button_hover_color: string | null;
  button_text_color: string | null;
  link_url: string | null;
  link_target: string;
  text_behavior: 'static' | 'marquee';
  scroll_speed: number;
  closeable: number;
  delay_seconds: number;
  display_frequency: 'always' | 'once' | 'daily' | 'weekly';
  display_order: number;
};

export async function registerHomeContent(api: FastifyInstance) {
  api.get('/sliders', { config: { public: true } }, async (request) => {
    const query = request.query as { locale?: string };
    const locale = query.locale?.trim() || 'tr';
    const [rows] = await pool.query<SliderRow[]>(
      `SELECT s.id, i.name, i.description, s.image_url, s.image2_url,
              i.alt, s.badge_text, s.badge_color, s.gradient,
              i.button_text, i.button_link, s.is_active, s.display_order
         FROM slider s
         JOIN slider_i18n i ON i.slider_id = s.id AND i.locale = ?
        WHERE s.is_active = 1
        ORDER BY s.display_order ASC, s.id ASC`,
      [locale],
    );

    return rows.map((row) => ({
      id: String(row.id),
      title: row.name,
      description: row.description ?? '',
      image: row.image_url ?? '',
      image2: row.image2_url ?? undefined,
      alt: row.alt ?? undefined,
      badgeText: row.badge_text ?? undefined,
      badgeColor: row.badge_color ?? undefined,
      gradient: row.gradient ?? undefined,
      buttonText: row.button_text ?? '',
      buttonLink: row.button_link ?? '',
      isActive: Boolean(row.is_active),
      order: row.display_order,
    }));
  });

  api.get('/popups', { config: { public: true } }, async (request) => {
    const query = request.query as { type?: string; limit?: string };
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const allowedTypes = new Set(['topbar', 'sidebar_top', 'sidebar_center', 'sidebar_bottom', 'modal']);
    const type = query.type && allowedTypes.has(query.type) ? query.type : null;
    const params: Array<string | number> = [];
    const typeFilter = type ? 'AND type = ?' : '';
    if (type) params.push(type);
    params.push(limit);

    const [rows] = await pool.query<PopupRow[]>(
      `SELECT id, type, title, content, image_url, alt, background_color, text_color,
              button_text, button_color, button_hover_color, button_text_color,
              link_url, link_target, text_behavior, scroll_speed, closeable,
              delay_seconds, display_frequency, display_order
         FROM popups
        WHERE is_active = 1
          AND (start_at IS NULL OR start_at <= NOW(3))
          AND (end_at IS NULL OR end_at >= NOW(3))
          ${typeFilter}
        ORDER BY display_order ASC, id ASC
        LIMIT ?`,
      params,
    );

    return rows.map((row) => ({
      ...row,
      image: row.image_url,
      closeable: Boolean(row.closeable),
      order: row.display_order,
    }));
  });
}
