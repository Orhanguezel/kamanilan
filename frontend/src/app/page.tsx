import type { Metadata } from "next";
import { t } from "@/lib/t";
import { HomeClient } from "@/components/home/home-client";
import { SponsoredBusinessesSection } from "@/components/home/sponsored-businesses-section";
import type { SliderItem } from "@/modules/site/site.type";
import BannerSlot from "@/components/ads/BannerSlot";

export const metadata: Metadata = {
  title: { absolute: t("seo.home_title") },
  description: t("seo.home_description"),
  alternates: { canonical: "https://www.kamanilan.com/" },
  openGraph: { url: "https://www.kamanilan.com/", type: "website" },
};

const rawApiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";
const apiBase = rawApiBase.endsWith("/api") ? `${rawApiBase}/v1` : rawApiBase;

async function fetchSliders(): Promise<SliderItem[]> {
  try {
    const res = await fetch(`${apiBase}/sliders`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const raw = await res.json();
    const items: SliderItem[] = Array.isArray(raw) ? raw : raw?.data ?? [];
    return items.slice(0, 1);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sliders = await fetchSliders();

  return (
    <HomeClient
      initialSlides={sliders}
      heroAd={<BannerSlot position="home_hero_below" />}
      sponsorSection={<SponsoredBusinessesSection />}
    />
  );
}
