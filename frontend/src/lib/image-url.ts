export function getCategoryThumbnailUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", "160");
      url.searchParams.set("h", "120");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("fm", "webp");
      url.searchParams.set("q", "68");
      return url.toString();
    }
  } catch {
    return imageUrl;
  }
  return imageUrl;
}
