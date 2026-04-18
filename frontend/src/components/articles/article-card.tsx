"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import type { Article } from "@/modules/articles/articles.types";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem", spor: "Spor", ekonomi: "Ekonomi",
  teknoloji: "Teknoloji", kultur: "Kültür", saglik: "Sağlık",
  dunya: "Dünya", yerel: "Yerel", genel: "Genel",
};

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
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
      className="group flex flex-col transition-all duration-500 hover:-translate-y-2 h-full"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[40px] shadow-xl border border-border bg-paper mb-8">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        <div className="absolute top-6 left-6">
           <span className="bg-saffron text-ink font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">
              {cat}
           </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-2">
        <div className="flex items-center gap-3 mb-4 font-mono text-[10px] uppercase tracking-widest opacity-40">
           <Calendar className="h-3 w-3" />
           {fmtDate(article.published_at ?? article.created_at)}
           {article.author && <span className="truncate max-w-[120px]">· {article.author}</span>}
        </div>

        <h3 className="font-fraunces text-2xl font-medium leading-[1.2] text-ink group-hover:text-saffron-2 transition-colors mb-4">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-sm text-walnut opacity-60 leading-relaxed font-manrope line-clamp-2 mb-6">
            {article.excerpt}
          </p>
        )}
        
        <div className="mt-auto pt-6 border-t border-black/5 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-ink group-hover:gap-4 transition-all">
           OKUMAYA BAŞLA <ArrowRight className="h-3 w-3 -rotate-45" />
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
      className="group flex items-center gap-6 py-4 border-b border-black/5 last:border-0 hover:bg-black/5 transition-all p-2 rounded-2xl"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[20px] bg-paper shadow-md border border-border">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="120px" className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-saffron-2 mb-1 block">{cat}</span>
        <h4 className="font-fraunces text-base font-medium leading-tight text-ink line-clamp-2 group-hover:text-saffron-2 transition-colors mb-1">
          {article.title}
        </h4>
        <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">{fmtDate(article.published_at ?? article.created_at)}</span>
      </div>
    </Link>
  );
}

/** Featured card – used as the big hero left card */
function FeaturedCard({ article }: { article: Article }) {
  const cover = article.cover_url ?? article.cover_image_url;
  const cat = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <Link href={`/haberler/${article.slug}`} className="group relative block overflow-hidden rounded-[40px] shadow-3xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, 60vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <span className="mb-4 inline-block rounded-full bg-saffron px-6 py-1.5 text-[9px] font-bold uppercase tracking-widest text-ink shadow-2xl">
          {cat}
        </span>
        <h2 className="font-fraunces text-2xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight group-hover:text-saffron transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="line-clamp-2 text-parchment opacity-60 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
           <span>{fmtDate(article.published_at ?? article.created_at)}</span>
           <span className="h-1 w-1 rounded-full bg-white/20" />
           {article.author && <span>EDİTÖR: {article.author}</span>}
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
