"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/announcements/admin-announcements-detail-client.tsx
// Admin Duyuru Create/Edit
// - id: "new" => create mode; numeric => edit mode
// =============================================================

import * as React from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import {
  useCreateAnnouncementAdminMutation,
  useLazyGetAnnouncementAdminQuery,
  useUpdateAnnouncementAdminMutation,
} from "@/integrations/hooks";
import type { AnnouncementCreatePayload, AnnouncementDto, AnnouncementUpdatePayload } from "@/integrations/shared";

import { AnnouncementsForm, type AnnouncementsFormValues } from "./_components/AnnouncementsForm";

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

export default function AdminAnnouncementsDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const t = useAdminT("admin.announcements");
  const isCreateMode = String(id) === "new";

  const [triggerGetById, getState] = useLazyGetAnnouncementAdminQuery();
  const [announcement, setAnnouncement] = React.useState<AnnouncementDto | undefined>(undefined);

  React.useEffect(() => {
    let alive = true;

    async function run() {
      if (isCreateMode) {
        setAnnouncement(undefined);
        return;
      }

      if (!isNumericId(String(id))) return;

      try {
        const res = await triggerGetById({ id: Number(id) }).unwrap();
        if (!alive) return;
        setAnnouncement(res as any);
      } catch {
        if (!alive) return;
        setAnnouncement(undefined);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [id, isCreateMode, triggerGetById]);

  const [createAnnouncement, createState] = useCreateAnnouncementAdminMutation();
  const [updateAnnouncement, updateState] = useUpdateAnnouncementAdminMutation();

  const loading = getState.isLoading || getState.isFetching;
  const saving = createState.isLoading || updateState.isLoading;
  const busy = loading || saving;

  const mode = isCreateMode ? "create" : "edit";

  const onCancel = () => router.push("/admin/announcements");

  const handleSubmit = async (values: AnnouncementsFormValues) => {
    try {
      if (mode === "create") {
        const payload: AnnouncementCreatePayload = {
          locale: values.locale || undefined,
          title: values.title.trim(),
          slug: values.slug.trim(),
          excerpt: values.excerpt.trim() || undefined,
          content: values.content.trim() || undefined,
          category: values.category || undefined,
          author: values.author.trim() || undefined,
          alt: values.alt.trim() || undefined,
          meta_title: values.meta_title.trim() || undefined,
          meta_description: values.meta_description.trim() || undefined,
          is_published: values.is_published ? 1 : 0,
          is_featured: values.is_featured ? 1 : 0,
          display_order: values.display_order ?? 0,
        };

        const created = await createAnnouncement(payload).unwrap();
        const nextId = String((created as any)?.id ?? "").trim();

        if (!nextId || !isNumericId(nextId)) {
          toast.error(t("errors.createdButInvalidId"));
          return;
        }

        toast.success(t("messages.created"));
        router.replace(`/admin/announcements/${encodeURIComponent(nextId)}`);
        router.refresh();
        return;
      }

      const baseId = announcement?.id || Number(id);
      if (!baseId) {
        toast.error(t("errors.missingId"));
        return;
      }

      const patch: AnnouncementUpdatePayload = {
        locale: values.locale || undefined,
        title: values.title.trim(),
        slug: values.slug.trim(),
        excerpt: values.excerpt.trim() || undefined,
        content: values.content.trim() || undefined,
        category: values.category || undefined,
        author: values.author.trim() || undefined,
        alt: values.alt.trim() || undefined,
        meta_title: values.meta_title.trim() || undefined,
        meta_description: values.meta_description.trim() || undefined,
        is_published: values.is_published ? 1 : 0,
        is_featured: values.is_featured ? 1 : 0,
        display_order: values.display_order ?? 0,
      };

      await updateAnnouncement({ id: baseId, patch }).unwrap();
      toast.success(t("messages.updated"));
    } catch (err) {
      toast.error(getErrMessage(err, t("errors.generic")));
    }
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
    <AnnouncementsForm
      mode={mode}
      initialData={announcement}
      loading={busy}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
