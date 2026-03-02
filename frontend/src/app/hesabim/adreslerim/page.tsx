import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { AdreslerClient } from "./adresler-client";

export const metadata: Metadata = {
  title: "Adreslerim",
  robots: { index: false },
};

export default async function AdreslerimPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <AdreslerClient
      translations={{
        addresses: t("account.addresses", {}, locale),
        add_address: t("checkout.add_address", {}, locale),
        address_title: t("checkout.address_title", {}, locale),
        address_field: t("checkout.address_field", {}, locale),
        address_email: t("checkout.address_email", {}, locale),
        address_phone: t("checkout.address_phone", {}, locale),
        address_postal: t("checkout.address_postal", {}, locale),
        set_default: t("checkout.set_default", {}, locale),
        no_addresses: t("checkout.no_addresses", {}, locale),
        address_saved: t("checkout.address_saved", {}, locale),
        save: t("common.save", {}, locale),
        cancel: t("common.cancel", {}, locale),
        delete: t("common.delete", {}, locale),
        edit: t("common.edit", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
      }}
    />
  );
}
