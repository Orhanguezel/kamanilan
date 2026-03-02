"use client";

import Link from "next/link";
import { Megaphone, ChevronRight, Calendar, Rss } from "lucide-react";
import { useAnnouncementsQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type AnnouncementCategory,
} from "@/modules/announcement/announcement.type";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";
import { t } from "@/lib/t";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export function AnnouncementsSection({ config }: Props) {
  const limit = config?.limit ?? 7;

  const { data, isPending } = useAnnouncementsQuery({ limit, page: 1 });
  const items = data?.items ?? [];

  const rssUrl = `${getApiBaseUrl()}${API_ENDPOINTS.ANNOUNCEMENTS_RSS}`;

  const inGrid = !!(config?.span && config.span < 12);

  return (
    <section className={inGrid ? "py-4 flex-1" : "py-5"}>
      <div className={inGrid ? "px-3 h-full" : "container mx-auto px-4 md:px-6"}>
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            border: "1px solid hsl(var(--border))",
            background: "white",
            boxShadow: "0 2px 12px hsl(153 39% 15% / 0.07)",
          }}
        >
          {/* ── Başlık ── */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-white/80" />
              <h2 className="text-sm font-bold text-white">
                {config?.label || t("home.announcements_title")}
              </h2>
            </div>
            <a
              href={rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[0.65rem] text-white/60 hover:text-white/90 transition-colors"
              title="RSS ile takip et"
            >
              <Rss className="h-3 w-3" />
              RSS
            </a>
          </div>

          {/* ── Liste ── */}
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {isPending ? (
              /* skeleton */
              Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5 px-4 py-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                Henüz duyuru yok.
              </p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={ROUTES.ANNOUNCEMENT_DETAIL(item.slug)}
                  className="group flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* Kategori + tarih satırı */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${
                        CATEGORY_COLORS[item.category as AnnouncementCategory] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[0.6rem] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                  </div>

                  {/* Başlık */}
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                    {item.title}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-end px-4 py-2.5"
            style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.35)" }}
          >
            <Link
              href={ROUTES.ANNOUNCEMENTS}
              className="flex items-center gap-0.5 text-[0.7rem] font-semibold transition-colors hover:gap-1"
              style={{ color: "hsl(var(--accent))" }}
            >
              Tümünü Gör
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
