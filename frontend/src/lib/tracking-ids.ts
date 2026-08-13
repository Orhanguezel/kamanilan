export function normalizeGoogleAdsId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const candidate = raw.toUpperCase().startsWith("AW-")
    ? raw.toUpperCase()
    : `AW-${raw.replace(/^AW-/i, "")}`;
  return /^AW-\d+$/.test(candidate) ? candidate : null;
}

export function normalizeGa4MeasurementId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toUpperCase();
  return /^G-[A-Z0-9]+$/.test(candidate) ? candidate : null;
}

export function selectGoogleTagLoaderId(
  googleAdsId: string | null,
  ga4MeasurementId: string | null
): string | null {
  // Ads destinations serve the shared gtag.js loader reliably. A GA4 stream ID
  // that is syntactically valid but not provisioned can return 404 and prevent
  // every Google destination (including Tag Assistant) from initializing.
  return googleAdsId ?? ga4MeasurementId;
}
