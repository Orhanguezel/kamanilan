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
      className="group flex flex-col transition-all duration-500 hover:-translate-y-1 h-full"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden shadow-sm border border-border bg-paper mb-8">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        <div className="absolute top-4 left-4">
           <span className="bg-saffron text-ink font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 shadow-2xl">
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

        <h3 className="font-fraunces text-2xl font-medium leading-[1.2] text-ink group-hover:text-blue-900 transition-colors mb-4">
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
      className="group flex gap-4 py-5 hover:bg-black/5 transition-all px-3 border-b border-black/5 last:border-0"
    >
      <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-paper shadow-sm border border-border">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="120px" className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1.5 font-mono text-[8px] font-bold uppercase tracking-widest text-saffron-2">
           <span className="opacity-50 tracking-normal">#</span> {cat}
        </div>
        <h4 className="font-fraunces text-lg font-medium leading-[1.2] text-ink line-clamp-2 group-hover:text-blue-900 transition-colors mb-2">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest opacity-40">
           <Calendar className="size-2.5" />
           {fmtDate(article.published_at ?? article.created_at)}
        </div>
      </div>
    </Link>
  );
}

/** Featured card – used as the big hero left card */
function FeaturedCard({ article }: { article: Article }) {
  const cover = article.cover_url ?? article.cover_image_url;
  const cat = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <Link href={`/haberler/${article.slug}`} className="group relative block overflow-hidden shadow-3xl bg-ink">
      <div className="relative aspect-[16/10] lg:aspect-[16/9] w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover} alt={article.alt ?? article.title}
            fill sizes="(max-width:768px) 100vw, 60vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
            priority
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        {/* Stronger overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
        <div className="flex items-center gap-4 mb-6">
           <span className="bg-saffron px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink">
             {cat}
           </span>
           <div className="h-px w-12 bg-white/20" />
           <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{fmtDate(article.published_at ?? article.created_at)}</span>
        </div>
        
        <h2 className="font-fraunces text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-8 leading-[1.1] group-hover:text-saffron transition-colors">
          {article.title}
        </h2>
        
        {article.excerpt && (
          <p className="line-clamp-2 text-parchment/70 text-base md:text-lg leading-relaxed mb-10 max-w-3xl">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-saffron">
           DOKÜMANI İNCELE <ArrowRight className="h-3 w-3 -rotate-45" />
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
