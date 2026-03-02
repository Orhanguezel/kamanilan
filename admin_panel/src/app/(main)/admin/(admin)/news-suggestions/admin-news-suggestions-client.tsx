"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/news-suggestions/admin-news-suggestions-client.tsx
// Canlı RSS feed — DB'ye kaydetmez, onaylayınca articles tablosuna ekler
// =============================================================

import * as React from "react";

import Link from "next/link";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import {
  useListLiveFeedAdminQuery,
  useListNewsSourcesAdminQuery,
  useQuickApproveAdminMutation,
  usePreviewUrlAdminMutation,
  useAiEnhanceLiveAdminMutation,
  useDismissFeedItemAdminMutation,
} from "@/integrations/hooks";
import type { LiveFeedItem } from "@/integrations/shared";

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

const CATEGORY_OPTIONS = [
  "gundem", "spor", "ekonomi", "teknoloji",
  "kultur", "saglik", "dunya", "yerel", "genel",
];

function stripHtmlToText(input: string): string {
  return input
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminNewsSuggestionsClient() {
  const t = useAdminT("admin.newsSuggestions");

  const [q,          setQ]          = React.useState("");
  const [sourceId,   setSourceId]   = React.useState<number | undefined>(undefined);
  const [debouncedQ, setDebouncedQ] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  const queryParams = React.useMemo(
    () => ({
      source_id: sourceId,
      q:         debouncedQ.trim() || undefined,
      limit:     100,
    }),
    [sourceId, debouncedQ],
  );

  const { data: feedData, isLoading, isFetching, isError, refetch } =
    useListLiveFeedAdminQuery(queryParams, { refetchOnMountOrArgChange: true } as any);
  const { data: sources = [] } = useListNewsSourcesAdminQuery();

  const allItems   = feedData?.items  ?? [];
  const feedErrors = feedData?.errors ?? [];

  // Local set of URLs removed this session (approved or dismissed)
  const [removedUrls, setRemovedUrls] = React.useState<Set<string>>(() => new Set());

  const handleRemove = React.useCallback((sourceUrl: string) => {
    setRemovedUrls((prev) => {
      const next = new Set(prev);
      next.add(sourceUrl);
      return next;
    });
  }, []);

  const items = React.useMemo(
    () => allItems.filter((i) => !removedUrls.has(i.source_url)),
    [allItems, removedUrls],
  );

  const busy = isLoading || isFetching;

  const formatDate = (v: string | null) =>
    v ? new Date(v).toLocaleString("tr-TR") : "-";

  return (
    <div className="min-w-0 w-full max-w-full space-y-4 overflow-x-hidden">

      {/* ── Header ── */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{t("header.title")}</div>
            <div className="text-xs text-muted-foreground">{t("header.liveFeedDesc")}</div>
          </div>
          <div className="min-w-0 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={busy}>
              {isFetching ? t("actions.refreshing") : t("actions.refresh")}
            </Button>
            <Link href="/admin/news-sources" className="rounded-md border px-3 py-1.5 text-xs">
              {t("actions.manageSources")}
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            className="w-full rounded-md border bg-background px-2 py-1.5 text-xs sm:w-44"
            value={sourceId ?? ""}
            onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">{t("filters.allSources")}</option>
            {sources
              .filter((s) => s.source_type === "rss")
              .map((src) => (
                <option key={src.id} value={src.id}>{src.name}</option>
              ))}
          </select>
          <input
            type="search"
            className="w-full min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-xs"
            placeholder={t("filters.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{items.length} {t("header.total")}</span>
          {removedUrls.size > 0 && (
            <span className="text-green-600">{removedUrls.size} işlem yapıldı</span>
          )}
          {feedErrors.length > 0 && (
            <span className="text-amber-600">⚠ {feedErrors.length} kaynak hata verdi</span>
          )}
        </div>
      </div>

      {/* Feed errors */}
      {feedErrors.length > 0 && items.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
          <div className="font-semibold">RSS kaynakları yüklenemedi:</div>
          {feedErrors.map((e, i) => <div key={i} className="truncate">• {e}</div>)}
          <div className="mt-2 text-muted-foreground">
            Kaynakları <Link href="/admin/news-sources" className="underline">Kaynak Yönetimi</Link> sayfasından kontrol edin.
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          API isteği başarısız. Backend çalışıyor mu? Sayfayı yenilemeyi deneyin.
        </div>
      )}

      {/* ── List ── */}
      <div className="max-w-full overflow-x-hidden rounded-lg border bg-card divide-y">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">{t("list.loading")}</div>
        ) : items.length === 0 && feedErrors.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">{t("list.empty")}</div>
        ) : items.length === 0 ? null : (
          items.map((item, idx) => (
            <LiveFeedCard
              key={`${item.source_url}-${idx}`}
              item={item}
              globalBusy={busy}
              t={t as any}
              formatDate={formatDate}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// LiveFeedCard — with inline edit panel
// ──────────────────────────────────────────────────────────────

type CardProps = {
  item:       LiveFeedItem;
  globalBusy: boolean;
  t:          (key: string, params?: Record<string, string | number>) => string;
  formatDate: (v: string | null) => string;
  onRemove:   (sourceUrl: string) => void;
};

function LiveFeedCard({ item, globalBusy, t, formatDate, onRemove }: CardProps) {
  // Quick approve state
  const [category, setCategory] = React.useState("genel");

  // Edit panel state
  const [isEditing,    setIsEditing]    = React.useState(false);
  const [editTitle,    setEditTitle]    = React.useState(item.title ?? "");
  const [editExcerpt,  setEditExcerpt]  = React.useState("");
  const [editContent,  setEditContent]  = React.useState("");
  const [editTags,     setEditTags]     = React.useState("");
  const [editMetaTitle, setEditMetaTitle] = React.useState("");
  const [editMetaDesc,  setEditMetaDesc]  = React.useState("");

  // Per-card mutations
  const [quickApprove,  approveState]  = useQuickApproveAdminMutation();
  const [previewUrl,    previewState]  = usePreviewUrlAdminMutation();
  const [aiEnhance,     aiState]       = useAiEnhanceLiveAdminMutation();
  const [dismissItem,   dismissState]  = useDismissFeedItemAdminMutation();

  const localBusy = approveState.isLoading || previewState.isLoading || aiState.isLoading || dismissState.isLoading;
  const busy      = globalBusy || localBusy;

  const excerptText = React.useMemo(() => {
    const raw = String(item.excerpt ?? "").trim();
    if (!raw) return "";
    return stripHtmlToText(raw).slice(0, 200);
  }, [item.excerpt]);

  function openEdit() {
    setEditTitle(item.title ?? "");
    setEditExcerpt(stripHtmlToText(item.excerpt ?? ""));
    setEditContent(item.content ?? "");
    setEditTags("");
    setEditMetaTitle("");
    setEditMetaDesc("");
    setIsEditing(true);
  }

  async function handleFetchContent() {
    try {
      const r = await previewUrl({ url: item.source_url }).unwrap();
      if (r.content)                     setEditContent(r.content);
      if (r.title   && !editTitle)       setEditTitle(r.title);
      if (r.excerpt && !editExcerpt)     setEditExcerpt(stripHtmlToText(r.excerpt));
      toast.success("İçerik çekildi.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "İçerik çekilemedi.");
    }
  }

  async function handleAiEnhance() {
    try {
      const r = await aiEnhance({
        title:      editTitle,
        excerpt:    editExcerpt,
        content:    editContent,
        source_url: item.source_url,
        category,
        tags:       editTags,
      }).unwrap();
      if (r.title)            setEditTitle(r.title);
      if (r.excerpt)          setEditExcerpt(r.excerpt);
      if (r.content)          setEditContent(r.content);
      if (r.tags)             setEditTags(r.tags);
      if (r.meta_title)       setEditMetaTitle(r.meta_title);
      if (r.meta_description) setEditMetaDesc(r.meta_description);
      toast.success("AI geliştirme tamamlandı.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "AI geliştirme başarısız.");
    }
  }

  async function handleQuickApprove() {
    if (!item.title) return;
    try {
      const r = await quickApprove({
        source_url:    item.source_url,
        title:         item.title,
        excerpt:       item.excerpt,
        content:       item.content || undefined,
        image_url:     item.image_url,
        author:        item.author,
        source_name:   item.source_name,
        category,
        fetch_content: false,
      }).unwrap();
      toast.success(t("messages.approved", { articleId: r.article_id }));
      onRemove(item.source_url);
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.data?.error ?? t("errors.generic"));
    }
  }

  async function handleDismiss() {
    try {
      await dismissItem({ source_url: item.source_url, title: item.title }).unwrap();
      onRemove(item.source_url);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Gizlenemedi.");
    }
  }

  async function handleEditApprove() {
    const title = editTitle.trim();
    if (!title) { toast.error("Başlık boş olamaz."); return; }
    try {
      const r = await quickApprove({
        source_url:        item.source_url,
        title,
        excerpt:           editExcerpt   || undefined,
        content:           editContent   || undefined,
        image_url:         item.image_url,
        author:            item.author,
        source_name:       item.source_name,
        category,
        tags:              editTags      || undefined,
        meta_title:        editMetaTitle || undefined,
        meta_description:  editMetaDesc  || undefined,
        fetch_content:     false,
      }).unwrap();
      toast.success(t("messages.approved", { articleId: r.article_id }));
      onRemove(item.source_url);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.data?.error ?? t("errors.generic"));
    }
  }

  return (
    <div className="overflow-x-hidden p-3">
      {/* ── Card summary ── */}
      <div className="flex min-w-0 gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title ?? ""}
            className="hidden h-20 w-28 shrink-0 rounded object-cover sm:block"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              {item.source_name}
            </span>
          </div>

          <div className="text-sm font-semibold break-all wrap-anywhere">
            {item.title ?? <span className="text-muted-foreground">{t("card.noTitle")}</span>}
          </div>

          {excerptText ? (
            <div className="mt-0.5 text-xs text-muted-foreground break-all wrap-anywhere">
              {excerptText}
            </div>
          ) : null}

          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {item.author ? <span className="inline-block max-w-30 truncate">{item.author}</span> : null}
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block max-w-40 truncate underline"
              title={item.source_url}
            >
              {t("card.originalLink")}
            </a>
            <span className="whitespace-nowrap">{formatDate(item.original_pub_at)}</span>
          </div>

          {/* Quick approve row (only when NOT editing) */}
          {!isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                className="rounded-md border bg-background px-2 py-1 text-xs"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
                ))}
              </select>

              <button
                type="button"
                className="rounded-md border border-green-300 bg-green-50 px-2.5 py-1 text-xs text-green-700 disabled:opacity-60"
                disabled={busy || !item.title}
                onClick={handleQuickApprove}
              >
                {approveState.isLoading ? "Kaydediliyor…" : t("actions.approve")}
              </button>

              <button
                type="button"
                className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 disabled:opacity-60"
                disabled={busy}
                onClick={openEdit}
              >
                Düzenle
              </button>

              <button
                type="button"
                className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 disabled:opacity-60"
                disabled={busy}
                onClick={handleDismiss}
                title="Bu haberi kalıcı olarak gizle (yenileme sonrası da gelmez)"
              >
                {dismissState.isLoading ? "Gizleniyor…" : "Sil"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Inline edit panel ── */}
      {isEditing && (
        <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-3">

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium">Başlık</label>
            <input
              type="text"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Haber başlığı…"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1 block text-xs font-medium">Özet</label>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
              rows={3}
              value={editExcerpt}
              onChange={(e) => setEditExcerpt(e.target.value)}
              placeholder="Kısa özet…"
            />
          </div>

          {/* Content */}
          <div>
            <div className="mb-1 flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-medium">İçerik</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="rounded border bg-background px-2 py-0.5 text-[11px] disabled:opacity-60"
                  disabled={busy}
                  onClick={handleFetchContent}
                >
                  {previewState.isLoading ? "Çekiliyor…" : "İçerik Çek"}
                </button>
                <button
                  type="button"
                  className="rounded border border-purple-300 bg-purple-50 px-2 py-0.5 text-[11px] text-purple-700 disabled:opacity-60"
                  disabled={busy}
                  onClick={handleAiEnhance}
                >
                  {aiState.isLoading ? "AI çalışıyor…" : "✦ AI ile Geliştir"}
                </button>
              </div>
            </div>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono"
              rows={10}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Haber içeriği burada görünecek. 'İçerik Çek' veya 'AI ile Geliştir' butonlarını kullanın…"
            />
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {editContent.length} karakter
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-medium">
              Etiketler <span className="font-normal text-muted-foreground">(virgülle ayır)</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="kaman, kırşehir, yerel haber…"
            />
          </div>

          {/* Meta SEO fields */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">
                Meta Başlık <span className="font-normal text-muted-foreground">(SEO, 50-60 karakter)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
                value={editMetaTitle}
                onChange={(e) => setEditMetaTitle(e.target.value)}
                placeholder="Meta title…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Meta Açıklama <span className="font-normal text-muted-foreground">(SEO, 150-160 karakter)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs"
                value={editMetaDesc}
                onChange={(e) => setEditMetaDesc(e.target.value)}
                placeholder="Meta description…"
              />
            </div>
          </div>

          {/* Category + action buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t pt-2">
            <select
              className="rounded-md border bg-background px-2 py-1.5 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
              ))}
            </select>

            <button
              type="button"
              className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-60"
              disabled={busy || !editTitle.trim()}
              onClick={handleEditApprove}
            >
              {approveState.isLoading ? "Kaydediliyor…" : "Onayla ve Kaydet"}
            </button>

            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-60"
              disabled={localBusy}
              onClick={() => setIsEditing(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
