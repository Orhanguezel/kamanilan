"use client";

import * as React from "react";
import { ThumbsUp, MessageSquare, Send, Loader2, Heart, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useAuthStore } from "@/stores/auth-store";
import {
  useArticleCommentsQuery,
  useArticleLikesQuery,
  useCreateCommentMutation,
  useToggleLikeMutation,
} from "@/modules/articles/articles.service";

function fmtDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
      className={`group flex items-center gap-3 border px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all ${
        likes?.user_liked
          ? "border-[hsl(var(--col-saffron))] bg-[hsl(var(--col-saffron))] text-[hsl(var(--col-ink))]"
          : "border-black/5 bg-white text-[hsl(var(--col-ink))] hover:border-[hsl(var(--col-saffron))] hover:bg-[hsl(var(--col-saffron))] shadow-sm"
      }`}
    >
      {toggle.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={`size-4 transition-transform group-hover:scale-125 ${likes?.user_liked ? 'fill-current' : ''}`} />
      )}
      <span>{likes?.count ?? 0} BEĞENİ</span>
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
      toast.success("Yorumunuz iletildi.");
    } catch {
      toast.error("Yorum gönderilemedi.");
    }
  };

  const rows = Array.isArray(comments) ? comments : [];

  return (
    <div className="space-y-12">
      {/* Interaction row */}
      <div className="flex items-center gap-6">
        <LikeButton slug={slug} />
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-walnut">
          <MessageSquare className="size-4" />
          <span>{rows.length} YORUM</span>
        </div>
      </div>

      {/* Comment form */}
      <div className="bg-white border border-black/5 p-8 md:p-12 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--col-saffron))] opacity-5 blur-3xl pointer-events-none" />
        
        <h3 className="font-fraunces text-2xl font-medium text-[hsl(var(--col-ink))] mb-8">Fikrinizi Paylaşın</h3>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bu haber hakkında ne düşünüyorsunuz?"
                rows={4}
                maxLength={2000}
                required
                className="w-full bg-[hsl(var(--col-paper))] border-none py-6 px-8 focus:ring-1 focus:ring-[hsl(var(--col-saffron-2))] transition-all outline-none text-sm resize-none"
              />
              <div className="absolute bottom-4 right-6 text-[10px] font-mono font-bold opacity-30">
                {text.length}/2000
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createComment.isPending || !text.trim()}
                className="btn-editorial bg-[hsl(var(--col-ink))] text-white px-10 group"
              >
                <span>
                  {createComment.isPending ? "GÖNDERİLİYOR..." : "YORUMU GÖNDER"}
                  {!createComment.isPending && <Send className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-10 text-center bg-[hsl(var(--col-paper))] border border-dashed border-black/10">
            <p className="text-[hsl(var(--col-walnut))] opacity-60 text-sm mb-6">
              Tartışmaya katılmak için giriş yapmanız gerekmektedir.
            </p>
            <Link href="/giris" className="btn-editorial inline-flex">
              <span>GİRİŞ YAPIN</span>
            </Link>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-10">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-[hsl(var(--col-saffron))]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4 opacity-10">🕯️</div>
            <p className="font-fraunces text-xl text-[hsl(var(--col-ink))] opacity-30 italic">
              Henüz kimse yorum yapmamış...
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {rows.map((c) => (
              <div key={c.id} className="group relative flex gap-6 md:gap-8 items-start p-8 bg-white/50 border border-transparent hover:border-black/5 hover:bg-white hover:shadow-2xl transition-all duration-500">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[hsl(var(--col-ink))] text-white shadow-lg transition-transform group-hover:scale-110">
                  <User className="h-5 w-5" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="font-fraunces text-lg font-medium text-[hsl(var(--col-ink))] leading-none">
                       {c.author_name}
                    </span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-30">
                       {fmtDate(c.created_at)}
                    </span>
                  </div>
                  <p className="text-[hsl(var(--col-walnut))] leading-relaxed text-sm md:text-base">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
