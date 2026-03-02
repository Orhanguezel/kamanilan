"use client";

import { useState, useRef, useEffect } from "react";
import {
  useTicketListQuery,
  useTicketRepliesQuery,
  useCreateTicketMutation,
  useAddReplyMutation,
  useCloseTicketMutation,
} from "@/modules/support/support.service";
import type { SupportTicket, TicketReply, TicketPriority } from "@/modules/support/support.type";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Headphones,
  Plus,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

type View = "list" | "create" | "conversation";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  waiting_response: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function DestekClient({ translations: tr }: Props) {
  const authUser = useAuthStore((s) => s.user as any);
  const [view, setView] = useState<View>("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [createForm, setCreateForm] = useState({
    subject: "",
    message: "",
    priority: "medium" as TicketPriority,
  });

  const { data: tickets = [], isLoading } = useTicketListQuery();
  const { data: replies = [] } = useTicketRepliesQuery(selectedTicket?.id ?? null);
  const createMutation = useCreateTicketMutation();
  const replyMutation = useAddReplyMutation();
  const closeMutation = useCloseTicketMutation();

  useEffect(() => {
    if (view === "conversation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies, view]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm, {
      onSuccess: () => {
        setView("list");
        setCreateForm({ subject: "", message: "", priority: "medium" });
      },
    });
  };

  const handleSendReply = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    replyMutation.mutate(
      { ticket_id: selectedTicket.id, message: newMessage.trim() },
      { onSuccess: () => setNewMessage("") }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{tr.support}</h2>
          <Button size="sm" onClick={() => setView("create")}>
            <Plus className="mr-1.5 h-4 w-4" />
            {tr.new_ticket}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Headphones className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">{tr.no_tickets}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: SupportTicket) => (
              <div
                key={ticket.id}
                className="rounded-lg border p-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setView("conversation");
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {ticket.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[ticket.status] ?? ""
                      }`}
                    >
                      {ticket.status === "open"
                        ? tr.status_open
                        : ticket.status === "closed"
                        ? tr.status_closed
                        : ticket.status}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        PRIORITY_COLORS[ticket.priority] ?? ""
                      }`}
                    >
                      {ticket.priority === "low"
                        ? tr.priority_low
                        : ticket.priority === "medium"
                        ? tr.priority_medium
                        : ticket.priority === "high"
                        ? tr.priority_high
                        : tr.priority_urgent}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                  <MessageSquare className="h-3 w-3" />
                  {tr.view_conversation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── CREATE VIEW ──
  if (view === "create") {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{tr.new_ticket}</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>{tr.ticket_title}</Label>
            <Input
              value={createForm.subject}
              onChange={(e) => setCreateForm((f) => ({ ...f, subject: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>{tr.ticket_subject}</Label>
            <textarea
              value={createForm.message}
              onChange={(e) => setCreateForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>{tr.ticket_priority}</Label>
            <select
              value={createForm.priority}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, priority: e.target.value as TicketPriority }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">{tr.priority_low}</option>
              <option value="medium">{tr.priority_medium}</option>
              <option value="high">{tr.priority_high}</option>
              <option value="urgent">{tr.priority_urgent}</option>
            </select>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">{tr.error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {tr.save}
            </Button>
            <Button type="button" variant="outline" onClick={() => setView("list")}>
              {tr.cancel}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── CONVERSATION VIEW ──
  return (
    <div className="rounded-lg border bg-card flex flex-col" style={{ minHeight: "500px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => setView("list")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{selectedTicket?.subject}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_COLORS[selectedTicket?.status ?? "open"] ?? ""
              }`}
            >
              {selectedTicket?.status === "open" ? tr.status_open : tr.status_closed}
            </span>
          </div>
        </div>
        {selectedTicket?.status !== "closed" && (
          <Button
            size="sm"
            variant="outline"
            disabled={closeMutation.isPending}
            onClick={() => {
              if (selectedTicket) {
                closeMutation.mutate(selectedTicket.id, {
                  onSuccess: () =>
                    setSelectedTicket((t) => (t ? { ...t, status: "closed" } : t)),
                });
              }
            }}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {tr.resolve_ticket}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Initial message */}
        {selectedTicket && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5">
              <p className="text-sm text-primary-foreground">{selectedTicket.message}</p>
              <p className="mt-1 text-xs text-primary-foreground/70">
                {new Date(selectedTicket.created_at).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        )}

        {replies.map((reply: TicketReply) => {
          const isOurs = !reply.is_admin;
          return (
            <div key={reply.id} className={`flex ${isOurs ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isOurs
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-muted text-foreground"
                }`}
              >
                {!isOurs && (
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Destek Ekibi</p>
                )}
                <p className="text-sm">{reply.message}</p>
                <p
                  className={`mt-1 text-xs ${
                    isOurs ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {new Date(reply.created_at).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {selectedTicket?.status !== "closed" && (
        <div className="border-t p-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tr.type_message}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendReply}
            disabled={!newMessage.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
