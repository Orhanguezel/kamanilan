import type { NextConfig } from "next";
import { LEGACY_CORPORATE_REDIRECTS } from "./src/config/corporate-content";

const apiUrl =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";

if (process.env.NODE_ENV === "production") {
  const apiHostname = new URL(apiUrl).hostname;
  if (apiHostname === "localhost" || apiHostname === "127.0.0.1") {
    throw new Error(
      "Production build refused: NEXT_PUBLIC_REST_API_ENDPOINT cannot use localhost",
    );
  }
}

// Backend base URL — /api veya /api/v1 suffix'i olmadan (/uploads, /static vb. için)
const backendBase = apiUrl.replace(/\/api(\/v\d+)?\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      ...LEGACY_CORPORATE_REDIRECTS,
      // Eski / alternatif URL'leri doğru route'lara yönlendir
      { source: "/uye-ol", destination: "/kayit", permanent: true },
      { source: "/uyelik", destination: "/kayit", permanent: true },
      { source: "/giris-yap", destination: "/giris", permanent: true },
      { source: "/login", destination: "/giris", permanent: true },
      { source: "/register", destination: "/kayit", permanent: true },
      { source: "/ilanlar/ara", destination: "/ara", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // Backend API proxy
      {
        source: "/api/proxy/:path*",
        destination: `${apiUrl}/v1/:path*`,
      },
      // Backend upload dosyaları proxy (logo, favicon, media vb.)
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Tag Assistant opens this site from a cross-origin window and needs
          // the opener relationship for its debug handshake. A stricter COOP
          // value separates the windows into different browsing-context groups.
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
  images: {
    // Upload'lar rewrite uzerinden backend'e gidiyor. Next'in Image Optimizer'i
    // internal fetch sirasinda rewrite'lari uygulamadigi icin /uploads icin null
    // doner. Optimizer'i kapatip Unsplash/Cloudinary'nin kendi CDN donusumlerine
    // guveniyoruz; logo zaten 58KB'a resize edildi.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "**" },
      { protocol: "http", hostname: "localhost", port: "8078", pathname: "**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**" },
      { protocol: "https", hostname: "www.kamanilan.com", pathname: "**" },
      { protocol: "https", hostname: "kamanilan.com", pathname: "**" },
    ],
  },
};

export default nextConfig;
