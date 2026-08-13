import { describe, expect, test } from "bun:test";
import { getCategoryThumbnailUrl } from "@/lib/image-url";

describe("getCategoryThumbnailUrl", () => {
  test("requests a compact WebP thumbnail from Unsplash", () => {
    const result = getCategoryThumbnailUrl(
      "https://images.unsplash.com/photo-example?w=600&h=450&fit=crop"
    );

    expect(result).toContain("w=160");
    expect(result).toContain("h=120");
    expect(result).toContain("fm=webp");
    expect(result).toContain("q=68");
  });

  test("keeps local upload URLs unchanged", () => {
    expect(getCategoryThumbnailUrl("/uploads/categories/ceviz.webp")).toBe(
      "/uploads/categories/ceviz.webp"
    );
  });
});
