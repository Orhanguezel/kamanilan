"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import {
  useConversationsQuery,
  useConversationMessagesQuery,
  useSendMessageMutation,
  useMarkSeenMutation,
} from "@/modules/chat/chat.service";
import type { Conversation } from "@/modules/chat/chat.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  Search,
  User,
} from "lucide-react";
import { t } from "@/lib/t";

export function ChatClient() {
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: listLoading } = useConversationsQuery();
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessagesQuery(
    selectedConv?.id ?? null
  );
  const sendMessage = useSendMessageMutation(selectedConv?.id ?? null);
  const markSeen = useMarkSeenMutation();

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark seen when opening a conversation
  useEffect(() => {
    if (selectedConv && selectedConv.unread_count > 0) {
      markSeen.mutate(selectedConv.id);
    }
  }, [selectedConv?.id]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    return c.other_user_id.toLowerCase().includes(search.toLowerCase());
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedConv) return;
    sendMessage.mutate(messageText.trim(), {
      onSuccess: () => setMessageText(""),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatConvDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t("nav.home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t("nav.mesajlar")}</span>
      </nav>

      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <MessageCircle className="h-6 w-6" />
        {t("nav.mesajlar")}
      </h1>

      <div className="overflow-hidden rounded-xl border bg-card" style={{ height: "70vh" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div
            className={`w-full flex-shrink-0 border-r md:w-80 ${
              selectedConv ? "hidden md:flex md:flex-col" : "flex flex-col"
            }`}
          >
            {/* Search */}
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("chat.search_placeholder")}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">{t("chat.no_conversations")}</p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedConv?.id === conv.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">
                          {t("chat.user_label")} {conv.other_user_id.slice(0, 8)}...
                        </p>
                        <div className="ml-2 flex flex-col items-end gap-1">
                          <span className="text-[10px] text-muted-foreground">
                            {formatConvDate(conv.last_message_at)}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      {conv.last_message && (
                        <p className="truncate text-xs text-muted-foreground">
                          {conv.last_message.body}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex flex-1 flex-col ${selectedConv ? "flex" : "hidden md:flex"}`}
          >
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="rounded-md p-1 hover:bg-muted md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("chat.user_label")} {selectedConv.other_user_id.slice(0, 8)}...
                    </p>
                    {selectedConv.property_id && (
                      <p className="text-xs text-muted-foreground">
                        {t("chat.about_listing")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">{t("chat.no_messages")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isMine = msg.sender_id !== selectedConv.other_user_id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{msg.body}</p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isMine
                                    ? "text-primary-foreground/60"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("chat.type_message")}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      className="flex-shrink-0"
                      onClick={handleSend}
                      disabled={!messageText.trim() || sendMessage.isPending}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">{t("chat.select_conversation")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
