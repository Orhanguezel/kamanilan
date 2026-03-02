import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { ProfilClient } from "./profil-client";

export const metadata: Metadata = {
  title: "Profil Bilgileri",
  robots: { index: false },
};

export default async function ProfilPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <ProfilClient
      translations={{
        profile: t("account.profile", {}, locale),
        first_name: t("account.first_name", {}, locale),
        last_name: t("account.last_name", {}, locale),
        email: t("account.email", {}, locale),
        phone: t("account.phone", {}, locale),
        birth_day: t("account.birth_day", {}, locale),
        gender: t("account.gender", {}, locale),
        gender_male: t("account.gender_male", {}, locale),
        gender_female: t("account.gender_female", {}, locale),
        gender_others: t("account.gender_others", {}, locale),
        profile_updated: t("account.profile_updated", {}, locale),
        save: t("common.save", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
        delete_account: t("account.delete_account", {}, locale),
        delete_account_message: t("account.delete_account_message", {}, locale),
        delete_yes: t("account.delete_yes", {}, locale),
        delete_no: t("account.delete_no", {}, locale),
      }}
    />
  );
}
