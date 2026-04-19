"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { usePopupsQuery } from "@/modules/popup/popup.service";
import type { PopupItem } from "@/modules/popup/popup.type";

const STORAGE_PREFIX = "popup_closed_";

function shouldShow(popup: PopupItem): boolean {
  if (typeof window === "undefined") return true;
  const key = `${STORAGE_PREFIX}${popup.id}`;
  const freq = popup.display_frequency;
  if (freq === "always") return true;
  const stored = localStorage.getItem(key);
  if (!stored) return true;
  if (freq === "once") return false;
  if (freq === "daily") {
    const closedAt = new Date(stored).getTime();
    return Date.now() - closedAt > 24 * 60 * 60 * 1000;
  }
  return true;
}

function markClosed(popup: PopupItem) {
  if (typeof window === "undefined" || popup.display_frequency === "always") return;
  localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, new Date().toISOString());
}

function TopbarBand({ popup }: { popup: PopupItem }) {
  // Render immediately for delay_seconds=0 so SSR HTML already includes the band
  // (no layout shift when client hydrates). Only defer when there's a real delay.
  const [visible, setVisible] = useState(() => popup.delay_seconds === 0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldShow(popup)) {
      setHidden(true);
      return;
    }
    if (popup.delay_seconds > 0) {
      const t = setTimeout(() => setVisible(true), popup.delay_seconds * 1000);
      return () => clearTimeout(t);
    }
  }, [popup.id, popup.delay_seconds, popup]);

  if (hidden || !visible) return null;

  // Sync with Editorial Ink/Saffron Theme
  const isGreen = /#(10b981|059669|16a34a|15803d|166534|065f46|064e3b)|green|emerald|teal/i.test(popup.background_color || "");
  const bg = isGreen ? "hsl(var(--col-ink))" : (popup.background_color || "hsl(var(--col-ink))");
  const fg = isGreen ? "white" : (popup.text_color || "hsl(var(--col-parchment))");
  const btnBg = popup.button_color || "hsl(var(--col-saffron))";
  const btnFg = popup.button_text_color || "hsl(var(--col-ink))";

  const isMarquee = popup.text_behavior === "marquee";
  const speed = popup.scroll_speed || 60;
  const duration = Math.max(10, Math.round(((popup.content || popup.title).length * 10) / speed));

  const handleClose = () => {
    setVisible(false);
    markClosed(popup);
  };

  const textEl = (
    <span className="whitespace-nowrap text-[11px] font-mono uppercase tracking-[0.1em] font-medium" style={{ color: fg }}>
      <span className="inline-block h-1 w-1 rounded-full bg-saffron mr-3 mb-0.5" />
      {popup.content || popup.title}
    </span>
  );

  return (
    <div
      className="relative flex items-center overflow-hidden border-b border-white/5"
      style={{ backgroundColor: bg, minHeight: 40 }}
    >
      <div className="flex flex-1 items-center overflow-hidden py-2.5">
        {isMarquee ? (
          <div className="flex w-full overflow-hidden">
            <div
              className="flex shrink-0 gap-16"
              style={{ animation: `topbar-marquee ${duration}s linear infinite` }}
            >
              {textEl}
              {textEl}
              {textEl}
              {textEl}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-6">
            {textEl}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pr-4 shrink-0">
        {popup.button_text && popup.link_url && (
           <Link
             href={popup.link_url}
             target={popup.link_target ?? "_self"}
             className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg"
             style={{ backgroundColor: btnBg, color: btnFg }}
           >
             {popup.button_text}
             <ArrowRight className="h-3 w-3" />
           </Link>
        )}

        {popup.closeable && (
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center transition-opacity hover:bg-white/10 rounded-full"
            style={{ color: fg }}
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes topbar-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
}

export function TopbarPopup() {
  const { data: popups = [], isPending } = usePopupsQuery("topbar");
  if (isPending || popups.length === 0) return null;

  return (
    <div className="z-[70]">
      {popups.map((popup) => (
        <TopbarBand key={popup.id} popup={popup} />
      ))}
    </div>
  );
}
