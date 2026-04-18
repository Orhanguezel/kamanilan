"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Zap } from "lucide-react";
import { usePopupsQuery } from "@/modules/popup/popup.service";
import { t } from "@/lib/t";
import type { PopupItem } from "@/modules/popup/popup.type";

const STORAGE_PREFIX = "sidebar_popup_closed_";

function shouldShow(popup: PopupItem): boolean {
  if (typeof window === "undefined") return true;
  const key = `${STORAGE_PREFIX}${popup.id}`;
  const stored = localStorage.getItem(key);
  if (!stored) return true;
  if (popup.display_frequency === "once")  return false;
  if (popup.display_frequency === "daily") {
    return Date.now() - new Date(stored).getTime() > 24 * 60 * 60 * 1000;
  }
  return true;
}

function markClosed(popup: PopupItem) {
  if (typeof window === "undefined" || popup.display_frequency === "always") return;
  localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, new Date().toISOString());
}

const POSITION_CLASSES: Record<string, string> = {
  sidebar_top:    "top-32 right-8",
  sidebar_center: "top-1/2 right-8 -translate-y-1/2",
  sidebar_bottom: "bottom-8 right-8",
};

function SidebarCard({ popup }: { popup: PopupItem }) {
  const [visible, setVisible]   = useState(false);
  
  useEffect(() => {
    if (!shouldShow(popup)) return;
    const ms = popup.delay_seconds > 0 ? popup.delay_seconds * 1000 : 0;
    const t = setTimeout(() => setVisible(true), ms);
    return () => clearTimeout(t);
  }, [popup.id, popup.delay_seconds, popup]);

  if (!visible) return null;

  // Premium Luxury Defaults (Ink & Saffron)
  // Force Ink theme if database still has old green shades
  const isGreen = /#(10b981|059669|16a34a|15803d|166534|065f46|064e3b)|green|emerald|teal/i.test(popup.background_color || "");
  const bg = isGreen ? "hsl(var(--col-ink))" : (popup.background_color || "hsl(var(--col-paper))");
  const fg = isGreen ? "white" : (popup.text_color || "hsl(var(--col-ink))");
  const btnBg = popup.button_color || "hsl(var(--col-saffron))";
  const btnFg = popup.button_text_color || "hsl(var(--col-ink))";

  const posClass = POSITION_CLASSES[popup.type] ?? POSITION_CLASSES.sidebar_bottom;

  const handleClose = () => {
    setVisible(false);
    markClosed(popup);
  };

  return (
    <div
      className={`fixed ${posClass} z-[60] w-[300px] overflow-hidden rounded-[24px] shadow-3xl border border-border transition-all duration-700 animate-in fade-in slide-in-from-right-10`}
      style={{ backgroundColor: bg }}
    >
      {/* Decorative Saffron corner */}
      <div className="absolute top-0 left-0 w-12 h-12 bg-saffron opacity-10 blur-2xl rounded-full" />
      
      {/* Close button */}
      {popup.closeable && (
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-current opacity-60 hover:opacity-100"
          aria-label="Kapat"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Image Handling */}
      {popup.image && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={popup.image}
            alt={popup.alt ?? popup.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-7">
        <div className="flex items-center gap-2 mb-4">
           <Zap className="h-3 w-3 text-saffron" />
           <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60" style={{ color: fg }}>Önemli Duyuru</span>
        </div>

        <h4 className="font-fraunces text-xl font-medium tracking-tight mb-3 leading-tight" style={{ color: fg }}>
          {popup.title}
        </h4>

        {popup.content && (
          <p className="mb-6 text-[13px] leading-relaxed opacity-80 line-clamp-4" style={{ color: fg }}>
            {popup.content}
          </p>
        )}

        {popup.button_text && popup.link_url && (
          <Link
            href={popup.link_url}
            target={popup.link_target ?? "_self"}
            className="group/btn inline-flex items-center justify-center w-full gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-black/5"
            style={{ backgroundColor: btnBg, color: btnFg }}
          >
            {popup.button_text}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function SidebarPopups() {
  const { data: topPopups    = [] } = usePopupsQuery("sidebar_top");
  const { data: centerPopups = [] } = usePopupsQuery("sidebar_center");
  const { data: bottomPopups = [] } = usePopupsQuery("sidebar_bottom");

  const all = [
    ...(topPopups[0]    ? [topPopups[0]]    : []),
    ...(centerPopups[0] ? [centerPopups[0]] : []),
    ...(bottomPopups[0] ? [bottomPopups[0]] : []),
  ];

  if (all.length === 0) return null;

  return (
    <>
      {all.map((popup) => (
        <SidebarCard key={popup.id} popup={popup} />
      ))}
    </>
  );
}
