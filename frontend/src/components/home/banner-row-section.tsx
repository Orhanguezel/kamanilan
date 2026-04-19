"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBannersByIdsQuery } from "@/modules/banner/banner.service";
import type { BannerItem } from "@/modules/banner/banner.type";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

/* ─────────────────────────────────────────────────
   Tek banner kartı — her zaman tam genişlik
   (sütun sayısına göre küçültme yok, container'ı doldurur)
───────────────────────────────────────────────── */
function BannerCard({ banner }: { banner: BannerItem }) {
  // Regex to catch old green colors (emerald, teal, green hex/names)
  const isOldGreen = (color: string) => {
    if (!color) return false;
    const greenRegex = /(#10[bB]981|#059669|#06[dD]17[bB]|emerald|teal|#14[bB]58[eE]|green)/i;
    return greenRegex.test(color);
  };

  const dbBg = banner.background_color;
  const bg = isOldGreen(dbBg || "") ? "hsl(var(--col-ink))" : (dbBg || "hsl(var(--col-ivory))");
  const title  = isOldGreen(dbBg || "") ? "hsl(var(--col-saffron))" : (banner.title_color || "hsl(var(--col-ink))");
  const desc   = isOldGreen(dbBg || "") ? "hsl(var(--col-parchment) / 0.7)" : (banner.description_color || "hsl(var(--col-text-2))");
  
  const bgImage = banner.image;
  const thumbImage = banner.thumbnail && banner.thumbnail !== banner.image ? banner.thumbnail : null;

  return (
    <div
      className="group relative overflow-hidden border border-border shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full h-full flex flex-col md:flex-row items-center"
      style={{ backgroundColor: bg }}
    >
      {/* Editorial Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-parchment opacity-50 pointer-events-none skew-x-[-15deg] translate-x-12" />

      {bgImage && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={bgImage}
            alt={banner.alt ?? banner.title}
            fill
            className="object-cover opacity-[0.12] mix-blend-multiply transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
      )}

      {/* Content Area */}
      <div className="relative z-10 flex-1 p-8 md:p-12 lg:p-14 flex flex-col items-start justify-center">
        {banner.subtitle && (
          <div className="eyebrow mb-6">
            {banner.subtitle}
          </div>
        )}
        <h3
          className="font-fraunces font-medium leading-[1.1] text-2xl md:text-3xl lg:text-4xl tracking-tight mb-6 transition-colors group-hover:text-saffron-2"
          style={{ color: title }}
        >
          {banner.title.split(' ').map((word, i) => (
             <span key={i}>
                {["Fırsat", "Özel", "İndirim", "Ceviz"].includes(word) ? <em>{word}</em> : word}{" "}
             </span>
          ))}
        </h3>
        {banner.description && (
          <p
            className="mb-10 line-clamp-2 text-sm md:text-[15px] leading-relaxed max-w-[480px] opacity-80"
            style={{ color: desc }}
          >
            {banner.description}
          </p>
        )}
        {banner.button_text && (
          <div className="btn-editorial py-4 px-10">
            <span>
              {banner.button_text}
              <ArrowRight className="h-4.5 w-4.5 arrow" />
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail / Product Focus */}
      {thumbImage && (
        <div className="relative z-10 pr-12 hidden md:block">
           <div className="relative h-[240px] w-[240px] lg:h-[300px] lg:w-[300px]">
              <Image
                src={thumbImage}
                alt={banner.alt ?? banner.title}
                fill
                className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[5deg]"
                sizes="300px"
                unoptimized
              />
           </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Ana bölüm
   Her banner_section__N bloğu, instance=N olan banner ID'sini
   getirir ve dikey olarak listeler.
   Yan yana düzen = dış 12-sütun grid ile yönetilir,
   BannerRowSection içinde yatay grid YOKTUR.
───────────────────────────────────────────────── */
export function BannerRowSection({ config }: Props) {
  const instance   = (config as any)?.instance as number | undefined;
  const rowFromKey = Number(
    config?.key?.replace("banner_row_", "").replace(/banner_section__/, "") || 0,
  );
  const bannerId   = instance ?? rowFromKey;
  const ids        = bannerId > 0 ? String(bannerId) : "";
  const stackCount = Math.max(1, Number((config as any)?.stack_count ?? 1));
  const isSolo     = !config?.span || config.span >= 12;

  const { data: banners = [], isFetching } = useBannersByIdsQuery(ids, Math.max(1, stackCount));

  if (!ids) return null;

  if (isFetching && !banners.length) {
    return (
      <section className={isSolo ? "py-4" : "py-2 h-full"}>
        <div className={isSolo ? "container mx-auto px-4 flex flex-col gap-3" : "px-2 md:px-3 h-full flex flex-col gap-3"}>
          {Array.from({ length: stackCount }).map((_, i) => (
            <div key={i} className="flex-1 min-h-[200px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  const visible = banners.slice(0, stackCount);
  if (!visible.length) return null;

  return (
    <section className={isSolo ? "py-12 md:py-16" : "py-2 h-full"}>
      <div className={isSolo ? "container flex flex-col gap-8" : "px-2 md:px-3 flex flex-col gap-8 h-full"}>
        {visible.map((banner) =>
          banner.link_url ? (
            <Link
              key={banner.id}
              href={banner.link_url}
              target={banner.link_target ?? "_self"}
              rel={banner.link_target === "_blank" ? "noopener noreferrer" : undefined}
              className={isSolo ? "block" : "block flex-1"}
            >
              <BannerCard banner={banner} />
            </Link>
          ) : (
            <div key={banner.id} className={isSolo ? undefined : "flex-1"}>
              <BannerCard banner={banner} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
