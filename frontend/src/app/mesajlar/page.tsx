import type { Metadata } from "next";
import { t } from "@/lib/t";
import { ChatClient } from "./chat-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: t("nav.mesajlar"),
    robots: { index: false },
  };
}

export default async function ChatPage() {
  return <ChatClient />;
}
