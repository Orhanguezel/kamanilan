"use client";

import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HomeSections } from "./home-sections";
import type { SliderItem } from "@/modules/site/site.type";

interface Props {
  initialSlides?: SliderItem[];
  heroAd?: ReactNode;
  sponsorSection?: ReactNode;
}

/**
 * Wrapper client component that seeds the TanStack Query cache with SSR-fetched
 * sliders BEFORE HomeSections renders. HeroSection then reads from cache
 * synchronously — no skeleton, no client-side waterfall, no layout shift.
 *
 * Using setQueryData directly (instead of HydrationBoundary) avoids the React
 * 19 / Next 16 hydration mismatch that was unmounting the hero on the client.
 */
export function HomeClient({ initialSlides, heroAd, sponsorSection }: Props) {
  const qc = useQueryClient();

  if (initialSlides && initialSlides.length) {
    const cached = qc.getQueryData<SliderItem[]>(["sliders"]);
    if (!cached || cached.length === 0) {
      qc.setQueryData(["sliders"], initialSlides);
    }
  }

  return <HomeSections heroAd={heroAd} sponsorSection={sponsorSection} />;
}
