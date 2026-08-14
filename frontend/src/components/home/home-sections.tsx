"use client";

import { HeroSection } from "./hero-section";
import { MarketplaceHome } from "./marketplace-home";

/**
 * Ana sayfanın kilitli kompozisyonu tasarım konsepti 02'yi izler.
 * Yönetilebilir kampanya/reklam alanları sayfa seviyesindeki BannerSlot'larda kalır;
 * theme.layout_blocks ana pazar akışını büyütüp bozmaz.
 */
export function HomeSections() {
  return (
    <>
      <HeroSection />
      <MarketplaceHome />
    </>
  );
}
