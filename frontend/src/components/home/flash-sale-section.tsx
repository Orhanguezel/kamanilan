"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useFlashSalesQuery } from "@/modules/flash-sale/flash-sale.service";
import type { FlashSale } from "@/modules/flash-sale/flash-sale.types";
import type { SectionConfig } from "@/modules/theme/theme.type";

/* ── Geri sayım ── */
function useCountdown(endAt?: string | null) {
  const [time, setTime] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    if (!endAt) return;
    const endMs = new Date(endAt).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTime({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return time;
}

/* ── Tek kampanya kartı ── */
function CampaignCard({ sale }: { sale: FlashSale }) {
  const { h, m, s } = useCountdown(sale.end_at);

  const bg         = sale.background_color  ?? "#FFF7ED";
  const titleColor = sale.title_color       ?? "hsl(var(--foreground))";
  const descColor  = sale.description_color ?? "hsl(var(--muted-foreground))";
  const btnBg      = sale.button_bg_color   ?? "hsl(var(--accent))";
  const btnText    = sale.button_text_color ?? "#FFFFFF";
  const timerBg    = sale.timer_bg_color    ?? "rgba(0,0,0,0.10)";
  const timerText  = sale.timer_text_color  ?? titleColor;

  const rawVal = parseFloat(sale.discount_value);
  const discountLabel =
    sale.discount_type === "percent" ? `%${rawVal}` : `${rawVal}₺`;

  const units = [
    { val: h, label: "Saat" },
    { val: m, label: "Dak" },
    { val: s, label: "Sn" },
  ];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg h-full"
      style={{ backgroundColor: bg, minHeight: "220px" }}
    >
      {/* Kapak görsel overlay */}
      {sale.cover_image_url && (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={sale.cover_image_url}
            alt={sale.title}
            fill
            className="object-cover opacity-[0.12] transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}

      {/* Derinlik gradyanı */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />

      {/* İndirim rozeti — sağ üst, pulsing */}
      <div className="absolute right-4 top-4 animate-pulse">
        <div
          className="flex flex-col items-center rounded-2xl px-4 py-2.5 text-center shadow-[0_8px_24px_rgba(220,38,38,0.30)] ring-2 ring-white/80"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #fff7b1 0%, #f59e0b 38%, #dc2626 100%)",
          }}
        >
          <span className="text-xl font-black leading-none text-white drop-shadow">
            {discountLabel}
          </span>
          <span className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.15em] text-white/90">
            indirim
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="relative flex h-full flex-col justify-between p-5 pr-24">
        {/* Üst: başlık + açıklama */}
        <div>
          <h2
            className="font-playfair mb-1.5 text-lg font-bold leading-tight"
            style={{ color: titleColor }}
          >
            {sale.title}
          </h2>
          {sale.description && (
            <p
              className="mb-3 line-clamp-2 text-xs leading-relaxed opacity-80"
              style={{ color: descColor }}
            >
              {sale.description}
            </p>
          )}
        </div>

        {/* Alt: geri sayım + buton */}
        <div>
          {/* Geri sayım */}
          <div className="mb-3 flex items-center gap-1">
            {units.map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-1">
                {i > 0 && (
                  <span
                    className="pb-2 text-base font-black select-none"
                    style={{ color: timerText }}
                  >
                    :
                  </span>
                )}
                <div
                  className="flex min-w-[42px] flex-col items-center rounded-lg px-2 py-1.5 text-center"
                  style={{ background: timerBg }}
                >
                  <span
                    className="font-playfair text-lg font-black leading-none tabular-nums"
                    style={{ color: timerText }}
                  >
                    {unit.val}
                  </span>
                  <span
                    className="mt-0.5 text-[0.45rem] uppercase tracking-widest opacity-60"
                    style={{ color: timerText }}
                  >
                    {unit.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA butonu */}
          <Link
            href={sale.button_url ?? ROUTES.CAMPAIGNS}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: btnBg, color: btnText }}
          >
            <Zap className="h-3.5 w-3.5" />
            {sale.button_text ?? "Kampanyaya Git"}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Bölüm ── */
interface Props {
  config?: SectionConfig;
}

export function FlashSaleSection({ config }: Props) {
  // Her flash_sale bloğu bir kampanyayı temsil eder.
  // instance=1 → aktif kampanyaların 1. sırası, instance=2 → 2. sırası (display_order'a göre)
  const instance = ((config as any)?.instance as number | undefined) ?? 1;

  const { data: allSales = [], isPending } = useFlashSalesQuery();
  // display_order sıralamasına göre Nth kampanyayı seç (0-indexed)
  const sale = allSales[instance - 1] ?? null;
  const sales: typeof allSales = sale ? [sale] : [];

  if (isPending) {
    return (
      <section className="py-4 h-full">
        <div className="px-2 md:px-3 h-full flex flex-col gap-3">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex-1 min-h-[220px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </section>
    );
  }

  if (!sales.length) return null;

  const label = config?.label || t("home.flash_deals_title");

  return (
    <section className="py-4 h-full">
      <div className="px-2 md:px-3 flex flex-col gap-3 h-full">
        {/* Başlık */}
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "hsl(var(--accent))" }}
          >
            <Zap className="h-4 w-4 fill-white text-white" />
          </span>
          <h2 className="text-base font-bold tracking-tight md:text-lg">
            {label}
          </h2>
        </div>

        {/* Tek kampanya kartı — grid cell'i tam doldurur */}
        <div className="flex-1">
          <CampaignCard sale={sales[0]} />
        </div>
      </div>
    </section>
  );
}
