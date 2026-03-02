"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface CustomPageClientProps {
  title: string;
  htmlContent: string | null;
  imageUrl?: string | null;
  breadcrumbs: Breadcrumb[];
}

export function CustomPageClient({ title, htmlContent, imageUrl, breadcrumbs }: CustomPageClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Hero image */}
        {imageUrl && (
          <div className="relative mb-8 h-[240px] w-full overflow-hidden rounded-2xl md:h-[320px]">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <h1 className="absolute bottom-6 left-6 text-3xl font-bold text-white drop-shadow md:text-4xl">
              {title}
            </h1>
          </div>
        )}

        {/* Inline title when no image */}
        {!imageUrl && (
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        )}

        {/* HTML content from DB */}
        {htmlContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            <p>Bu sayfa henüz hazırlanıyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
