import type { Metadata } from "next";
import Link from "next/link";
import { Store, Bell, Clock, ChevronRight, Phone, MessageCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Mağazalar — Kaman İlan",
  description:
    "Kaman İlan'da mağaza açma özelliği yakında aktif olacak. Mağazanızı açmak için şimdiden kayıt olun.",
  alternates: { canonical: "/magazalar" },
};

const FEATURES = [
  {
    emoji: "🏪",
    title: "Kendi Mağazanız",
    desc: "Tüm ürün ve ilanlarınızı tek bir profil altında toplayın. Müşterilerinize markanızı tanıtın.",
  },
  {
    emoji: "⭐",
    title: "Değerlendirme & Yorum",
    desc: "Alıcılar mağazanızı değerlendirebilecek. Güvenilirliğinizi artırın, daha fazla satış yapın.",
  },
  {
    emoji: "📊",
    title: "Mağaza İstatistikleri",
    desc: "Kaç kişi mağazanızı ziyaret etti, hangi ürünlere ilgi var? Veriye dayalı karar alın.",
  },
  {
    emoji: "🔔",
    title: "Müşteri Bildirimleri",
    desc: "Yeni ilanlarınızda takipçileriniz otomatik bilgilendirilsin.",
  },
];

export default function MagazalarPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>

      {/* ── Hero ── */}
      <section
        className="border-b py-12 md:py-16"
        style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Link href={ROUTES.HOME} className="hover:opacity-80">Ana Sayfa</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Mağazalar</span>
          </nav>

          <div className="flex flex-col items-center text-center gap-6">
            {/* İkon */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
              style={{ backgroundColor: "hsl(var(--accent))", color: "#fff" }}
            >
              <Store className="h-10 w-10" />
            </div>

            {/* Yakında rozeti */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Clock className="h-3.5 w-3.5" />
              Yakında
            </span>

            <div className="max-w-xl">
              <h1
                className="mb-3 text-3xl font-black leading-tight md:text-4xl"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Kaman İlan&apos;da{" "}
                <span style={{ color: "hsl(var(--accent))" }}>Mağazanızı Açın</span>
              </h1>
              <p className="text-sm leading-relaxed md:text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
                Esnaf ve işletmeler için mağaza profili özelliği hazırlanıyor. Kısa süre içinde
                ilanlarınızı mağaza çatısı altında toplayabilecek, müşteri değerlendirmeleri
                alabilecek ve takipçi kitlesi oluşturabileceksiniz.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "hsl(var(--accent))", color: "#fff" }}
              >
                <Bell className="h-4 w-4" />
                Beni Bilgilendir
              </Link>
              <Link
                href={ROUTES.LISTINGS}
                className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
              >
                İlanlara Göz At
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h2
            className="mb-8 text-center text-xl font-bold"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Mağaza Özellikleri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border p-5 text-center"
                style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
              >
                <div className="mb-3 text-4xl">{f.emoji}</div>
                <h3 className="mb-2 text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Şimdiden ilan ver CTA ── */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="rounded-3xl border p-8 text-center"
            style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted))" }}
          >
            <p className="mb-2 text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
              Beklerken
            </p>
            <h2 className="mb-4 text-xl font-black" style={{ color: "hsl(var(--foreground))" }}>
              Hemen Ücretsiz İlan Verin
            </h2>
            <p className="mb-6 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Mağaza özelliği hazır olana kadar Kaman İlan&apos;da ücretsiz ilan vererek
              müşterilerinize ulaşmaya devam edebilirsiniz.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={ROUTES.POST_LISTING}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                <Store className="h-4 w-4" />
                Ücretsiz İlan Ver
              </Link>
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-all hover:opacity-80"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
              >
                <MessageCircle className="h-4 w-4" />
                Bilgi Al
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
