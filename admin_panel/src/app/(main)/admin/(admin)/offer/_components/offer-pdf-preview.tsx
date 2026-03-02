'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/offer/_components/offer-pdf-preview.tsx
// Offer PDF iframe preview with URL resolution
// =============================================================

import * as React from 'react';

interface OfferPdfPreviewProps {
  pdfUrl: string | null;
  emptyMessage?: string;
  fallbackLabel?: string;
}

function getFileBase(): string {
  // 1) Explicit env override
  const envBase = (process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    (process.env as any).NEXT_PUBLIC_PUBLIC_BASE_URL ||
    '') as string;

  const cleaned = String(envBase).trim().replace(/\/+$/, '');
  if (cleaned) return cleaned;

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;

    // 2) Localhost → backend origin (where /uploads/ is served by @fastify/static)
    //    NEXT_PUBLIC_API_URL may end with /api — strip it to get the bare origin
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
      if (apiUrl) {
        try {
          const u = new URL(apiUrl);
          return u.origin; // e.g. http://localhost:8086
        } catch {
          return apiUrl.replace(/\/api\/?$/, '');
        }
      }

      const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN || '').trim().replace(/\/+$/, '');
      if (apiOrigin) return apiOrigin;

      // fallback: same host, backend port
      return `${protocol}//${hostname}:8084`;
    }

    // 3) Production → same origin (nginx serves /uploads/)
    return String(window.location.origin || '').trim().replace(/\/+$/, '');
  }

  return 'https://www.ensotek.de';
}

function normalizePdfPath(pdfUrl: string): string {
  const s = String(pdfUrl || '').trim();
  if (!s) return '/uploads';
  if (/^https?:\/\//i.test(s)) return s;

  const [pathOnly, suffix = ''] = s.split(/(?=[?#])/);
  const cleaned = String(pathOnly).replace(/^https?:\/\/[^/]+/i, '');
  let p = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

  while (p.startsWith('/api/api/')) p = p.replace('/api/api/', '/api/');

  if (p === '/api/uploads') return `/uploads${suffix}`;
  if (p.startsWith('/api/uploads/')) return `${p.replace(/^\/api/, '')}${suffix}`;
  if (p === '/uploads' || p.startsWith('/uploads/')) return `${p}${suffix}`;

  const idx = p.indexOf('/uploads/');
  if (idx >= 0) return `${p.substring(idx)}${suffix}`;

  return `/uploads${p}${suffix}`.replace(/^\/uploads\/uploads(\/|$)/, '/uploads$1');
}

function buildIframeSrc(pdfUrl: string | null): string | null {
  const raw = String(pdfUrl || '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const fileBase = getFileBase();
  const normalized = normalizePdfPath(raw);
  const base = String(fileBase).replace(/\/+$/, '');
  return `${base}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
}

export function OfferPdfPreview({ pdfUrl, emptyMessage, fallbackLabel }: OfferPdfPreviewProps) {
  const iframeSrc = React.useMemo(() => buildIframeSrc(pdfUrl), [pdfUrl]);

  if (!iframeSrc) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        {emptyMessage || 'PDF not generated yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border" style={{ height: 600 }}>
        <iframe
          title="Offer PDF Preview"
          src={iframeSrc}
          className="size-full rounded-lg"
          style={{ border: 'none' }}
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {fallbackLabel || 'If PDF does not load,'}{' '}
        <a href={iframeSrc} target="_blank" rel="noreferrer" className="underline">
          {fallbackLabel ? '' : 'open in a new tab'}
        </a>
        <br />
        <code className="text-xs">{iframeSrc}</code>
      </p>
    </div>
  );
}
