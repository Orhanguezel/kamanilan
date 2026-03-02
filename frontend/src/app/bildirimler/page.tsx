import type { Metadata } from "next";
import { t } from "@/lib/t";
import { NotificationClient } from "./notification-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("notification.title"),
    robots: { index: false },
    alternates: { canonical: "/bildirimler" },
  };
}

export default async function NotificationPage() {
  return <NotificationClient />;
}
