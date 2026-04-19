import type { Metadata } from "next";
import { t } from "@/lib/t";
import { HomeClient } from "@/components/home/home-client";
import { HeroPreload } from "@/components/home/hero-preload";
import type { SliderItem } from "@/modules/site/site.type";

export const metadata: Metadata = {
  title: { absolute: t("seo.home_title") },
  description: t("seo.home_description"),
};

const rawApiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";
const apiBase = rawApiBase.endsWith("/api") ? `${rawApiBase}/v1` : rawApiBase;

async function fetchSliders(): Promise<SliderItem[]> {
  try {
    const res = await fetch(`${apiBase}/sliders`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const raw = await res.json();
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sliders = await fetchSliders();

  return (
    <>
      <HeroPreload />
      <HomeClient initialSlides={sliders} />
    </>
  );
}
