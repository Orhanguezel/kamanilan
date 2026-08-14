"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BannerItem } from "@/modules/banner/banner.type";

type PremiumBannerVariant = "wide" | "sidebar";

function isSalesPlaceholder(banner: BannerItem): boolean {
  return banner.link_url === "/reklam-ver" || /bu alana|reklam ver/i.test(banner.subtitle ?? "");
}

function VisualPanel({ banner, placeholder }: { banner: BannerItem; placeholder: boolean }) {
  if (!placeholder && banner.image) {
    return (
      <div className="relative min-h-[150px] overflow-hidden bg-ink">
        <Image
          src={banner.image}
          alt={banner.alt ?? banner.title}
          width={960}
          height={540}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          sizes="(max-width: 768px) 100vw, 42vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      data-testid="premium-placeholder-visual"
      className="relative min-h-[150px] overflow-hidden bg-ink"
      aria-hidden="true"
    >
      <div className="absolute inset-y-0 left-[18%] w-px bg-white/10" />
      <div className="absolute inset-y-0 left-[42%] w-px bg-white/10" />
      <div className="absolute inset-y-0 left-[66%] w-px bg-white/10" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <div className="absolute -right-12 -top-14 size-44 rounded-full border border-saffron/30" />
      <div className="absolute -right-4 -top-4 size-28 rounded-full bg-saffron" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-fraunces text-[88px] font-medium italic leading-none text-paper">K</span>
      </div>
      <div className="absolute bottom-4 left-5 font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-saffron">
        Kaman İlan · Yerel Reklam
      </div>
    </div>
  );
}

export function PremiumBannerCard({
  banner,
  variant = "sidebar",
}: {
  banner: BannerItem;
  variant?: PremiumBannerVariant;
}) {
  const placeholder = isSalesPlaceholder(banner);
  const wide = variant === "wide";
  const label = placeholder ? "Kaman'ın yerel pazarında" : "Sponsorlu içerik";
  const title = placeholder ? "Markanızı doğru yerde görünür kılın." : banner.title;
  const description = placeholder
    ? "Kaman ve çevresindeki müşterilere, ilanların ve yerel haberlerin yanında ulaşın."
    : banner.description;
  const cta = placeholder ? "Reklam seçenekleri" : banner.button_text;

  const card = (
    <article
      data-variant={variant}
      className={`group relative overflow-hidden border border-ink/10 bg-ivory shadow-[0_16px_45px_rgba(30,22,14,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-saffron/60 hover:shadow-[0_20px_55px_rgba(30,22,14,0.13)] ${
        wide ? "grid min-h-[180px] md:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]" : "flex min-h-[340px] flex-col"
      }`}
    >
      <div className={`relative flex min-w-0 flex-col justify-center ${wide ? "order-1 px-7 py-8 md:px-10" : "order-2 px-6 py-7"}`}>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-7 bg-saffron" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-saffron-2">
            {label}
          </span>
        </div>
        <h3 className={`max-w-2xl font-fraunces font-medium leading-[1.05] tracking-[-0.025em] text-ink ${wide ? "text-2xl md:text-[32px]" : "text-[24px]"}`}>
          {title}
        </h3>
        {description ? (
          <p className={`mt-3 max-w-2xl leading-relaxed text-walnut/75 ${wide ? "line-clamp-2 text-[13px]" : "line-clamp-3 text-[12px]"}`}>
            {description}
          </p>
        ) : null}
        {cta ? (
          <span className="mt-6 inline-flex w-fit items-center gap-3 border-b border-ink pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-ink transition-colors group-hover:border-saffron group-hover:text-saffron-2">
            {cta}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </span>
        ) : null}
        <span className="absolute right-5 top-4 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-walnut/35">
          Sponsorlu
        </span>
      </div>
      <div className={wide ? "order-2" : "order-1"}>
        <VisualPanel banner={banner} placeholder={placeholder} />
      </div>
    </article>
  );

  if (!banner.link_url) return card;

  return (
    <Link
      href={banner.link_url}
      target={banner.link_target ?? "_self"}
      rel="sponsored nofollow noopener"
      className="block"
    >
      {card}
    </Link>
  );
}
