"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBannersByRowQuery } from "@/modules/banner/banner.service";
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
  const bg     = banner.background_color   || "hsl(var(--muted))";
  const title  = banner.title_color        || "hsl(var(--foreground))";
  const desc   = banner.description_color  || "hsl(var(--muted-foreground))";
  const btn    = banner.button_color       || "hsl(var(--accent))";
  const btnHov = banner.button_hover_color || banner.button_color || "hsl(var(--accent))";
  const btnTxt = banner.button_text_color  || "hsl(var(--accent-foreground))";
  const image  = banner.thumbnail || banner.image;

  return (
    <div
      className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 min-h-[200px] w-full h-full"
      style={{ backgroundColor: bg }}
    >
      {/* Derinlik katmanları */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-10"
        style={{ backgroundColor: "hsl(var(--accent))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -right-4 h-20 w-20 rounded-full opacity-[0.06]"
        style={{ backgroundColor: "hsl(var(--accent))" }}
      />
      {/* Sol kenar çizgisi */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: "hsl(var(--accent))" }}
      />

      <div className="relative flex items-center h-full min-h-[200px]">
        {/* Sol: metin içeriği */}
        <div className="flex flex-1 flex-col justify-center pl-7 pr-5 py-6 md:pl-9 md:pr-7">
          {banner.subtitle && (
            <span
              className="mb-2 block text-[0.6rem] font-bold uppercase tracking-[0.2em]"
              style={{ color: "hsl(var(--accent))" }}
            >
              {banner.subtitle}
            </span>
          )}
          <h3
            className="font-playfair font-bold leading-tight text-xl md:text-2xl"
            style={{ color: title }}
          >
            {banner.title}
          </h3>
          {banner.description && (
            <p
              className="mt-2 mb-4 line-clamp-3 text-sm leading-relaxed opacity-85"
              style={{ color: desc }}
            >
              {banner.description}
            </p>
          )}
          {banner.button_text && (
            <div>
              <span
                className="group/btn inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow transition-all duration-150 hover:shadow-md active:scale-95"
                style={{ backgroundColor: btn, color: btnTxt }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = btnHov)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = btn)}
              >
                {banner.button_text}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
              </span>
            </div>
          )}
        </div>

        {/* Sağ: görsel */}
        {image && (
          <div className="relative hidden shrink-0 md:block" style={{ height: 200, width: 280 }}>
            <Image
              src={image}
              alt={banner.alt ?? banner.title}
              fill
              className="object-contain object-right-bottom transition-transform duration-300 group-hover:scale-[1.04]"
              sizes="280px"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Ana bölüm
   Her banner_section__N bloğu, instance=N olan satırın
   bannerlarını getirir ve dikey olarak listeler.
   Yan yana düzen = dış 12-sütun grid ile yönetilir,
   BannerRowSection içinde yatay grid YOKTUR.
───────────────────────────────────────────────── */
export function BannerRowSection({ config }: Props) {
  const instance   = (config as any)?.instance as number | undefined;
  const rowFromKey = Number(
    config?.key?.replace("banner_row_", "").replace(/banner_section__/, "") || 0,
  );
  const row        = instance ?? rowFromKey;
  const stackCount = Math.max(1, Number((config as any)?.stack_count ?? 1));
  const isSolo     = !config?.span || config.span >= 12;

  const { data: banners = [], isFetching } = useBannersByRowQuery(row);

  if (row === 0) return null;

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
    <section className={isSolo ? "py-4" : "py-2 h-full"}>
      <div className={isSolo ? "container mx-auto px-4 flex flex-col gap-3" : "px-2 md:px-3 flex flex-col gap-3 h-full"}>
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
