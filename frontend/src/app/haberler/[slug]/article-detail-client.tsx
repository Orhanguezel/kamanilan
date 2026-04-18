"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft, Clock, User, ExternalLink, Calendar, Share2 } from "lucide-react";

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
    return <div className="my-12 h-[200px] w-full animate-pulse rounded-[32px] bg-muted/20" />;
  }
  if (!ids || !banners.length) return null;
  const cols = banners.length === 1 ? "" : banners.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`my-16 grid grid-cols-1 gap-10 ${cols}`}>
      {banners.map((b) => <SidebarBannerCard key={b.id} banner={b} />)}
    </div>
  );
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function BannerSidebarSlot({ ids }: { ids?: string }) {
  const { data: banners = [], isPending } = useBannersByIdsQuery(ids, 1);

  if (isPending && ids) {
    return <div className="h-[200px] animate-pulse rounded-[32px] bg-muted/20" />;
  }

  if (!ids || !banners.length) return null;

  return (
    <div className="space-y-6">
      {banners.map((b) => (
        <SidebarBannerCard key={b.id} banner={b} />
      ))}
    </div>
  );
}

export function ArticleDetailClient({ slug }: { slug: string }) {
  const { data: article, isLoading, isError } = useArticleBySlugQuery(slug);
  const { data: theme } = useThemeQuery();

  const detailSections = useMemo(() => {
    const raw = theme?.newsDetailSections ?? [];
    return [...raw].sort((a, b) => a.order - b.order);
  }, [theme?.newsDetailSections]);

  const isEnabled = (key: string): boolean => {
    if (!detailSections.length) return true;
    const sec = detailSections.find((s) => s.key === key);
    return sec ? sec.enabled : true;
  };

  const relatedCount = detailSections.find((s) => s.key === "related")?.count ?? 5;

  const mainKeyOrders = detailSections.filter((s) => MAIN_KEYS.has(s.key)).map((s) => s.order);
  const mainMinOrder  = mainKeyOrders.length ? Math.min(...mainKeyOrders) : 1;
  const fullWidthDetailSections = detailSections.filter((s) => s.enabled && s.key.startsWith("banner_full_"));
  const fullWidthTop    = fullWidthDetailSections.filter((s) => s.order < mainMinOrder);
  const fullWidthBottom = fullWidthDetailSections.filter((s) => s.order >= mainMinOrder);

  const sidebarDetailSections = detailSections.filter(
    (s) => s.enabled && !MAIN_KEYS.has(s.key) && !s.key.startsWith("banner_full_"),
  );

  const { data: latest } = useArticlesQuery(
    { limit: relatedCount + 1, sort: "published_at", order: "desc" },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[hsl(var(--col-paper))]">
        <Loader2 className="size-10 animate-spin text-[hsl(var(--col-saffron))]" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-[hsl(var(--col-paper))] flex flex-col items-center justify-center py-24 text-center">
        <h2 className="font-fraunces text-3xl mb-4 text-[hsl(var(--col-ink))]">Haber Bulunamadı</h2>
        <p className="text-[hsl(var(--col-walnut))] opacity-60 mb-10">Aradığınız haber yayından kaldırılmış veya silinmiş olabilir.</p>
        <Link href="/haberler" className="btn-editorial bg-[hsl(var(--col-ink))] text-white inline-flex">
          <span>Haberlere dön</span>
        </Link>
      </div>
    );
  }

  const cover = article.cover_url ?? article.cover_image_url;
  const cat   = CATEGORY_LABELS[article.category] ?? article.category;
  const relatedArticles = (latest ?? []).filter((a) => a.slug !== slug).slice(0, relatedCount);

  return (
    <div className="bg-[hsl(var(--col-paper))] min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-[hsl(var(--col-ink))] py-12 lg:py-20 border-b border-white/5">
        <div className="container">
          <nav className="mb-10 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-[hsl(var(--col-parchment))] opacity-40">
            <Link href="/" className="hover:text-[hsl(var(--col-saffron))] transition-colors">Ana Sayfa</Link>
            <span className="opacity-20">/</span>
            <Link href="/haberler" className="hover:text-[hsl(var(--col-saffron))] transition-colors">Haberler</Link>
            <span className="opacity-20">/</span>
            <span className="text-white line-clamp-1">{article.title}</span>
          </nav>

          <div className="flex flex-col gap-8">
            <div className="inline-flex">
              <span className="bg-[hsl(var(--col-saffron))] text-[hsl(var(--col-ink))] font-mono text-[9px] font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-2xl">
                {cat}
              </span>
            </div>
            
            <h1 className="font-fraunces text-4xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1] max-w-5xl">
               {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-[hsl(var(--col-parchment))] opacity-50 text-base md:text-xl leading-relaxed max-w-4xl font-manrope">
                {article.excerpt}
              </p>
            )}

            {/* Meta Top */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/10">
               <div className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[hsl(var(--col-parchment))] opacity-60">
                  <Calendar className="h-4 w-4" />
                  {fmtDate(article.published_at ?? article.created_at)}
               </div>
               {article.author && (
                 <div className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[hsl(var(--col-parchment))] opacity-60">
                    <User className="h-4 w-4" />
                    EDİTÖR: {article.author}
                 </div>
               )}
               <button className="ml-auto h-12 w-12 rounded-full border border-white/10 text-white flex items-center justify-center hover:bg-[hsl(var(--col-saffron))] hover:text-[hsl(var(--col-ink))] transition-all">
                  <Share2 className="h-4 w-4" />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16 lg:py-24">
        {/* Tam genişlik bannerlar — üst */}
        {fullWidthTop.map((sec) => (
          <FullWidthDetailBanner key={sec.key} ids={sec.bannerIds} />
        ))}

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 items-start">
          {/* ── Main content ──────────────────────────────────── */}
          <article className="lg:col-span-3 space-y-12">
            
            {/* Cover image */}
            {isEnabled("cover") && cover && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[48px] shadow-3xl bg-muted border border-border">
                <Image
                  src={cover} alt={article.alt ?? article.title}
                  fill sizes="(max-width:768px) 100vw, 75vw"
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                  priority
                />
              </div>
            )}

            {/* Video embed */}
            {isEnabled("video") && article.video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-[48px] shadow-3xl">
                <iframe
                  src={article.video_url}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Article body */}
            {isEnabled("body") && article.content && (
              <div
                className="editorial-content mt-12"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}

            {/* Tags */}
            {isEnabled("tags") && article.tags && (
              <div className="pt-12 border-t border-black/5 flex flex-wrap gap-3">
                {article.tags.split(",").map((tag) => (
                  <span
                    key={tag.trim()}
                    className="font-mono text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--col-walnut))] opacity-50 hover:opacity-100 transition-opacity bg-black/5 px-4 py-2 rounded-full"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Source Info */}
            {article.source && (
               <div className="p-8 rounded-[32px] bg-[hsl(var(--col-ivory))] flex items-center justify-between gap-6 border border-black/5">
                  <div className="flex flex-col gap-2">
                     <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-40">HABER KAYNAĞI</span>
                     <span className="font-fraunces text-xl font-medium text-[hsl(var(--col-ink))]">{article.source}</span>
                  </div>
                  {article.source_url && (
                    <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-[hsl(var(--col-ink))] hover:text-white transition-all shadow-md">
                       <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
               </div>
            )}

            {/* Comments */}
            {isEnabled("comments") && (
              <div className="pt-24">
                 <div className="mb-12 flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--col-saffron))]" />
                    <h3 className="font-fraunces text-3xl font-medium text-[hsl(var(--col-ink))] pb-1">Tartışmaya Katıl</h3>
                    <div className="h-px flex-1 bg-black/5" />
                 </div>
                 <ArticleComments slug={slug} />
              </div>
            )}
          </article>

          {/* ── Sidebar ───────────────────────────────────────── */}
          <aside className="flex flex-col gap-16 lg:col-span-1 border-l lg:pl-16 border-black/5">
            {sidebarDetailSections.map((sec) => {
              if (sec.key === "related") {
                return relatedArticles.length > 0 ? (
                  <div key="related" className="space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="h-1 w-1 rounded-full bg-[hsl(var(--col-saffron))]" />
                       <h3 className="font-fraunces text-xl font-medium text-[hsl(var(--col-ink))]">
                         {sec.label || "İlginizi Çekebilir"}
                       </h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      {relatedArticles.map((a) => (
                        <ArticleCard key={a.id} article={a} variant="horizontal" />
                      ))}
                    </div>
                    <Link
                      href="/haberler"
                      className="btn-editorial w-full py-4 text-[10px] justify-center"
                    >
                      <span>Tüm Haberlere Göz At</span>
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
    </div>
  );
}
