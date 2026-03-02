import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { SifreClient } from "./sifre-client";

export const metadata: Metadata = {
  title: "Şifre Değiştir",
  robots: { index: false },
};

export default async function SifreDegistirPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <SifreClient
      translations={{
        change_password: t("account.change_password", {}, locale),
        old_password: t("account.old_password", {}, locale),
        new_password: t("account.new_password", {}, locale),
        confirm_password: t("account.confirm_password", {}, locale),
        password_changed: t("account.password_changed", {}, locale),
        passwords_not_match: t("account.passwords_not_match", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
      }}
    />
  );
}
