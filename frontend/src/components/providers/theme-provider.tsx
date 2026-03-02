"use client";

import { useEffect } from "react";
import { useThemeQuery } from "@/modules/theme/theme.service";

/** hex → "H S% L%" (shadcn CSS variable formatı) */
function hexToHSL(hex: string): string | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Açıklık (lightness) değerine göre ön plan rengi seç */
function fgForHSL(hsl: string): string {
  const l = parseInt(hsl.split("%")[1] ?? "50");
  return l > 65 ? "222.2 47.4% 11.2%" : "210 40% 98%";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme } = useThemeQuery();

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;

    // --- Renk token'ları → CSS değişkenleri ---
    if (theme.colors) {
      const c = theme.colors;

      const primary = c.primary && hexToHSL(c.primary);
      if (primary) {
        root.style.setProperty("--primary", primary);
        root.style.setProperty("--ring",    primary);
        root.style.setProperty("--primary-foreground", fgForHSL(primary));
      }

      const secondary = c.secondary && hexToHSL(c.secondary);
      if (secondary) root.style.setProperty("--secondary", secondary);

      const accent = c.accent && hexToHSL(c.accent);
      if (accent) root.style.setProperty("--accent", accent);

      const background = c.background && hexToHSL(c.background);
      if (background) root.style.setProperty("--background", background);

      const foreground = c.foreground && hexToHSL(c.foreground);
      if (foreground) root.style.setProperty("--foreground", foreground);

      const muted = c.muted && hexToHSL(c.muted);
      if (muted) root.style.setProperty("--muted", muted);

      const mutedFg = c.mutedFg && hexToHSL(c.mutedFg);
      if (mutedFg) root.style.setProperty("--muted-foreground", mutedFg);

      const border = c.border && hexToHSL(c.border);
      if (border) root.style.setProperty("--border", border);

      const destructive = c.destructive && hexToHSL(c.destructive);
      if (destructive) root.style.setProperty("--destructive", destructive);

      const navBg = c.navBg && hexToHSL(c.navBg);
      if (navBg) {
        root.style.setProperty("--nav-bg", navBg);
        const navFgHsl = c.navFg ? hexToHSL(c.navFg) : null;
        root.style.setProperty("--nav-fg", navFgHsl ?? "42 100% 99%");
      }

      const footerBg = c.footerBg && hexToHSL(c.footerBg);
      if (footerBg) {
        root.style.setProperty("--footer-bg", footerBg);
        const footerFgHsl = c.footerFg ? hexToHSL(c.footerFg) : null;
        root.style.setProperty("--footer-fg", footerFgHsl ?? "42 60% 90%");
      }
    }

    // --- Border radius ---
    if (theme.radius) {
      root.style.setProperty("--radius", theme.radius);
    }

    // --- Font ailesi ---
    if (theme.fontFamily) {
      root.style.setProperty("--font-family", theme.fontFamily);
      root.style.fontFamily = `var(--font-family), system-ui, sans-serif`;
    }

    // --- Dark mode ---
    if (theme.darkMode === "dark") {
      root.classList.add("dark");
    } else if (theme.darkMode === "light") {
      root.classList.remove("dark");
    }
    // "system" → OS tercihine bırak
  }, [theme]);

  return <>{children}</>;
}
