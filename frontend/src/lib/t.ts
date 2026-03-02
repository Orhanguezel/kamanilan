/**
 * Çeviri sistemi.
 * Aktif dil "lang" cookie'sinden okunur (tr | en).
 * Server component'larda: t("key") — otomatik olarak cookie'yi okur.
 * Client component'larda çeviriler server'dan prop olarak gelir.
 */
import tr from "@/locales/tr.json";
import en from "@/locales/en.json";

export type Locale = "tr" | "en";

type Dict = Record<string, unknown>;

const dicts: Record<Locale, Dict> = {
  tr: tr as unknown as Dict,
  en: en as unknown as Dict,
};

function resolve(obj: unknown, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Dict)[key];
  }
  return typeof current === "string" ? current : path;
}

/**
 * Server-side çeviri — locale parametresi ile kullanın.
 *
 * @example
 * // page.tsx içinde:
 * import { cookies } from "next/headers";
 * const locale = ((await cookies()).get("lang")?.value ?? "tr") as Locale;
 * t("account.profile", {}, locale)
 *
 * // locale belirtilmezse Türkçe döner (geriye dönük uyumluluk)
 * t("common.save")
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  locale: Locale = "tr"
): string {
  const dict = dicts[locale] ?? dicts.tr;
  // Önce seçili dilde ara, bulamazsan TR'ye düş
  let value = resolve(dict, key);
  if (value === key && locale !== "tr") {
    value = resolve(dicts.tr, key);
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}
