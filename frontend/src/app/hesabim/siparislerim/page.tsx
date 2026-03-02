import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { SiparislerClient } from "./siparisler-client";

export const metadata: Metadata = {
  title: "Siparişlerim",
  robots: { index: false },
};

export default async function SiparislerimPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <SiparislerClient
      translations={{
        my_orders: t("order.my_orders", {}, locale),
        order_number: t("order.order_number", {}, locale),
        order_date: t("order.order_date", {}, locale),
        no_orders: t("order.no_orders", {}, locale),
        items_count: t("order.items_count", {}, locale),
        cancel_order: t("order.cancel_order", {}, locale),
        cancel_confirm: t("order.cancel_confirm", {}, locale),
        cancel_confirm_message: t("order.cancel_confirm_message", {}, locale),
        cancel_yes: t("order.cancel_yes", {}, locale),
        cancel_no: t("order.cancel_no", {}, locale),
        status_pending: t("order.status_pending", {}, locale),
        status_confirmed: t("order.status_confirmed", {}, locale),
        status_processing: t("order.status_processing", {}, locale),
        status_pickup: t("order.status_pickup", {}, locale),
        status_shipped: t("order.status_shipped", {}, locale),
        status_delivered: t("order.status_delivered", {}, locale),
        status_cancelled: t("order.status_cancelled", {}, locale),
        status_on_hold: t("order.status_on_hold", {}, locale),
        filter_all: t("order.filter_all", {}, locale),
        previous: t("common.previous", {}, locale),
        next: t("common.next", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
      }}
    />
  );
}
