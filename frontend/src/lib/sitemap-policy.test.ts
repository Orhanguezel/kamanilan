import { describe, expect, it } from "bun:test";
import { shouldIndexCategory } from "./sitemap-policy";

describe("sitemap category policy", () => {
  it("indexes categories only when they contain an active listing", () => {
    expect(shouldIndexCategory(2)).toBe(true);
    expect(shouldIndexCategory(0)).toBe(false);
    expect(shouldIndexCategory(undefined)).toBe(false);
  });
});
