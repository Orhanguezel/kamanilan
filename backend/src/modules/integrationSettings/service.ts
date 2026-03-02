import { randomUUID } from 'crypto';
import { asc, like, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { siteSettings } from '@/modules/siteSettings/schema';
import type { JsonLike } from './validation';

const INTEGRATION_PREFIX = 'integration.';
const ENABLED_FIELD = 'enabled';

const SECRET_TOKENS = [
  'secret',
  'password',
  'token',
  'api_key',
  'private_key',
  'client_secret',
  'webhook_secret',
] as const;

export type IntegrationSettingsItem = {
  provider: string;
  enabled: boolean;
  settings: Record<string, unknown>;
};

function parseDbValue(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function stringifyValue(v: JsonLike): string {
  return JSON.stringify(v);
}

function normalizeProvider(provider: string): string {
  return provider.trim().toLowerCase();
}

function fieldKey(provider: string, field: string): string {
  return `${INTEGRATION_PREFIX}${provider}.${field}`;
}

function isSecretField(field: string): boolean {
  const f = field.toLowerCase();
  return SECRET_TOKENS.some((token) => f.includes(token));
}

function toBool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v !== 'string') return fallback;
  const s = v.trim().toLowerCase();
  if (!s) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(s);
}

function mapRowsToItems(rows: Array<{ key: string; value: string }>, includeSecrets = false): IntegrationSettingsItem[] {
  const out = new Map<string, IntegrationSettingsItem>();

  for (const row of rows) {
    if (!row.key.startsWith(INTEGRATION_PREFIX)) continue;

    const suffix = row.key.slice(INTEGRATION_PREFIX.length);
    const firstDot = suffix.indexOf('.');
    if (firstDot <= 0) continue;

    const provider = normalizeProvider(suffix.slice(0, firstDot));
    const field = suffix.slice(firstDot + 1);
    if (!field) continue;

    const item = out.get(provider) || { provider, enabled: false, settings: {} };
    const parsed = parseDbValue(row.value);

    if (field === ENABLED_FIELD) {
      item.enabled = toBool(parsed, false);
    } else if (includeSecrets || !isSecretField(field)) {
      item.settings[field] = parsed;
    }

    out.set(provider, item);
  }

  return Array.from(out.values()).sort((a, b) => a.provider.localeCompare(b.provider));
}

export async function listIntegrationSettings(params?: {
  provider?: string;
  includeSecrets?: boolean;
}): Promise<IntegrationSettingsItem[]> {
  const includeSecrets = !!params?.includeSecrets;
  const provider = params?.provider ? normalizeProvider(params.provider) : null;

  let rows: Array<{ key: string; value: string }> = [];

  if (provider) {
    rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(like(siteSettings.key, `${INTEGRATION_PREFIX}${provider}.%`))
      .orderBy(asc(siteSettings.key));
  } else {
    rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(like(siteSettings.key, `${INTEGRATION_PREFIX}%`))
      .orderBy(asc(siteSettings.key));
  }

  return mapRowsToItems(rows, includeSecrets);
}

export async function getIntegrationSettings(provider: string, includeSecrets = true): Promise<IntegrationSettingsItem | null> {
  const normalized = normalizeProvider(provider);
  const list = await listIntegrationSettings({ provider: normalized, includeSecrets });
  return list[0] ?? null;
}

export async function upsertIntegrationSettings(
  provider: string,
  input: { enabled?: boolean; settings: Record<string, JsonLike> },
): Promise<IntegrationSettingsItem> {
  const normalized = normalizeProvider(provider);
  const now = new Date();

  const values = Object.entries(input.settings || {}).map(([field, value]) => ({
    id: randomUUID(),
    key: fieldKey(normalized, field),
    value: stringifyValue(value),
    created_at: now,
    updated_at: now,
  }));

  if (typeof input.enabled === 'boolean') {
    values.push({
      id: randomUUID(),
      key: fieldKey(normalized, ENABLED_FIELD),
      value: stringifyValue(input.enabled),
      created_at: now,
      updated_at: now,
    });
  }

  if (values.length) {
    await db.insert(siteSettings).values(values).onDuplicateKeyUpdate({
      set: {
        value: sql`VALUES(${siteSettings.value})`,
        updated_at: sql`VALUES(${siteSettings.updated_at})`,
      },
    });
  }

  const item = await getIntegrationSettings(normalized, true);
  return item ?? { provider: normalized, enabled: false, settings: {} };
}

export async function deleteIntegrationSettings(provider: string): Promise<void> {
  const normalized = normalizeProvider(provider);
  await db
    .delete(siteSettings)
    .where(like(siteSettings.key, `${INTEGRATION_PREFIX}${normalized}.%`));
}

export async function listPublicIntegrationSettings(): Promise<IntegrationSettingsItem[]> {
  const all = await listIntegrationSettings({ includeSecrets: false });
  return all.filter((item) => item.enabled);
}

export async function getPublicIntegrationSettings(provider: string): Promise<IntegrationSettingsItem | null> {
  const item = await getIntegrationSettings(provider, false);
  if (!item) return null;
  return item.enabled ? item : null;
}
