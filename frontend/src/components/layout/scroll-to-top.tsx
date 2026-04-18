"use client";

import { useState, useEffect } from "react";
import { ChevronsUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 left-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-saffron shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 border border-saffron/20 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <ChevronsUp className="h-6 w-6" />
    </button>
  );
}
