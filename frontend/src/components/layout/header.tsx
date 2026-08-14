"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Plus, User } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { extractMediaUrl, useSiteSettingsQuery } from "@/modules/site/site.service";
import { useAuthStore } from "@/stores/auth-store";
import { MobileNav } from "./mobile-nav";

const NAV_ITEMS = [
  { label: "Emlak", href: ROUTES.CATEGORY("emlak-kira") },
  { label: "Vasıta", href: ROUTES.CATEGORY("arac-motosiklet") },
  { label: "Tarım & Hayvancılık", href: ROUTES.CATEGORY("hayvan-tarim") },
  { label: "İş İlanları", href: ROUTES.CATEGORY("is-ilanlari") },
  { label: "Hizmetler", href: ROUTES.CATEGORY("usta-hizmet") },
  { label: "Diğer İlanlar", href: ROUTES.CATEGORIES },
  { label: "Haberler", href: ROUTES.NEWS },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { data: brand } = useSiteSettingsQuery(["brand_name", "site_logo_light", "site_logo"]);
  const brandName = (brand?.brand_name as string | undefined) ?? "Kaman İlan";
  const brandLogo = extractMediaUrl(brand?.site_logo_light ?? brand?.site_logo);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/95 backdrop-blur-xl">
        <div className="container flex h-[70px] items-center gap-5 px-6 lg:gap-7 lg:px-12 xl:px-16">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
            className="flex h-9 w-9 items-center justify-center border border-black/10 xl:hidden"
          >
            <Menu aria-hidden="true" className="h-4 w-4" />
          </button>

          <Link href={ROUTES.HOME} className="mr-auto flex min-w-max items-center gap-2.5 lg:mr-2">
            {brandLogo ? (
              <Image
                src={brandLogo}
                alt={`${brandName} logosu`}
                width={40}
                height={40}
                priority
                className="h-10 w-10 rounded-full object-contain"
              />
            ) : null}
            <span className="font-fraunces text-[26px] font-semibold tracking-[-0.04em] text-ink">
              Kaman İlan
            </span>
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.2em] text-walnut/65 xl:inline">
              Yerel Pazar
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 xl:flex xl:gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`whitespace-nowrap border-b py-1 text-[12px] font-semibold transition-colors ${
                    isActive
                      ? "border-saffron text-ink"
                      : "border-transparent text-walnut hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <Link
              href={ROUTES.POST_LISTING}
              className="hidden items-center gap-1.5 text-[11px] font-bold text-ink transition-colors hover:text-saffron xl:flex"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              İlan Ver
            </Link>
            <Link
              href={ROUTES.PROFILE_FAVORITES}
              aria-label="Favoriler"
              className="flex h-9 w-9 items-center justify-center border border-black/10 transition-colors hover:border-saffron"
            >
              <Heart aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={hasHydrated && isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
              className="flex items-center gap-1.5 text-[11px] font-bold text-ink"
            >
              <User aria-hidden="true" className="h-4 w-4" />
              {hasHydrated && isAuthenticated ? "Hesabım" : "Giriş"}
            </Link>
            <Link
              href={ROUTES.POST_LISTING}
              className="rounded-full bg-saffron px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink transition-transform hover:-translate-y-0.5"
            >
              Ücretsiz İlan Ver
            </Link>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} brandName={brandName} />
    </>
  );
}
