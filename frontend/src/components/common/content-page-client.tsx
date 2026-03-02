"use client";

import Link from 'next/link';
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ContentPageClientProps {
  title: string;
  content: string | any[] | null;
  breadcrumbs: Breadcrumb[];
}

export function ContentPageClient({
  title,
  content,
  breadcrumbs,
}: ContentPageClientProps) {
  const htmlContent = typeof content === "string" ? content : null;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>

      {htmlContent ? (
        <div
          className="prose prose-sm max-w-none dark:prose-invert sm:prose-base"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>Bu sayfa henüz hazırlanıyor.</p>
        </div>
      )}
    </div>
  );
}
