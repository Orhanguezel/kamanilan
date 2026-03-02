"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/articles/_components/ArticlesList.tsx
// Admin Haberler — Kompakt liste görünümü (responsive, no-overflow)
// =============================================================

import type React from "react";

import Link from "next/link";

import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { useDeleteArticleAdminMutation, useSetArticlePublishedMutation } from "@/integrations/hooks";
import type { ArticleDto } from "@/integrations/shared";

export type ArticlesListProps = {
  items?: ArticleDto[];
  loading: boolean;

  onSaveOrder?: () => void;
  savingOrder?: boolean;

  enableMoveControls?: boolean;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("tr-TR");
};

const safeText = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const isPublished = (v: any) => !!v;
const isFeatured  = (v: any) => !!v;

const CATEGORY_LABELS: Record<string, string> = {
  gundem:    "Gündem",
  spor:      "Spor",
  ekonomi:   "Ekonomi",
  teknoloji: "Teknoloji",
  kultur:    "Kültür",
  saglik:    "Sağlık",
  dunya:     "Dünya",
  yerel:     "Yerel",
  genel:     "Genel",
};

export const ArticlesList: React.FC<ArticlesListProps> = ({
  items,
  loading,
  onSaveOrder,
  savingOrder,
  enableMoveControls,
  onMoveUp,
  onMoveDown,
}) => {
  const t = useAdminT("admin.articles");
  const rows = items ?? [];
  const hasData = rows.length > 0;

  const [deleteArticle,  { isLoading: isDeleting }]   = useDeleteArticleAdminMutation();
  const [setPublished,   { isLoading: isPublishing }]  = useSetArticlePublishedMutation();
  const globalBusy = loading || isDeleting || isPublishing || !!savingOrder;

  const editHref = (id: number) => `/admin/articles/${encodeURIComponent(String(id))}`;

  const handleDelete = async (item: ArticleDto) => {
    const titleText = safeText(item.title) || t("list.placeholders.noTitle");
    if (!window.confirm(t("list.deleteConfirm", { title: titleText, id: item.id }))) return;
    try {
      await deleteArticle(item.id).unwrap();
      toast.success(t("messages.deleted"));
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
        t("messages.deleteError");
      toast.error(msg);
    }
  };

  const handleTogglePublish = async (item: ArticleDto) => {
    const nextState = !isPublished(item.is_published);
    try {
      await setPublished({ id: item.id, body: { is_published: nextState } }).unwrap();
      toast.success(nextState ? t("messages.published") : t("messages.unpublished"));
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
        t("messages.publishError");
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">

      {/* ── Header ── */}
      <div className="border-b p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">{t("list.title")}</div>
            <div className="text-xs text-muted-foreground">
              {globalBusy
                ? t("list.loadingInline")
                : t("list.recordCount", { count: rows.length })}
            </div>
          </div>

          {onSaveOrder ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveOrder}
              disabled={globalBusy || !hasData}
            >
              <Save className="mr-1.5 size-3.5" />
              {savingOrder ? t("list.savingOrder") : t("list.saveOrder")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── List ── */}
      {!hasData ? (
        <div className="p-6 text-sm text-muted-foreground">
          {loading ? t("list.loading") : t("list.empty")}
        </div>
      ) : (
        <div className="divide-y">
          {rows.map((item, idx) => {
            const published = isPublished(item.is_published);
            const featured  = isFeatured(item.is_featured);
            const coverUrl  = item.cover_url ?? item.cover_image_url;

            return (
              <div
                key={item.id}
                className="flex min-w-0 items-start gap-3 p-3 hover:bg-muted/20"
              >
                {/* ── Thumbnail ── */}
                <div className="shrink-0">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={safeText(item.alt ?? item.title)}
                      className="h-12 w-16 rounded object-cover object-top"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-12 w-16 rounded bg-muted/40" />
                  )}
                </div>

                {/* ── Info ── */}
                <div className="min-w-0 flex-1">
                  {/* Badges */}
                  <div className="mb-0.5 flex flex-wrap items-center gap-1">
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] ${
                        published
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      {published ? t("list.status.published") : t("list.status.draft")}
                    </span>

                    {featured ? (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                        {t("list.status.featured")}
                      </span>
                    ) : null}

                    {item.category ? (
                      <span className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                    ) : null}

                    {item.video_url ? (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                        {t("list.status.hasVideo")}
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <div
                    className="truncate text-sm font-semibold leading-snug"
                    title={safeText(item.title)}
                  >
                    {item.title ?? (
                      <span className="text-muted-foreground">
                        {t("list.placeholders.noTitle")}
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0 text-[11px] text-muted-foreground">
                    {item.author ? <span className="truncate max-w-28">{item.author}</span> : null}
                    <code className="truncate max-w-40">{item.slug ?? "-"}</code>
                    <span className="whitespace-nowrap">{formatDate(item.updated_at)}</span>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="shrink-0 flex flex-wrap items-center gap-1.5">
                  {/* Move controls */}
                  {enableMoveControls && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        className="rounded border p-1 disabled:opacity-40 hover:bg-muted"
                        onClick={() => onMoveUp?.(idx)}
                        disabled={globalBusy || idx === 0 || !onMoveUp}
                        title={t("list.actions.moveUp")}
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded border p-1 disabled:opacity-40 hover:bg-muted"
                        onClick={() => onMoveDown?.(idx)}
                        disabled={globalBusy || idx === rows.length - 1 || !onMoveDown}
                        title={t("list.actions.moveDown")}
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </div>
                  )}

                  {/* Edit */}
                  <Link
                    href={editHref(item.id)}
                    className="rounded-md border px-2.5 py-1 text-[11px] hover:bg-muted"
                  >
                    {t("list.actions.edit")}
                  </Link>

                  {/* Publish toggle */}
                  <button
                    type="button"
                    className={`rounded-md border px-2.5 py-1 text-[11px] disabled:opacity-60 ${
                      published
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                    disabled={globalBusy}
                    onClick={() => handleTogglePublish(item)}
                  >
                    {published ? t("list.actions.unpublish") : t("list.actions.publish")}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    className="rounded-md border px-2.5 py-1 text-[11px] text-destructive disabled:opacity-60 hover:bg-destructive/10"
                    disabled={globalBusy}
                    onClick={() => handleDelete(item)}
                  >
                    {t("list.actions.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasData && (
        <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
          {t("list.reorderHint")}
        </div>
      )}
    </div>
  );
};
