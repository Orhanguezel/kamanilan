// =============================================================
// FILE: src/lib/cities.ts
// Kamanilan SEO icin kritik sehir/ilce listesi.
// Strateji: Kaman + Kirsehir + cevre = rekabetsiz long-tail keywords.
// Her giris URL-slug (ASCII) ile DB'deki display name arasinda kopru.
// =============================================================

export type CityDef = {
  slug: string;          // URL'de: /kategori/emlak-kira/kaman
  displayName: string;   // Kart/baslik metni + backend query degeri
  parent?: string;       // Ust idari birim (Kirsehir, Ankara vb.)
  priority: number;      // Sitemap + sayfa onceligi; yuksek = daha onemli
};

// ─────────────────────────────────────────────────────────────
// Oncelik sirasina gore
//   1.0 = ana hedef (her kategoride indexlensin)
//   0.8 = cevre (emlak gibi yaygin kategorilerde indexlensin)
//   0.5 = il merkezi / bolgesel
// ─────────────────────────────────────────────────────────────
export const CITIES: readonly CityDef[] = [
  // Kaman ve kaman ilcesi (ana hedef)
  { slug: "kaman",         displayName: "Kaman",        parent: "Kirsehir", priority: 1.0 },

  // Kirsehir ili
  { slug: "kirsehir",      displayName: "Kirsehir",                        priority: 0.8 },
  { slug: "kirsehir-merkez", displayName: "Kirsehir Merkez", parent: "Kirsehir", priority: 0.7 },
  { slug: "mucur",         displayName: "Mucur",        parent: "Kirsehir", priority: 0.6 },
  { slug: "akpinar",       displayName: "Akpinar",      parent: "Kirsehir", priority: 0.6 },
  { slug: "boztepe",       displayName: "Boztepe",      parent: "Kirsehir", priority: 0.5 },
  { slug: "cicekdagi",     displayName: "Cicekdagi",    parent: "Kirsehir", priority: 0.5 },
  { slug: "akcakent",      displayName: "Akcakent",     parent: "Kirsehir", priority: 0.5 },

  // Kaman'a yakin: Ankara/Kocasinan (sohbet yakin bolge)
  { slug: "ankara",        displayName: "Ankara",                          priority: 0.4 },
  { slug: "kayseri",       displayName: "Kayseri",                         priority: 0.4 },
] as const;

const BY_SLUG = new Map<string, CityDef>(CITIES.map((c) => [c.slug, c]));

export function getCityBySlug(slug: string): CityDef | null {
  if (!slug) return null;
  return BY_SLUG.get(slug.toLowerCase()) ?? null;
}

export function isValidCitySlug(slug: string): boolean {
  return BY_SLUG.has(slug.toLowerCase());
}

/**
 * Sitemap + landing page navigasyonu icin onceligi >= threshold olanlar.
 * Default threshold 0.5 — orta seviye ve uzeri.
 */
export function priorityCities(threshold = 0.5): CityDef[] {
  return CITIES
    .filter((c) => c.priority >= threshold)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Kaman'in ana hedef oldugu kategorilerde anchor link'lerin listesi.
 */
export const KAMAN_FOCUS_CITIES = CITIES.filter((c) => c.priority >= 0.6);
