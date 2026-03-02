"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/news-sources/admin-news-sources-client.tsx
// Haber Kaynakları Yönetimi
// =============================================================

import * as React from "react";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import {
  useListNewsSourcesAdminQuery,
  useCreateNewsSourceAdminMutation,
  useUpdateNewsSourceAdminMutation,
  useDeleteNewsSourceAdminMutation,
  useFetchNewsSourceAdminMutation,
  useFetchAllNewsSourcesAdminMutation,
} from "@/integrations/hooks";
import type { NewsSourceDto, NewsSourceCreatePayload } from "@/integrations/shared";

const SOURCE_TYPE_LABELS: Record<string, string> = {
  rss:    "RSS Feed",
  og:     "Open Graph (URL)",
  scrape: "Web Scrape",
};

type FormState = {
  name:               string;
  url:                string;
  source_type:        "rss" | "og" | "scrape";
  is_enabled:         number;
  fetch_interval_min: number;
  notes:              string;
  display_order:      number;
};

const EMPTY_FORM: FormState = {
  name:               "",
  url:                "",
  source_type:        "rss",
  is_enabled:         1,
  fetch_interval_min: 30,
  notes:              "",
  display_order:      0,
};

export default function AdminNewsSourcesClient() {
  const t = useAdminT("admin.newsSources");

  const { data: sources = [], isLoading, isFetching, refetch } = useListNewsSourcesAdminQuery();
  const [createSource, createState]     = useCreateNewsSourceAdminMutation();
  const [updateSource, updateState]     = useUpdateNewsSourceAdminMutation();
  const [deleteSource, deleteState]     = useDeleteNewsSourceAdminMutation();
  const [fetchSource,  fetchState]      = useFetchNewsSourceAdminMutation();
  const [fetchAll,     fetchAllState]   = useFetchAllNewsSourcesAdminMutation();

  const [editId,  setEditId]  = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form,    setForm]    = React.useState<FormState>(EMPTY_FORM);

  const busy = isLoading || isFetching || createState.isLoading || updateState.isLoading || deleteState.isLoading;

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(src: NewsSourceDto) {
    setEditId(src.id);
    setForm({
      name:               src.name,
      url:                src.url,
      source_type:        src.source_type as FormState["source_type"],
      is_enabled:         src.is_enabled,
      fetch_interval_min: src.fetch_interval_min,
      notes:              src.notes ?? "",
      display_order:      src.display_order,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: NewsSourceCreatePayload = {
      name:               form.name.trim(),
      url:                form.url.trim(),
      source_type:        form.source_type,
      is_enabled:         form.is_enabled,
      fetch_interval_min: form.fetch_interval_min,
      notes:              form.notes.trim() || undefined,
      display_order:      form.display_order,
    };

    try {
      if (editId) {
        await updateSource({ id: editId, patch: payload }).unwrap();
        toast.success(t("messages.updated"));
      } else {
        await createSource(payload).unwrap();
        toast.success(t("messages.created"));
      }
      closeForm();
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  }

  async function handleDelete(src: NewsSourceDto) {
    if (!window.confirm(t("deleteConfirm", { name: src.name }))) return;
    try {
      await deleteSource(src.id).unwrap();
      toast.success(t("messages.deleted"));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  }

  async function handleFetch(src: NewsSourceDto) {
    try {
      const r = await fetchSource(src.id).unwrap();
      toast.success(t("messages.fetched", { inserted: r.inserted, skipped: r.skipped }));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.fetchFailed"));
    }
  }

  async function handleFetchAll() {
    try {
      const r = await fetchAll().unwrap();
      toast.success(t("messages.fetchedAll", { total: r.total, inserted: r.inserted, errors: r.errors }));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.fetchFailed"));
    }
  }

  const DEFAULT_SOURCES: NewsSourceCreatePayload[] = [
    { name: "Google News - Kaman",          url: "https://news.google.com/rss/search?q=Kaman+K%C4%B1r%C5%9Fehir&hl=tr&gl=TR&ceid=TR:tr", source_type: "rss", is_enabled: 1, fetch_interval_min: 60, display_order: 1 },
    { name: "Google News - Kırşehir",        url: "https://news.google.com/rss/search?q=K%C4%B1r%C5%9Fehir&hl=tr&gl=TR&ceid=TR:tr",        source_type: "rss", is_enabled: 1, fetch_interval_min: 60, display_order: 2 },
    { name: "Kırşehir Haber Türk",           url: "https://www.kirsehirhaberturk.com/rss.xml",                                               source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 3 },
    { name: "Kırşehir Haber Türk - Gündem", url: "https://www.kirsehirhaberturk.com/rss/gundem.xml",                                        source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 4 },
    { name: "Kırşehir Haber Türk - Asayiş", url: "https://www.kirsehirhaberturk.com/rss/asayis.xml",                                        source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 5 },
    { name: "Son Dakika - Kaman",            url: "https://www.sondakika.com/kaman/rss/",                                                    source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 6 },
    { name: "Sabah Gündem",                  url: "https://www.sabah.com.tr/rss/gundem.xml",                                                  source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 7 },
    { name: "AA - Son Dakika",               url: "https://www.aa.com.tr/tr/rss/default?cat=guncel",                                         source_type: "rss", is_enabled: 1, fetch_interval_min: 30, display_order: 8 },
  ];

  const [seeding, setSeeding] = React.useState(false);
  async function handleSeedDefaults() {
    if (!window.confirm("Varsayılan haber kaynakları eklensin mi?")) return;
    setSeeding(true);
    let added = 0;
    for (const src of DEFAULT_SOURCES) {
      try { await createSource(src).unwrap(); added++; } catch { /* skip duplicates */ }
    }
    setSeeding(false);
    toast.success(`${added} kaynak eklendi.`);
  }

  const formatDate = (v: string | null) => {
    if (!v) return "-";
    return new Date(v).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t("header.title")}</div>
              <div className="text-xs text-muted-foreground">{t("header.description")}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1 text-xs"
                onClick={() => refetch()}
                disabled={busy}
              >
                {t("actions.refresh")}
              </button>
              {!isLoading && sources.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedDefaults}
                  disabled={seeding}
                >
                  {seeding ? "Ekleniyor..." : "Varsayılan Kaynakları Ekle"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchAll}
                disabled={busy || fetchAllState.isLoading}
              >
                {fetchAllState.isLoading ? t("actions.fetchingAll") : t("actions.fetchAll")}
              </Button>
              <Button size="sm" onClick={openCreate} disabled={busy}>
                {t("actions.create")}
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">{t("list.loading")}</div>
          ) : sources.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{t("list.empty")}</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-3 py-2 text-xs">{t("columns.name")}</th>
                  <th className="px-3 py-2 text-xs">{t("columns.type")}</th>
                  <th className="px-3 py-2 text-xs">{t("columns.interval")}</th>
                  <th className="px-3 py-2 text-xs">{t("columns.status")}</th>
                  <th className="px-3 py-2 text-xs">{t("columns.lastFetched")}</th>
                  <th className="px-3 py-2 text-xs">{t("columns.errors")}</th>
                  <th className="px-3 py-2 text-right text-xs">{t("columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((src) => (
                  <tr key={src.id} className="border-b">
                    <td className="px-3 py-2">
                      <div className="font-medium text-sm">{src.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[260px]" title={src.url}>
                        {src.url}
                      </div>
                      {src.notes ? (
                        <div className="text-xs text-muted-foreground">{src.notes}</div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {SOURCE_TYPE_LABELS[src.source_type] ?? src.source_type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      {src.fetch_interval_min} dk
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {src.is_enabled ? (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] text-green-700">
                          {t("status.active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                          {t("status.passive")}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                      {formatDate(src.last_fetched_at)}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[200px]">
                      {src.error_count > 0 ? (
                        <div>
                          <span className="font-medium text-destructive">
                            {src.error_count} {t("columns.errors")}
                          </span>
                          {src.last_error ? (
                            <div className="mt-0.5 break-words text-[11px] text-destructive/70">
                              {src.last_error}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1 text-xs disabled:opacity-60"
                          disabled={busy || fetchState.isLoading}
                          onClick={() => handleFetch(src)}
                          title={t("actions.fetchNow")}
                        >
                          {t("actions.fetch")}
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1 text-xs"
                          onClick={() => openEdit(src)}
                        >
                          {t("actions.edit")}
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-3 py-1 text-xs text-destructive disabled:opacity-60"
                          disabled={busy}
                          onClick={() => handleDelete(src)}
                        >
                          {t("actions.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal / Panel */}
      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-card shadow-xl">
            <div className="border-b p-4">
              <div className="text-sm font-semibold">
                {editId ? t("form.titleEdit") : t("form.titleCreate")}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.name")} *</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.url")} *</label>
                <input
                  type="url"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                  placeholder="https://..."
                />
              </div>

              {/* Type + Interval */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.sourceType")}</label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={form.source_type}
                    onChange={(e) => setForm({ ...form, source_type: e.target.value as FormState["source_type"] })}
                  >
                    <option value="rss">RSS Feed</option>
                    <option value="og">Open Graph (URL)</option>
                    <option value="scrape">Web Scrape</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.interval")} (dk)</label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={form.fetch_interval_min}
                    onChange={(e) => setForm({ ...form, fetch_interval_min: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Enabled + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.enabled")}</label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={form.is_enabled}
                    onChange={(e) => setForm({ ...form, is_enabled: Number(e.target.value) })}
                  >
                    <option value={1}>{t("status.active")}</option>
                    <option value={0}>{t("status.passive")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.displayOrder")}</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("form.notes")}</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("form.notesPlaceholder")}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm"
                  onClick={closeForm}
                >
                  {t("form.cancel")}
                </button>
                <Button type="submit" disabled={createState.isLoading || updateState.isLoading}>
                  {editId ? t("form.save") : t("form.create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
