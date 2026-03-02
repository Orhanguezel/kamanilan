"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Tag, ChevronRight } from "lucide-react";
import { useFlashSalesQuery } from "@/modules/flash-sale/flash-sale.service";
import type { FlashSale } from "@/modules/flash-sale/flash-sale.types";
import { ROUTES } from "@/config/routes";

/* ── Geri sayım ── */
function useCountdown(endAt?: string | null) {
  const [time, setTime] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    if (!endAt) return;
    const endMs = new Date(endAt).getTime();
    const tick = () => {
      const diff = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTime({
        h: String(Math.floor(diff / 3600)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600) / 60)).padStart(2, "0"),
        s: String(diff % 60).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return time;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Kampanya kartı ── */
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
      className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ backgroundColor: bg, minHeight: "240px" }}
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
        {/* Üst */}
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
          <p className="mb-3 text-[0.65rem] opacity-60" style={{ color: descColor }}>
            {formatDate(sale.start_at)} — {formatDate(sale.end_at)}
          </p>
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
                  className="flex min-w-[44px] flex-col items-center rounded-lg px-2 py-1.5 text-center"
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

          {/* CTA */}
          <Link
            href={sale.button_url ?? ROUTES.LISTINGS}
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

/* ── Sayfa ── */
export default function KampanyalarPage() {
  const { data: campaigns, isPending } = useFlashSalesQuery();

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "hsl(var(--accent))" }}
        >
          <Zap className="h-5 w-5 fill-white text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kampanyalar</h1>
          <p className="text-sm text-muted-foreground">Sınırlı süreli fırsatlar</p>
        </div>
      </div>

      {/* Liste */}
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[240px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : !campaigns?.length ? (
        <div className="py-20 text-center">
          <Tag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Şu an aktif kampanya bulunmuyor.</p>
          <Link
            href={ROUTES.LISTINGS}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Tüm İlanlar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} sale={c} />
          ))}
        </div>
      )}
    </main>
  );
}
