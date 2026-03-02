"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/announcements/_components/AnnouncementsHeader.tsx
// Admin Duyurular Header (Filters + Summary)
// =============================================================

import type React from "react";

import Link from "next/link";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";

export type AnnouncementsFilters = {
  q: string;
  category: string;
  isPublished: "all" | "published" | "draft";
  isFeatured: "all" | "featured" | "notFeatured";
  sort: "published_at" | "created_at" | "display_order";
  order: "asc" | "desc";
};

export type AnnouncementsHeaderProps = {
  filters: AnnouncementsFilters;
  total: number;
  onFiltersChange: (next: AnnouncementsFilters) => void;
  onRefresh?: () => void;
};

export const AnnouncementsHeader: React.FC<AnnouncementsHeaderProps> = ({
  filters,
  total,
  onFiltersChange,
  onRefresh,
}) => {
  const t = useAdminT("admin.announcements");

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{t("header.title")}</div>
            <div className="text-xs text-muted-foreground">{t("header.description")}</div>

            <div className="mt-3 grid gap-2 md:grid-cols-12 md:items-end">
              <div className="md:col-span-4">
                <label className="mb-1 block text-xs text-muted-foreground">{t("header.filters.searchLabel")}</label>
                <input
                  type="search"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={t("header.filters.searchPlaceholder")}
                  value={filters.q}
                  onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">{t("header.filters.categoryLabel")}</label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={filters.category}
                  onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                >
                  <option value="">{t("header.filters.categoryOptions.all")}</option>
                  <option value="duyuru">{t("header.filters.categoryOptions.duyuru")}</option>
                  <option value="haber">{t("header.filters.categoryOptions.haber")}</option>
                  <option value="kampanya">{t("header.filters.categoryOptions.kampanya")}</option>
                  <option value="etkinlik">{t("header.filters.categoryOptions.etkinlik")}</option>
                  <option value="guncelleme">{t("header.filters.categoryOptions.guncelleme")}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">{t("header.filters.publishedLabel")}</label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={filters.isPublished}
                  onChange={(e) => onFiltersChange({ ...filters, isPublished: e.target.value as any })}
                >
                  <option value="all">{t("header.filters.publishedOptions.all")}</option>
                  <option value="published">{t("header.filters.publishedOptions.published")}</option>
                  <option value="draft">{t("header.filters.publishedOptions.draft")}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">{t("header.filters.sortLabel")}</label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={filters.sort}
                  onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as any })}
                >
                  <option value="published_at">{t("header.filters.sortOptions.publishedAt")}</option>
                  <option value="created_at">{t("header.filters.sortOptions.createdAt")}</option>
                  <option value="display_order">{t("header.filters.sortOptions.displayOrder")}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">{t("header.filters.dirLabel")}</label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                  value={filters.order}
                  onChange={(e) => onFiltersChange({ ...filters, order: e.target.value as any })}
                >
                  <option value="desc">{t("header.filters.dirOptions.desc")}</option>
                  <option value="asc">{t("header.filters.dirOptions.asc")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:w-64 lg:border-l lg:pl-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{t("header.summary.totalLabel")}</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>

              {onRefresh ? (
                <button type="button" className="rounded-md border px-3 py-1 text-xs" onClick={onRefresh}>
                  {t("header.actions.refresh")}
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex justify-end">
              <Link
                href="/admin/announcements/new"
                className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
              >
                {t("header.actions.create")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
