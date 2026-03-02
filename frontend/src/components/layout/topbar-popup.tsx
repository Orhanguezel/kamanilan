"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePopupsQuery } from "@/modules/popup/popup.service";
import type { PopupItem } from "@/modules/popup/popup.type";

/* ─── Gösterim frekansı yardımcıları ─────────────────────────────────── */

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

/* ─── Tek topbar bandı ────────────────────────────────────────────────── */

function TopbarBand({ popup }: { popup: PopupItem }) {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  // FIX: setState her zaman setTimeout callback'i içinde çağrılıyor (asenkron),
  // böylece effect body'sinde senkron setState uyarısı önleniyor.
  useEffect(() => {
    if (!shouldShow(popup)) return;
    const ms = popup.delay_seconds > 0 ? popup.delay_seconds * 1000 : 0;
    const t = setTimeout(() => setVisible(true), ms);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup.id, popup.delay_seconds]);

  if (!visible) return null;

  // Yeni tema tokenları: varsayılanlar artık koyu yeşil değil
  const bg      = popup.background_color   || "hsl(var(--muted))";
  const fg      = popup.text_color         || "hsl(var(--foreground))";
  const btnBg   = popup.button_color       || "hsl(var(--accent))";
  const btnHovr = popup.button_hover_color || btnBg;
  const btnFg   = popup.button_text_color  || "#FFFFFF";

  const isMarquee = popup.text_behavior === "marquee";
  const speed = popup.scroll_speed || 60;
  const duration = Math.max(10, Math.round(((popup.content || popup.title).length * 8) / speed));

  const handleClose = () => {
    setVisible(false);
    markClosed(popup);
  };

  const textEl = (
    <span className="whitespace-nowrap text-sm font-medium" style={{ color: fg }}>
      {popup.content || popup.title}
    </span>
  );

  return (
    <div
      className="relative flex items-center overflow-hidden"
      style={{ backgroundColor: bg, minHeight: 36, borderBottom: "1px solid hsl(var(--border))" }}
    >
      {/* Kayan yazı veya statik */}
      <div className="flex flex-1 items-center overflow-hidden px-4 py-1.5">
        {isMarquee ? (
          <div className="flex w-full overflow-hidden">
            <div
              className="flex shrink-0 gap-16"
              style={{ animation: `topbar-marquee ${duration}s linear infinite` }}
            >
              {textEl}
              {textEl}
              {textEl}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-3">
            <span className="text-sm font-medium text-center" style={{ color: fg }}>
              {popup.content || popup.title}
            </span>
          </div>
        )}
      </div>

      {/* Buton */}
      {popup.button_text && popup.link_url && (
        <div className="shrink-0 pr-2">
          <Link
            href={popup.link_url}
            target={popup.link_target ?? "_self"}
            rel={popup.link_target === "_blank" ? "noopener noreferrer" : undefined}
            className="inline-flex items-center rounded-full px-4 py-1 text-xs font-bold transition-all active:scale-95"
            style={{ backgroundColor: btnHover ? btnHovr : btnBg, color: btnFg }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {popup.button_text}
          </Link>
        </div>
      )}

      {/* Kapat */}
      {popup.closeable && (
        <button
          onClick={handleClose}
          className="shrink-0 flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60 mr-1"
          style={{ color: fg }}
          aria-label="Kapat"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Marquee fade overlay */}
      {isMarquee && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
            style={{ background: `linear-gradient(to right, ${bg}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
            style={{ background: `linear-gradient(to left, ${bg}, transparent)` }}
          />
        </>
      )}

      <style>{`
        @keyframes topbar-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Dışa açık bileşen ───────────────────────────────────────────────── */

export function TopbarPopup() {
  const { data: popups = [], isPending } = usePopupsQuery("topbar");

  if (isPending || popups.length === 0) return null;

  return (
    <div>
      {popups.map((popup) => (
        <TopbarBand key={popup.id} popup={popup} />
      ))}
    </div>
  );
}
