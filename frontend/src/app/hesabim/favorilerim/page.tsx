import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { FavoriteListingsClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "Favorilerim",
  robots: { index: false },
};

export default async function FavorilerimPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <FavoriteListingsClient
      translations={{
        favorites: t("account.favorites", {}, locale),
        favorites_empty: t("account.favorites_empty", {}, locale),
        favorites_empty_desc: t("account.favorites_empty_desc", {}, locale),
        favorites_count: t("account.favorites_count", {}, locale),
        browse_listings: t("home.browse_listings", {}, locale),
        loading: t("common.loading", {}, locale),
      }}
    />
  );
}
