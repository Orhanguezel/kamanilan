import type { Metadata } from "next";
import { t } from "@/lib/t";

export const metadata: Metadata = {
  title: t("seo.my_listings_title"),
};

export default function MyListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{t("listing.my_listings")}</h1>
      <p className="mt-2 text-muted-foreground">{t("listing.no_listings")}</p>
    </div>
  );
}
