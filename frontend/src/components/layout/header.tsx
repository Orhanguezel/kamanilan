"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { MobileNav } from "./mobile-nav";
import {
  Search,
  Menu,
  User,
  ShoppingCart,
} from "lucide-react";
import {
  useSiteSettingsQuery,
  useMenuItemsQuery,
  extractMediaUrl,
} from "@/modules/site/site.service";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItemDto } from "@/modules/site/site.type";

export function Header() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { data: brand } = useSiteSettingsQuery([
    "site_logo_light",
    "site_logo",
    "brand_logo_text",
    "brand_name",
  ]);
  const brandLogo     = extractMediaUrl(brand?.site_logo_light ?? brand?.site_logo);
  const brandLogoText = brand?.brand_logo_text as string | undefined;
  const brandName     = (brand?.brand_name     as string) ?? "Kaman İlan";

  const { data: headerMenuItems = [] } = useMenuItemsQuery("header");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartItemCount = useCartStore((s) => s.totalItems());

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* ── TOP STRIP ── */}
      <div className="bg-ink text-parchment py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] hidden sm:block overflow-hidden border-b border-white/5">
        <div className="container flex items-center justify-between gap-8">
          <div className="flex items-center gap-10 whitespace-nowrap">
             <span className="flex items-center gap-2 text-wheat">
               <span className="h-1 w-1 rounded-full bg-saffron shadow-[0_0_8px_hsl(var(--col-saffron))]" />
               Kırşehir · Kaman
             </span>
             <span className="hidden md:inline opacity-30">|</span>
             <div className="hidden md:flex items-center gap-10 opacity-70">
                <span>Türkiye'nin Ceviz Başkenti</span>
                <span>Hasat Zamanı 2026</span>
             </div>
          </div>
          <div className="flex items-center gap-5">
            <a href="mailto:info@kamanilan.com" className="hover:text-saffron transition-colors">Bize Ulaşın</a>
            {!isAuthenticated && (
              <Link href={ROUTES.REGISTER} className="text-saffron hover:brightness-125 transition-all">Üye Ol</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-[rgba(253,250,243,0.92)] backdrop-blur-xl transition-all">
        <div className="container grid grid-cols-[auto_1fr_auto] items-center gap-8 py-5 md:py-6">
          
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
            title="Menüyü aç"
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full border border-border"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          <Link href={ROUTES.HOME} className="flex items-center gap-4 group shrink-0">
            <div className="relative h-14 w-14 flex-shrink-0 bg-white rounded-full flex items-center justify-center p-1 shadow-md transition-all duration-500 group-hover:shadow-xl group-hover:scale-105">
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={brandName}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  decoding="async"
                />
              ) : (
                <span className="font-fraunces text-2xl font-bold leading-none text-ink italic">K</span>
              )}
              {/* Gold ring */}
              <div className="absolute inset-0 rounded-full border border-saffron/40 ring-1 ring-saffron/10 ring-offset-2" />
            </div>
            
            <div className="hidden md:flex flex-col -gap-1">
               <span className="font-fraunces text-2xl lg:text-3xl font-medium tracking-tight text-ink leading-tight">
                 {brandName.split(' ')[0]} <span className="text-[hsl(var(--col-ink)/0.8)]">{brandName.split(' ').slice(1).join(' ')}</span>
               </span>
               <div className="flex items-center gap-2">
                 <div className="h-px w-3 bg-saffron" />
                 <small className="font-mono text-[9px] uppercase tracking-[0.25em] text-[hsl(var(--col-walnut))] font-bold">{brandLogoText || "YEREL GURUR"}</small>
               </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-10">
            {(headerMenuItems as MenuItemDto[]).filter(i => !i.parent_id).sort((a,b)=>a.order_num - b.order_num).map((item) => {
              let href = item.url || "#";
              // Fallback for empty DB links
              if (!item.url || item.url === "#") {
                const title = item.title.toLowerCase();
                if (title.includes("kategori")) href = ROUTES.CATEGORIES;
                else if (title.includes("ilan")) href = ROUTES.LISTINGS;
                else if (title.includes("duyuru")) href = ROUTES.ANNOUNCEMENTS;
                else if (title.includes("hakkımızda") || title.includes("sayfalar") || title.includes("kurumsal")) href = ROUTES.ABOUT;
                else if (title.includes("iletişim") || title.includes("iletisim")) href = ROUTES.CONTACT;
                else if (title.includes("anasayfa") || title.includes("ana sayfa")) href = ROUTES.HOME;
              }

              const isActive = pathname === href;
              return (
                <Link 
                  key={item.id} 
                  href={href} 
                  className={`relative py-1.5 text-sm font-semibold tracking-wide transition-all duration-300 group ${
                    isActive ? "text-ink" : "text-walnut hover:text-ink"
                  }`}
                >
                  {item.title}
                  <span className={`absolute left-0 bottom-0 h-px bg-saffron transition-all duration-300 ${
                    isActive ? "right-0" : "right-full group-hover:right-0"
                  }`} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3.5">
            {mounted && (
              <>
                <Link
                  href={`${ROUTES.LISTINGS}`}
                  aria-label="İlanlarda ara"
                  title="İlanlarda ara"
                  className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-ink hover:text-saffron transition-all"
                >
                  <Search aria-hidden="true" className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href={ROUTES.CART}
                  aria-label={`Sepet${cartItemCount > 0 ? ` (${cartItemCount} ürün)` : ""}`}
                  title="Sepet"
                  className="relative h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-ink hover:text-saffron transition-all"
                >
                  <ShoppingCart aria-hidden="true" className="h-4.5 w-4.5" />
                  {cartItemCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-saffron text-[9px] font-bold text-ink">{cartItemCount}</span>}
                </Link>
                {!isAuthenticated ? (
                  <Link href={ROUTES.LOGIN} className="btn-editorial"><span><User aria-hidden="true" className="h-4 w-4" /> Giriş</span></Link>
                ) : (
                  <Link
                    href={ROUTES.PROFILE}
                    aria-label="Hesabım"
                    title="Hesabım"
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-saffron text-ink transition-transform hover:scale-110 shadow-lg"
                  >
                    <User aria-hidden="true" className="h-5 w-5" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} brandName={brandName} />
    </>
  );
}
