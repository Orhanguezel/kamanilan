import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sportoonline.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/giris",
          "/*/kayit",
          "/*/sifremi-unuttum",
          "/*/sepet",
          "/*/odeme",
          "/*/siparis-basarili",
          "/*/siparislerim",
          "/*/siparis/",
          "/*/hesabim",
          "/*/favorilerim",
          "/*/adreslerim",
          "/*/cuzdan",
          "/*/destek",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
