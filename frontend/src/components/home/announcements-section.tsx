"use client";

import Link from "next/link";
import { Megaphone, ChevronRight, Calendar, Rss, ArrowRight } from "lucide-react";
import { useAnnouncementsQuery } from "@/modules/announcement/announcement.service";
import {
  CATEGORY_LABELS,
  type AnnouncementCategory,
} from "@/modules/announcement/announcement.type";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";
import { t } from "@/lib/t";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function AnnouncementsSection({ config }: Props) {
  const limit = config?.limit ?? 5;
  const { data, isPending } = useAnnouncementsQuery({ limit, page: 1 });
  const items = data?.items ?? [];
  const rssUrl = `${getApiBaseUrl()}${API_ENDPOINTS.ANNOUNCEMENTS_RSS}`;

  return (
    <section className="py-12 md:py-16 bg-paper overflow-hidden">
      <div className="container px-4">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Title & RSS */}
          <div className="lg:w-1/3">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-ink flex items-center justify-center text-saffron">
                  <Megaphone className="h-5 w-5" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-saffron-2">Resmi Duyurular</span>
             </div>

             <h2 className="font-fraunces text-4xl font-medium tracking-tight mb-6 leading-[1.1] text-ink">
               {config?.label || "Bölgeden Önemli Gelişmeler"}
             </h2>

             <p className="text-sm text-walnut opacity-70 mb-8 max-w-sm leading-relaxed">
               Kaman ve çevresine dair güncel duyurular, resmi bilgilendirmeler ve topluluk haberleri.
             </p>

             <a
               href={rssUrl}
               target="_blank"
               className="inline-flex items-center gap-2 text-[10px] font-mono group opacity-50 hover:opacity-100 transition-all"
             >
               <Rss className="h-3 w-3 text-saffron" />
               RSS İLE ABONE OL
               <ArrowRight className="h-3 w-3 -rotate-45 transition-transform group-hover:translate-x-1" />
             </a>
          </div>

          {/* Right Column: List */}
          <div className="lg:w-2/3 flex flex-col gap-10">
            {isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse">
                  <div className="h-4 w-24 bg-muted/40 rounded" />
                  <div className="h-6 w-full bg-muted/40 rounded" />
                  <div className="h-3 w-32 bg-muted/40 rounded" />
                </div>
              ))
            ) : items.length === 0 ? (
              <p className="text-sm opacity-50 italic">Yayında olan bir duyuru bulunmuyor.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={ROUTES.ANNOUNCEMENT_DETAIL(item.slug)}
                  className="group block border-b border-black/5 pb-8 transition-all hover:translate-x-2"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-saffron-2">
                      {CATEGORY_LABELS[item.category as AnnouncementCategory] ?? item.category}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-black/10" />
                    <span className="flex items-center gap-1.5 text-[10px] font-mono opacity-40">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                  </div>

                  <h3 className="font-fraunces text-2xl font-medium text-ink group-hover:text-saffron-2 transition-colors leading-tight">
                    {item.title}
                  </h3>
                </Link>
              ))
            )}

            <Link
              href={ROUTES.ANNOUNCEMENTS}
              className="ghost-link self-start mt-4"
            >
              TÜM DUYURULARI İNCELE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
