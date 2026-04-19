"use client";

import dynamic from "next/dynamic";

// CSR-only — SSR'de hydration hook-order mismatch (React #310) yaratıyordu.
// Zustand persist + TanStack Query + react-hook-form kombinasyonu server render'da
// client ile farklı fiber tree üretiyor. CSR-only render ile garantili uyum.
export const ProfilClient = dynamic(
  () => import("./profil-client").then((m) => ({ default: m.ProfilClient })),
  { ssr: false, loading: () => null }
);
