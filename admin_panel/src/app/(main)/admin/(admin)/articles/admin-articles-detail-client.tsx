"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/articles/admin-articles-detail-client.tsx
// Admin Haber Create/Edit
// - id: "new" => create mode; numeric => edit mode
// =============================================================

import * as React from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import {
  useCreateArticleAdminMutation,
  useLazyGetArticleAdminQuery,
  useUpdateArticleAdminMutation,
  useAiEnhanceArticleAdminMutation,
} from "@/integrations/hooks";
import type { ArticleCreatePayload, ArticleDto, ArticleUpdatePayload } from "@/integrations/shared";

import { ArticlesForm, type ArticlesFormValues } from "./_components/ArticlesForm";
import { ArticleCommentsPanel } from "./_components/ArticleCommentsPanel";

function isNumericId(v?: string) {
  if (!v) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && String(Math.floor(n)) === v.trim();
}

function getErrMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  const m1 = anyErr?.data?.error?.message;
  if (typeof m1 === "string" && m1.trim()) return m1;
  const m2 = anyErr?.data?.message;
  if (typeof m2 === "string" && m2.trim()) return m2;
  const m3 = anyErr?.error;
  if (typeof m3 === "string" && m3.trim()) return m3;
  return fallback;
}

export default function AdminArticlesDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const t = useAdminT("admin.articles");
  const isCreateMode = String(id) === "new";

  const [triggerGetById, getState] = useLazyGetArticleAdminQuery();
  const [article, setArticle] = React.useState<ArticleDto | undefined>(undefined);

  React.useEffect(() => {
    let alive = true;

    async function run() {
      if (isCreateMode) {
        setArticle(undefined);
        return;
      }

      if (!isNumericId(String(id))) return;

      try {
        const res = await triggerGetById({ id: Number(id) }).unwrap();
        if (!alive) return;
        setArticle(res as any);
      } catch {
        if (!alive) return;
        setArticle(undefined);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [id, isCreateMode, triggerGetById]);

  const [createArticle, createState]   = useCreateArticleAdminMutation();
  const [updateArticle, updateState]   = useUpdateArticleAdminMutation();
  const [aiEnhance,     aiEnhanceState] = useAiEnhanceArticleAdminMutation();

  const loading   = getState.isLoading || getState.isFetching;
  const saving    = createState.isLoading || updateState.isLoading;
  const enhancing = aiEnhanceState.isLoading;
  const busy      = loading || saving || enhancing;

  const mode = isCreateMode ? "create" : "edit";

  const onCancel = () => router.push("/admin/articles");

  const handleSubmit = async (values: ArticlesFormValues) => {
    try {
      if (mode === "create") {
        const payload: ArticleCreatePayload = {
          locale:           values.locale || undefined,
          title:            values.title.trim(),
          slug:             values.slug.trim(),
          excerpt:          values.excerpt.trim() || undefined,
          content:          values.content.trim() || undefined,
          category:         values.category || undefined,
          cover_image_url:  values.cover_image_url.trim() || undefined,
          alt:              values.alt.trim() || undefined,
          video_url:        values.video_url.trim() || undefined,
          author:           values.author.trim() || undefined,
          source:           values.source.trim() || undefined,
          source_url:       values.source_url.trim() || undefined,
          tags:             values.tags.trim() || undefined,
          reading_time:     values.reading_time ?? 0,
          meta_title:       values.meta_title.trim() || undefined,
          meta_description: values.meta_description.trim() || undefined,
          is_published:     values.is_published ? 1 : 0,
          is_featured:      values.is_featured ? 1 : 0,
          display_order:    values.display_order ?? 0,
        };

        const created = await createArticle(payload).unwrap();
        const nextId = String((created as any)?.id ?? "").trim();

        if (!nextId || !isNumericId(nextId)) {
          toast.error(t("errors.createdButInvalidId"));
          return;
        }

        toast.success(t("messages.created"));
        router.replace(`/admin/articles/${encodeURIComponent(nextId)}`);
        router.refresh();
        return;
      }

      const baseId = article?.id || Number(id);
      if (!baseId) {
        toast.error(t("errors.missingId"));
        return;
      }

      const patch: ArticleUpdatePayload = {
        locale:           values.locale || undefined,
        title:            values.title.trim(),
        slug:             values.slug.trim(),
        excerpt:          values.excerpt.trim() || undefined,
        content:          values.content.trim() || undefined,
        category:         values.category || undefined,
        cover_image_url:  values.cover_image_url.trim() || null,
        alt:              values.alt.trim() || undefined,
        video_url:        values.video_url.trim() || undefined,
        author:           values.author.trim() || undefined,
        source:           values.source.trim() || undefined,
        source_url:       values.source_url.trim() || undefined,
        tags:             values.tags.trim() || undefined,
        reading_time:     values.reading_time ?? 0,
        meta_title:       values.meta_title.trim() || undefined,
        meta_description: values.meta_description.trim() || undefined,
        is_published:     values.is_published ? 1 : 0,
        is_featured:      values.is_featured ? 1 : 0,
        display_order:    values.display_order ?? 0,
      };

      await updateArticle({ id: baseId, patch }).unwrap();
      toast.success(t("messages.updated"));
    } catch (err) {
      toast.error(getErrMessage(err, t("errors.generic")));
    }
  };

  const handleAiEnhance = async () => {
    const articleId = article?.id || Number(id);
    if (!articleId) return undefined;
    return await aiEnhance(articleId).unwrap();
  };

  if (!isCreateMode && !isNumericId(String(id || ""))) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm font-semibold">{t("invalidId.title")}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {t("invalidId.description")} <code>{String(id || "-")}</code>
        </div>
        <div className="mt-3">
          <button className="rounded-md border px-3 py-2 text-xs" onClick={onCancel}>
            {t("actions.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ArticlesForm
        mode={mode}
        initialData={article}
        loading={busy}
        saving={saving}
        enhancing={enhancing}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onAiEnhance={!isCreateMode ? handleAiEnhance : undefined}
      />

      {!isCreateMode && article?.id ? (
        <ArticleCommentsPanel articleId={article.id} />
      ) : null}
    </div>
  );
}
