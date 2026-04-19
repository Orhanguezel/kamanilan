"use client";

import { useThemeQuery } from "@/modules/theme/theme.service";
import type { SectionConfig, LayoutBlock } from "@/modules/theme/theme.type";
import { HeroSection } from "./hero-section";
import { CategoriesSection } from "./categories-section";
import { FeaturedListingsSection } from "./featured-listings-section";
import { RecentListingsSection } from "./recent-listings-section";
import { FlashSaleSection } from "./flash-sale-section";
import { BannerRowSection } from "./banner-row-section";
import { ListingsSection } from "./listings-section";
import { AnnouncementsSection } from "./announcements-section";
import { NewsFeedSection } from "./news-feed-section";
import { InfiniteListingsSection } from "./infinite-listings-section";
// Yeni e-commerce section bileşenleri
import { ProductFeaturedSection } from "./product-featured-section";
import { ProductTopSellingSection } from "./product-top-selling-section";
import { ProductLatestSection } from "./product-latest-section";
import { PopularProductSection } from "./popular-product-section";
import { NewsletterSection } from "./newsletter-section";
import { TopStoresSection } from "./top-stores-section";
import { SpotlightSection } from "./spotlight-section";

/* ─── section type → bileşen eşlemesi ─────────────────────────────────── */

const SECTION_MAP: Record<string, React.ComponentType<{ config?: SectionConfig }>> = {
  // Eski format (sections[]) — geriye dönük uyumluluk
  hero:               HeroSection,
  category:           CategoriesSection,  // layout_blocks tipi (tekil)
  categories:         CategoriesSection,  // eski format (çoğul — geriye dönük uyumluluk)
  flash_sale:         FlashSaleSection,
  featured:           FeaturedListingsSection,
  recent:             RecentListingsSection,
  announcements:      AnnouncementsSection,
  news_feed:          NewsFeedSection,
  infinite_listings:  InfiniteListingsSection,
  spotlight:          SpotlightSection,
  // Yeni e-commerce section tipleri (layout_blocks)
  product_featured:        ProductFeaturedSection,
  product_top_selling:     ProductTopSellingSection,
  product_latest:          ProductLatestSection,
  popular_product_section: PopularProductSection,
  newsletters_section:     NewsletterSection,
  top_stores_section:      TopStoresSection,
  // Tekrarlanabilir: banner_section ve flash_sale (tip eşlemesi)
  banner_section:          BannerRowSection,
};

/** Exact map lookup, ardından prefix fallback'ler (eski format için) */
function resolveComponent(
  key: string,
  blockType?: string,
): React.ComponentType<{ config?: SectionConfig }> | null {
  // layout_blocks modunda: blockType öncelikli
  const lookup = blockType ?? key;
  if (lookup in SECTION_MAP) return SECTION_MAP[lookup];
  if (key.startsWith("banner_row"))    return BannerRowSection;
  if (key.startsWith("banner_section")) return BannerRowSection;
  if (key.startsWith("listings_"))     return ListingsSection;
  if (key.startsWith("announcements_")) return AnnouncementsSection;
  return null;
}

/* ─── LayoutBlock → SectionConfig dönüştürücü ─────────────────────────── */

function layoutBlockToSection(block: LayoutBlock, index: number): SectionConfig {
  const span =
    (block.config?.banner_span     as number | undefined) ??
    (block.config?.flash_sale_span as number | undefined) ??
    (block.config?.section_span    as number | undefined) ??
    12;

  const colsLg      = (block.config?.cols_lg      as number | undefined) ?? 4;
  const limit       = (block.config?.limit        as number | undefined) ?? null;
  const stack_count = (block.config?.stack_count  as number | undefined) ?? 1;

  return {
    key:         block.id,               // "banner_section__1"
    enabled:     block.enabled_disabled === "on",
    order:       index,
    label:       "",                     // boş string → component'lerde || ile t() fallback tetiklenir
    colsLg,
    colsMd:      2,
    colsSm:      1,
    limit,
    span,
    variant:     block.type,             // component resolve için
    instance:    block.instance,         // banner/flash_sale instance = kampanya/banner ID
    stack_count,                         // banner_section: dikey yığın adedi
    _blockType:  block.type,             // gerçek tip bilgisi
  } as SectionConfig & { instance?: number; stack_count?: number; _blockType?: string };
}

/* ─── layout_blocks için otomatik satır gruplama ──────────────────────── */
/**
 * Span'lar toplamı 12'ye ulaşana kadar aynı satıra koyar.
 * 12'yi tam dolduran ya da solo (span=12) olan section'lar kendi satırını alır.
 * rowId yerine span akümülasyonu kullanır (quickecommerce mimarisi).
 */
function buildRowsFromBlocks(sections: SectionConfig[]): Array<SectionConfig[]> {
  const rows: Array<SectionConfig[]> = [];
  let currentRow: SectionConfig[] = [];
  let currentSpan = 0;

  for (const s of sections) {
    const span = s.span ?? 12;

    if (span >= 12) {
      // Tam genişlik: mevcut satırı flush et, sonra solo satır
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        currentSpan = 0;
      }
      rows.push([s]);
    } else if (currentSpan + span > 12) {
      // Satır taşıyor: mevcut satırı kaydet, yeni satır başlat
      rows.push(currentRow);
      currentRow = [s];
      currentSpan = span;
    } else {
      currentRow.push(s);
      currentSpan += span;
      if (currentSpan === 12) {
        // Tam doldu
        rows.push(currentRow);
        currentRow = [];
        currentSpan = 0;
      }
    }
  }

  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}

