"use client";

import { useEffect } from "react";

interface DeferredGoogleTagProps {
  loaderId: string;
  configIds: string[];
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function DeferredGoogleTag({ loaderId, configIds }: DeferredGoogleTagProps) {
  useEffect(() => {
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      window.dataLayer = window.dataLayer ?? [];
      const gtag = (...args: unknown[]) => window.dataLayer?.push(args);
      gtag("js", new Date());
      for (const id of configIds) gtag("config", id);

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`;
      document.head.appendChild(script);
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown"];
    for (const event of events) window.addEventListener(event, start, { once: true, passive: true });
    const timer = window.setTimeout(start, 30_000);

    return () => {
      window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, start);
    };
  }, [configIds, loaderId]);

  return null;
}
