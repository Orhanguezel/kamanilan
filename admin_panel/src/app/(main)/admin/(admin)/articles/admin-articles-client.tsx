"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/articles/admin-articles-client.tsx
// Admin Haberler List
// =============================================================

import * as React from "react";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { useListArticlesAdminQuery, useUpdateArticleAdminMutation } from "@/integrations/hooks";
import type { ArticleCategory, ArticleDto } from "@/integrations/shared";

import type { ArticlesFilters } from "./_components/ArticlesHeader";
import { ArticlesHeader } from "./_components/ArticlesHeader";
import { ArticlesList } from "./_components/ArticlesList";

export default function AdminArticlesClient() {
  const t = useAdminT("admin.articles");

  const [filters, setFilters] = React.useState<ArticlesFilters>({
    q: "",
    category: "",
    isPublished: "all",
    isFeatured: "all",
    sort: "published_at",
    order: "desc",
  });

  const queryParams = React.useMemo(
    () => ({
      q: filters.q.trim() || undefined,
      category: (filters.category as ArticleCategory) || undefined,
      is_published:
        filters.isPublished === "all" ? undefined : filters.isPublished === "published" ? (1 as const) : (0 as const),
      is_featured:
        filters.isFeatured === "all" ? undefined : filters.isFeatured === "featured" ? (1 as const) : (0 as const),
      sort: filters.sort,
      order: filters.order,
      limit: 100,
      offset: 0,
    }),
    [filters],
  );

  const listQ = useListArticlesAdminQuery(queryParams as any, { refetchOnMountOrArgChange: true } as any);

  const items: ArticleDto[] = React.useMemo(() => {
    const d = listQ.data;
    return Array.isArray(d) ? (d as any) : [];
  }, [listQ.data]);

  const total = items.length;

  const [rows, setRows] = React.useState<ArticleDto[]>([]);
  React.useEffect(() => setRows(items), [items]);

  function moveRow(from: number, to: number) {
    setRows((prev) => {
      if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const copy = prev.slice();
      const [x] = copy.splice(from, 1);
      copy.splice(to, 0, x);
      return copy;
    });
  }

  const [updateArticle, updateState] = useUpdateArticleAdminMutation();

  async function onSaveOrder() {
    try {
      for (let i = 0; i < rows.length; i++) {
        const it = rows[i];
        await updateArticle({ id: it.id, patch: { display_order: i } }).unwrap();
      }
      toast.success(t("messages.orderSaved"));
      listQ.refetch();
    } catch (err: any) {
      const msg = err?.data?.error?.message || err?.message || t("messages.orderSaveError");
      toast.error(msg);
    }
  }

  const busy = listQ.isLoading || listQ.isFetching || updateState.isLoading;

  return (
    <div className="space-y-4">
      <ArticlesHeader
        filters={filters}
        total={total}
        onFiltersChange={setFilters}
        onRefresh={() => listQ.refetch()}
      />

      <ArticlesList
        items={rows}
        loading={busy}
        enableMoveControls
        onMoveUp={(index) => moveRow(index, index - 1)}
        onMoveDown={(index) => moveRow(index, index + 1)}
        onSaveOrder={onSaveOrder}
        savingOrder={updateState.isLoading}
      />
    </div>
  );
}
