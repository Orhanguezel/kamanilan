import { getCategoryThumbnailUrl as resolveImageUrl } from "@/lib/image-url";
import type { PublicBanner } from "@/lib/banners";
import { ArrowUpRight } from "lucide-react";
import ResilientAdImage from "./ResilientAdImage";

export default function TemplateBanner({ banner, href, sidebar }: {
  banner: PublicBanner;
  href: string | null;
  sidebar: boolean;
}) {
  const config = banner.creativeConfig ?? {};
  const template = banner.creativeTemplate ?? "image";
  const vertical = sidebar || template === "mpu" || template === "mobile";
  const split = template === "split";
  const mediaUrl = banner.imageUrl || config.backgroundImageUrl || null;
  const accent = config.accentColor || "hsl(var(--col-saffron))";
  const label = template === "seller" ? "Sponsor mağaza" : template === "listing" ? "Sponsorlu ilan" : template === "sponsorship" ? "Ürün sponsorluğu" : "Sponsorlu içerik";
  return (
    <a
      href={href ?? undefined}
      target={href ? banner.linkTarget || "_blank" : undefined}
      rel={href ? banner.rel || "sponsored nofollow noopener" : undefined}
      className={`${banner.device === "desktop" ? "hidden md:flex" : banner.device === "mobile" ? "flex md:hidden" : "flex"} group relative overflow-hidden border border-ink/10 bg-ivory text-ink shadow-[0_16px_45px_rgba(30,22,14,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-saffron/60 hover:shadow-[0_20px_55px_rgba(30,22,14,0.13)] ${vertical ? "min-h-[330px] flex-col" : "min-h-[150px] items-stretch"} ${config.animation ? "motion-safe:animate-[pulse_8s_ease-in-out_infinite]" : ""}`}
    >
      {mediaUrl ? (
        <ResilientAdImage
          src={resolveImageUrl(mediaUrl)}
          alt={banner.alt || banner.title}
          className={vertical ? "h-40 w-full" : split ? "order-2 w-[42%]" : "order-2 w-40 sm:w-64 lg:w-[34%]"}
          fallbackClassName={vertical ? "min-h-40" : "order-2 min-h-[150px] w-[34%]"}
          style={{ objectFit: config.imageFit || "cover", objectPosition: `${config.focalX ?? 50}% ${config.focalY ?? 50}%` }}
        />
      ) : (
        <span className={`${vertical ? "h-36 w-full" : "order-2 w-[30%] min-w-44"} relative overflow-hidden bg-ink`} aria-hidden="true">
          <span className="absolute -right-8 -top-10 size-32 rounded-full border border-saffron/30" />
          <span className="absolute -right-2 -top-2 size-20 rounded-full bg-saffron" />
          <span className="absolute inset-0 flex items-center justify-center font-fraunces text-7xl italic text-paper">K</span>
        </span>
      )}
      <span className={`${vertical ? "order-2" : "order-1"} relative flex min-w-0 flex-1 flex-col justify-center p-6 sm:px-8`}>
        {config.logoUrl ? (
          <ResilientAdImage src={resolveImageUrl(config.logoUrl)} alt="" className="mb-3 max-h-8 max-w-28 object-contain object-left" hideOnError />
        ) : null}
        <span className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.18em] text-saffron-2">
          <span className="h-px w-6" style={{ backgroundColor: accent }} />
          {label}
        </span>
        <strong className="mt-3 line-clamp-3 break-words font-fraunces text-xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-2xl">{banner.caption || banner.title}</strong>
        {config.description ? <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-walnut/70">{config.description}</span> : null}
        {banner.advertiser ? <span className="mt-2 font-mono text-[9px] uppercase tracking-[.14em] text-walnut/50">{banner.advertiser}</span> : null}
        {banner.ctaLabel ? (
          <span className="mt-5 inline-flex w-fit items-center gap-2 border-b border-ink pb-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] transition-colors group-hover:border-saffron group-hover:text-saffron-2">
            {banner.ctaLabel}<ArrowUpRight aria-hidden="true" className="size-3.5" />
          </span>
        ) : null}
      </span>
    </a>
  );
}
