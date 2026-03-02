"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { usePopupsQuery } from "@/modules/popup/popup.service";
import type { PopupItem } from "@/modules/popup/popup.type";

/* ─── Gösterim yardımcıları ──────────────────────────────────────────── */

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

/* ─── Konum sınıfları ─────────────────────────────────────────────────── */

const POSITION_CLASSES: Record<string, string> = {
  sidebar_top:    "top-24 right-4",
  sidebar_center: "top-1/2 right-4 -translate-y-1/2",
  sidebar_bottom: "bottom-6 right-4",
};

/* ─── Tek sidebar popup kartı ────────────────────────────────────────── */

function SidebarCard({ popup }: { popup: PopupItem }) {
  const [visible, setVisible]   = useState(false);
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
  const btnHovr = popup.button_hover_color  || btnBg;
  const btnFg   = popup.button_text_color   || "#FFFFFF";

  const posClass = POSITION_CLASSES[popup.type] ?? POSITION_CLASSES.sidebar_bottom;

  const handleClose = () => {
    setVisible(false);
    markClosed(popup);
  };

  return (
    <div
      className={`fixed ${posClass} z-40 w-64 overflow-hidden rounded-2xl shadow-2xl`}
      style={{
        backgroundColor: bg,
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* Sol aksan şeridi (amber) */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: "hsl(var(--accent))" }}
      />

      {/* Kapat butonu */}
      {popup.closeable && (
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ backgroundColor: "hsl(var(--border))", color: fg }}
          aria-label="Kapat"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Görsel */}
      {popup.image && (
        <div className="h-32 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={popup.image}
            alt={popup.alt ?? popup.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* İçerik */}
      <div className="pl-5 pr-4 py-4">
        <h4
          className="font-playfair mb-1.5 font-bold leading-tight text-base"
          style={{ color: fg }}
        >
          {popup.title}
        </h4>

        {popup.content && (
          <p
            className="mb-3 text-xs leading-relaxed line-clamp-3 opacity-80"
            style={{ color: fg }}
          >
            {popup.content}
          </p>
        )}

        {popup.button_text && popup.link_url && (
          <Link
            href={popup.link_url}
            target={popup.link_target ?? "_self"}
            rel={popup.link_target === "_blank" ? "noopener noreferrer" : undefined}
            className="group/btn inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: btnHover ? btnHovr : btnBg, color: btnFg }}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {popup.button_text}
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Dışa açık bileşen ───────────────────────────────────────────────── */

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
