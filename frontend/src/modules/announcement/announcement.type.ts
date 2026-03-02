export type AnnouncementCategory =
  | "duyuru"
  | "haber"
  | "kampanya"
  | "etkinlik"
  | "guncelleme";

export interface AnnouncementItem {
  id: number;
  uuid: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: AnnouncementCategory;
  cover_image_url: string | null;
  alt: string | null;
  author: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  published_at: string | null;
  created_at: string;
}

export interface AnnouncementsResponse {
  items: AnnouncementItem[];
  total: number;
  page: number;
  limit: number;
}

export const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  duyuru:    "Duyuru",
  haber:     "Haber",
  kampanya:  "Kampanya",
  etkinlik:  "Etkinlik",
  guncelleme:"Güncelleme",
};

export const CATEGORY_COLORS: Record<AnnouncementCategory, string> = {
  duyuru:    "bg-blue-100 text-blue-700",
  haber:     "bg-green-100 text-green-700",
  kampanya:  "bg-orange-100 text-orange-700",
  etkinlik:  "bg-purple-100 text-purple-700",
  guncelleme:"bg-gray-100 text-gray-700",
};
