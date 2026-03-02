"use client";

import Link from "next/link";
import Image from "next/image";
import { Newspaper, ChevronRight, Calendar } from "lucide-react";
import { useArticlesQuery } from "@/modules/articles/articles.service";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem", spor: "Spor", ekonomi: "Ekonomi",
  teknoloji: "Teknoloji", kultur: "Kültür", saglik: "Sağlık",
  dunya: "Dünya", yerel: "Yerel", genel: "Genel",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day:   "numeric",
    month: "short",
  });
}

export function NewsFeedSection({ config }: Props) {
  const limit = config?.limit ?? 9;

  const { data, isPending } = useArticlesQuery({
    limit,
    sort:  "published_at",
    order: "desc",
  });
  const items = data ?? [];

  const inGrid = !!(config?.span && config.span < 12);

  return (
    <section className={inGrid ? "py-4 flex-1" : "py-5"}>
      <div className={inGrid ? "px-3 h-full" : "container mx-auto px-4 md:px-6"}>
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            border:     "1px solid hsl(var(--border))",
            background: "white",
            boxShadow:  "0 2px 12px hsl(153 39% 15% / 0.07)",
          }}
        >
          {/* ── Başlık ── */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: "hsl(var(--secondary))" }}
          >
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-white/80" />
              <h2 className="text-sm font-bold text-white">
                {config?.label || t("home.news_feed_title")}
              </h2>
            </div>
            <span className="text-[0.6rem] text-white/60">{t("home.news_feed_subtitle")}</span>
          </div>

          {/* ── Liste ── */}
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {isPending ? (
              Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-md bg-muted" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                Haber bulunamadı.
              </p>
            ) : (
              items.map((item) => {
                const cover = item.cover_url ?? item.cover_image_url;
                return (
                  <Link
                    key={item.id}
                    href={`/haberler/${item.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    {/* Küçük resim */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={item.alt ?? item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Newspaper className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Metin */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {/* Kategori + tarih */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                        <span className="flex shrink-0 items-center gap-0.5 text-[0.6rem] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(item.published_at ?? item.created_at)}
                        </span>
                      </div>
                      {/* Başlık */}
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground transition-colors group-hover:text-[hsl(var(--secondary))]">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-end px-4 py-2.5"
            style={{
              borderTop:  "1px solid hsl(var(--border))",
              background: "hsl(var(--muted) / 0.35)",
            }}
          >
            <Link
              href={ROUTES.NEWS}
              className="flex items-center gap-0.5 text-[0.7rem] font-semibold transition-colors hover:gap-1"
              style={{ color: "hsl(var(--accent))" }}
            >
              {t("common.view_all")}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
