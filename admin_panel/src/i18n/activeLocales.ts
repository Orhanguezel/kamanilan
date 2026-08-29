// =============================================================
// FILE: src/i18n/activeLocales.ts
// (DYNAMIC LOCALES) - FIXED (/api tolerant + stable normalization)
// =============================================================

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_LOCALE } from './config';
import { normLocaleTag } from './localeUtils';
import { BASE_URL } from '@/integrations/apiBase';
import { computeActiveLocales, normalizeAppLocalesMeta, type AppLocaleMeta } from './app-locales-meta';

function getApiBase(): string {
  // Tek kaynak: integrations/apiBase. Onceden burada ayri env sirasi + '/api'
  // ekleme mantigi vardi; RTK ile farkli taban uretip yanlis URL'e istek atiyordu.
  return BASE_URL;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ✅ Minimal in-memory cache (page lifetime)
let __cache: { at: number; meta: AppLocaleMeta[] | null } | null = null;
const CACHE_TTL_MS = 60_000;

export function useActiveLocales() {
  const [meta, setMeta] = useState<AppLocaleMeta[] | null>(() => {
    if (__cache && Date.now() - __cache.at < CACHE_TTL_MS) return __cache.meta;
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // cache validse fetch yok
    if (__cache && Date.now() - __cache.at < CACHE_TTL_MS) {
      setMeta(__cache.meta);
      return;
    }

    const base = getApiBase();
    if (!base) {
      __cache = { at: Date.now(), meta: null };
      setMeta(null);
      return;
    }

    setIsLoading(true);

    (async () => {
      // ✅ Varsayım: GET {API_BASE}/site_settings/app-locales
      // API_BASE burada .../api ile biter.
      const raw = await fetchJson<any>(`${base}/site_settings/app-locales`);
      const arr = normalizeAppLocalesMeta(raw);

      const next = arr.length ? arr : null;
      __cache = { at: Date.now(), meta: next };

      setMeta(next);
      setIsLoading(false);
    })();
  }, []);

  const locales = useMemo<string[]>(() => computeActiveLocales(meta as AppLocaleMeta[] | null, FALLBACK_LOCALE), [meta]);

  return { locales, isLoading };
}
