"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useToken } from "@/lib/use-token";
import { t } from "@/lib/t";
import { MobileNav } from "./mobile-nav";
import {
  Search,
  Plus,
  Menu,
  User,
  Bell,
  MessageSquare,
  LogOut,
  ClipboardList,
  Mail,
  Phone,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

/* ── Inline SVG marka ikonları (lucide-react deprecated) ── */
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import {
  useSiteSettingsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
  useMenuItemsQuery,
  extractMediaUrl,
} from "@/modules/site/site.service";
import { useCartStore } from "@/stores/cart-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryItem, SubCategoryItem, MenuItemDto } from "@/modules/site/site.type";

export function Header() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaOpen, setMegaOpen]       = useState(false);
  const [hoveredCat, setHoveredCat]   = useState<CategoryItem | null>(null);
  const [hoveredCatY, setHoveredCatY] = useState(0);
  const megaRef    = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();

  /* ── Site settings ───────────────────────────── */
  const { data: brand } = useSiteSettingsQuery([
    "site_logo_light",
    "site_logo",
    "brand_logo_text",
    "brand_name",
    "contact_email",
    "contact_phone_display",
    "contact_phone_tel",
    "social_facebook_url",
    "social_instagram_url",
    "social_twitter_url",
  ]);
  const brandLogo     = extractMediaUrl(brand?.site_logo_light ?? brand?.site_logo);
  const brandLogoText = brand?.brand_logo_text as string | undefined;
  const brandName     = (brand?.brand_name     as string) ?? "Kaman İlan";
  const contactEmail        = (brand?.contact_email         as string) ?? "";
  const contactPhoneDisplay = (brand?.contact_phone_display as string) ?? "";
  const contactPhoneTel     = (brand?.contact_phone_tel     as string) ?? contactPhoneDisplay;
  const facebookUrl         = brand?.social_facebook_url    as string | undefined;
  const instagramUrl        = brand?.social_instagram_url   as string | undefined;
  const twitterUrl          = brand?.social_twitter_url     as string | undefined;

  /* ── Menu items ────────────────────────── */
  const { data: headerMenuItems = [] } = useMenuItemsQuery("header");

  /* ── Categories & sub-categories ─────────────── */
  const { data: categories = [] }    = useCategoriesQuery();
  const { data: allSubCats = [] }    = useSubCategoriesQuery();
  const visibleCats = (categories as CategoryItem[])
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  const subCats = allSubCats as SubCategoryItem[];

  /* ── Auth ─────────────────────────────────────── */
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user            = useAuthStore((s) => s.user);
  const logout          = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();

  /* ── Cart ─────────────────────────────────────── */
  const cartItemCount = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => { removeToken(); logout(); };

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  /* ── Mega menu helpers ────────────────────────── */
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
    if (!hoveredCat && visibleCats.length) setHoveredCat(visibleCats[0]);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false);
      setHoveredCat(null);
    }, 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
        setHoveredCat(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const catSubCats = hoveredCat
    ? subCats.filter((s) => s.category_id === hoveredCat.id && s.is_active !== 0 && s.is_active !== false)
    : [];

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          TOPBAR — e-posta / telefon + kısa bağlantılar
         ══════════════════════════════════════════════════════ */}
      <div
        className="hidden sm:block text-xs"
        style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--foreground) / 0.70)", borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div className="container flex h-8 items-center justify-between gap-4">
          {/* Sol: iletişim bilgileri */}
          <div className="flex items-center gap-4">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
              >
                <Mail className="h-3 w-3 opacity-60" />
                {contactEmail}
              </a>
            )}
            {contactPhoneDisplay && (
              <>
                {contactEmail && <span className="opacity-25">|</span>}
                <a
                  href={`tel:${contactPhoneTel || contactPhoneDisplay}`}
                  className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
                >
                  <Phone className="h-3 w-3 opacity-60" />
                  {contactPhoneDisplay}
                </a>
              </>
            )}
          </div>

          {/* Sağ: sosyal medya + kısa linkler */}
          <div className="flex items-center gap-3 ml-auto">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="opacity-50 hover:opacity-100 transition-opacity">
                <IconFacebook className="h-3.5 w-3.5" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="opacity-50 hover:opacity-100 transition-opacity">
                <IconInstagram className="h-3.5 w-3.5" />
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                className="opacity-50 hover:opacity-100 transition-opacity">
                <IconX className="h-3.5 w-3.5" />
              </a>
            )}
            {(facebookUrl || instagramUrl || twitterUrl) && (
              <span className="opacity-25">|</span>
            )}
            {mounted && !isAuthenticated && (
              <Link href={ROUTES.REGISTER} className="opacity-60 hover:opacity-100 transition-opacity">Üye Ol</Link>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          STICKY WRAPPER — ana nav + kategori bar
         ══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40" style={{ boxShadow: "0 2px 16px hsl(153 42% 10% / 0.25)" }}>

        {/* ── ANA NAVBAR (beyaz) ───────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="container flex h-32 items-center gap-3">

            {/* Mobil menü butonu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 md:hidden flex-shrink-0"
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href={ROUTES.HOME} className="shrink-0 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brandLogo && <img src={brandLogo} alt={brandName} className="h-24 w-auto object-contain" />}
              {brandLogoText && (
                <span className="font-black text-3xl tracking-tight leading-none" style={{ color: "hsl(var(--primary))" }}>
                  {brandLogoText}
                </span>
              )}
            </Link>

            {/* Arama çubuğu — desktop */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex max-w-2xl px-4">
              <div className="flex w-full rounded-lg border-2 overflow-hidden transition-all focus-within:border-[hsl(var(--primary)/0.5)]" style={{ borderColor: "hsl(var(--primary) / 0.2)" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.search_placeholder")}
                  className="h-10 flex-1 min-w-0 pl-4 pr-3 text-sm outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="h-10 px-5 flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "hsl(var(--primary))", color: "white" }}
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Ara</span>
                </button>
              </div>
            </form>

            {/* Sağ aksiyonlar */}
            <div className="ml-auto flex items-center gap-2">
              {/* Cart icon (Hadi sepete!) */}
              <Link
                href={ROUTES.CART}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={t("cart.title")}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {mounted && (
                isAuthenticated ? (
                  <>
                    <Link
                      href={ROUTES.NOTIFICATIONS}
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label={t("nav.notifications")}
                    >
                      <Bell className="h-4.5 w-4.5" />
                    </Link>
                    <Link
                      href={ROUTES.MESSAGES}
                      className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label={t("nav.messages")}
                    >
                      <MessageSquare className="h-4.5 w-4.5" />
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                          style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
                        >
                          <User className="h-4.5 w-4.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {user?.full_name && (
                          <div className="px-3 py-2 text-sm font-medium truncate">{user.full_name}</div>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.PROFILE} className="flex items-center gap-2">
                            <User className="h-4 w-4" />{t("nav.account")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.MY_LISTINGS} className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />{t("nav.my_listings")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />{t("nav.logout")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Link
                    href={ROUTES.LOGIN}
                    className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}
                  >
                    <User className="h-3.5 w-3.5" />
                    {t("nav.login")}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Arama — mobil satır */}
          <div className="sm:hidden border-t border-gray-100 px-4 py-2">
            <form onSubmit={handleSearch}>
              <div className="flex rounded-lg border-2 overflow-hidden" style={{ borderColor: "hsl(var(--primary) / 0.25)" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.search_placeholder")}
                  className="h-9 flex-1 pl-3 text-sm outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="h-9 px-4 flex items-center"
                  style={{ backgroundColor: "hsl(var(--primary))", color: "white" }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── KATEGORİ BAR ────────────────────────────────── */}
        <div style={{ backgroundColor: "hsl(var(--secondary))", borderTop: "1px solid hsl(var(--primary-foreground) / 0.10)" }}>
          <div className="container flex items-center h-14 gap-1">

            {/* ── MEGA DROPDOWN BUTONU ── */}
            <div
              ref={megaRef}
              className="relative flex-shrink-0"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <button
                onClick={() => setMegaOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-md px-4 h-9 text-sm font-bold transition-colors"
                style={{
                  backgroundColor: megaOpen ? "hsl(var(--accent))" : "hsl(var(--primary-foreground) / 0.12)",
                  color: megaOpen ? "#2A1505" : "white",
                }}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Tüm Kategoriler
                <ChevronDown className={`h-3 w-3 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
              </button>

              {/* ── MEGA PANEL ── */}
              {megaOpen && (
                <div
                  className="absolute top-full left-0 z-50"
                  style={{ marginTop: 2 }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={closeMega}
                >
                  {/* Sol: kategori listesi */}
                  <div
                    className="w-52 overflow-y-auto rounded-b-xl shadow-2xl"
                    style={{
                      maxHeight: "70vh",
                      background: "#f8faf8",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {visibleCats.map((cat) => (
                      <button
                        key={cat.id}
                        onMouseEnter={(e) => {
                          setHoveredCat(cat);
                          const container = e.currentTarget.closest(".overflow-y-auto") as HTMLElement;
                          const row = e.currentTarget as HTMLElement;
                          const containerTop = container?.getBoundingClientRect().top ?? 0;
                          const rowTop = row.getBoundingClientRect().top;
                          setHoveredCatY(rowTop - containerTop);
                        }}
                        onClick={() => setMegaOpen(false)}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left transition-colors"
                        style={{
                          backgroundColor:
                            hoveredCat?.id === cat.id ? "hsl(var(--primary) / 0.08)" : "transparent",
                          color:
                            hoveredCat?.id === cat.id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                          fontWeight: hoveredCat?.id === cat.id ? 600 : 400,
                          borderLeft:
                            hoveredCat?.id === cat.id
                              ? "3px solid hsl(var(--primary))"
                              : "3px solid transparent",
                        }}
                      >
                        {cat.icon && (
                          <span className="text-base w-5 text-center leading-none">{cat.icon}</span>
                        )}
                        <Link
                          href={ROUTES.CATEGORY(cat.slug)}
                          className="flex-1 truncate"
                          onClick={() => setMegaOpen(false)}
                        >
                          {cat.name}
                        </Link>
                        {subCats.some((s) => s.category_id === cat.id) && (
                          <ChevronRight className="h-3 w-3 opacity-40 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Sağ: alt kategoriler — hover satırıyla hizalı */}
                  {hoveredCat && catSubCats.length > 0 && (
                    <div
                      className="absolute overflow-y-auto rounded-xl shadow-2xl"
                      style={{
                        left: 210,
                        top: hoveredCatY,
                        minWidth: 300,
                        maxWidth: 440,
                        maxHeight: "60vh",
                        background: "white",
                        border: "1px solid hsl(var(--border))",
                        borderTopLeftRadius: 4,
                        padding: 16,
                        zIndex: 10,
                      }}
                    >
                      <div
                        className="flex items-center gap-2 mb-3 pb-2"
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                      >
                        {hoveredCat.icon && <span className="text-xl">{hoveredCat.icon}</span>}
                        <Link
                          href={ROUTES.CATEGORY(hoveredCat.slug)}
                          className="text-sm font-bold hover:underline"
                          style={{ color: "hsl(var(--primary))" }}
                          onClick={() => setMegaOpen(false)}
                        >
                          {hoveredCat.name}
                        </Link>
                        <Link
                          href={ROUTES.CATEGORY(hoveredCat.slug)}
                          className="text-xs text-gray-400 ml-auto hover:text-gray-600"
                          onClick={() => setMegaOpen(false)}
                        >
                          Tümünü Gör →
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {catSubCats.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`${ROUTES.CATEGORY(hoveredCat.slug)}?alt=${sub.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {sub.icon && (
                              <span className="text-base w-5 text-center">{sub.icon}</span>
                            )}
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ayırıcı */}
            <div className="h-5 w-px mx-1 opacity-20 bg-white flex-shrink-0" />

            {/* Navigasyon Linkleri (Merkez) */}
            <div className="hidden lg:flex items-center justify-center gap-2 xl:gap-6 flex-1 px-4">
              {(headerMenuItems as MenuItemDto[])
                .filter((i) => !i.parent_id)
                .sort((a, b) => a.order_num - b.order_num)
                .map((item) => {
                  const children = (headerMenuItems as MenuItemDto[]).filter(
                    (child) => child.parent_id === item.id
                  ).sort((a, b) => a.order_num - b.order_num);

                  const isActive = pathname === item.url;

                  if (children.length > 0) {
                    return (
                      <DropdownMenu key={item.id}>
                        <DropdownMenuTrigger className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors whitespace-nowrap outline-none ${
                          isActive || children.some(c => pathname === c.url) ? "text-accent" : "text-white/80 hover:text-white"
                        }`}>
                          {item.title}
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="min-w-[180px]">
                          {children.map((child) => (
                            <DropdownMenuItem key={child.id} asChild>
                              <Link
                                href={child.url}
                                className={`w-full cursor-pointer font-medium ${
                                  pathname === child.url ? "text-primary bg-primary/5" : ""
                                }`}
                              >
                                {child.title}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.url}
                      className={`px-3 py-2 text-sm font-bold transition-colors whitespace-nowrap ${
                        isActive ? "text-accent" : "text-white/80 hover:text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                })}
            </div>

            {/* İlan Ver Butonu (Sağ) */}
            <Link
              href={ROUTES.POST_LISTING}
              className="flex items-center gap-2 rounded-md px-5 h-10 text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
              style={{
                backgroundColor: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground))",
              }}
            >
              <Plus className="h-4 w-4" />
              {t("nav.post_listing")}
            </Link>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} brandName={brandName} />
    </>
  );
}
