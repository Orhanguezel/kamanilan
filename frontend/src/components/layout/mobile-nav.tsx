"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useToken } from "@/lib/use-token";
import { t } from "@/lib/t";
import { Button } from "@/components/ui/button";
import {
  X, Home, List, Tag, Plus, User, ClipboardList,
  MessageSquare, Bell, Info, Phone, LogOut, Megaphone,
} from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  brandName?: string;
}

export function MobileNav({ open, onClose, brandName = "Kaman İlan" }: MobileNavProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { removeToken } = useToken();

  const handleLogout = () => {
    removeToken();
    logout();
    onClose();
  };

  if (!open) return null;

  const publicLinks = [
    { href: ROUTES.HOME, label: t("nav.home"), icon: Home },
    { href: ROUTES.LISTINGS, label: t("nav.listings"), icon: List },
    { href: ROUTES.CATEGORIES, label: t("nav.categories"), icon: Tag },
    { href: ROUTES.ANNOUNCEMENTS, label: "Duyurular", icon: Megaphone },
    { href: ROUTES.ABOUT, label: t("nav.about"), icon: Info },
    { href: ROUTES.CONTACT, label: t("nav.contact"), icon: Phone },
  ];

  const authLinks = [
    { href: ROUTES.PROFILE, label: t("nav.account"), icon: User },
    { href: ROUTES.MY_LISTINGS, label: t("nav.my_listings"), icon: ClipboardList },
    { href: ROUTES.MESSAGES, label: t("nav.messages"), icon: MessageSquare },
    { href: ROUTES.NOTIFICATIONS, label: t("nav.notifications"), icon: Bell },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl flex flex-col">
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
          <span className="font-bold text-lg">{brandName}</span>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/15">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {publicLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t" />

          <Button asChild className="w-full gap-2">
            <Link href={ROUTES.POST_LISTING} onClick={onClose}>
              <Plus className="h-4 w-4" />
              {t("nav.post_listing")}
            </Link>
          </Button>

          {isAuthenticated ? (
            <>
              <div className="my-4 border-t" />
              <ul className="space-y-1">
                {authLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <link.icon className="h-4 w-4 text-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <>
              <div className="my-4 border-t" />
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={ROUTES.LOGIN} onClick={onClose}>{t("nav.login")}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={ROUTES.REGISTER} onClick={onClose}>{t("nav.register")}</Link>
                </Button>
              </div>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
