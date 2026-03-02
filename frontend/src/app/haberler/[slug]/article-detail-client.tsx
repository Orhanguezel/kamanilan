"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft, Clock, User, ExternalLink } from "lucide-react";

import { useArticleBySlugQuery, useArticlesQuery } from "@/modules/articles/articles.service";
import { useThemeQuery } from "@/modules/theme/theme.service";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import { ArticleComments } from "@/components/articles/article-comments";
import { ArticleCard } from "@/components/articles/article-card";
import { SidebarBannerCard } from "@/components/articles/articles-sidebar";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem", spor: "Spor", ekonomi: "Ekonomi",
  teknoloji: "Teknoloji", kultur: "Kültür", saglik: "Sağlık",
  dunya: "Dünya", yerel: "Yerel", genel: "Genel",
};

const MAIN_KEYS = new Set(["cover", "meta", "body", "video", "tags", "comments"]);

function FullWidthDetailBanner({ ids }: { ids?: string }) {
  const { data: banners = [], isPending } = useBannersByIdsQuery(ids, 3);
  if (isPending && ids) {
    return <div className="my-4 h-[120px] w-full animate-pulse rounded-lg bg-muted" />;
  }
  if (!ids || !banners.length) return null;
  const cols = banners.length === 1 ? "" : banners.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`my-4 grid grid-cols-1 gap-3 ${cols}`}>
      {banners.map((b) => <SidebarBannerCard key={b.id} banner={b} />)}
    </div>
  );
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function BannerSidebarSlot({ ids }: { ids?: string }) {
  const { data: banners = [], isPending } = useBannersByIdsQuery(ids, 1);

  if (isPending && ids) {
    return <div className="h-[140px] animate-pulse rounded-lg bg-muted" />;
  }

  if (!ids || !banners.length) return null;

  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <SidebarBannerCard key={b.id} banner={b} />
      ))}
    </div>
  );
}

export function ArticleDetailClient({ slug }: { slug: string }) {
  const { data: article, isLoading, isError } = useArticleBySlugQuery(slug);
  const { data: theme } = useThemeQuery();

  // Resolve theme sections sorted by order
  const detailSections = useMemo(() => {
    const raw = theme?.newsDetailSections ?? [];
    return [...raw].sort((a, b) => a.order - b.order);
  }, [theme?.newsDetailSections]);

  const isEnabled = (key: string): boolean => {
    if (!detailSections.length) return true; // no config → show all
    const sec = detailSections.find((s) => s.key === key);
    return sec ? sec.enabled : true;
  };

  const relatedCount = detailSections.find((s) => s.key === "related")?.count ?? 7;

  // Full-width banners (banner_full_*) — split above/below the article body
  const mainKeyOrders = detailSections.filter((s) => MAIN_KEYS.has(s.key)).map((s) => s.order);
  const mainMinOrder  = mainKeyOrders.length ? Math.min(...mainKeyOrders) : 1;
  const fullWidthDetailSections = detailSections.filter((s) => s.enabled && s.key.startsWith("banner_full_"));
  const fullWidthTop    = fullWidthDetailSections.filter((s) => s.order < mainMinOrder);
  const fullWidthBottom = fullWidthDetailSections.filter((s) => s.order >= mainMinOrder);

  // Sidebar sections: everything not in MAIN_KEYS and not full-width, sorted by order (enabled only)
  const sidebarDetailSections = detailSections.filter(
    (s) => s.enabled && !MAIN_KEYS.has(s.key) && !s.key.startsWith("banner_full_"),
  );

  const { data: latest } = useArticlesQuery(
    { limit: relatedCount + 1, sort: "published_at", order: "desc" },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Haber bulunamadı.</p>
        <Link href="/haberler" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline">
          <ArrowLeft className="size-4" /> Haberlere dön
        </Link>
      </div>
    );
  }

  const cover = article.cover_url ?? article.cover_image_url;
  const cat   = CATEGORY_LABELS[article.category] ?? article.category;
  const relatedArticles = (latest ?? []).filter((a) => a.slug !== slug).slice(0, relatedCount);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/haberler" className="hover:text-foreground">Haberler</Link>
        <span>/</span>
        <span className="line-clamp-1 text-foreground">{article.title}</span>
      </nav>

      {/* Tam genişlik bannerlar — üst */}
      {fullWidthTop.map((sec) => (
        <FullWidthDetailBanner key={sec.key} ids={sec.bannerIds} />
      ))}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* ── Main content ──────────────────────────────────── */}
        <article className="lg:col-span-3">
          {/* Category + title (always shown) */}
          <div className="mb-4">
            <span className="mb-2 inline-block rounded bg-primary px-2.5 py-0.5 text-[11px] font-bold uppercase text-primary-foreground">
              {cat}
            </span>
            <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
              {article.title}
            </h1>
            {article.excerpt ? (
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">{article.excerpt}</p>
            ) : null}
          </div>

          {/* Meta */}
          {isEnabled("meta") ? (
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border pb-4 text-xs text-muted-foreground">
              {article.author ? (
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {article.author}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {fmtDate(article.published_at ?? article.created_at)}
              </span>
              {article.reading_time > 0 ? (
                <span>{article.reading_time} dk okuma</span>
              ) : null}
              {article.source && article.source_url ? (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 hover:text-primary"
                >
                  Kaynak: {article.source}
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          ) : null}

          {/* Cover image */}
          {isEnabled("cover") && cover ? (
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={cover}
                alt={article.alt ?? article.title}
                fill
                sizes="(max-width:768px) 100vw, 75vw"
                className="object-cover object-top"
                priority
              />
            </div>
          ) : null}

          {/* Video embed */}
          {isEnabled("video") && article.video_url ? (
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={article.video_url}
                title={article.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : null}

          {/* Article body */}
          {isEnabled("body") && article.content ? (
            <div
              className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : null}

          {/* Tags */}
          {isEnabled("tags") && article.tags ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.split(",").map((tag) => (
                <span
                  key={tag.trim()}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          ) : null}

          {/* Comments */}
          {isEnabled("comments") ? (
            <ArticleComments slug={slug} />
          ) : null}
        </article>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="flex flex-col gap-5 lg:col-span-1">
          {sidebarDetailSections.map((sec) => {
            if (sec.key === "related") {
              return relatedArticles.length > 0 ? (
                <div key="related" className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-3 border-b border-border pb-2 text-sm font-bold text-foreground">
                    {sec.label || "Diğer Haberler"}
                  </h3>
                  <div className="space-y-1 divide-y divide-border">
                    {relatedArticles.map((a) => (
                      <ArticleCard key={a.id} article={a} variant="horizontal" />
                    ))}
                  </div>
                  <Link
                    href="/haberler"
                    className="mt-3 flex items-center justify-center text-xs font-medium text-primary hover:underline"
                  >
                    Tüm Haberleri Gör →
                  </Link>
                </div>
              ) : null;
            }
            if (sec.key.startsWith("banner") || sec.key.startsWith("banners_")) {
              return <BannerSidebarSlot key={sec.key} ids={sec.bannerIds} />;
            }
            return null;
          })}
        </aside>
      </div>

      {/* Tam genişlik bannerlar — alt */}
      {fullWidthBottom.map((sec) => (
        <FullWidthDetailBanner key={sec.key} ids={sec.bannerIds} />
      ))}
    </div>
  );
}
