import type { Metadata } from "next";
import { AnnouncementsClient } from "./announcements-client";
import BannerSlot from "@/components/ads/BannerSlot";

export const metadata: Metadata = {
  title: "Duyurular | Kaman İlan",
  description: "Kaman İlan platformu duyuruları, haberleri, kampanyaları ve güncellemeleri.",
  alternates: { canonical: "/duyurular" },
};

export default function AnnouncementsPage() {
  return <><BannerSlot position="announcements_top" /><AnnouncementsClient /></>;
}
