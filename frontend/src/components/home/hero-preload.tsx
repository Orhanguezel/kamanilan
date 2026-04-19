import type { SliderItem } from "@/modules/site/site.type";

const apiBase =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://kamanilan.com/api/v1";

export async function HeroPreload() {
  let topImage: string | undefined;
  try {
    const res = await fetch(`${apiBase}/sliders`, { next: { revalidate: 300 } });
    if (res.ok) {
      const raw = await res.json();
      const items: SliderItem[] = Array.isArray(raw) ? raw : raw?.data ?? [];
      topImage = items[0]?.image;
    }
  } catch {
    // fail-silent — SSR preload is optional
  }

  if (!topImage) return null;

  const absolute = topImage.startsWith("http")
    ? topImage
    : `https://www.kamanilan.com${topImage}`;

  // Point preload to the Next.js image optimizer URL so the preloaded response
  // is the same one <Image> will request (cache hit instead of redundant download).
  const optimized = `/_next/image?url=${encodeURIComponent(absolute)}&w=828&q=75`;

  return (
    <link
      rel="preload"
      as="image"
      href={optimized}
      fetchPriority="high"
    />
  );
}
