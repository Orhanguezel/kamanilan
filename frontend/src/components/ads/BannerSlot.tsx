import { fetchBanners, type BannerContext, type PublicBanner } from "@/lib/banners";
import { headers } from "next/headers";
import { getCategoryThumbnailUrl as resolveImageUrl } from "@/lib/image-url";
import TemplateBanner from "./TemplateBanner";
import ResilientAdImage from "./ResilientAdImage";

const SIDEBAR_POSITIONS = new Set(["listings_sidebar", "listing_detail_sidebar", "news_detail_sidebar", "store_detail_sidebar"]);

function deviceClass(device: PublicBanner["device"]): string {
  if (device === "desktop") return "hidden md:block";
  if (device === "mobile") return "md:hidden";
  return "";
}

function clickHref(banner: PublicBanner): string | null {
  return banner.linkUrl || banner.sourceType === "listing" ? `/api/v1/ads/banners/${banner.id}/click` : null;
}

export function bannerColumnsClass(columns: number) {
  if (columns === 2) return "md:grid-cols-2";
  if (columns === 3) return "md:grid-cols-3";
  return "grid-cols-1";
}

function inferredPageType(position: string) {
  if (position.startsWith("store_")) return "store_detail";
  if (position.startsWith("listing_")) return "listing_detail";
  if (position.startsWith("listings_")) return "listings";
  if (position.startsWith("category_")) return "category";
  if (position.startsWith("news_detail_")) return "news_detail";
  if (position.startsWith("news_")) return "news";
  if (position.startsWith("announcements_")) return "announcements";
  if (position.startsWith("home_")) return "home";
  return "global";
}

export default async function BannerSlot({
  position,
  className = "",
  context = {},
}: {
  position: string;
  className?: string;
  context?: BannerContext;
}) {
  const incoming = await headers();
  const forwarded = new Headers();
  const clientIp = incoming.get("x-forwarded-for");
  const userAgent = incoming.get("user-agent");
  if (clientIp) forwarded.set("x-forwarded-for", clientIp);
  if (userAgent) forwarded.set("user-agent", userAgent);
  const banners = await fetchBanners(position, { page_type: inferredPageType(position), ...context }, forwarded);
  if (!banners.length) return null;
  const sidebar = SIDEBAR_POSITIONS.has(position);
  const rows = new Map<number, PublicBanner[]>();
  for (const banner of banners) {
    const row = banner.desktopRow ?? 1;
    rows.set(row, [...(rows.get(row) ?? []), banner]);
  }

  return (
    <div className={className} aria-label="Reklam">
      <div
        className={`mx-auto my-5 ${
          sidebar
            ? "max-w-[336px] px-4"
            : "max-w-[var(--container-max)] px-6 lg:px-12 xl:px-16"
        }`}
      >
        <SponsorLabel />
        <div className="space-y-4">
          {[...rows.entries()].sort(([a], [b]) => a - b).map(([row, rowBanners]) => (
            <div key={row} className={`grid gap-4 ${bannerColumnsClass(rowBanners[0]?.desktopColumns ?? 1)}`}>
              {rowBanners.map((banner) => <BannerCreative key={banner.id} banner={banner} sidebar={sidebar} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BannerCreative({ banner, sidebar }: { banner: PublicBanner; sidebar: boolean }) {
  const href = clickHref(banner);
  const target = banner.linkTarget || "_blank";
  const rel = banner.rel || "sponsored nofollow noopener";
  const alt = banner.alt ?? banner.title;

  if (banner.type === "code" && banner.code) {
    return <div className={`${deviceClass(banner.device)} isolate overflow-hidden [contain:layout_paint]`.trim()} dangerouslySetInnerHTML={{ __html: banner.code }} />;
  }

  if (banner.sourceType === "listing" && banner.listing) {
    const listing = banner.listing;
    const listingHref = `/api/v1/ads/banners/${banner.id}/click`;
    const price = listing.priceMin == null ? "Fiyat için iletişime geçin" : `${Number(listing.priceMin).toLocaleString("tr-TR")} ${listing.currency}/${listing.priceUnit}`;
    return (
      <a href={listingHref} target={target} rel={rel} className={`${deviceClass(banner.device)} group flex min-h-[140px] overflow-hidden border border-ink/10 bg-ivory text-ink shadow-[0_16px_45px_rgba(30,22,14,0.08)] transition hover:-translate-y-0.5 hover:border-saffron/60 hover:shadow-[0_20px_55px_rgba(30,22,14,0.13)]`.trim()}>
        {listing.imageUrl && (
          <ResilientAdImage src={resolveImageUrl(listing.imageUrl)} alt={listing.title} className="w-32 shrink-0 object-cover sm:w-40" />
        )}
        <span className="flex min-w-0 flex-1 flex-col justify-center p-6">
          <span className="text-[9px] font-bold uppercase tracking-[.18em] text-saffron-2">Sponsorlu ilan · {listing.productName}</span>
          <strong className="mt-2 line-clamp-2 font-fraunces text-xl font-medium leading-tight">{listing.title}</strong>
          <span className="mt-2 text-sm font-semibold">{price}</span>
          <span className="mt-1 text-xs text-(--color-muted)">{listing.citySlug || "Türkiye"} · İlanı incele →</span>
        </span>
      </a>
    );
  }

  if (banner.creativeTemplate && banner.creativeTemplate !== "image") {
    return <TemplateBanner banner={banner} href={href} sidebar={sidebar} />;
  }
  if (!banner.imageUrl) return null;
  return (
    <a href={href ?? undefined} target={href ? target : undefined} rel={href ? rel : undefined} className={`${deviceClass(banner.device)} flex h-full overflow-hidden border border-ink/10 bg-ivory shadow-[0_16px_45px_rgba(30,22,14,0.08)] transition hover:-translate-y-0.5 hover:border-saffron/60 sm:flex-row ${sidebar ? "flex-col" : "min-h-[140px]"}`.trim()}>
      <ResilientAdImage src={resolveImageUrl(banner.imageUrl)} alt={alt} fallbackClassName="min-h-32" className={sidebar ? "max-h-[260px] w-full object-cover" : "order-2 max-h-40 min-w-0 flex-1 object-cover"} />
      {(banner.caption || banner.ctaLabel) && <span className="flex min-w-0 flex-col justify-center p-6 text-sm"><small className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-saffron-2">Sponsorlu içerik</small>{banner.caption ? <strong className="mt-2 font-fraunces text-xl font-medium leading-tight text-ink">{banner.caption}</strong> : null}{banner.ctaLabel ? <small className="mt-4 border-b border-ink pb-1 text-[10px] font-bold uppercase tracking-[.1em] text-ink">{banner.ctaLabel} →</small> : null}</span>}
    </a>
  );
}

function SponsorLabel() {
  return <div className="mb-2 flex items-center gap-2 font-(family-name:--font-mono) text-[9px] font-semibold uppercase tracking-[0.16em] text-walnut/45"><span className="h-px w-5 bg-saffron" />Sponsorlu</div>;
}
