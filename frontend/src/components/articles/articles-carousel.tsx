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
  const [featured] = articles;

  if (!featured) return null;

  // Yan sütun (SIRADAKİLER) kaldırıldı — aynı içerik sidebar'daki "Kenar Çubuğu"
  // (Son Haberler) ile mükerrer çıkıyordu. Sadece büyük featured kart.
  return (
    <div className="group">
      <ArticleCard article={featured} variant="featured" />
    </div>
  );
}
