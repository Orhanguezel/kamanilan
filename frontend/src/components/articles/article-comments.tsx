"use client";

import * as React from "react";
import { ThumbsUp, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useAuthStore } from "@/stores/auth-store";
import {
  useArticleCommentsQuery,
  useArticleLikesQuery,
  useCreateCommentMutation,
  useToggleLikeMutation,
} from "@/modules/articles/articles.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function fmtDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Like Button ───────────────────────────────────────────── */

function LikeButton({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuthStore();
  const { data: likes } = useArticleLikesQuery(slug);
  const toggle = useToggleLikeMutation(slug);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Beğenmek için giriş yapmalısınız.");
      return;
    }
    try {
      await toggle.mutateAsync();
    } catch {
      toast.error("İşlem başarısız oldu.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={toggle.isPending}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        likes?.user_liked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-primary hover:text-primary"
      }`}
    >
      {toggle.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ThumbsUp className="size-4" />
      )}
      <span>{likes?.count ?? 0} Beğeni</span>
    </button>
  );
}

/* ─── Comments ──────────────────────────────────────────────── */

export function ArticleComments({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuthStore();
  const { data: comments, isLoading } = useArticleCommentsQuery(slug);
  const createComment = useCreateCommentMutation(slug);
  const [text, setText] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    try {
      await createComment.mutateAsync({ content });
      setText("");
      toast.success("Yorumunuz onay bekliyor.");
    } catch {
      toast.error("Yorum gönderilemedi.");
    }
  };

  const rows = Array.isArray(comments) ? comments : [];

  return (
    <div className="mt-8 space-y-6">
      {/* Like row */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <LikeButton slug={slug} />
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="size-4" />
          <span>{rows.length} Yorum</span>
        </div>
      </div>

      {/* Comment form */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold">Yorum Yap</h3>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              rows={3}
              maxLength={2000}
              className="resize-none"
              required
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length}/2000</span>
              <Button
                type="submit"
                size="sm"
                disabled={createComment.isPending || !text.trim()}
              >
                {createComment.isPending ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 size-3.5" />
                )}
                Gönder
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Yorum yapmak için{" "}
            <Link href="/giris" className="font-semibold text-primary underline-offset-2 hover:underline">
              giriş yapın
            </Link>
            .
          </p>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Henüz yorum yok. İlk yorumu siz yapın!
          </p>
        ) : (
          rows.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              {/* Avatar placeholder */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(c.author_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{c.author_name}</span>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(c.created_at)}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/85">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
