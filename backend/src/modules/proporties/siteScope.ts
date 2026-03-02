// =============================================================
// FILE: src/modules/properties/siteScope.ts
// Danabank site scope defaults (optional)
// - If you want Kırşehir/Kaman-focused listing site, keep defaults enabled.
// - Later you can disable or make it dynamic (site_settings).
// =============================================================
export const SITE_SCOPE = {
  enabled: true,

  // default focus
  defaultCity: 'Kırşehir',
  defaultDistrict: 'Kaman',
} as const;
