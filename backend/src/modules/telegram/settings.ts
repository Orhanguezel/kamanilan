import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { siteSettings } from '@/modules/siteSettings/schema';

/**
 * Ensotek Telegram Event Types
 */
export type TelegramEvent =
  | 'new_catalog_request'
  | 'new_offer_request'
  | 'new_contact'
  | 'new_ticket'
  | 'ticket_replied'
  | 'new_newsletter_subscription';

type TelegramSettings = {
  enabled: boolean;
  webhookEnabled: boolean;
  botToken: string;
  defaultChatId: string | null;
  legacyChatId: string | null;
  events: Partial<Record<TelegramEvent, boolean>>;
  templates: Partial<Record<TelegramEvent, string>>;
};

const GLOBAL_LOCALE = '*';

function toBool(v: string | null | undefined, fallback = false): boolean {
  if (v == null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (!s) return fallback;
  return ['1', 'true', 'yes', 'on', 'y'].includes(s);
}

function toText(v: string | null | undefined): string {
  return String(v ?? '').trim();
}

export async function getSiteSettingsMap(keys: readonly string[]): Promise<Map<string, string>> {
  if (!keys.length) return new Map();

  const rows = await db
    .select({ key: siteSettings.key, locale: siteSettings.locale, value: siteSettings.value })
    .from(siteSettings)
    .where(and(inArray(siteSettings.key, keys as string[]), inArray(siteSettings.locale, [GLOBAL_LOCALE])));

  const out = new Map<string, string>();
  for (const k of keys) {
    const hit = rows.find((r) => r.key === k && r.locale === GLOBAL_LOCALE);
    if (hit) out.set(k, String(hit.value ?? ''));
  }
  return out;
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
  const events: TelegramEvent[] = [
    'new_catalog_request',
    'new_offer_request',
    'new_contact',
    'new_ticket',
    'ticket_replied',
    'new_newsletter_subscription',
  ];

  const eventEnableKeys = events.flatMap((e) => [
    `telegram_event_${e}_enabled`,
    `telegram_${e}_enabled`,
  ]);
  const templateKeys = events.flatMap((e) => [`telegram_template_${e}`, `telegram_${e}_template`]);

  const baseKeys = [
    'telegram_notifications_enabled',
    'telegram_enabled',
    'telegram_webhook_enabled',
    'telegram_bot_token',
    'telegram_default_chat_id',
    'telegram_chat_id',
  ];

  const allKeys = [...baseKeys, ...eventEnableKeys, ...templateKeys];
  const map = await getSiteSettingsMap(allKeys);

  const enabled =
    toBool(map.get('telegram_notifications_enabled'), false) ||
    toBool(map.get('telegram_enabled'), false);

  const webhookEnabled = toBool(map.get('telegram_webhook_enabled'), true);
  const botToken = toText(map.get('telegram_bot_token'));
  const defaultChatId = toText(map.get('telegram_default_chat_id')) || null;
  const legacyChatId = toText(map.get('telegram_chat_id')) || null;

  const eventMap: Partial<Record<TelegramEvent, boolean>> = {};
  const templates: Partial<Record<TelegramEvent, string>> = {};

  for (const event of events) {
    const enabledRaw =
      map.get(`telegram_event_${event}_enabled`) ?? map.get(`telegram_${event}_enabled`) ?? null;
    if (enabledRaw != null) eventMap[event] = toBool(enabledRaw, true);

    const templateRaw =
      map.get(`telegram_template_${event}`) ?? map.get(`telegram_${event}_template`) ?? null;
    const tpl = toText(templateRaw);
    if (tpl) templates[event] = tpl;
  }

  return {
    enabled,
    webhookEnabled,
    botToken,
    defaultChatId,
    legacyChatId,
    events: eventMap,
    templates,
  };
}
