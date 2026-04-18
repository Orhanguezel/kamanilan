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
  const btnBg = "hsl(var(--col-ink))";
  const btnText = "hsl(var(--col-paper))";

  const rawVal = parseFloat(sale.discount_value);
  const discountLabel = sale.discount_type === "percent" ? `%${rawVal}` : `${rawVal}₺`;

  const units = [
    { val: h, label: "SAAT" },
    { val: m, label: "DAKİKA" },
    { val: s, label: "SANİYE" },
  ];

  return (
    <div
      className="group relative overflow-hidden rounded-[32px] border border-black/5 shadow-2xl transition-all duration-700 hover:shadow-3xl h-full flex flex-col md:flex-row"
      style={{ backgroundColor: bg }}
    >
      {/* Decorative Ribbon */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-ember to-saffron" />

      {/* Image Side */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
        {sale.cover_image_url ? (
          <Image
            src={sale.cover_image_url}
            alt={sale.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-walnut flex items-center justify-center opacity-10">
            <Zap className="h-24 w-24 text-white" />
          </div>
        )}
        
        {/* Discount Badge */}
        <div className="absolute top-8 left-8">
           <div className="bg-saffron text-ink font-fraunces font-bold px-6 py-4 rounded-full shadow-2xl flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-2xl leading-none">{discountLabel}</span>
              <span className="text-[10px] uppercase font-mono tracking-widest mt-1">İNDİRİM</span>
           </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saffron-2">Fırsat Köşesi</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <h2 className="font-fraunces text-3xl lg:text-4xl font-medium tracking-tight mb-4 leading-tight" style={{ color: titleColor }}>
            {sale.title}
          </h2>
          {sale.description && (
            <p className="text-sm leading-relaxed opacity-80 mb-8 font-manrope" style={{ color: descColor }}>
              {sale.description}
            </p>
          )}

          {/* Countdown */}
          <div className="flex gap-4 mb-10">
            {units.map((unit, i) => (
              <div key={unit.label} className="flex-1">
                <div className="bg-white/50 backdrop-blur-sm border border-black/5 rounded-2xl p-4 flex flex-col items-center">
                   <span className="font-fraunces text-2xl font-bold tabular-nums" style={{ color: titleColor }}>{unit.val}</span>
                   <span className="text-[8px] font-mono font-bold mt-1 opacity-40">{unit.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={sale.button_url || ROUTES.CAMPAIGNS}
          className="btn-editorial w-full sm:w-auto self-start"
        >
          <span>
            {sale.button_text ?? "Hemen Keşfet"}
            <ArrowRight className="h-4 w-4" />
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
      <section className="py-12">
        <div className="container px-4">
           <div className="h-[400px] w-full animate-pulse rounded-[40px] bg-muted/20" />
        </div>
      </section>
    );
  }

  if (!sale) return null;

  return (
    <section className="py-12 bg-white/30">
      <div className="container px-4">
        <CampaignCard sale={sale} />
      </div>
    </section>
  );
}
