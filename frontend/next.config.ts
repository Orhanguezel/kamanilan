import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api";

// Backend base URL — /api veya /api/v1 suffix'i olmadan (/uploads, /static vb. için)
const backendBase = apiUrl.replace(/\/api(\/v\d+)?\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      // Eski / alternatif URL'leri doğru route'lara yönlendir
      { source: "/uye-ol",         destination: "/kayit",    permanent: true },
      { source: "/uyelik",         destination: "/kayit",    permanent: true },
      { source: "/giris-yap",      destination: "/giris",    permanent: true },
      { source: "/login",          destination: "/giris",    permanent: true },
      { source: "/register",       destination: "/kayit",    permanent: true },
      { source: "/ilanlar/ara",    destination: "/ara",      permanent: false },
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
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Google OAuth popup uses window.opener to communicate back. Default
          // COOP "same-origin" breaks the popup close detection, causing the
          // "window.closed" warning flood. `same-origin-allow-popups` keeps
          // isolation but lets postMessage + popup lifecycle work.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
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
      { protocol: "http",  hostname: "localhost", port: "8078", pathname: "**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**" },
      { protocol: "https", hostname: "www.kamanilan.com", pathname: "**" },
      { protocol: "https", hostname: "kamanilan.com", pathname: "**" },
    ],
  },
};

export default nextConfig;
