"use client";

import Link from "next/link";
import { t } from "@/lib/t";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2
          className="font-playfair text-2xl font-bold flex items-center gap-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <span
            className="flex-shrink-0 rounded-full"
            style={{ width: 4, height: "1.3em", background: "hsl(var(--accent))" }}
          />
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 pl-3 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: "hsl(var(--accent))" }}
        >
          {t("common.view_all")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
