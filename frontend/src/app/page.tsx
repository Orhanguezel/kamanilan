import type { Metadata } from "next";
import { t } from "@/lib/t";
import { HomeSections } from "@/components/home/home-sections";
import { HeroPreload } from "@/components/home/hero-preload";

export const metadata: Metadata = {
  title: { absolute: t("seo.home_title") },
  description: t("seo.home_description"),
};

export default function HomePage() {
  return (
    <>
      <HeroPreload />
      <HomeSections />
    </>
  );
}
