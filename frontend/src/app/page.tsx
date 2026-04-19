import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { t } from "@/lib/t";
import { HomeSections } from "@/components/home/home-sections";
import type { SliderItem } from "@/modules/site/site.type";

export const metadata: Metadata = {
  title: { absolute: t("seo.home_title") },
  description: t("seo.home_description"),
};

const apiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api/v1";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchSliders(): Promise<SliderItem[]> {
  const raw = await fetchJson<SliderItem[] | { data: SliderItem[] }>("/sliders");
  if (!raw) return [];
  return Array.isArray(raw) ? raw : raw.data ?? [];
}

async function fetchPopups(type: string) {
  const raw = await fetchJson<unknown[]>(`/popups?limit=20&sort=display_order&order=asc&type=${type}`);
  return Array.isArray(raw) ? raw : [];
}

export default async function HomePage() {
  const qc = new QueryClient();
  await Promise.all([
    qc.prefetchQuery({ queryKey: ["sliders"], queryFn: fetchSliders }),
    qc.prefetchQuery({ queryKey: ["popups", "topbar"], queryFn: () => fetchPopups("topbar") }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HomeSections />
    </HydrationBoundary>
  );
}
