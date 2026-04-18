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
    <div className="section-header">
      <div className="flex flex-col gap-2">
        <div className="eyebrow">Seçki</div>
        <h2 className="section-title">
           {title.split(' ').map((word, i) => (
             <span key={i}>
                {["Fırsat", "Seçkileri", "İlanlar"].includes(word) ? <em>{word}</em> : word}{" "}
             </span>
           ))}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[15px] text-[hsl(var(--muted-foreground))] max-w-[500px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="ghost-link">
          {t("common.view_all")}
          <ChevronRight className="h-4 w-4 arrow" />
        </Link>
      )}
    </div>
  );
}
