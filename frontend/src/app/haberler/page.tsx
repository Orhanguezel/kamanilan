import type { Metadata } from "next";
import { ArticlesListClient } from "./articles-list-client";

export const metadata: Metadata = {
  title: "Haberler",
  description: "Son dakika haberler, gündem, spor, ekonomi ve daha fazlası.",
  alternates: { canonical: "/haberler" },
};

export default function HaberlerPage() {
  return <ArticlesListClient />;
}
