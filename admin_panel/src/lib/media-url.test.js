import { afterEach, describe, expect, it } from "bun:test";

import { resolveMediaUrl } from "./media-url";

const originalMediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

afterEach(() => {
  if (originalMediaUrl === undefined) delete process.env.NEXT_PUBLIC_MEDIA_URL;
  else process.env.NEXT_PUBLIC_MEDIA_URL = originalMediaUrl;
});

describe("resolveMediaUrl", () => {
  it("resolves backend upload paths against the configured media origin", () => {
    process.env.NEXT_PUBLIC_MEDIA_URL = "https://www.kamanilan.com/api";

    expect(resolveMediaUrl("/uploads/news/example.webp")).toBe(
      "https://www.kamanilan.com/uploads/news/example.webp",
    );
  });

  it("keeps absolute image URLs unchanged", () => {
    process.env.NEXT_PUBLIC_MEDIA_URL = "https://www.kamanilan.com/api";

    expect(resolveMediaUrl("https://cdn.example.com/example.webp")).toBe(
      "https://cdn.example.com/example.webp",
    );
  });
});
