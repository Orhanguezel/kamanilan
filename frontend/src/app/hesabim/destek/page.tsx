import type { Metadata } from "next";
import { cookies } from "next/headers";
import { t, type Locale } from "@/lib/t";
import { DestekClient } from "./destek-client";

export const metadata: Metadata = {
  title: "Destek",
  robots: { index: false },
};

export default async function DestekPage() {
  const locale = (((await cookies()).get("lang")?.value) ?? "tr") as Locale;
  return (
    <DestekClient
      translations={{
        support: t("support.support", {}, locale),
        new_ticket: t("support.new_ticket", {}, locale),
        ticket_title: t("support.ticket_title", {}, locale),
        ticket_subject: t("support.ticket_subject", {}, locale),
        ticket_priority: t("support.ticket_priority", {}, locale),
        priority_low: t("support.priority_low", {}, locale),
        priority_medium: t("support.priority_medium", {}, locale),
        priority_high: t("support.priority_high", {}, locale),
        priority_urgent: t("support.priority_urgent", {}, locale),
        status_open: t("support.status_open", {}, locale),
        status_closed: t("support.status_closed", {}, locale),
        no_tickets: t("support.no_tickets", {}, locale),
        view_conversation: t("support.view_conversation", {}, locale),
        type_message: t("support.type_message", {}, locale),
        resolve_ticket: t("support.resolve_ticket", {}, locale),
        save: t("common.save", {}, locale),
        cancel: t("common.cancel", {}, locale),
        loading: t("common.loading", {}, locale),
        error: t("common.error", {}, locale),
      }}
    />
  );
}
