"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Wallet,
  Package,
  Heart,
  Clock,
  Headphones,
  MapPin,
  Lock,
  LogOut,
  ChevronDown,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useToken } from "@/lib/use-token";
import { ROUTES } from "@/config/routes";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import Cookies from "js-cookie";

import trDict from "@/locales/tr.json";
import enDict from "@/locales/en.json";

type Dicts = typeof trDict;
const DICTS: Record<string, Dicts> = { tr: trDict, en: enDict as unknown as Dicts };

function tl(key: string, locale: string): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let d: any = DICTS[locale] ?? DICTS.tr;
  for (const p of parts) { d = d?.[p]; if (d === undefined) break; }
  if (typeof d !== "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fd: any = DICTS.tr;
    for (const p of parts) { fd = fd?.[p]; }
    return typeof fd === "string" ? fd : key;
  }
  return d;
}

const NAV_ITEMS = [
  { href: ROUTES.PROFILE_INFO,            key: "account.profile",          icon: User },
  { href: ROUTES.PROFILE_WALLET,          key: "account.wallet",           icon: Wallet },
  { href: ROUTES.PROFILE_ORDERS,          key: "account.orders",           icon: Package },
  { href: ROUTES.PROFILE_FAVORITES,       key: "account.favorites",        icon: Heart },
  { href: ROUTES.PROFILE_RECENTLY_VIEWED, key: "account.recently_viewed",  icon: Clock },
  { href: ROUTES.PROFILE_SUPPORT,         key: "account.support",          icon: Headphones },
  { href: ROUTES.PROFILE_ADDRESSES,       key: "account.addresses",        icon: MapPin },
  { href: ROUTES.PROFILE_PASSWORD,        key: "account.change_password",  icon: Lock },
];

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Stable SSR init — client reads cookie in effect to avoid hydration mismatch
  // (was causing React error #310 hook-order cascade on /hesabim/* pages).
  const [locale, setLocale] = useState("tr");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  // Read locale on mount + when cookie changes (LanguageSwitcher calls router.refresh)
  useEffect(() => {
    const sync = () => {
      const l = Cookies.get("lang") ?? "tr";
      setLocale((prev) => (prev !== l ? l : prev));
    };
    sync();
    const id = setInterval(sync, 300);
    return () => clearInterval(id);
  }, []);

  if (!isAuthenticated) return null;

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const handleLogout = () => {
    removeToken();
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3.5 w-3.5" />
          {tl("common.home", locale)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{tl("account.my_account", locale)}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile dropdown */}
        <div className="lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <User className="h-5 w-5" />
              {tl("account.my_account", locale)}
            </h1>
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-full flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              {activeItem && <activeItem.icon className="h-4 w-4 text-primary" />}
              {activeItem ? tl(activeItem.key, locale) : tl("account.my_account", locale)}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileOpen && (
            <nav className="mt-1 rounded-lg border bg-card overflow-hidden">
              {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {tl(key, locale)}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {tl("nav.logout", locale)}
              </button>
            </nav>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-3">
          {/* Sidebar header */}
          <div className="rounded-lg border bg-card px-4 py-3">
            <h1 className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4" />
              {tl("account.my_account", locale)}
            </h1>
          </div>

          {/* Nav */}
          <nav className="rounded-lg border bg-card overflow-hidden">
            {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${
                  pathname === href || pathname.startsWith(href + "/")
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tl(key, locale)}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {tl("nav.logout", locale)}
            </button>
          </nav>

          {/* Language switcher in sidebar */}
          <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Dil / Language</span>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
