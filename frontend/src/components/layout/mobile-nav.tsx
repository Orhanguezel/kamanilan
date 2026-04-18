"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useToken } from "@/lib/use-token";
import { t } from "@/lib/t";
import { 
  X, Home, List, Tag, Plus, User, ClipboardList,
  MessageSquare, Bell, Info, Phone, LogOut, Megaphone,
  ArrowRight
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
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-[rgba(15,17,13,0.8)] backdrop-blur-sm transition-all" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-[101] w-full max-w-[320px] bg-cream shadow-3xl flex flex-col transition-transform duration-500 transform ease-out">
        
        {/* Header */}
        <div className="p-8 flex items-center justify-between border-b border-border bg-ink text-white">
           <div className="flex flex-col">
              <span className="font-fraunces text-2xl font-medium tracking-tight text-saffron">{brandName}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-60 mt-1">Yerelin Dijital Pazarı</span>
           </div>
           <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">
             <X className="h-5 w-5" />
           </button>
        </div>

        {/* Content */}
        <nav className="flex-1 overflow-y-auto p-8">
           <div className="space-y-1">
             <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-6">Navigasyon</div>
             {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between group py-3.5 border-b border-border/50 text-walnut hover:text-ink transition-all"
                >
                  <div className="flex items-center gap-4">
                     <span className="h-1.5 w-1.5 rounded-full bg-saffron opacity-0 group-hover:opacity-100 transition-all" />
                     <span className="font-fraunces text-xl font-medium">{link.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-saffron" />
                </Link>
             ))}
           </div>

           {/* Actions Area */}
           <div className="mt-12">
             <Link 
               href={ROUTES.POST_LISTING} 
               onClick={onClose}
               className="btn-editorial w-full py-5 justify-center"
             >
                <span><Plus className="h-4 w-4" /> Ücretsiz İlan Ver</span>
             </Link>
           </div>

           {/* Auth Section */}
           <div className="mt-12 pt-8 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-6">Hesabım</div>
                  <div className="grid grid-cols-2 gap-3">
                    {authLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex flex-col gap-3 p-4 rounded-2xl bg-white/50 border border-border hover:bg-white hover:shadow-lg transition-all"
                      >
                         <link.icon className="h-5 w-5 text-saffron-2" />
                         <span className="text-xs font-bold text-walnut">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-3 mt-6 py-4 text-sm font-bold text-red-600 border border-red-100 rounded-2xl hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href={ROUTES.LOGIN} onClick={onClose} className="btn-editorial w-full py-5 justify-center">
                    <span>Giriş Yap</span>
                  </Link>
                  <Link href={ROUTES.REGISTER} onClick={onClose} className="flex items-center justify-center py-5 text-sm font-bold text-walnut hover:text-ink">
                    Hesap Oluştur <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              )}
           </div>
        </nav>

        {/* Footer Info */}
        <div className="p-8 mt-auto border-t border-border bg-white/30 text-[10px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-widest text-center">
           Kaman İlan © 2026 · Yerelin Gücü
        </div>
      </div>
    </>
  );
}
