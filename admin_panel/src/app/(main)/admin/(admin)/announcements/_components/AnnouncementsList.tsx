"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/announcements/_components/AnnouncementsList.tsx
// Admin Duyurular List (Table >=1700px, Cards mobile)
// =============================================================

import type React from "react";
import { useMemo } from "react";

import Link from "next/link";

import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { useDeleteAnnouncementAdminMutation, useSetAnnouncementPublishedMutation } from "@/integrations/hooks";
import type { AnnouncementDto } from "@/integrations/shared";

export type AnnouncementsListProps = {
  items?: AnnouncementDto[];
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
  return d.toLocaleString();
};

const safeText = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const isPublished = (v: any) => !!Number(v ?? 0);
const isFeatured = (v: any) => !!Number(v ?? 0);

const CATEGORY_LABELS: Record<string, string> = {
  duyuru: "Duyuru",
  haber: "Haber",
  kampanya: "Kampanya",
  etkinlik: "Etkinlik",
  guncelleme: "Güncelleme",
};

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  items,
  loading,
  onSaveOrder,
  savingOrder,
  enableMoveControls,
  onMoveUp,
  onMoveDown,
}) => {
  const t = useAdminT("admin.announcements");
  const rows = items ?? [];
  const hasData = rows.length > 0;

  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementAdminMutation();
  const [setPublished, { isLoading: isPublishing }] = useSetAnnouncementPublishedMutation();
  const busy = loading || isDeleting || isPublishing || !!savingOrder;

  const editHref = (id: number) => `/admin/announcements/${encodeURIComponent(String(id))}`;

  const renderPublishBadge = (item: AnnouncementDto) =>
    isPublished(item.is_published) ? (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] text-green-700">
        {t("list.status.published")}
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
        {t("list.status.draft")}
      </span>
    );

  const handleDelete = async (item: AnnouncementDto) => {
    const titleText = safeText(item.title) || t("list.placeholders.noTitle");
    const ok = window.confirm(t("list.deleteConfirm", { title: titleText, id: item.id }));
    if (!ok) return;

    try {
      await deleteAnnouncement(item.id).unwrap();
      toast.success(t("messages.deleted"));
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? t("messages.deleteError");
      toast.error(msg);
    }
  };

  const handleTogglePublish = async (item: AnnouncementDto) => {
    try {
      await setPublished({
        id: item.id,
        body: { is_published: !isPublished(item.is_published) },
      }).unwrap();
      toast.success(isPublished(item.is_published) ? t("messages.unpublished") : t("messages.published"));
    } catch (err: unknown) {
      const msg =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? t("messages.publishError");
      toast.error(msg);
    }
  };

  const MoveControls = ({ idx }: { idx: number }) => {
    if (!enableMoveControls) return null;
    return (
      <div className="inline-flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveUp?.(idx)}
          disabled={busy || idx === 0 || !onMoveUp}
          title={t("list.actions.moveUp")}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveDown?.(idx)}
          disabled={busy || idx === rows.length - 1 || !onMoveDown}
          title={t("list.actions.moveDown")}
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    );
  };

  const renderEmptyOrLoading = () => {
    if (loading) return <div className="p-6 text-sm text-muted-foreground">{t("list.loading")}</div>;
    return <div className="p-6 text-sm text-muted-foreground">{t("list.empty")}</div>;
  };

  const renderCards = () => {
    if (!hasData) return renderEmptyOrLoading();

    return (
      <div className="p-4">
        <div className="grid gap-3 2xl:grid-cols-2">
          {rows.map((item, idx) => (
            <div key={item.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                      #{idx + 1}
                    </span>
                    {renderPublishBadge(item)}
                    {isFeatured(item.is_featured) ? (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                        {t("list.status.featured")}
                      </span>
                    ) : null}
                    {item.category ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                    ) : null}
                    {item.locale ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {t("list.meta.locale")}: <code className="ml-1">{item.locale}</code>
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 truncate text-sm font-semibold" title={safeText(item.title)}>
                    {item.title ?? <span className="text-muted-foreground">{t("list.placeholders.noTitle")}</span>}
                  </div>

                  {item.excerpt ? (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</div>
                  ) : null}

                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {t("list.meta.slug")}: <code>{item.slug ?? "-"}</code>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    <div>
                      {t("list.meta.updatedAt")}: {formatDate(item.updated_at)}
                    </div>
                    {item.published_at ? (
                      <div>
                        {t("list.meta.publishedAt")}: {formatDate(item.published_at)}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <MoveControls idx={idx} />
                  <Link href={editHref(item.id)} className="rounded-md border px-3 py-1 text-center text-xs">
                    {t("list.actions.edit")}
                  </Link>
                  <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-center text-xs disabled:opacity-60"
                    disabled={busy}
                    onClick={() => handleTogglePublish(item)}
                  >
                    {isPublished(item.is_published) ? t("list.actions.unpublish") : t("list.actions.publish")}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-center text-xs text-destructive disabled:opacity-60"
                    disabled={busy}
                    onClick={() => handleDelete(item)}
                  >
                    {t("list.actions.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (!hasData) return renderEmptyOrLoading();

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2 text-xs text-muted-foreground">#</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.title")}</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.category")}</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.slug")}</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.order")}</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.status")}</th>
              <th className="px-3 py-2 text-xs">{t("list.columns.date")}</th>
              <th className="px-3 py-2 text-right text-xs">{t("list.columns.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item, idx) => (
              <tr key={item.id} className="border-b">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>

                <td className="px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold" title={safeText(item.title)}>
                      {item.title ?? t("list.placeholders.noTitle")}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {renderPublishBadge(item)}
                      {isFeatured(item.is_featured) ? (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                          {t("list.status.featured")}
                        </span>
                      ) : null}
                      {item.locale ? (
                        <span className="text-[11px] text-muted-foreground">
                          <code>{item.locale}</code>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-3 py-2 text-xs">
                  {item.category ? (CATEGORY_LABELS[item.category] ?? item.category) : "-"}
                </td>

                <td className="whitespace-nowrap px-3 py-2">
                  <code className="text-xs">{item.slug ?? "-"}</code>
                </td>

                <td className="whitespace-nowrap px-3 py-2">
                  <code className="text-xs">{String(item.display_order ?? 0)}</code>
                </td>

                <td className="whitespace-nowrap px-3 py-2">{renderPublishBadge(item)}</td>

                <td className="whitespace-nowrap px-3 py-2 text-xs">
                  <div>{formatDate(item.updated_at)}</div>
                  {item.published_at ? (
                    <div className="text-muted-foreground">
                      {t("list.meta.publishedAt")}: {formatDate(item.published_at)}
                    </div>
                  ) : null}
                </td>

                <td className="whitespace-nowrap px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <MoveControls idx={idx} />
                    <Link href={editHref(item.id)} className="rounded-md border px-3 py-1 text-xs">
                      {t("list.actions.edit")}
                    </Link>
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1 text-xs disabled:opacity-60"
                      disabled={busy}
                      onClick={() => handleTogglePublish(item)}
                    >
                      {isPublished(item.is_published) ? t("list.actions.unpublish") : t("list.actions.publish")}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1 text-xs text-destructive disabled:opacity-60"
                      disabled={busy}
                      onClick={() => handleDelete(item)}
                    >
                      {t("list.actions.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-3 text-xs text-muted-foreground">{t("list.reorderHint")}</div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">{t("list.title")}</div>
            <div className="text-xs text-muted-foreground">
              {busy ? t("list.loadingInline") : t("list.recordCount", { count: rows.length })}
            </div>
          </div>

          {onSaveOrder ? (
            <Button variant="outline" onClick={onSaveOrder} disabled={busy || !hasData}>
              <Save className="mr-2 size-4" />
              {savingOrder ? t("list.savingOrder") : t("list.saveOrder")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="hidden min-[1700px]:block">{renderTable()}</div>
      <div className="block min-[1700px]:hidden">{renderCards()}</div>
    </div>
  );
};