/* ─── Eski format: rowId gruplama ──────────────────────────────────────── */

type SoloUnit = { type: "solo"; section: SectionConfig };
type RowUnit  = { type: "row";  rowId: string; sections: SectionConfig[] };
type DisplayUnit = SoloUnit | RowUnit;

function buildDisplayUnits(sorted: SectionConfig[]): DisplayUnit[] {
  const units: DisplayUnit[] = [];
  const rowIndex = new Map<string, number>();

  for (const s of sorted) {
    if (!s.rowId) {
      units.push({ type: "solo", section: s });
    } else if (rowIndex.has(s.rowId)) {
      (units[rowIndex.get(s.rowId)!] as RowUnit).sections.push(s);
    } else {
      rowIndex.set(s.rowId, units.length);
      units.push({ type: "row", rowId: s.rowId, sections: [s] });
    }
  }

  for (const u of units) {
    if (u.type === "row") {
      u.sections.sort((a, b) => a.order - b.order);
    }
  }

  return units;
}

/* ─── Tailwind col-span sınıfları (JIT safe) ───────────────────────────── */
const COL_SPAN: Record<number, string> = {
  1:  "col-span-12 lg:col-span-1",
  2:  "col-span-12 lg:col-span-2",
  3:  "col-span-12 lg:col-span-3",
  4:  "col-span-12 lg:col-span-4",
  5:  "col-span-12 lg:col-span-5",
  6:  "col-span-12 lg:col-span-6",
  7:  "col-span-12 lg:col-span-7",
  8:  "col-span-12 lg:col-span-8",
  9:  "col-span-12 lg:col-span-9",
  10: "col-span-12 lg:col-span-10",
  11: "col-span-12 lg:col-span-11",
  12: "col-span-12 lg:col-span-12",
};

/* ─── Varsayılan sections[] (layout_blocks yoksa) ─────────────────────── */

const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: "hero",              enabled: true, order: 1, label: "Hero",            colsLg: 1, colsMd: 1, colsSm: 1, limit: null },
  { key: "categories",        enabled: true, order: 2, label: "Tüm Kategoriler", colsLg: 6, colsMd: 3, colsSm: 2, limit: null },
  { key: "banner_section__1", enabled: true, order: 3, label: "Reklam Banner 1", colsLg: 1, colsMd: 1, colsSm: 1, limit: null },
  { key: "spotlight",         enabled: true, order: 4, label: "Özel Vurgu",       colsLg: 1, colsMd: 1, colsSm: 1, limit: null },
  { key: "flash_sale",        enabled: true, order: 5, label: "Flash Fırsat",    colsLg: 5, colsMd: 3, colsSm: 2, limit: 5   },
  { key: "banner_section__2", enabled: true, order: 6, label: "Reklam Banner 2", colsLg: 1, colsMd: 1, colsSm: 1, limit: null },
  { key: "featured",          enabled: true, order: 7, label: "Öne Çıkan",       colsLg: 4, colsMd: 3, colsSm: 2, limit: 8   },
  { key: "recent",            enabled: true, order: 8, label: "Son İlanlar",     colsLg: 4, colsMd: 3, colsSm: 2, limit: 8   },
];

/* ─── Ana bileşen ──────────────────────────────────────────────────────── */

export function HomeSections() {
  const { data: theme } = useThemeQuery();

  /* ── layout_blocks modu (quickecommerce mimarisi) ─────────────────── */
  if (theme?.layout_blocks?.length) {
    const sections = theme.layout_blocks
      .map((block, idx) => layoutBlockToSection(block, idx))
      .filter((s) => s.enabled && resolveComponent(s.key, (s as any)._blockType) !== null);

    const rows = buildRowsFromBlocks(sections);

    return (
      <>
        {rows.map((row, rowIdx) => {
          if (row.length === 1 && (row[0].span ?? 12) >= 12) {
            // Solo (tam genişlik) section
            const s = row[0];
            const Component = resolveComponent(s.key, (s as any)._blockType);
            if (!Component) return null;
            return <Component key={s.key} config={s} />;
          }

          // Çok kolonlu satır
          return (
            <div key={`row-${rowIdx}`} className="container mx-auto">
              <div className="grid grid-cols-12">
                {row.map((s) => {
                  const Component = resolveComponent(s.key, (s as any)._blockType);
                  if (!Component) return null;
                  const spanClass = COL_SPAN[s.span ?? 12] ?? COL_SPAN[12];
                  return (
                    <div key={s.key} className={`${spanClass} min-w-0 flex flex-col`}>
                      <Component config={s} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  /* ── Eski sections[] modu (geriye dönük uyumluluk) ───────────────── */
  const sections = theme?.sections?.length ? theme.sections : DEFAULT_SECTIONS;

  const visible = [...sections]
    .filter((s) => s.enabled && resolveComponent(s.key) !== null)
    .sort((a, b) => a.order - b.order);

  const units = buildDisplayUnits(visible);

  return (
    <>
      {units.map((unit) => {
        if (unit.type === "solo") {
          const Component = resolveComponent(unit.section.key);
          if (!Component) return null;
          return <Component key={unit.section.key} config={unit.section} />;
        }

        return (
          <div key={unit.rowId} className="container mx-auto">
            <div className="grid grid-cols-12">
              {unit.sections.map((section) => {
                const Component = resolveComponent(section.key);
                if (!Component) return null;
                const spanClass = COL_SPAN[section.span ?? 12] ?? COL_SPAN[12];
                return (
                  <div key={section.key} className={`${spanClass} min-w-0 flex flex-col`}>
                    <Component config={section} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
