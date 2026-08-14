"use client";

import type { ReactNode } from "react";
import { HeroSection } from "./hero-section";
import { MarketplaceHome } from "./marketplace-home";

/**
 * Ana sayfanın kilitli kompozisyonu tasarım konsepti 02'yi izler.
 * Yönetilebilir kampanya/reklam alanları sayfa seviyesindeki BannerSlot'larda kalır;
 * theme.layout_blocks ana pazar akışını büyütüp bozmaz.
 */
export function HomeSections({
  heroAd,
  sponsorSection,
}: {
  heroAd?: ReactNode;
  sponsorSection?: ReactNode;
}) {
  return (
    <>
      <HeroSection />
      {heroAd}
      <MarketplaceHome sponsorSection={sponsorSection} />
    </>
  );
}
