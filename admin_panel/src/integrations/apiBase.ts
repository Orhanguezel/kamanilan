// =============================================================
// FILE: src/integrations/apiBase.ts
// FINAL — Central API base resolver (shared by RTK + server SEO)
// - Exports: BASE_URL
// - Same logic as baseApi.ts (kept stable)
// =============================================================

function trimSlash(x: string) {
  return x.replace(/\/+$/, '');
}
function ensureLeadingSlash(x: string) {
  return x.startsWith('/') ? x : `/${x}`;
}
function isAbsUrl(x: string) {
  return /^https?:\/\//i.test(x);
}
function joinOriginAndBase(origin?: string, base?: string) {
  if (!origin) return '';
  const o = trimSlash(origin);
  if (!base) return o;
  const b = trimSlash(base);
  return o + ensureLeadingSlash(b);
}

const IS_DEV = process.env.NODE_ENV !== 'production';

/** Prod'da (ve baked env bozuksa) kullanilan goreli taban.
 *  nginx panel.kamanilan.com'da `location ^~ /api/` isteklerini dogrudan
 *  backend'e (8097) yolluyor ve yolu KORUYOR — yani istemci `/api/v1/...`
 *  cagirmali. Next rewrite'i devreye girmez. */
const RELATIVE_BASE = '/api/v1';

/** Kamanilan backend lokalde 8078'de ve tum rotalar /api/v1 altinda. */
function guessDevBackend(): string {
  try {
    if (typeof window !== 'undefined') {
      const loc = window.location;
      const host = loc?.hostname || 'localhost';
      const proto = loc?.protocol || 'http:';
      return `${proto}//${host}:8078${RELATIVE_BASE}`;
    }
  } catch {
    // ignore
  }
  return `http://localhost:8078${RELATIVE_BASE}`;
}

/** Tarayici localhost DISI bir host'ta calisiyorsa, build'e gomulmus
 *  localhost tabani ziyaretcinin kendi makinesine istek atar ve
 *  ERR_CONNECTION_REFUSED verir (panel.kamanilan.com'da yasandi).
 *  Boyle bir durumda goreli tabana dus — nginx dogru backend'e yollar. */
function isUnreachableLocalhostBase(base: string): boolean {
  if (typeof window === 'undefined' || !isAbsUrl(base)) return false;
  try {
    const target = new URL(base).hostname;
    const current = window.location.hostname;
    const local = (h: string) => h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
    return local(target) && !local(current);
  } catch {
    return false;
  }
}

/**
 * Env resolution (Next.js):
 * - NEXT_PUBLIC_API_URL      : full base url, e.g. https://api.domain.com/api
 * - NEXT_PUBLIC_API_ORIGIN   : origin only, e.g. https://api.domain.com
 * - NEXT_PUBLIC_API_BASE     : base path, e.g. /api  (or api)
 * Fallback:
 * - DEV: guessed http(s)://{host}:8078/api/v1
 * - PROD: /api/v1  (nginx bunu backend'e proxy'ler)
 */
export function resolveBaseUrl(): string {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN || '').trim();
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE || '').trim();

  // 1) Full URL preferred
  if (apiUrl && isAbsUrl(apiUrl)) return guardLocalhost(trimSlash(apiUrl));

  // 2) origin + base together
  if (apiOrigin && apiBase) return guardLocalhost(joinOriginAndBase(apiOrigin, apiBase));

  // 3) only base provided
  if (apiBase) {
    if (isAbsUrl(apiBase)) return guardLocalhost(trimSlash(apiBase));
    return ensureLeadingSlash(trimSlash(apiBase));
  }

  // 4) fallbacks
  if (IS_DEV) return guessDevBackend();
  return RELATIVE_BASE;
}

function guardLocalhost(base: string): string {
  return isUnreachableLocalhostBase(base) ? RELATIVE_BASE : base;
}

export const BASE_URL = resolveBaseUrl();
