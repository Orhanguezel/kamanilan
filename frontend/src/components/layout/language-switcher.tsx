"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const LOCALES = [
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
] as const;

interface Props {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: string) => {
    Cookies.set("lang", locale, { expires: 365, path: "/" });
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending}
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
            currentLocale === code
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
