import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { SonGoruntulenenlerClient } from "./son-goruntulenenler-client";

export const metadata: Metadata = {
  title: "Son Görüntülenenler",
  robots: { index: false },
};

export default async function SonGoruntulenenlerPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <SonGoruntulenenlerClient
      translations={{
        recently_viewed: t("account.recently_viewed", {}, locale),
        no_recently_viewed: t("account.no_recently_viewed", {}, locale),
        clear_history: t("account.clear_history", {}, locale),
      }}
    />
  );
}
