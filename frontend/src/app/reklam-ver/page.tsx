"use client";

import Link from "next/link";
import {
  Megaphone,
  LayoutTemplate,
  Phone,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useSiteSettingsQuery } from "@/modules/site/site.service";
import { ROUTES } from "@/config/routes";

/* ─── Reklam konumları ────────────────────────────────────────────── */

const AD_POSITIONS = [
  {
    key: "home_top",
    label: "Ana Sayfa Üst",
    desc: "Sayfanın en üstünde, ziyaretçi siteye gelir gelmez gördüğü tam genişlik alan.",
    size: "Tam genişlik (12/12)",
    visibility: "Çok Yüksek",
    priceMonthly: 500,
    priceWeekly: 150,
    bg: "#FFFBF0",
    accent: "#D97706",
    icon: "🏆",
  },
  {
    key: "home_middle",
    label: "Ana Sayfa Orta",
    desc: "Ana sayfanın ortasında, iki kart yan yana görünüm. Kategori içeriğiyle birlikte.",
    size: "Yarım genişlik (6/12)",
    visibility: "Yüksek",
    priceMonthly: 300,
    priceWeekly: 100,
    bg: "#EBF4FF",
    accent: "#3B82F6",
    icon: "⭐",
  },
  {
    key: "listing_top",
    label: "İlan Listesi Üstü",
    desc: "İlan arama ve listeleme sayfasının üstünde. Satın almaya hazır kitleye görünür.",
    size: "Tam genişlik",
    visibility: "Hedefli & Yüksek",
    priceMonthly: 350,
    priceWeekly: 120,
    bg: "#FFF5F5",
    accent: "#E11D48",
    icon: "🎯",
  },
  {
    key: "home_bottom",
    label: "Ana Sayfa Alt",
    desc: "Ana sayfanın altında, üç kart yan yana. Ekonomik seçenek.",
    size: "Çeyrek genişlik (4/12)",
    visibility: "Orta",
    priceMonthly: 200,
    priceWeekly: 70,
    bg: "#F0FDF4",
    accent: "#16A34A",
    icon: "💚",
  },
];

/* ─── Paketler ────────────────────────────────────────────────────── */

const PACKAGES = [
  {
    label: "Haftalık",
    duration: "7 gün",
    badge: null,
    description: "Kısa süreli tanıtım için.",
    multiplier: 1,
    unit: "priceWeekly",
  },
  {
    label: "Aylık",
    duration: "30 gün",
    badge: "Popüler",
    description: "En çok tercih edilen paket.",
    multiplier: 1,
    unit: "priceMonthly",
  },
  {
    label: "3 Aylık",
    duration: "90 gün",
    badge: "%20 İndirim",
    description: "Uzun vadeli görünürlük, daha avantajlı fiyat.",
    multiplier: 2.4,
    unit: "priceMonthly",
  },
] as const;

/* ─── Adımlar ─────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: "01",
    title: "Konum Seçin",
    desc: "Hedef kitlenize en uygun reklam konumunu ve süreyi belirleyin.",
    color: "hsl(var(--accent))",
  },
  {
    num: "02",
    title: "İletişime Geçin",
    desc: "WhatsApp veya telefon ile bize ulaşın, fiyat ve detayları konuşalım.",
    color: "#3B82F6",
  },
  {
    num: "03",
    title: "Materyal Gönderin",
    desc: "Başlık, açıklama, renk ve link bilgilerini bize iletin.",
    color: "#16A34A",
  },
  {
    num: "04",
    title: "Yayına Alın",
    desc: "Ödeme onayından sonra reklamınız hemen yayına girer.",
    color: "#E11D48",
  },
];

/* ─── İstatistikler ───────────────────────────────────────────────── */

const STATS = [
  { icon: Users,     value: "5.000+",    label: "Aylık Ziyaretçi" },
  { icon: TrendingUp, value: "15.000+", label: "Sayfa Görüntüleme" },
  { icon: MapPin,    value: "Kaman",     label: "ve Çevre İlçeler" },
];

/* ─── Ana sayfa ────────────────────────────────────────────────────── */

