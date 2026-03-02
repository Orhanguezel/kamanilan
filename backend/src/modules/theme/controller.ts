import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '@/db/client';
import { themeConfig } from './schema';
import { DEFAULT_THEME, DEFAULT_LAYOUT_BLOCKS } from './defaults';
import type { ThemeConfig } from './types';

function parseConfig(raw: string): ThemeConfig {
  try {
    return JSON.parse(raw) as ThemeConfig;
  } catch {
    return DEFAULT_THEME;
  }
}

/** GET /theme — tüm tema konfigürasyonunu döner (public) */
export async function getThemePublic(_req: FastifyRequest, reply: FastifyReply) {
  const rows = await db.select().from(themeConfig).limit(1);

  if (!rows.length) {
    return reply.send(DEFAULT_THEME);
  }

  const parsed = parseConfig(rows[0].config);

  // Eksik alanları DEFAULT_THEME ile doldur (deep merge)
  const merged: ThemeConfig = {
    colors:             { ...DEFAULT_THEME.colors,  ...(parsed.colors ?? {}) },
    radius:             parsed.radius     ?? DEFAULT_THEME.radius,
    fontFamily:         parsed.fontFamily ?? DEFAULT_THEME.fontFamily,
    darkMode:           parsed.darkMode   ?? DEFAULT_THEME.darkMode,
    sections:           parsed.sections?.length           ? parsed.sections           : DEFAULT_THEME.sections,
    pages:              { ...DEFAULT_THEME.pages,  ...(parsed.pages ?? {}) },
    newsListSections:   parsed.newsListSections?.length   ? parsed.newsListSections   : DEFAULT_THEME.newsListSections,
    newsDetailSections: parsed.newsDetailSections?.length ? parsed.newsDetailSections : DEFAULT_THEME.newsDetailSections,
    layout_blocks:      parsed.layout_blocks?.length      ? parsed.layout_blocks      : DEFAULT_LAYOUT_BLOCKS,
  };

  return reply.send(merged);
}
