"use client";

import Link from "next/link";
import { ChevronRight, Copy, Check, Tag, Clock, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import type { Coupon } from "./page";

interface Breadcrumb { label: string; href?: string }

interface KuponlarClientProps {
  coupons: Coupon[];
  breadcrumbs: Breadcrumb[];
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDiscount(c: Coupon) {
  const val = Number(c.discount_value);
  return c.discount_type === "percent" ? `%${val}` : `${val} ₺`;
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [coupon.code]);

  const isPercent   = coupon.discount_type === "percent";
  const discountVal = Number(coupon.discount_value);
  const endDate     = fmtDate(coupon.end_at);
  const minOrder    = coupon.min_order_amount ? Number(coupon.min_order_amount) : null;
  const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Top stripe */}
      <div className={`flex items-center justify-center py-5 ${isPercent ? "bg-gradient-to-r from-blue-600 to-blue-500" : "bg-gradient-to-r from-slate-800 to-slate-700"}`}>
        <span className="text-4xl font-extrabold text-white drop-shadow">
          {isPercent ? `%${discountVal}` : `${discountVal} ₺`}
        </span>
        <span className="ml-2 mt-2 text-sm font-medium text-white/80">
          {isPercent ? "İndirim" : "İndirim"}
        </span>
      </div>

      {/* Dashed divider */}
      <div className="relative flex items-center px-4">
        <div className="absolute -left-3 h-6 w-6 rounded-full bg-slate-100 border border-slate-200" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 my-0 py-0" />
        <div className="absolute -right-3 h-6 w-6 rounded-full bg-slate-100 border border-slate-200" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div>
            <p className="font-semibold text-slate-900 leading-snug">{coupon.title}</p>
            {coupon.description && (
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{coupon.description}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-slate-500">
          {minOrder && (
            <p>Min. sipariş: <span className="font-medium text-slate-700">{minOrder} ₺</span></p>
          )}
          {maxDiscount && (
            <p>Maks. indirim: <span className="font-medium text-slate-700">{maxDiscount} ₺</span></p>
          )}
          {endDate && (
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Son kullanım: <span className="font-medium text-slate-700">{endDate}</span>
            </p>
          )}
        </div>

        {/* Code + copy button */}
        <div className="mt-auto flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
          <span className="flex-1 font-mono text-sm font-bold tracking-widest text-slate-800 select-all">
            {coupon.code}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KuponlarClient({ coupons, breadcrumbs }: KuponlarClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Kuponlar</h1>
          <p className="mt-2 text-muted-foreground">
            Aktif indirim kuponlarını kopyalayın ve kullanın.
          </p>
        </div>

        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-slate-600">Şu an aktif kupon bulunmuyor.</p>
            <p className="mt-1 text-sm text-muted-foreground">Yeni kampanyalar için bizi takip edin!</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
