export type ArticleCategory =
  | 'gundem'
  | 'spor'
  | 'ekonomi'
  | 'teknoloji'
  | 'kultur'
  | 'saglik'
  | 'dunya'
  | 'yerel'
  | 'genel';

export interface Article {
  id: number;
  uuid: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: ArticleCategory;
  cover_url: string | null;
  cover_image_url: string | null;
  alt: string | null;
  video_url: string | null;
  author: string | null;
  source: string | null;
  source_url: string | null;
  tags: string | null;
  reading_time: number;
  is_featured: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleListParams {
  locale?: string;
  category?: ArticleCategory;
  featured?: boolean;
  q?: string;
  tags?: string;
  limit?: number;
  offset?: number;
  sort?: 'published_at' | 'created_at' | 'display_order';
  order?: 'asc' | 'desc';
}

export interface ArticleComment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export interface ArticleLikes {
  count: number;
  user_liked: boolean | null;
}
