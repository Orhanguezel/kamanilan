import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { TopbarPopup } from "@/components/layout/topbar-popup";
import { SidebarPopups } from "@/components/layout/sidebar-popups";
import { t } from "@/lib/t";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/json-ld";
import "./globals.css";

import { Manrope, Fraunces, JetBrains_Mono } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kamanilan.com";
const apiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";

// ─── Tip yardımcıları ──────────────────────────────────────────────────────

interface SeoAppIcons {
  appleTouchIcon?: string;
  favicon?: string;
  faviconSvg?: string;
  logoIcon192?: string;
  logoIcon512?: string;
}

interface SettingRecord {
  key: string;
  value: unknown;
}

// ─── Dinamik Metadata ──────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c9931a",
};

export async function generateMetadata(): Promise<Metadata> {
  let brandName = t("seo.site_name");
  let description = t("seo.site_description");
  let ogLocale = "tr_TR";
  let ogImage = "";
  let seoIcons: SeoAppIcons = {};
  let siteLogo = "";

  try {
    const res = await fetch(
      `${apiBase}/site_settings?key_in=brand_name,brand_og_image,seo_defaults,seo_app_icons,site_logo`,
      {
        next: { revalidate: 3600 }, // 1 saatte bir yenile
      }
    );
    if (res.ok) {
      const records: SettingRecord[] = await res.json();
      for (const r of records) {
        switch (r.key) {
          case "brand_name":
            if (typeof r.value === "string") brandName = r.value;
            break;
          case "brand_og_image":
            if (typeof r.value === "string") ogImage = r.value;
            break;
          case "seo_defaults": {
            const d = r.value as Record<string, string> | null;
            if (d) {
              if (d.description) description = d.description;
              if (d.ogLocale)    ogLocale    = d.ogLocale;
            }
            break;
          }
          case "seo_app_icons":
            if (r.value && typeof r.value === "object") {
              seoIcons = r.value as SeoAppIcons;
            }
            break;
          case "site_logo": {
            if (typeof r.value === "string") siteLogo = r.value;
            else if (r.value && typeof r.value === "object" && "url" in (r.value as object)) {
              siteLogo = (r.value as { url?: string }).url ?? "";
            }
            break;
          }
        }
      }
    }
  } catch {
    // Backend erişilemezse locale fallback'e devam et
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: brandName,
      template: `%s | ${brandName}`,
    },
    description,
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: ogLocale,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon: (seoIcons.favicon || siteLogo)
        ? [{ url: seoIcons.favicon || siteLogo || "/favicon/favicon.png" }]
        : [{ url: "/favicon/favicon.png" }],
      shortcut: seoIcons.favicon || siteLogo || "/favicon/favicon.ico",
      apple: seoIcons.appleTouchIcon
        ? [{ url: seoIcons.appleTouchIcon }]
        : [{ url: "/favicon/apple-touch-icon.png" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

// ─── Root Layout ───────────────────────────────────────────────────────────

const SITE_NAME = "Kamanilan";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = buildOrganizationJsonLd({
    name:        SITE_NAME,
    legalName:   "Kaman İlan",
    url:         siteUrl,
    logoUrl:     `${siteUrl}/favicon/favicon.png`,
    description: "Kaman ve Kırşehir bölgesinin yerel ilan ve haber platformu. Emlak, araç, 2. el eşya, Kaman cevizi ve yerel ürünler için güvenilir dijital vitrin.",
    foundingDate: "2026",
    areaServed:   ["Kaman", "Kırşehir", "Mucur", "Akpınar", "Boztepe"],
    address: {
      addressLocality: "Kaman",
      addressRegion:   "Kırşehir",
      addressCountry:  "TR",
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61586451088043",
      "https://www.instagram.com/kamanilan",
      "https://x.com/kamanilan",
    ],
  });
  const websiteJsonLd = buildWebSiteJsonLd({ name: SITE_NAME, url: siteUrl });

  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <JsonLd data={[orgJsonLd, websiteJsonLd]} id="site" />
        <QueryProvider>
          <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <div className="flex min-h-screen flex-col">
              <TopbarPopup />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <SidebarPopups />
            <ScrollToTop />
          </NextThemesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
