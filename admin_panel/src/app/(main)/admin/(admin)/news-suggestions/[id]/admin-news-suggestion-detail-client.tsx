"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/news-suggestions/[id]/admin-news-suggestion-detail-client.tsx
// Haber Önerisi — Düzenle + Onayla / Reddet + AI Geliştir
// =============================================================

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Download, Sparkles } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import RichContentEditor from "@/app/(main)/admin/_components/common/RichContentEditor";
import { Button } from "@/components/ui/button";
import {
  useGetNewsSuggestionAdminQuery,
  useUpdateNewsSuggestionAdminMutation,
  useApproveNewsSuggestionAdminMutation,
  useRejectNewsSuggestionAdminMutation,
  useFetchSourceNewsSuggestionAdminMutation,
  useAiEnhanceNewsSuggestionAdminMutation,
} from "@/integrations/hooks";
import type { SuggestionUpdatePayload } from "@/integrations/shared";

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

function getErrMessage(err: unknown, fallback: string): string {
  const e = err as any;
  return e?.data?.error?.message ?? e?.data?.message ?? e?.error ?? fallback;
}

export default function AdminNewsSuggestionDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const t = useAdminT("admin.newsSuggestions");

  const numId = Number(id);
  const valid = Number.isFinite(numId) && numId > 0;

  const { data: sug, isLoading, isError } = useGetNewsSuggestionAdminQuery(numId, { skip: !valid });

  const [updateSuggestion,    updateState]    = useUpdateNewsSuggestionAdminMutation();
  const [approveSuggestion,   approveState]   = useApproveNewsSuggestionAdminMutation();
  const [rejectSuggestion,    rejectState]    = useRejectNewsSuggestionAdminMutation();
  const [fetchFromSource,     fetchState]     = useFetchSourceNewsSuggestionAdminMutation();
  const [aiEnhance,           aiState]        = useAiEnhanceNewsSuggestionAdminMutation();

  const [form, setForm] = React.useState<SuggestionUpdatePayload>({});
  const initialized = React.useRef(false);

  // Populate form once data arrives
  React.useEffect(() => {
    if (sug && !initialized.current) {
      setForm({
        title:            sug.title          ?? "",
        excerpt:          sug.excerpt        ?? "",
        content:          sug.content        ?? "",
        image_url:        sug.image_url      ?? "",
        author:           sug.author         ?? "",
        category:         sug.category       ?? "genel",
        tags:             sug.tags           ?? "",
        meta_title:       "",
        meta_description: "",
        original_pub_at:  sug.original_pub_at ?? null,
      });
      initialized.current = true;
    }
  }, [sug]);

  const fetching  = fetchState.isLoading;
  const enhancing = aiState.isLoading;
  const saving    = updateState.isLoading || approveState.isLoading || rejectState.isLoading || fetching || enhancing;

  async function handleFetchFromSource() {
    try {
      const res = await fetchFromSource(numId).unwrap();
      // Fill form with fetched data (only fields that were empty)
      setForm((prev) => ({
        ...prev,
        title:     (prev.title    as string)?.trim() || res.fetched_title    || prev.title,
        excerpt:   (prev.excerpt  as string)?.trim() || res.fetched_excerpt  || prev.excerpt,
        content:   (prev.content  as string)?.trim() || res.fetched_content  || prev.content,
        image_url: (prev.image_url as string)?.trim() || res.fetched_image   || prev.image_url,
      }));
      toast.success(t("messages.fetchedFromSource"));
    } catch (err: any) {
      toast.error(getErrMessage(err, t("errors.fetchFailed")));
    }
  }

  async function handleAiEnhance() {
    try {
      const result = await aiEnhance(numId).unwrap();
      setForm((prev) => ({
        ...prev,
        ...(result.title            ? { title:            result.title            } : {}),
        ...(result.excerpt          ? { excerpt:          result.excerpt          } : {}),
        ...(result.content          ? { content:          result.content          } : {}),
        ...(result.tags             ? { tags:             result.tags             } : {}),
        ...(result.meta_title       ? { meta_title:       result.meta_title       } : {}),
        ...(result.meta_description ? { meta_description: result.meta_description } : {}),
      }));
      toast.success(t("messages.aiEnhanced"));
    } catch (err: any) {
      const msg = err?.data?.error === "ai_not_configured"
        ? t("ai.notConfigured")
        : getErrMessage(err, t("errors.generic"));
      toast.error(msg);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const patch: SuggestionUpdatePayload = {
      title:           (form.title    as string)?.trim() || undefined,
      excerpt:         (form.excerpt  as string)?.trim() || undefined,
      content:         (form.content  as string)?.trim() || undefined,
      image_url:       form.image_url || null,
      author:          (form.author   as string)?.trim() || undefined,
      category:        (form.category as string)?.trim() || undefined,
      tags:            (form.tags     as string)?.trim() || undefined,
      original_pub_at: form.original_pub_at || null,
    };
    try {
      await updateSuggestion({ id: numId, patch }).unwrap();
      toast.success(t("messages.updated"));
    } catch (err) {
      toast.error(getErrMessage(err, t("errors.generic")));
    }
  }

  async function handleApprove() {
    try {
      const r = await approveSuggestion({
        id:   numId,
        body: {
          category:         (form.category        as string) ?? "genel",
          tags:             (form.tags            as string) || undefined,
          meta_title:       (form.meta_title       as string)?.trim() || undefined,
          meta_description: (form.meta_description as string)?.trim() || undefined,
        },
      }).unwrap();
      toast.success(t("messages.approved", { articleId: r.article_id }));
      router.push(`/admin/articles/${r.article_id}`);
    } catch (err: any) {
      if (err?.data?.error === "already_approved") {
        toast.info(t("errors.alreadyApproved"));
      } else {
        toast.error(getErrMessage(err, t("errors.generic")));
      }
    }
  }

  async function handleReject() {
    const reason = window.prompt(t("rejectPrompt")) ?? undefined;
    try {
      await rejectSuggestion({ id: numId, body: { reason } }).unwrap();
      toast.success(t("messages.rejected"));
      router.push("/admin/news-suggestions");
    } catch (err) {
      toast.error(getErrMessage(err, t("errors.generic")));
    }
  }

  // ── Invalid id ──
  if (!valid) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm font-semibold">{t("errors.invalidId")}</div>
        <div className="mt-3">
          <Link href="/admin/news-suggestions" className="rounded-md border px-3 py-2 text-xs">
            {t("actions.backToList")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">{t("list.loading")}</div>;
  }

  // ── Not found ──
  if (isError || !sug) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm font-semibold">{t("errors.notFound")}</div>
        <div className="mt-3">
          <Link href="/admin/news-suggestions" className="rounded-md border px-3 py-2 text-xs">
            {t("actions.backToList")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Breadcrumb / back ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/news-suggestions" className="rounded-md border px-3 py-1.5 text-xs">
          {t("actions.backToList")}
        </Link>

        {sug.status === "approved" && (
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] text-green-700">
            {t("status.approved")}
          </span>
        )}
        {sug.status === "rejected" && (
          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
            {t("status.rejected")}
          </span>
        )}
        {sug.status === "pending" && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
            {t("status.pending")}
          </span>
        )}

        {sug.status === "approved" && sug.article_id ? (
          <Link href={`/admin/articles/${sug.article_id}`} className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
            {t("card.viewArticle", { id: sug.article_id })}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Form ── */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold">{t("form.title")}</div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t("form.title_field")}</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={(form.title as string) ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={saving}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t("form.excerpt")}</label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={3}
                value={(form.excerpt as string) ?? ""}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                disabled={saving}
              />
            </div>

            {/* Content — RichContentEditor */}
            <RichContentEditor
              label={t("form.content")}
              value={(form.content as string) ?? ""}
              onChange={(val) => setForm({ ...form, content: val })}
              disabled={saving}
              height="320px"
            />
          </div>

          {/* Category + Author */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-semibold mb-3">{t("form.classification")}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.category")}</label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={(form.category as string) ?? "genel"}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={saving}
                >
                  {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.author")}</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={(form.author as string) ?? ""}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.tags")}</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={(form.tags as string) ?? ""}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder={t("form.tagsPlaceholder")}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* SEO Meta Fields */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold">SEO</div>
            <p className="text-xs text-muted-foreground">
              Bu alanlar onaylanınca makaleye aktarılır. AI ile otomatik doldurabilirsiniz.
            </p>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Meta Başlık <span className="font-normal">(50-60 karakter)</span>
              </label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={(form.meta_title as string) ?? ""}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                placeholder="SEO başlığı…"
                maxLength={255}
                disabled={saving}
              />
              <div className="mt-0.5 text-[11px] text-muted-foreground text-right">
                {((form.meta_title as string) ?? "").length} / 60
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Meta Açıklama <span className="font-normal">(150-160 karakter)</span>
              </label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={3}
                value={(form.meta_description as string) ?? ""}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                placeholder="SEO açıklaması…"
                maxLength={500}
                disabled={saving}
              />
              <div className="mt-0.5 text-[11px] text-muted-foreground text-right">
                {((form.meta_description as string) ?? "").length} / 160
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="text-sm font-semibold">{t("form.imageSection")}</div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{t("form.imageUrl")}</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={(form.image_url as string) ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            {(form.image_url as string) ? (
              <img
                src={form.image_url as string}
                alt=""
                className="h-40 w-full rounded-md object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : null}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {updateState.isLoading ? t("form.saving") : t("form.save")}
            </Button>
          </div>
        </form>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Source info */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="text-sm font-semibold">{t("sidebar.sourceInfo")}</div>
            {sug.source_name ? (
              <div className="text-xs">
                <span className="text-muted-foreground">{t("sidebar.sourceLabel")}: </span>
                {sug.source_name}
              </div>
            ) : null}
            <div className="text-xs">
              <span className="text-muted-foreground">URL: </span>
              <a
                href={sug.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline"
              >
                {sug.source_url}
              </a>
            </div>
            {sug.original_pub_at ? (
              <div className="text-xs">
                <span className="text-muted-foreground">{t("sidebar.originalPubAt")}: </span>
                {new Date(sug.original_pub_at).toLocaleString("tr-TR")}
              </div>
            ) : null}
            <div className="text-xs">
              <span className="text-muted-foreground">{t("sidebar.createdAt")}: </span>
              {new Date(sug.created_at).toLocaleString("tr-TR")}
            </div>
          </div>

          {/* Fetch from source + AI enhance */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="text-sm font-semibold">İçerik Araçları</div>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleFetchFromSource}
              disabled={saving}
            >
              <Download className="mr-1.5 size-3.5" />
              {fetching ? t("sidebar.fetchingFromSource") : t("sidebar.fetchFromSource")}
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleAiEnhance}
              disabled={saving}
            >
              <Sparkles className="mr-1.5 size-3.5 text-violet-500" />
              {enhancing ? t("sidebar.aiEnhancing") : t("sidebar.aiEnhance")}
            </Button>
            {(fetching || enhancing) && (
              <p className="text-[11px] text-muted-foreground animate-pulse text-center">
                {t("ai.wait")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="text-sm font-semibold">{t("sidebar.actions")}</div>

            {sug.status !== "approved" ? (
              <Button
                className="w-full"
                variant="default"
                onClick={handleApprove}
                disabled={saving}
              >
                {approveState.isLoading ? t("actions.approving") : t("actions.approve")}
              </Button>
            ) : null}

            {sug.status === "pending" ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleReject}
                disabled={saving}
              >
                {rejectState.isLoading ? t("actions.rejecting") : t("actions.reject")}
              </Button>
            ) : null}

            {sug.status === "approved" && sug.article_id ? (
              <Link
                href={`/admin/articles/${sug.article_id}`}
                className="block w-full rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-center text-xs text-blue-700"
              >
                {t("actions.editArticle")}
              </Link>
            ) : null}

            {sug.reject_reason ? (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 wrap-break-word">
                <span className="font-medium">{t("sidebar.rejectReason")}: </span>{sug.reject_reason}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
