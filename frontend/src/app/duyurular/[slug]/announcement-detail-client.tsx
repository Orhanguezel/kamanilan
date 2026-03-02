"use client";

import Link from "next/link";
import { Calendar, Tag, User, ChevronRight, ArrowLeft, Megaphone, Rss } from "lucide-react";
import { useAnnouncementBySlugQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type AnnouncementCategory,
} from "@/modules/announcement/announcement.type";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  slug: string;
}

export function AnnouncementDetailClient({ slug }: Props) {
  const { data: item, isPending, isError } = useAnnouncementBySlugQuery(slug);

  if (isPending) {
    return (
      <div className="container py-16 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-400 text-lg mb-4">Duyuru bulunamadı.</p>
        <Link
          href={ROUTES.ANNOUNCEMENTS}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "hsl(var(--primary))" }}
        >
          <ArrowLeft className="h-4 w-4" /> Duyurulara Geri Dön
        </Link>
      </div>
    );
  }

  const rssUrl = `${getApiBaseUrl()}${API_ENDPOINTS.ANNOUNCEMENTS_RSS}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div
        className="py-8"
        style={{ backgroundColor: "hsl(var(--primary))" }}
      >
        <div className="container max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
            <Link href={ROUTES.HOME} className="hover:text-white/90 transition-colors">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={ROUTES.ANNOUNCEMENTS} className="hover:text-white/90 transition-colors">Duyurular</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90 truncate max-w-xs">{item.title}</span>
          </nav>

          <div className="flex items-start gap-3">
            <Megaphone className="h-6 w-6 text-white/70 shrink-0 mt-0.5" />
            <h1 className="text-2xl font-bold text-white leading-snug">{item.title}</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto py-8">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-500">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              CATEGORY_COLORS[item.category as AnnouncementCategory] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            <Tag className="h-3 w-3" />
            {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
          </span>
          {item.is_featured && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
              Öne Çıkan
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.published_at ?? item.created_at)}
          </span>
          {item.author && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {item.author}
            </span>
          )}
        </div>

        {/* Kapak görseli */}
        {item.cover_image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.cover_image_url}
              alt={item.alt ?? item.title}
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        {/* İçerik */}
        <article
          className="prose prose-sm max-w-none bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8"
          dangerouslySetInnerHTML={{ __html: item.content ?? "<p>İçerik bulunamadı.</p>" }}
        />

        {/* Alt linkler */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={ROUTES.ANNOUNCEMENTS}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: "hsl(var(--primary))" }}
          >
            <ArrowLeft className="h-4 w-4" /> Tüm Duyurulara Dön
          </Link>

          <a
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 transition-colors"
          >
            <Rss className="h-3.5 w-3.5" />
            RSS ile Takip Et
          </a>
        </div>
      </div>
    </div>
  );
}
