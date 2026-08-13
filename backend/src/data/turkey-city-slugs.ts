export const CITY_DISTRICT_SLUGS: Record<string, string[]> = {
  kaman: [],
  kirsehir: ["kaman"],
};

export function isValidCitySlug(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(CITY_DISTRICT_SLUGS, value);
}
