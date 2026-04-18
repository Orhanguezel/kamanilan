import type { MetadataRoute } from "next";

/**
 * robots.txt — Google SEO + AI crawler (GEO) erisim kurallari.
 *
 * Kaynak stratejisi:
 *  - Public alanlar (ilan, haber, kategori landing, statik bilgi) → Allow
 *  - Kullanici ozel alanlar (hesabim, mesajlar, vb.) → Disallow (hem SEO hem AI crawler'a kapali)
 *  - API proxy → Disallow (duplicate content + rate limit riski)
 *  - AI crawler'lara: baslica (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot)
 *    icin ayri kurallarla aciklik beyan — tam Allow. Bu GEO icin kritik — bazi siteler
 *    ayri blok olmadan tereddut ettiriyor, biz acikca izin veriyoruz.
 */
const PROTECTED_PATHS = [
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
  "/sepet",
  "/odeme",
  "/siparis-basarili",
  "/siparislerim",
  "/siparis/",
  "/hesabim",
  "/hesabim/*",
  "/ilanlarim",
  "/mesajlar",
  "/bildirimler",
  "/favorilerim",
  "/api/proxy/",
];

// Faz 3 GEO — AI crawler'larina explicit Allow (ne kadar net olursa o kadar iyi)
const AI_CRAWLERS = [
  "GPTBot",              // OpenAI (ChatGPT)
  "ChatGPT-User",        // OpenAI browse mode
  "OAI-SearchBot",       // OpenAI SearchGPT
  "ClaudeBot",           // Anthropic
  "Claude-Web",          // Anthropic (legacy)
  "anthropic-ai",        // Anthropic (legacy)
  "PerplexityBot",       // Perplexity
  "Perplexity-User",     // Perplexity citation fetch
  "Google-Extended",     // Google Gemini training
  "Googlebot",           // Google Search + AI Overviews
  "Googlebot-News",      // Google News
  "Bingbot",             // Microsoft / Copilot
  "Applebot",            // Apple
  "Applebot-Extended",   // Apple AI training
  "CCBot",               // Common Crawl (AI training data)
  "Bytespider",          // ByteDance / Doubao
  "Amazonbot",           // Amazon / Alexa
  "meta-externalagent",  // Meta AI / Llama
  "FacebookBot",         // Meta
  "DuckAssistBot",       // DuckDuckGo AI
  "YouBot",              // You.com
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";

  return {
    rules: [
      // Default — genel crawler'lar
      {
        userAgent: "*",
        allow: "/",
        disallow: PROTECTED_PATHS,
      },
      // AI crawler'lara explicit izin — her biri icin ayri blok
      ...AI_CRAWLERS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: PROTECTED_PATHS,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
