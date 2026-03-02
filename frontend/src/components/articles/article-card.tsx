"use client";

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/modules/articles/articles.types";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem", spor: "Spor", ekonomi: "Ekonomi",
  teknoloji: "Teknoloji", kultur: "Kültür", saglik: "Sağlık",
  dunya: "Dünya", yerel: "Yerel", genel: "Genel",
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

interface ArticleCardProps {
  article: Article;
  variant?: "vertical" | "horizontal" | "featured";
}

/** Vertical card – image on top, text below (used in grid) */
function VerticalCard({ article }: { article: Article }) {
  const cover = article.cover_url ?? article.cover_image_url;
  const cat = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <Link
      href={`/haberler/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
          {cat}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{article.excerpt}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          {article.author ? <span className="truncate max-w-[120px]">{article.author}</span> : null}
          <span className="ml-auto whitespace-nowrap">{fmtDate(article.published_at ?? article.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Horizontal card – small image on left, text on right (used in sidebar/list) */
function HorizontalCard({ article }: { article: Article }) {
  const cover = article.cover_url ?? article.cover_image_url;
  const cat = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <Link
      href={`/haberler/${article.slug}`}
      className="group flex items-start gap-3 py-2 hover:opacity-80 transition-opacity"
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="80px" className="object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase text-primary">{cat}</span>
        <h4 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {article.title}
        </h4>
        <span className="text-[10px] text-muted-foreground">{fmtDate(article.published_at ?? article.created_at)}</span>
      </div>
    </Link>
  );
}

/** Featured card – used as the big hero left card */
function FeaturedCard({ article }: { article: Article }) {
  const cover = article.cover_url ?? article.cover_image_url;
  const cat = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <Link href={`/haberler/${article.slug}`} className="group relative block overflow-hidden rounded-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, 60vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            priority
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content over image */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <span className="mb-2 inline-block rounded bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase text-accent-foreground">
          {cat}
        </span>
        <h2 className="line-clamp-3 text-base font-bold leading-snug text-white md:text-xl">
          {article.title}
        </h2>
        {article.excerpt ? (
          <p className="mt-1 line-clamp-2 text-xs text-white/80 md:text-sm">{article.excerpt}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/70">
          {article.author ? <span>{article.author}</span> : null}
          <span className="ml-auto">{fmtDate(article.published_at ?? article.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, variant = "vertical" }: ArticleCardProps) {
  if (variant === "featured")    return <FeaturedCard article={article} />;
  if (variant === "horizontal")  return <HorizontalCard article={article} />;
  return <VerticalCard article={article} />;
}
