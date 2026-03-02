"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2, Sparkles } from "lucide-react";
import { t } from "@/lib/t";
import { useChatWidgetStore } from "@/stores/chat-widget-store";
import { useAiChatSendMutation } from "@/modules/ai-chat/ai-chat.service";
import Image from "next/image";

export function ChatWidget() {
  const {
    isOpen,
    messages,
    sessionId,
    isTyping,
    toggle,
    addMessage,
    setTyping,
    clearMessages,
  } = useChatWidgetStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMutation = useAiChatSendMutation();
  const buildMsg = (role: "user" | "assistant", content: string) => ({
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    role,
    content,
    createdAt: new Date(),
  });

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    addMessage(buildMsg("user", trimmed));
    setInput("");
    setTyping(true);

    try {
      const result = await sendMutation.mutateAsync({
        message: trimmed,
        session_id: sessionId ?? undefined,
      });

      addMessage(buildMsg("assistant", result.message));
    } catch {
      addMessage(buildMsg("assistant", t("chat_widget.error_message")));
    } finally {
      setTyping(false);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button - Bottom Left */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 left-6 z-40 group"
          aria-label={t("chat_widget.open_chat")}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 blur-md transition-opacity group-hover:opacity-100" />
            
            {/* Main button */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg transition-transform group-hover:scale-110">
              <Image
                src="/assets/icons/support_ai.png"
                alt="AI Support"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 animate-ping" />
          </div>
        </button>
      )}

      {/* Chat Panel - Bottom Left */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-40 flex h-[480px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border">
          {/* Header with gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Image
                    src="/assets/icons/support_ai.png"
                    alt="AI"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {t("chat_widget.ai_assistant")}
                    <Sparkles className="h-3.5 w-3.5" />
                  </h3>
                  <p className="text-xs text-white/80">{t("chat_widget.always_online")}</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label={t("chat_widget.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {t("chat_widget.welcome_message")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("chat_widget.how_can_help")}
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-card text-foreground border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-card border px-4 py-3 shadow-sm">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-card p-3">
            {messages.length > 0 && (
              <div className="mb-2 flex justify-end">
                <button
                  onClick={clearMessages}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  {t("chat_widget.clear")}
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat_widget.input_placeholder")}
                className="flex-1 rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
