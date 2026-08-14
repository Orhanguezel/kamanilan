import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { BannerCreative, bannerColumnsClass } from "@/components/ads/BannerSlot";
import { ROUTES } from "@/config/routes";
import { fetchBanners, type PublicBanner } from "@/lib/banners";

function groupBannerRows(banners: PublicBanner[]): Array<[number, PublicBanner[]]> {
  const rows = new Map<number, PublicBanner[]>();
  for (const banner of banners) {
    const row = banner.desktopRow ?? 1;
    rows.set(row, [...(rows.get(row) ?? []), banner]);
  }
  return [...rows.entries()].sort(([first], [second]) => first - second);
}

export async function SponsoredBusinessesSection() {
  const incoming = await headers();
  const forwarded = new Headers();
  const clientIp = incoming.get("x-forwarded-for");
  const userAgent = incoming.get("user-agent");
  if (clientIp) forwarded.set("x-forwarded-for", clientIp);
  if (userAgent) forwarded.set("user-agent", userAgent);

  const banners = await fetchBanners(
    "home_mid",
    { page_type: "home" },
    forwarded,
  );

  return (
    <section aria-labelledby="sponsored-businesses-title" className="border-t border-black/10 pt-3">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2
          id="sponsored-businesses-title"
          className="font-fraunces text-[26px] font-medium leading-tight tracking-[-0.035em] text-ink"
        >
          Sponsorlu İşletmeler
        </h2>
        <Link
          href={ROUTES.ADVERTISE}
          className="flex items-center gap-2 text-[10px] font-bold text-ink transition-colors hover:text-saffron"
        >
          Reklam Ver <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {banners.length > 0 ? (
        <div className="space-y-3" aria-label="Sponsorlu işletmeler">
          {groupBannerRows(banners).map(([row, rowBanners]) => (
            <div
              key={row}
              className={`grid gap-3 ${bannerColumnsClass(rowBanners[0]?.desktopColumns ?? 1)}`}
            >
              {rowBanners.map((banner) => (
                <BannerCreative key={banner.id} banner={banner} sidebar={false} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Link
          href={ROUTES.ADVERTISE}
          className="group grid min-h-[104px] overflow-hidden border border-black/10 bg-paper transition-colors hover:border-saffron md:grid-cols-[120px_1fr_auto]"
        >
          <span className="flex items-center justify-center bg-ink text-saffron">
            <Store className="h-10 w-10" aria-hidden="true" />
          </span>
          <span className="flex flex-col justify-center px-6 py-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-saffron">
              Bu alan sizin olabilir
            </span>
            <strong className="mt-2 font-fraunces text-[21px] font-medium text-ink">
              İşletmenizi Kaman&apos;ın yerel pazarında öne çıkarın.
            </strong>
            <span className="mt-1 text-[11px] leading-5 text-walnut/65">
              Kampanya, mağaza ve ilan reklamları için uygun alanları inceleyin.
            </span>
          </span>
          <span className="hidden items-center border-l border-black/10 px-6 text-saffron md:flex">
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      )}
    </section>
  );
}
