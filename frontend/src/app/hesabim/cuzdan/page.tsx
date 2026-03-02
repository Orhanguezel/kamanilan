import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { WalletClient } from "./wallet-client";

export const metadata: Metadata = {
  title: "Cüzdan",
  robots: { index: false },
};

export default async function CuzdanPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <WalletClient
      translations={{
        wallet: t("account.wallet", {}, locale),
        wallet_balance: t("account.wallet_balance", {}, locale),
        wallet_earnings: t("account.wallet_earnings", {}, locale),
        wallet_withdrawn: t("account.wallet_withdrawn", {}, locale),
        wallet_transactions: t("account.wallet_transactions", {}, locale),
        wallet_no_transactions: t("account.wallet_no_transactions", {}, locale),
        wallet_all: t("account.wallet_all", {}, locale),
        wallet_credit: t("account.wallet_credit", {}, locale),
        wallet_debit: t("account.wallet_debit", {}, locale),
        wallet_status_pending: t("account.wallet_status_pending", {}, locale),
        wallet_status_completed: t("account.wallet_status_completed", {}, locale),
        wallet_status_failed: t("account.wallet_status_failed", {}, locale),
        wallet_status_refunded: t("account.wallet_status_refunded", {}, locale),
        wallet_suspended: t("account.wallet_suspended", {}, locale),
        wallet_closed: t("account.wallet_closed", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
        previous: t("common.previous", {}, locale),
        next: t("common.next", {}, locale),
      }}
    />
  );
}
