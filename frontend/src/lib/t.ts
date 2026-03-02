/**
 * Basit çeviri sistemi.
 * İleride dil eklenmek istendiğinde:
 *  1. src/locales/en.json ekle
 *  2. Bu dosyada aktif dili bir context/cookie'den oku
 *  3. t() fonksiyonunu o dile göre güncelle
 */
import tr from "@/locales/tr.json";

type Dict = Record<string, unknown>;

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
 * Çeviri fonksiyonu.
 *
 * @example
 * t("common.search")           // "Ara"
 * t("listing.showing", { from: 1, to: 10, total: 42 })  // "1–10 / 42 ilan gösteriliyor"
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let value = resolve(tr as unknown, key);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}