export default function ReklamVerPage() {
  const { data: site } = useSiteSettingsQuery([
    "contact_phone_display",
    "contact_phone_tel",
    "contact_whatsapp_link",
  ]);

  const phoneTel      = site?.contact_phone_tel     as string | undefined;
  const phoneDisplay  = site?.contact_phone_display as string | undefined;
  const whatsappLink  = site?.contact_whatsapp_link as string | undefined;

  const waHref = whatsappLink ?? (phoneTel ? `https://wa.me/${phoneTel.replace(/\D/g, "")}` : null);
  const telHref = phoneTel ? `tel:${phoneTel}` : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="border-b py-12 md:py-16"
        style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Link href={ROUTES.HOME} className="hover:opacity-80">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Reklam Ver</span>
          </nav>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              {/* Badge */}
              <span
                className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: "hsl(var(--accent))", color: "#FFFFFF" }}
              >
                <Megaphone className="h-3.5 w-3.5" />
                Reklam Ver
              </span>

              <h1
                className="font-playfair mb-3 text-3xl font-black leading-tight md:text-4xl"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Kaman İlan'da <br />
                <span style={{ color: "hsl(var(--accent))" }}>İşletmenizi Tanıtın</span>
              </h1>
              <p className="text-sm leading-relaxed md:text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
                Yerel halk ve çevre ilçelerdeki binlerce ziyaretçiye ulaşın.
                Uygun fiyatlı banner alanlarıyla işletmenizin görünürlüğünü artırın.
              </p>
            </div>

            {/* İstatistikler */}
            <div className="flex gap-4 md:gap-6">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center text-center">
                  <Icon className="mb-1 h-5 w-5" style={{ color: "hsl(var(--accent))" }} />
                  <span className="text-lg font-black" style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                  <span className="text-[0.65rem] leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reklam Konumları ─────────────────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" style={{ color: "hsl(var(--accent))" }} />
            <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Reklam Konumları</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AD_POSITIONS.map((pos) => (
              <div
                key={pos.key}
                className="group relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: pos.bg,
                  borderColor: "hsl(var(--border))",
                }}
              >
                {/* Sol aksan şeridi */}
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl" style={{ backgroundColor: pos.accent }} />

                <div className="pl-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl">{pos.icon}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: pos.accent, color: "#fff" }}
                    >
                      {pos.visibility}
                    </span>
                  </div>

                  <h3 className="font-playfair mb-1 text-base font-bold" style={{ color: "hsl(var(--foreground))" }}>
                    {pos.label}
                  </h3>
                  <p className="mb-3 text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {pos.desc}
                  </p>

                  <div className="mb-3 text-[0.65rem]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <span className="font-semibold">Boyut:</span> {pos.size}
                  </div>

                  {/* Fiyat */}
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                  >
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Başlangıç fiyatı</div>
                    <div className="font-playfair text-2xl font-black" style={{ color: pos.accent }}>
                      ₺{pos.priceWeekly}
                      <span className="text-sm font-normal">/hafta</span>
                    </div>
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      ₺{pos.priceMonthly}/ay · ₺{Math.round(pos.priceMonthly * 2.4)}/3ay
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            * Fiyatlar tahminidir, kesin fiyat için bizimle iletişime geçin.
          </p>
        </div>
      </section>

      {/* ── Nasıl Çalışır ────────────────────────────────────────────── */}
      <section
        className="py-12 border-y"
        style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-playfair text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              Nasıl Çalışır?
            </h2>
            <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              4 adımda reklamınız yayında
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Bağlantı çizgisi */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+28px)] top-7 hidden h-px w-[calc(100%-56px)] lg:block"
                    style={{ backgroundColor: "hsl(var(--border))" }}
                  />
                )}

                <div
                  className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow"
                  style={{ backgroundColor: step.color }}
                >
                  {step.num}
                </div>
                <h3 className="mb-1 text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reklam Materyali Gereksinimleri ──────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-playfair mb-6 text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              Reklam Materyali
            </h2>

            <div
              className="rounded-2xl border p-6"
              style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
            >
              <p className="mb-4 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                Reklam yayına alınabilmesi için aşağıdaki bilgileri bize gönderin:
              </p>

              {[
                "Başlık (maks. 60 karakter)",
                "Alt başlık (maks. 60 karakter, opsiyonel)",
                "Kısa açıklama (maks. 120 karakter, opsiyonel)",
                "Buton yazısı ve hedef link / telefon numarası",
                "Arka plan rengi veya görsel (opsiyonel)",
                "Yayın başlangıç ve bitiş tarihi",
              ].map((item) => (
                <div key={item} className="mb-2 flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
                  <span className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{item}</span>
                </div>
              ))}

              <div
                className="mt-4 rounded-xl border-l-4 p-3 text-xs"
                style={{
                  borderColor: "hsl(var(--accent))",
                  backgroundColor: "hsl(var(--background))",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <Zap className="mb-1 h-4 w-4 inline" style={{ color: "hsl(var(--accent))" }} />{" "}
                <strong>Hızlı yayın:</strong> Bilgileri WhatsApp üzerinden gönderin, ödeme onayından
                sonra reklamınız aynı gün yayına girer.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── İletişim CTA ─────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="overflow-hidden rounded-3xl p-8 text-center md:p-12"
            style={{ backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
          >
            {/* Dekoratif arka plan dairesi */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
              aria-hidden
            >
              <div
                className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.06]"
                style={{ backgroundColor: "hsl(var(--accent))" }}
              />
              <div
                className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-[0.04]"
                style={{ backgroundColor: "hsl(var(--primary))" }}
              />
            </div>

            <div className="relative">
              <span
                className="mb-4 inline-flex items-center justify-center rounded-full p-3"
                style={{ backgroundColor: "hsl(var(--accent))", color: "#fff" }}
              >
                <Megaphone className="h-6 w-6" />
              </span>

              <h2 className="font-playfair mb-2 text-2xl font-black md:text-3xl" style={{ color: "hsl(var(--foreground))" }}>
                Hemen Başlayın
              </h2>
              <p className="mb-8 text-sm md:text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
                Reklam konum ve paket seçimi için bizimle iletişime geçin.
                Size en uygun çözümü birlikte belirleyelim.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                {/* WhatsApp */}
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "#25D366", color: "#FFFFFF" }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp'tan Yaz
                  </a>
                )}

                {/* Telefon */}
                {telHref && (
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-bold transition-all hover:opacity-80 active:scale-95"
                    style={{
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    {phoneDisplay ?? "Telefon ile Ara"}
                  </a>
                )}

                {/* Fallback — site ayarları yoksa iletişim sayfasına yönlendir */}
                {!waHref && !telHref && (
                  <Link
                    href={ROUTES.CONTACT}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "hsl(var(--accent))", color: "#FFFFFF" }}
                  >
                    <Phone className="h-4 w-4" />
                    İletişime Geçin
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
