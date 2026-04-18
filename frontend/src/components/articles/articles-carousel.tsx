"use client";

import type { Article } from "@/modules/articles/articles.types";
import { ArticleCard } from "./article-card";

interface ArticlesCarouselProps {
  articles: Article[];
}

/**
 * Editorial Hero Grid:
 * Left (Large): Main featured story
 * Right (Column): Secondary stacked stories
 */
export function ArticlesCarousel({ articles }: ArticlesCarouselProps) {
  const [featured, ...rest] = articles;

  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      {/* Featured Main Story (Large) */}
      <div className="lg:col-span-8 group">
         <ArticleCard article={featured} variant="featured" />
      </div>

      {/* Secondary Stories column */}
      <div className="lg:col-span-4 flex flex-col gap-6 lg:border-l lg:pl-12 border-black/5">
        <div className="flex items-center gap-3 mb-4">
           <div className="h-1 w-1 rounded-full bg-[hsl(var(--col-saffron))]" />
           <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--col-ink))] opacity-40">SIRADAKİLER</h3>
        </div>
        <div className="flex flex-col divide-y divide-black/5">
          {rest.slice(0, 4).map((a) => (
            <div key={a.id} className="py-6 first:pt-0 last:pb-0 group">
              <ArticleCard article={a} variant="horizontal" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
