export const availableLocales = ["tr", "en"] as const;

export type Locale = (typeof availableLocales)[number];

export const defaultLocale: Locale = "tr";

export function getLanguageName(locale: string): string {
  switch (locale) {
    case "tr":
      return "Türkçe";
    case "en":
      return "English";
    default:
      return locale.toUpperCase();
  }
}
