"use client";

import type { Article } from "@/modules/articles/articles.types";
import { ArticleCard } from "./article-card";

interface ArticlesCarouselProps {
  articles: Article[];
}

/**
 * Habertürk-style hero section:
 * Left (60%): Big featured article with overlay
 * Right (40%): 4 horizontal article cards stacked
 */
export function ArticlesCarousel({ articles }: ArticlesCarouselProps) {
  const [featured, ...rest] = articles;

  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {/* Left – Featured */}
      <div className="md:col-span-3">
        <ArticleCard article={featured} variant="featured" />
      </div>

      {/* Right – Secondary articles */}
      <div className="flex flex-col divide-y divide-border md:col-span-2">
        {rest.slice(0, 5).map((a) => (
          <ArticleCard key={a.id} article={a} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}
