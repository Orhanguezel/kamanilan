"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { useFlashSalesQuery } from "@/modules/flash-sale/flash-sale.service";
import type { FlashSale } from "@/modules/flash-sale/flash-sale.types";
import type { SectionConfig } from "@/modules/theme/theme.type";

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

function CampaignCard({ sale }: { sale: FlashSale }) {
  const { h, m, s } = useCountdown(sale.end_at);

  const bg = sale.background_color ?? "hsl(var(--col-ivory))";
  const titleColor = "hsl(var(--col-ink))";
  const descColor = "hsl(var(--col-walnut))";

  const rawVal = parseFloat(sale.discount_value);
  const discountLabel = sale.discount_type === "percent" ? `%${rawVal}` : `${rawVal}₺`;

  const units = [
    { val: h, label: "SAAT" },
    { val: m, label: "DAKİKA" },
    { val: s, label: "SANİYE" },
  ];

  return (
    <div
      className="group relative h-full flex flex-col lg:flex-row shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-black/5"
      style={{ backgroundColor: bg }}
    >
      {/* Top indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-ember to-saffron z-20" />

      {/* Image / Stats Side */}
      <div className="relative w-full lg:w-2/5 aspect-video lg:aspect-auto overflow-hidden bg-ink/5 shrink-0">
        {sale.cover_image_url ? (
          <Image
            src={sale.cover_image_url}
            alt={sale.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-5">
            <Zap className="h-16 w-16 text-ink" />
          </div>
        )}
        
        {/* Discount Badge */}
        <div className="absolute top-4 left-4 z-30">
           <div className="bg-saffron text-ink font-fraunces font-bold px-4 py-2 shadow-2xl flex flex-col items-center justify-center border-b border-ink/10">
              <span className="text-lg leading-none">{discountLabel}</span>
              <span className="text-[7px] uppercase font-mono tracking-widest mt-0.5 opacity-60">İNDİRİM</span>
           </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 flex flex-col justify-between p-6 lg:p-8 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-saffron-2 font-black">HAFTALIK FIRSAT</span>
            <div className="h-px flex-1 bg-saffron/20" />
          </div>

          <h3 className="font-fraunces text-xl lg:text-2xl font-medium tracking-tight leading-tight" style={{ color: titleColor }}>
            {sale.title}
          </h3>
          
          {sale.description && (
            <p className="text-xs leading-relaxed opacity-60 font-manrope line-clamp-2" style={{ color: descColor }}>
              {sale.description}
            </p>
          )}

          {/* Countdown */}
          <div className="flex gap-2">
            {units.map((unit) => (
              <div key={unit.label} className="bg-white/40 border border-black/5 p-2 px-3 flex flex-col items-center min-w-[54px]">
                 <span className="font-fraunces text-base font-bold tabular-nums" style={{ color: titleColor }}>{unit.val}</span>
                 <span className="text-[6px] font-mono font-bold text-walnut opacity-40 uppercase">{unit.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={sale.button_url || ROUTES.CAMPAIGNS}
          className="btn-editorial bg-ink text-white w-full py-3.5 text-[9px] justify-center"
        >
          <span>
            {sale.button_text ?? "Hemen İncele"}
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}

interface Props {
  config?: SectionConfig;
}

export function FlashSaleSection({ config }: Props) {
  const instance = ((config as any)?.instance as number | undefined) ?? 1;
  const { data: allSales = [], isPending } = useFlashSalesQuery();
  const sale = allSales[instance - 1] ?? null;

  if (isPending) {
    return (
      <div className="h-full min-h-[400px] w-full animate-pulse bg-muted/10 border border-black/5" />
    );
  }

  if (!sale) return null;

  // Layout block mode (container/padding is handled by parent grid in HomeSections)
  return <CampaignCard sale={sale} />;
}
