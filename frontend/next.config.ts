import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "http://localhost:8078/api";

// Backend base URL — /api suffix'i olmadan (/uploads, /static vb. için)
const backendBase = apiUrl.replace(/\/api$/, "");

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
        destination: `${apiUrl}/:path*`,
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
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8078",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
