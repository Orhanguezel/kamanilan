import type { RouteHandler } from 'fastify';
import { randomUUID } from 'crypto';
import { db } from '@/db/client';
import { themeConfig } from './schema';
import { themeUpdateSchema, type ThemeUpdateInput } from './validation';
import { DEFAULT_THEME, DEFAULT_LAYOUT_BLOCKS } from './defaults';
import type { ThemeConfig } from './types';
import { sql } from 'drizzle-orm';

const THEME_ID = '00000000-0000-4000-8000-000000000001'; // Sabit ID (tek satır yönetimi)

function parseConfig(raw: string): ThemeConfig {
  try {
    return JSON.parse(raw) as ThemeConfig;
  } catch {
    return DEFAULT_THEME;
  }
}

function sanitizePages(input: unknown, fallback: ThemeConfig['pages']): ThemeConfig['pages'] {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fallback;

  const out: ThemeConfig['pages'] = { ...fallback };
  for (const [pageKey, pageVal] of Object.entries(input as Record<string, unknown>)) {
    if (!pageVal || typeof pageVal !== 'object' || Array.isArray(pageVal)) continue;

    const page: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(pageVal as Record<string, unknown>)) {
      if (typeof v === 'string') page[k] = v;
      else if (typeof v === 'undefined') page[k] = undefined;
    }
    out[pageKey] = page;
  }
  return out;
}

/** GET /admin/theme — mevcut temayı döner */
export const adminGetTheme: RouteHandler = async (_req, reply) => {
  const rows = await db.select().from(themeConfig).limit(1);

  if (!rows.length) {
    return reply.send({ ...DEFAULT_THEME, _source: 'default' });
  }

  const parsed = parseConfig(rows[0].config);
  const merged: ThemeConfig = {
    colors:             { ...DEFAULT_THEME.colors,  ...(parsed.colors ?? {}) },
    radius:             parsed.radius     ?? DEFAULT_THEME.radius,
    fontFamily:         parsed.fontFamily ?? DEFAULT_THEME.fontFamily,
    darkMode:           parsed.darkMode   ?? DEFAULT_THEME.darkMode,
    sections:           parsed.sections?.length ? parsed.sections : DEFAULT_THEME.sections,
    pages:              sanitizePages(parsed.pages, DEFAULT_THEME.pages),
    newsListSections:   parsed.newsListSections?.length   ? parsed.newsListSections   : DEFAULT_THEME.newsListSections,
    newsDetailSections: parsed.newsDetailSections?.length ? parsed.newsDetailSections : DEFAULT_THEME.newsDetailSections,
  };

  return reply.send(merged);
};

/** PUT /admin/theme — partial update (deep merge ile) */
export const adminUpdateTheme: RouteHandler<{ Body: ThemeUpdateInput }> = async (req, reply) => {
  const parsed = themeUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: 'invalid_body', issues: parsed.error.flatten() },
    });
  }

  const patch = parsed.data;

  // Mevcut kaydı oku
  const rows = await db.select().from(themeConfig).limit(1);
  const existing: ThemeConfig = rows.length
    ? parseConfig(rows[0].config)
    : { ...DEFAULT_THEME };

  // Deep merge: üst düzey key'leri birleştir
  const updated: ThemeConfig = {
    colors:             patch.colors     ? { ...existing.colors, ...patch.colors } : existing.colors,
    radius:             patch.radius     ?? existing.radius,
    fontFamily:         patch.fontFamily !== undefined ? patch.fontFamily : existing.fontFamily,
    darkMode:           patch.darkMode   ?? existing.darkMode,
    sections:           patch.sections   ?? existing.sections,
    pages:              patch.pages ? sanitizePages({ ...existing.pages, ...patch.pages }, existing.pages) : existing.pages,
    newsListSections:   patch.newsListSections   ?? existing.newsListSections   ?? DEFAULT_THEME.newsListSections,
    newsDetailSections: patch.newsDetailSections ?? existing.newsDetailSections ?? DEFAULT_THEME.newsDetailSections,
    layout_blocks:      patch.layout_blocks      ?? existing.layout_blocks      ?? DEFAULT_LAYOUT_BLOCKS,
  };

  const configStr = JSON.stringify(updated);
  const now       = new Date();

  if (rows.length) {
    await db
      .update(themeConfig)
      .set({ config: configStr, updated_at: now })
      .where(sql`1=1`); // tek satır, where şart yok ama Drizzle update where ister
  } else {
    await db.insert(themeConfig).values({
      id:         THEME_ID,
      is_active:  1,
      config:     configStr,
      created_at: now,
      updated_at: now,
    });
  }

  return reply.send(updated);
};

/** POST /admin/theme/reset — varsayılana sıfırla */
export const adminResetTheme: RouteHandler = async (_req, reply) => {
  const now       = new Date();
  const configStr = JSON.stringify(DEFAULT_THEME);

  const rows = await db.select().from(themeConfig).limit(1);
  if (rows.length) {
    await db.update(themeConfig).set({ config: configStr, updated_at: now }).where(sql`1=1`);
  } else {
    await db.insert(themeConfig).values({
      id: THEME_ID, is_active: 1, config: configStr, created_at: now, updated_at: now,
    });
  }

  return reply.send(DEFAULT_THEME);
};
