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

  // Match the actual <Image sizes="(max-width: 1024px) 65vw, 40vw"> srcset picks:
  // mobile ≈ w=640, desktop ≈ w=828. Preload both via imageSrcSet so browser
  // picks the exact one that <Image> will request — guaranteed cache hit.
  const encoded = encodeURIComponent(absolute);
  const imageSrcSet = [
    `/_next/image?url=${encoded}&w=640&q=75 640w`,
    `/_next/image?url=${encoded}&w=828&q=75 828w`,
    `/_next/image?url=${encoded}&w=1080&q=75 1080w`,
  ].join(", ");

  return (
    <link
      rel="preload"
      as="image"
      imageSrcSet={imageSrcSet}
      imageSizes="(max-width: 1024px) 65vw, 40vw"
      fetchPriority="high"
    />
  );
}
