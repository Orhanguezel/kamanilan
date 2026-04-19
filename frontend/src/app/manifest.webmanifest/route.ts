import { NextResponse } from "next/server";

const rawApiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";
const apiBase = rawApiBase.endsWith("/api") ? `${rawApiBase}/v1` : rawApiBase;

interface SettingRecord {
  key: string;
  value: unknown;
}

export async function GET() {
  let brandName = "Kaman İlan";
  let brandTagline = "";
  let icon192 = "/uploads/media/logo/logo_light.png";
  let icon512 = "/uploads/media/logo/logo_light.png";
  let themeColor = "#2D6A4F";

  try {
    const res = await fetch(
      `${apiBase}/site_settings?key_in=brand_name,brand_tagline,seo_app_icons,seo_defaults`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const records: SettingRecord[] = await res.json();
      for (const r of records) {
        if (r.key === "brand_name" && typeof r.value === "string") {
          brandName = r.value;
        }
        if (r.key === "brand_tagline" && typeof r.value === "string") {
          brandTagline = r.value;
        }
        if (r.key === "seo_app_icons" && r.value && typeof r.value === "object") {
          const icons = r.value as Record<string, string>;
          if (icons.logoIcon192) icon192 = icons.logoIcon192;
          if (icons.logoIcon512) icon512 = icons.logoIcon512;
        }
        if (r.key === "seo_defaults" && r.value && typeof r.value === "object") {
          const d = r.value as Record<string, string>;
          if (d.themeColor) themeColor = d.themeColor;
        }
      }
    }
  } catch {
    // fallback'e devam
  }

  const manifest = {
    name: brandName,
    short_name: brandName,
    description: brandTagline || brandName,
    start_url: "/",
    display: "standalone",
    background_color: "#F8FBF8",
    theme_color: themeColor,
    icons: [
      { src: icon192, sizes: "192x192", type: "image/png" },
      { src: icon512, sizes: "512x512", type: "image/png" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
