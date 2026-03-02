"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/announcements/_components/AnnouncementsForm.tsx
// Admin Duyuru Create/Edit Form
// =============================================================

import type React from "react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import type { AnnouncementCategory, AnnouncementDto } from "@/integrations/shared";

/* ------------------------------------------------------------- */
/* Types                                                         */
/* ------------------------------------------------------------- */

export type AnnouncementsFormValues = {
  id?: number;

  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: AnnouncementCategory | "";

  alt: string;
  author: string;

  meta_title: string;
  meta_description: string;

  is_published: boolean;
  is_featured: boolean;
  display_order: number;
};

export type AnnouncementsFormProps = {
  mode: "create" | "edit";
  initialData?: AnnouncementDto;
  loading: boolean;
  saving: boolean;
  onSubmit: (values: AnnouncementsFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

/* ------------------------------------------------------------- */
/* Helpers                                                       */
/* ------------------------------------------------------------- */

const toBool = (v: any) => !!Number(v ?? 0);
const toNum = (v: any, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
};

const slugify = (value: string): string => {
  if (!value) return "";
  let s = value.trim();

  const trMap: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  s = s
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("");
  s = s.replace(/ß/g, "ss").replace(/ẞ/g, "ss");

  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const CATEGORY_OPTIONS: { value: AnnouncementCategory; label: string }[] = [
  { value: "duyuru", label: "Duyuru" },
  { value: "haber", label: "Haber" },
  { value: "kampanya", label: "Kampanya" },
  { value: "etkinlik", label: "Etkinlik" },
  { value: "guncelleme", label: "Güncelleme" },
];

const buildInitialValues = (initial: AnnouncementDto | undefined): AnnouncementsFormValues => {
  if (!initial) {
    return {
      id: undefined,
      locale: "tr",
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      alt: "",
      author: "",
      meta_title: "",
      meta_description: "",
      is_published: false,
      is_featured: false,
      display_order: 0,
    };
  }

  return {
    id: initial.id,
    locale: initial.locale ?? "tr",
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    excerpt: initial.excerpt ?? "",
    content: initial.content ?? "",
    category: (initial.category as AnnouncementCategory) ?? "",
    alt: initial.alt ?? "",
    author: initial.author ?? "",
    meta_title: initial.meta_title ?? "",
    meta_description: initial.meta_description ?? "",
    is_published: toBool(initial.is_published),
    is_featured: toBool(initial.is_featured),
    display_order: toNum(initial.display_order, 0),
  };
};

/* ------------------------------------------------------------- */
/* Component                                                     */
/* ------------------------------------------------------------- */

export const AnnouncementsForm: React.FC<AnnouncementsFormProps> = ({
  mode,
  initialData,
  loading,
  saving,
  onSubmit,
  onCancel,
}) => {
  const t = useAdminT("admin.announcements");

  const [values, setValues] = useState<AnnouncementsFormValues>(buildInitialValues(initialData));
  const [slugTouched, setSlugTouched] = useState(false);

  const disabled = loading || saving;

  useEffect(() => {
    const next = buildInitialValues(initialData);
    setValues(next);
    setSlugTouched(false);
  }, [initialData]);

  const set = (patch: Partial<AnnouncementsFormValues>) => setValues((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (!values.title.trim() || !values.slug.trim()) {
      toast.error(t("form.validation.requiredFields"));
      return;
    }

    void onSubmit({
      ...values,
      title: values.title.trim(),
      slug: values.slug.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-card">
        {/* Header */}
        <div className="border-b p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold">
                {mode === "create" ? t("form.titles.create") : t("form.titles.edit")}
              </div>
              <div className="text-xs text-muted-foreground">{t("form.descriptions.main")}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCancel ? (
                <button
                  type="button"
                  className="rounded-md border px-3 py-1 text-xs"
                  onClick={onCancel}
                  disabled={disabled}
                >
                  {t("actions.back")}
                </button>
              ) : null}

              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-60"
                disabled={disabled}
              >
                {saving
                  ? mode === "create"
                    ? t("actions.creating")
                    : t("actions.saving")
                  : mode === "create"
                    ? t("actions.create")
                    : t("actions.save")}
              </button>

              {loading ? (
                <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {t("form.loading")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Main fields */}
            <div className="space-y-4 lg:col-span-8">
              {/* Basic info */}
              <div className="space-y-4 rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("form.sections.basic")}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {t("form.fields.title")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      set({ title: v, ...(!slugTouched ? { slug: slugify(v) } : {}) });
                    }}
                    disabled={disabled}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {t("form.fields.slug")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                    value={values.slug}
                    onFocus={() => setSlugTouched(true)}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set({ slug: e.target.value });
                    }}
                    disabled={disabled}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.excerpt")}</label>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    rows={3}
                    value={values.excerpt}
                    onChange={(e) => set({ excerpt: e.target.value })}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.content")}</label>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    rows={10}
                    value={values.content}
                    onChange={(e) => set({ content: e.target.value })}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4 rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("form.sections.seo")}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.metaTitle")}</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.meta_title}
                    onChange={(e) => set({ meta_title: e.target.value })}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.metaDescription")}</label>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    rows={3}
                    value={values.meta_description}
                    onChange={(e) => set({ meta_description: e.target.value })}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:col-span-4">
              {/* Publish settings */}
              <div className="space-y-3 rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("form.sections.publish")}
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={values.is_published}
                    onChange={(e) => set({ is_published: e.target.checked })}
                    disabled={disabled}
                  />
                  <span>{t("form.fields.isPublished")}</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={values.is_featured}
                    onChange={(e) => set({ is_featured: e.target.checked })}
                    disabled={disabled}
                  />
                  <span>{t("form.fields.isFeatured")}</span>
                </label>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.displayOrder")}</label>
                  <input
                    type="number"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.display_order}
                    onChange={(e) => set({ display_order: toNum(e.target.value, 0) })}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-3 rounded-lg border bg-card p-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("form.sections.classification")}
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.category")}</label>
                  <select
                    className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                    value={values.category}
                    onChange={(e) => set({ category: e.target.value as AnnouncementCategory | "" })}
                    disabled={disabled}
                  >
                    <option value="">{t("form.fields.categoryPlaceholder")}</option>
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.locale")}</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.locale}
                    onChange={(e) => set({ locale: e.target.value })}
                    disabled={disabled}
                    placeholder="tr"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.author")}</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.author}
                    onChange={(e) => set({ author: e.target.value })}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("form.fields.alt")}</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={values.alt}
                    onChange={(e) => set({ alt: e.target.value })}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Meta info */}
              {initialData ? (
                <div className="space-y-2 rounded-lg border bg-card p-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("form.sections.meta")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: <code>{initialData.id}</code>
                  </div>
                  {initialData.uuid ? (
                    <div className="text-xs text-muted-foreground">
                      UUID: <code className="break-all">{initialData.uuid}</code>
                    </div>
                  ) : null}
                  {initialData.created_at ? (
                    <div className="text-xs text-muted-foreground">
                      {t("form.notes.createdAt")}: <code>{new Date(initialData.created_at).toLocaleString()}</code>
                    </div>
                  ) : null}
                  {initialData.updated_at ? (
                    <div className="text-xs text-muted-foreground">
                      {t("form.notes.updatedAt")}: <code>{new Date(initialData.updated_at).toLocaleString()}</code>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
