"use client";

// =============================================================
// FILE: _components/ArticleCommentsPanel.tsx
// Admin – Article Comments panel (list / approve / delete)
// =============================================================

import * as React from "react";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import {
  useListArticleCommentsAdminQuery,
  useApproveArticleCommentAdminMutation,
  useDeleteArticleCommentAdminMutation,
} from "@/integrations/hooks";
import type { ArticleCommentDto } from "@/integrations/shared";

const fmt = (v: string) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("tr-TR");
};

export function ArticleCommentsPanel({ articleId }: { articleId: number }) {
  const t = useAdminT("admin.articles.comments");

  const { data, isLoading, refetch } = useListArticleCommentsAdminQuery(articleId, {
    refetchOnMountOrArgChange: true,
  });

  const [approve, approveState]   = useApproveArticleCommentAdminMutation();
  const [deleteComment, deleteState] = useDeleteArticleCommentAdminMutation();

  const busy = approveState.isLoading || deleteState.isLoading;

  const handleApprove = async (c: ArticleCommentDto, isApproved: boolean) => {
    try {
      await approve({ cid: c.id, body: { is_approved: isApproved } }).unwrap();
      toast.success(isApproved ? t("approvedSuccess") : t("rejectedSuccess"));
      refetch();
    } catch {
      toast.error(t("error"));
    }
  };

  const handleDelete = async (c: ArticleCommentDto) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteComment(c.id).unwrap();
      toast.success(t("deletedSuccess"));
      refetch();
    } catch {
      toast.error(t("error"));
    }
  };

  const rows: ArticleCommentDto[] = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold">{t("title")}</div>
        <div className="text-xs text-muted-foreground">
          {isLoading ? t("loading") : `${rows.length} yorum`}
        </div>
      </div>

      {!isLoading && rows.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">{t("empty")}</div>
      ) : (
        <div className="divide-y">
          {rows.map((c) => (
            <div key={c.id} className="flex items-start gap-3 px-4 py-3">
              {/* Status indicator */}
              <span
                className={`mt-0.5 shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] ${
                  c.is_approved
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {c.is_approved ? t("approved") : t("pending")}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">{c.author_name}</div>
                <div className="mt-0.5 text-sm text-foreground/80 whitespace-pre-wrap break-words">
                  {c.content}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{fmt(c.created_at)}</div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1.5">
                {!c.is_approved ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleApprove(c, true)}
                    className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] text-green-700 hover:bg-green-100 disabled:opacity-60"
                  >
                    {t("approve")}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleApprove(c, false)}
                    className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                  >
                    {t("reject")}
                  </button>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(c)}
                  className="rounded-md border px-2.5 py-1 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-60"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
