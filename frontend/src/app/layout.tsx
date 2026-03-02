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
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
const apiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "http://localhost:8078/api";

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
  themeColor: "#2D6A4F",
};

export async function generateMetadata(): Promise<Metadata> {
  let brandName = t("seo.site_name");
  let description = t("seo.site_description");
  let ogLocale = "tr_TR";
  let ogImage = "";
  let seoIcons: SeoAppIcons = {};

  try {
    const res = await fetch(
      `${apiBase}/site_settings?key_in=brand_name,brand_og_image,seo_defaults,seo_app_icons`,
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
      icon: seoIcons.faviconSvg
        ? [{ url: seoIcons.faviconSvg, type: "image/svg+xml" }]
        : [{ url: "/favicon/favicon.ico" }],
      shortcut: seoIcons.favicon ?? "/favicon/favicon.ico",
      apple: seoIcons.appleTouchIcon
        ? [{ url: seoIcons.appleTouchIcon }]
        : undefined,
    },
    manifest: "/manifest.webmanifest",
  };
}

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${playfairDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
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
